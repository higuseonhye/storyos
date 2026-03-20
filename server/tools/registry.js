import { BUILTIN_HANDLERS, BUILTIN_OPENAI_TOOLS } from './builtin.js'

/**
 * @param {import('../mcp/manager.js').McpCluster | null} mcp
 */
export function createTooling(mcp) {
  const mcpPack = mcp?.getToolPack?.() ?? {
    openAiTools: [],
    handles: () => false,
    call: async () => '',
  }

  const tools = [...BUILTIN_OPENAI_TOOLS, ...mcpPack.openAiTools]

  /**
   * @param {string} name
   * @param {Record<string, unknown>} args
   * @param {import('./types.js').ToolContext} ctx
   */
  async function executeTool(name, args, ctx) {
    if (BUILTIN_HANDLERS.has(name)) {
      const fn = BUILTIN_HANDLERS.get(name)
      return fn(args, ctx)
    }
    if (mcpPack.handles?.(name)) {
      return mcpPack.call(name, args)
    }
    throw new Error(`Unknown tool: ${name}`)
  }

  return { tools, executeTool }
}
