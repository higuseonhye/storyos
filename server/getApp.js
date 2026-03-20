import { createStoryOsApp } from './createApp.js'

let cached
let inflight

/**
 * Single cached Express app for Vercel (warm invocations reuse it).
 */
export async function getStoryOsApp() {
  if (cached) return cached
  if (inflight) return inflight
  inflight = createStoryOsApp()
    .then((app) => {
      cached = app
      inflight = null
      return app
    })
    .catch((err) => {
      inflight = null
      throw err
    })
  return inflight
}
