/**
 * Emit NDJSON tokens in small chunks so the UI feels streamed (post-tool or post-refine).
 * @param {(obj: Record<string, unknown>) => Promise<void>} writeLine
 * @param {string} agentId
 * @param {string} text
 * @param {number} [chunkSize]
 */
export async function emitTextAsTokenChunks(writeLine, agentId, text, chunkSize = 28) {
  const s = text || ''
  for (let i = 0; i < s.length; i += chunkSize) {
    await writeLine({ type: 'token', id: agentId, text: s.slice(i, i + chunkSize) })
  }
}
