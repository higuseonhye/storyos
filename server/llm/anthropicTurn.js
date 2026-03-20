import { emitTextAsTokenChunks } from './streamChunks.js'

/**
 * @param {import('@anthropic-ai/sdk').default} client
 * @param {object} opts
 */
export async function runAnthropicAgentTurn(client, opts) {
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

  const anthropicTools = tools.map((t) => ({
    name: t.function.name,
    description: t.function.description || '',
    input_schema: t.function.parameters || { type: 'object', properties: {} },
  }))

  let messages = [{ role: 'user', content: userPayload }]

  const maxTokens = Number(process.env.ANTHROPIC_MAX_TOKENS) || 4096

  let lastText = ''
  let steps = 0

  while (steps < maxToolSteps) {
    steps += 1
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      tools: anthropicTools.length ? anthropicTools : undefined,
      messages,
    })

    const toolUses = []
    let text = ''
    for (const b of msg.content) {
      if (b.type === 'text') text += b.text
      if (b.type === 'tool_use') toolUses.push(b)
    }

    if (toolUses.length) {
      messages = [...messages, { role: 'assistant', content: msg.content }]
      const results = []
      for (const tu of toolUses) {
        const name = tu.name
        await writeLine({ type: 'tool_start', id: agent.id, tool: name })
        let out
        try {
          out = await executeTool(
            name,
            /** @type {Record<string, unknown>} */ (tu.input || {}),
            { agentId: agent.id, writeLine },
          )
        } catch (e) {
          out = JSON.stringify({
            error: e instanceof Error ? e.message : String(e),
          })
        }
        await writeLine({
          type: 'tool_end',
          id: agent.id,
          tool: name,
          ok: true,
          preview: String(out).slice(0, 360),
        })
        results.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: out,
        })
      }
      messages = [...messages, { role: 'user', content: results }]
      continue
    }

    lastText = text
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
    const refined = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system:
        'You improve the prior panel answer: remove fluff, fix contradictions, sharpen claims, keep the same professional voice. Output only the improved answer — no preamble.',
      messages: [
        {
          role: 'user',
          content: `Draft:\n\n${refinedText}\n\nRewrite more tightly.`,
        },
      ],
    })
    let t = ''
    for (const b of refined.content) {
      if (b.type === 'text') t += b.text
    }
    refinedText = t || refinedText
    await emitTextAsTokenChunks(writeLine, agent.id, refinedText)
    await writeLine({ type: 'refine_end', id: agent.id, round: r + 1 })
  }

  await writeLine({ type: 'agent_end', id: agent.id })
}
