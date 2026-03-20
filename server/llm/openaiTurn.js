import { emitTextAsTokenChunks } from './streamChunks.js'

/**
 * Tool loop (non-streaming completions) then pseudo-stream final text; optional bounded self-refine.
 *
 * @param {import('openai').OpenAI} client
 * @param {object} opts
 * @param {import('../agents.js').AGENTS[0]} opts.agent
 * @param {string} opts.model
 * @param {string} opts.system
 * @param {string} opts.userPayload
 * @param {import('openai').OpenAI.ChatCompletionTool[]} opts.tools
 * @param {(name: string, args: Record<string, unknown>, ctx: import('../tools/types.js').ToolContext) => Promise<string>} opts.executeTool
 * @param {(obj: Record<string, unknown>) => Promise<void>} opts.writeLine
 * @param {number} opts.maxToolSteps
 * @param {number} opts.refineRounds
 */
export async function runOpenAiAgentTurn(client, opts) {
  const {
    agent,
    model,
    system,
    userPayload,
    tools,
    executeTool,
    writeLine,
    maxToolSteps,
    refineRounds,
  } = opts

  /** @type {import('openai').OpenAI.ChatCompletionMessageParam[]} */
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userPayload },
  ]

  const temperature = Number(process.env.OPENAI_TEMPERATURE) || 0.72
  const maxTokens = Number(process.env.OPENAI_MAX_TOKENS) || 1400

  let lastText = ''
  let steps = 0

  while (steps < maxToolSteps) {
    steps += 1
    const completion = await client.chat.completions.create({
      model,
      messages,
      tools: tools.length ? tools : undefined,
      tool_choice: tools.length ? 'auto' : undefined,
      temperature,
      max_tokens: maxTokens,
    })

    const msg = completion.choices[0]?.message
    if (!msg) break

    if (msg.tool_calls?.length) {
      messages.push(msg)
      for (const tc of msg.tool_calls) {
        const name = tc.function?.name || 'unknown'
        let args = {}
        try {
          args = JSON.parse(tc.function?.arguments || '{}')
        } catch {
          args = {}
        }
        await writeLine({ type: 'tool_start', id: agent.id, tool: name })
        let result
        try {
          result = await executeTool(name, args, {
            agentId: agent.id,
            writeLine,
          })
        } catch (e) {
          result = JSON.stringify({
            error: e instanceof Error ? e.message : String(e),
          })
        }
        await writeLine({
          type: 'tool_end',
          id: agent.id,
          tool: name,
          ok: true,
          preview: String(result).slice(0, 360),
        })
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        })
      }
      continue
    }

    lastText = typeof msg.content === 'string' ? msg.content : ''
    break
  }

  if (!lastText.trim() && steps >= maxToolSteps) {
    lastText =
      '[Panel hit the tool-step limit without a final answer. Narrow the question or increase MAX_TOOL_STEPS.]'
  }

  await writeLine({ type: 'agent_start', id: agent.id, label: agent.label })
  await emitTextAsTokenChunks(writeLine, agent.id, lastText)

  let refinedText = lastText
  for (let r = 0; r < refineRounds; r += 1) {
    if (!refinedText.trim()) break
    await writeLine({ type: 'refine_start', id: agent.id, round: r + 1 })
    const refined = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You improve the prior panel answer: remove fluff, fix contradictions, sharpen claims, keep the same professional voice. Output only the improved answer — no preamble.',
        },
        {
          role: 'user',
          content: `Draft:\n\n${refinedText}\n\nRewrite more tightly.`,
        },
      ],
      temperature: 0.45,
      max_tokens: Math.min(maxTokens, 1600),
    })
    refinedText = refined.choices[0]?.message?.content || refinedText
    await emitTextAsTokenChunks(writeLine, agent.id, refinedText)
    await writeLine({ type: 'refine_end', id: agent.id, round: r + 1 })
  }

  await writeLine({ type: 'agent_end', id: agent.id })
}
