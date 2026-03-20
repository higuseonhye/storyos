import 'dotenv/config'
import { validateEnvOrExit } from './validateEnv.js'
import { closeMcpIfAny, createStoryOsApp } from './createApp.js'

validateEnvOrExit()

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
  console.log(`StoryOS API http://localhost:${PORT}`)
})
