import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { AGENTS } from './agents.js'
import { runParallelAgentStreams } from './discussStream.js'
import { initMcpCluster } from './mcp/manager.js'
import { createTooling } from './tools/registry.js'
import { createLlmRuntime, resolveProvider } from './llm/runtime.js'

/** @type {import('./mcp/manager.js').McpCluster | null} */
let activeMcpCluster = null

export async function closeMcpIfAny() {
  if (activeMcpCluster) {
    await activeMcpCluster.closeAll()
    activeMcpCluster = null
  }
}

/**
 * Build Express app (local server or Vercel serverless).
 * MCP is skipped on Vercel — stdio servers don’t fit serverless cold starts.
 */
export async function createStoryOsApp() {
  const provider = resolveProvider()

  const skipMcp =
    process.env.VERCEL === '1' ||
    process.env.DISABLE_MCP === '1' ||
    process.env.SKIP_MCP === '1'

  const mcpCluster = skipMcp ? null : await initMcpCluster()
  activeMcpCluster = mcpCluster
  if (skipMcp && process.env.VERCEL === '1') {
    console.info('StoryOS: MCP disabled on Vercel (use a long-running Node host for MCP_SERVERS)')
  }

  const tooling = createTooling(mcpCluster)
  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
  const anthropic =
    provider === 'anthropic' && process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null

  const runtime = createLlmRuntime({ openai, anthropic, tooling })

  const aiReady =
    (provider === 'openai' && !!openai) || (provider === 'anthropic' && !!anthropic)

  const app = express()

  const corsOrigin = process.env.CORS_ORIGIN
  app.use(
    cors({
      origin: corsOrigin ? corsOrigin.split(',').map((s) => s.trim()) : true,
      credentials: false,
    }),
  )
  app.use(express.json({ limit: '512kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      provider,
      ai: aiReady,
      model: runtime.model,
      tools: {
        total: runtime.toolCount,
        mcp: Math.max(0, runtime.toolCount - 3),
      },
      mcpServers: mcpCluster?.sessions?.length ?? 0,
      maxToolSteps: runtime.maxToolSteps,
      refineRounds: runtime.refineRounds,
    })
  })

  app.get('/api/agents', (_req, res) => {
    res.json({
      agents: AGENTS.map((a) => ({
        id: a.id,
        label: a.label,
        shortLabel: a.shortLabel,
        accent: a.accent,
      })),
    })
  })

  app.post('/api/discuss/stream', async (req, res) => {
    if (!aiReady) {
      res.status(503).json({
        error: 'AI unavailable',
        message:
          provider === 'anthropic'
            ? 'Set ANTHROPIC_API_KEY (and LLM_PROVIDER=anthropic) to enable the panel.'
            : 'Set OPENAI_API_KEY on the server to enable live discussion.',
      })
      return
    }

    let tail = Promise.resolve()

    function writeLine(obj) {
      const line = `${JSON.stringify(obj)}\n`
      tail = tail.then(
        () =>
          new Promise((resolve, reject) => {
            if (res.writableEnded) {
              resolve()
              return
            }
            res.write(line, (err) => (err ? reject(err) : resolve()))
          }),
      )
      return tail
    }

    try {
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.flushHeaders?.()

      await runParallelAgentStreams(runtime, req.body ?? {}, writeLine)
      await tail
      if (!res.writableEnded) res.end()
    } catch (err) {
      console.error('discuss/stream', err)
      try {
        await writeLine({
          type: 'error',
          message: err instanceof Error ? err.message : 'Stream failed',
        })
        await tail
      } catch {
        /* ignore */
      }
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream failed' })
      } else if (!res.writableEnded) {
        res.end()
      }
    }
  })

  return app
}
