import { resolveProvider } from './llm/runtime.js'

/**
 * @returns {{ provider: string, missing: string[], configured: boolean }}
 */
export function getLlmEnvStatus() {
  const provider = resolveProvider()
  const missing = []
  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY?.trim()) missing.push('ANTHROPIC_API_KEY')
  } else {
    if (!process.env.OPENAI_API_KEY?.trim()) missing.push('OPENAI_API_KEY')
  }
  return { provider, missing, configured: missing.length === 0 }
}

/**
 * Local API only (`server/index.js`). Exits so buyers see exactly what to set before the server binds.
 */
export function validateEnvOrExit() {
  if (process.env.VERCEL === '1') return
  if (process.env.STORYOS_SKIP_ENV_CHECK === '1') return

  const { provider, missing } = getLlmEnvStatus()
  if (missing.length === 0) return

  console.error('')
  console.error('StoryOS — missing required environment variable(s):')
  for (const name of missing) {
    console.error(`  • ${name}`)
  }
  console.error('')
  console.error(`Current LLM_PROVIDER: ${provider}`)
  console.error('Fix: copy .env.example → .env and set the key(s) above.')
  console.error('     (Anthropic: set LLM_PROVIDER=anthropic and ANTHROPIC_API_KEY.)')
  console.error('')
  process.exit(1)
}
