/**
 * Debug logging — enable with DEBUG=true or DEBUG=1 in .env
 * Errors and startup essentials stay on console.error / console.log as needed.
 */
export function isDebug() {
  const d = process.env.DEBUG
  return d === 'true' || d === '1' || d === 'yes'
}

export function debug(...args) {
  if (isDebug()) console.log('[StoryOS debug]', ...args)
}
