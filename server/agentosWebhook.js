import { debug } from './logger.js'

/**
 * POST final panel outputs to a human-approval queue (AgentOS / custom backend).
 * Fire-and-forget errors are logged; stream already completed for the client.
 *
 * @param {string} url
 * @param {string | undefined} secret
 * @param {Record<string, unknown>} payload
 */
export async function sendAgentOsWebhook(url, secret, payload) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (secret) headers['X-StoryOS-Secret'] = secret
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error(
        'AgentOS webhook:',
        res.status,
        res.statusText,
        (await res.text()).slice(0, 200),
      )
    } else {
      debug('AgentOS webhook ok', res.status)
    }
  } catch (err) {
    console.error('AgentOS webhook failed:', err instanceof Error ? err.message : err)
  }
}
