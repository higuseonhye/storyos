import 'dotenv/config'
import { closeMcpIfAny, createStoryOsApp } from './createApp.js'

const app = await createStoryOsApp()

const PORT = Number(process.env.PORT) || 3001

if (process.env.VERCEL !== '1') {
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, async () => {
      await closeMcpIfAny()
      process.exit(0)
    })
  }
}

app.listen(PORT, () => {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()
  const aiReady =
    (provider !== 'anthropic' && !!process.env.OPENAI_API_KEY) ||
    (provider === 'anthropic' && !!process.env.ANTHROPIC_API_KEY)
  console.log(`StoryOS API http://localhost:${PORT}`)
  if (!aiReady) {
    console.warn(
      provider === 'anthropic'
        ? 'ANTHROPIC_API_KEY missing — panel disabled'
        : 'OPENAI_API_KEY missing — panel disabled',
    )
  }
})
