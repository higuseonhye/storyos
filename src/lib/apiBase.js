/**
 * Production: set VITE_API_BASE_URL (e.g. https://api.yourdomain.com).
 * Dev: leave unset — Vite proxies /api to the local StoryOS server.
 */
export function getApiBase() {
  const base = import.meta.env.VITE_API_BASE_URL
  if (typeof base === 'string' && base.trim()) return base.replace(/\/$/, '')
  return ''
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${getApiBase()}${p}`
}
