import { getStoryOsApp } from '../server/getApp.js'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  req.url = '/api/health'
  const app = await getStoryOsApp()
  app(req, res)
}
