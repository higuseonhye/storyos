import { apiUrl } from './apiBase.js'

/**
 * @param {ReadableStream<Uint8Array> | null} body
 * @returns {AsyncGenerator<Record<string, unknown>>}
 */
export async function* readNdjsonStream(body) {
  if (!body) return
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const t = line.trim()
      if (!t) continue
      try {
        yield JSON.parse(t)
      } catch {
        /* skip malformed line */
      }
    }
  }
  const tail = buffer.trim()
  if (tail) {
    try {
      yield JSON.parse(tail)
    } catch {
      /* ignore */
    }
  }
}

/**
 * @param {{ topic: string, history: unknown[], userMessage: string, panelMemory?: string[], signal?: AbortSignal }} input
 */
export async function postDiscussStream(input) {
  const res = await fetch(apiUrl('/api/discuss/stream'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
    body: JSON.stringify({
      topic: input.topic,
      history: input.history,
      userMessage: input.userMessage,
      panelMemory: input.panelMemory?.length ? input.panelMemory : undefined,
    }),
    signal: input.signal,
  })

  if (!res.ok) {
    let msg = res.statusText
    try {
      const j = await res.json()
      if (j?.message) msg = j.message
      else if (j?.error) msg = j.error
    } catch {
      /* use statusText */
    }
    throw new Error(msg || `Request failed (${res.status})`)
  }

  return res
}
