import { AGENTS } from './agents.js'

/**
 * Build a single transcript string the models can read (no fake "assistant" roles).
 */
export function formatTranscript(topic, history) {
  const parts = []
  if (topic?.trim()) {
    parts.push(`Topic / decision frame:\n${topic.trim()}`)
  }
  for (const turn of history) {
    if (turn.role === 'user' && turn.content?.trim()) {
      parts.push(`User:\n${turn.content.trim()}`)
    }
    if (turn.role === 'round' && turn.agents && typeof turn.agents === 'object') {
      const lines = AGENTS.map((a) => {
        const text = turn.agents[a.id]
        return text?.trim() ? `${a.label}:\n${text.trim()}` : null
      }).filter(Boolean)
      if (lines.length) parts.push(lines.join('\n\n'))
    }
  }
  return parts.join('\n\n---\n\n') || '(No prior messages yet.)'
}

function buildUserPayload(userMessage, isFirstTurn) {
  const msg = userMessage?.trim() || ''
  if (!msg) return 'Please respond to the topic and open the discussion.'
  if (isFirstTurn) {
    return `This is the start of the live panel. User message:\n\n${msg}\n\nOpen with your distinct take; do not repeat the other voices verbatim.`
  }
  return `Latest user message:\n\n${msg}\n\nRespond in your voice only. Reference prior panel context where useful.`
}

/**
 * @param {{
 *   provider: string,
 *   model: string,
 *   toolCount: number,
 *   maxToolSteps: number,
 *   refineRounds: number,
 *   runAgentTurn: (o: {
 *     agent: import('./agents.js').AGENTS[number],
 *     system: string,
 *     userPayload: string,
 *     writeLine: (obj: Record<string, unknown>) => Promise<void>,
 *   }) => Promise<void>,
 * }} runtime
 */
export async function runParallelAgentStreams(runtime, body, writeLine) {
  const topic = typeof body.topic === 'string' ? body.topic : ''
  const userMessage = typeof body.userMessage === 'string' ? body.userMessage : ''
  const history = Array.isArray(body.history) ? body.history : []
  const panelMemory = Array.isArray(body.panelMemory)
    ? body.panelMemory.filter((x) => typeof x === 'string' && x.trim())
    : []

  const transcript = formatTranscript(topic, history)
  const isFirstTurn = history.filter((h) => h.role === 'user').length === 0
  const userPayload = buildUserPayload(userMessage, isFirstTurn)

  const mcpToolCount = Math.max(0, runtime.toolCount - 3)

  await writeLine({
    type: 'meta',
    provider: runtime.provider,
    model: runtime.model,
    toolsEnabled: runtime.toolCount > 0,
    builtinToolCount: 3,
    mcpToolCount,
    maxToolSteps: runtime.maxToolSteps,
    refineRounds: runtime.refineRounds,
  })

  async function streamOne(agent) {
    let system = `${agent.systemPrompt}

Shared context (read carefully; other panelists may disagree):
${transcript}

You may use the provided tools when they materially improve grounding (time, calculation, file/resource access via MCP, or proposing a pin-worthy insight). Prefer direct reasoning when tools are unnecessary.

Rules:
- Output plain language for a serious operator audience. No preambles like "As the Strategist".
- Stay under ~450 words unless the user explicitly asks for depth.
- If the user asks for a single "direct solution", still give your angle — the UI combines multiple voices.`

    if (panelMemory.length) {
      system += `

Pinned insights (user-approved; treat as durable constraints unless they contradict the latest user message):
${panelMemory.map((x) => `- ${x}`).join('\n')}`
    }

    await runtime.runAgentTurn({
      agent,
      system,
      userPayload,
      writeLine,
    })
  }

  await Promise.all(AGENTS.map((agent) => streamOne(agent)))
  await writeLine({ type: 'done' })
}
