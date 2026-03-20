/**
 * Vercel serverless entry: all `/api/*` traffic is rewritten here (see vercel.json).
 * Set OPENAI_API_KEY (or Anthropic) in Vercel → Project → Settings → Environment Variables.
 */
import { getStoryOsApp } from '../server/getApp.js'

export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  const app = await getStoryOsApp()
  app(req, res)
}
