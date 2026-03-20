import { runOpenAiAgentTurn } from './openaiTurn.js'
import { runAnthropicAgentTurn } from './anthropicTurn.js'

export function resolveProvider() {
  const p = (process.env.LLM_PROVIDER || 'openai').toLowerCase()
  if (p === 'anthropic') return 'anthropic'
  return 'openai'
}

/**
 * @param {object} input
 * @param {import('openai').OpenAI | null} input.openai
 * @param {import('@anthropic-ai/sdk').default | null} input.anthropic
 * @param {ReturnType<import('../tools/registry.js').createTooling>} input.tooling
 */
export function createLlmRuntime(input) {
  const provider = resolveProvider()
  const maxToolSteps = Math.min(24, Math.max(1, Number(process.env.MAX_TOOL_STEPS) || 10))
  const refineRounds = Math.min(3, Math.max(0, Number(process.env.SELF_IMPROVE_MAX_ROUNDS) || 0))

  const model =
    provider === 'anthropic'
      ? process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
      : process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const openai = input.openai
  const anthropic = input.anthropic
  const { tools, executeTool } = input.tooling

  return {
    provider,
    model,
    maxToolSteps,
    refineRounds,
    toolCount: tools.length,

    /**
     * @param {object} o
     * @param {import('../agents.js').AGENTS[number]} o.agent
     * @param {string} o.system
     * @param {string} o.userPayload
     * @param {(obj: Record<string, unknown>) => Promise<void>} o.writeLine
     */
    async runAgentTurn(o) {
      const { agent, system, userPayload, writeLine } = o
      if (provider === 'anthropic') {
        if (!anthropic) throw new Error('Anthropic provider selected but ANTHROPIC_API_KEY is missing')
        await runAnthropicAgentTurn(anthropic, {
          agent,
          model,
          system,
          userPayload,
          tools,
          executeTool,
          writeLine,
          maxToolSteps,
          refineRounds,
        })
        return
      }
      if (!openai) throw new Error('OpenAI client missing')
      await runOpenAiAgentTurn(openai, {
        agent,
        model,
        system,
        userPayload,
        tools,
        executeTool,
        writeLine,
        maxToolSteps,
        refineRounds,
      })
    },
  }
}
