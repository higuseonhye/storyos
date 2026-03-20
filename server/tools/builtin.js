/**
 * Built-in tools (provider-agnostic execution; names stable across OpenAI / Anthropic).
 */

function safeMathEval(expression) {
  const s = String(expression || '').trim()
  if (!/^[0-9+\-*/().\s]+$/.test(s)) {
    throw new Error('Only digits, + - * / ( ) and spaces are allowed.')
  }
  const fn = new Function(`return (${s})`)
  const v = fn()
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('Invalid result')
  return v
}

/** @type {Map<string, (args: Record<string, unknown>, ctx: import('./types.js').ToolContext) => Promise<string>>} */
export const BUILTIN_HANDLERS = new Map()

BUILTIN_HANDLERS.set('storyos_datetime', async () => {
  return JSON.stringify({
    utc_iso: new Date().toISOString(),
    unix_ms: Date.now(),
    note: 'Use for sequencing, deadlines, and “as of” reasoning.',
  })
})

BUILTIN_HANDLERS.set('storyos_calculator', async (args) => {
  const expression = typeof args.expression === 'string' ? args.expression : ''
  const value = safeMathEval(expression)
  return JSON.stringify({ expression, value })
})

/**
 * Lets the model propose a durable insight; the UI can pin it into the next request body.
 */
BUILTIN_HANDLERS.set('storyos_suggest_memory', async (args, ctx) => {
  const insight =
    typeof args.insight === 'string' ? args.insight.trim() : typeof args.note === 'string'
      ? args.note.trim()
      : ''
  if (!insight) return JSON.stringify({ ok: false, error: 'Empty insight' })
  if (ctx?.writeLine && ctx.agentId) {
    await ctx.writeLine({
      type: 'learning_suggest',
      id: ctx.agentId,
      text: insight.slice(0, 2000),
    })
  }
  return JSON.stringify({
    ok: true,
    message:
      'Suggestion emitted to the UI. The user can add it to “Pinned insights” for the next round.',
  })
})

/** OpenAI-style tool definitions */
export const BUILTIN_OPENAI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'storyos_datetime',
      description:
        'Get current UTC time (ISO-8601) and unix ms. Use for time-sensitive trade-offs and sequencing.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'storyos_calculator',
      description:
        'Evaluate a simple arithmetic expression safely (digits, + - * / parentheses, spaces only).',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'e.g. "(420000 / 12) * 3"' },
        },
        required: ['expression'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'storyos_suggest_memory',
      description:
        'Propose one concise insight the human may want to remember across turns (e.g. a constraint they stated, a metric, a risk). Does not persist until the user pins it in the UI.',
      parameters: {
        type: 'object',
        properties: {
          insight: {
            type: 'string',
            description: 'Single memorable line, <= ~200 chars ideally.',
          },
        },
        required: ['insight'],
        additionalProperties: false,
      },
    },
  },
]
