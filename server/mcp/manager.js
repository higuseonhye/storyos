import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { debug } from '../logger.js'

function sanitizeKey(s) {
  return String(s).replace(/[^a-zA-Z0-9_-]/g, '_')
}

function mcpResultToString(result) {
  if (!result) return ''
  if (result.isError) {
    return JSON.stringify({ mcp_error: true, content: result.content })
  }
  const parts = []
  for (const c of result.content || []) {
    if (c?.type === 'text' && c.text) parts.push(c.text)
  }
  if (parts.length) return parts.join('\n')
  try {
    return JSON.stringify(result)
  } catch {
    return String(result)
  }
}

/**
 * @typedef {{ id: string, command: string, args?: string[], env?: Record<string, string>, cwd?: string }} McpServerConfig
 */

export class McpCluster {
  constructor() {
    /** @type {Array<{ client: Client, transport: import('@modelcontextprotocol/sdk/client/stdio.js').StdioClientTransport }>} */
    this.sessions = []
    /**
     * openAiToolName -> { client, mcpToolName }
     * @type {Map<string, { client: Client, mcpToolName: string }>}
     */
    this.route = new Map()
    /** @type {import('openai').OpenAI.ChatCompletionTool[]} */
    this.openAiTools = []
  }

  /**
   * @param {McpServerConfig[]} configs
   */
  static async connectAll(configs) {
    const cluster = new McpCluster()
    for (const cfg of configs) {
      if (!cfg?.id || !cfg?.command) continue
      const sid = sanitizeKey(cfg.id)
      const transport = new StdioClientTransport({
        command: cfg.command,
        args: cfg.args ?? [],
        env: cfg.env,
        cwd: cfg.cwd,
      })
      const client = new Client({ name: `storyos-${sid}`, version: '1.0.0' })
      await client.connect(transport)
      const listed = await client.listTools()
      for (const tool of listed.tools ?? []) {
        const rawName = tool.name
        const openAiName = `mcp__${sid}__${sanitizeKey(rawName)}`.slice(0, 64)
        cluster.route.set(openAiName, { client, mcpToolName: rawName })
        cluster.openAiTools.push({
          type: 'function',
          function: {
            name: openAiName,
            description: `[MCP ${cfg.id}] ${tool.description || rawName}`,
            parameters: tool.inputSchema || { type: 'object', properties: {} },
          },
        })
      }
      cluster.sessions.push({ client, transport })
    }
    return cluster
  }

  /** @returns {{ openAiTools: typeof this.openAiTools, handles: (n: string) => boolean, call: (n: string, args: Record<string, unknown>) => Promise<string> }} */
  getToolPack() {
    const route = this.route
    /** Serialize MCP calls — parallel panelists share one stdio client per server. */
    let chain = Promise.resolve()
    return {
      openAiTools: this.openAiTools,
      handles: (n) => route.has(n),
      call: async (name, args) => {
        const r = route.get(name)
        if (!r) throw new Error(`MCP route missing: ${name}`)
        const run = async () => {
          const result = await r.client.callTool({
            name: r.mcpToolName,
            arguments: args && typeof args === 'object' ? args : {},
          })
          return mcpResultToString(result)
        }
        const p = chain.then(run)
        chain = p.catch(() => {})
        return p
      },
    }
  }

  async closeAll() {
    for (const { client } of this.sessions) {
      try {
        await client.close()
      } catch {
        /* ignore */
      }
    }
    this.sessions = []
    this.route.clear()
    this.openAiTools = []
  }
}

/**
 * @returns {Promise<McpCluster | null>}
 */
export async function initMcpCluster() {
  const raw = process.env.MCP_SERVERS
  if (!raw?.trim()) return null
  let configs
  try {
    configs = JSON.parse(raw)
  } catch (e) {
    console.warn('MCP_SERVERS is not valid JSON — skipping MCP:', e.message)
    return null
  }
  if (!Array.isArray(configs) || configs.length === 0) return null
  try {
    const cluster = await McpCluster.connectAll(configs)
    debug(`MCP: ${cluster.openAiTools.length} tool(s) from ${configs.length} server(s)`)
    return cluster
  } catch (e) {
    console.error('MCP connection failed:', e)
    return null
  }
}
