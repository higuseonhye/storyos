# AgentOS integration

StoryOS can notify an external **human-approval queue** (or AgentOS ingest API) after each **completed** live-panel round.

## Enable

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_MODE=agentOS` | `.env` (build-time) | Shows **AgentOS** next to the panel title in the UI. |
| `STORYOS_MODE=agentOS` | Server env | Arms the webhook (required with URL). |
| `AGENTOS_WEBHOOK_URL` | Server env | HTTPS endpoint to `POST` JSON payloads. |
| `AGENTOS_WEBHOOK_SECRET` | Server env (optional) | Sent as header `X-StoryOS-Secret` for HMAC-style checks on your side. |

On **Vercel**, add the server variables to **Environment Variables** and redeploy. Rebuild the static app when you change `VITE_*`.

## Payload (POST body)

`Content-Type: application/json`

```json
{
  "source": "storyos",
  "storyosMode": "agentos",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "topic": "…",
  "userMessage": "…",
  "panelMemory": ["pinned insight", "…"],
  "agents": {
    "strategist": "…",
    "skeptic": "…",
    "operator": "…"
  },
  "at": "2026-03-20T12:00:00.000Z"
}
```

`agents` contains the **final** streamed text per id (after any self-refine passes), matching what the UI would commit to the transcript.

## Receiver checklist

- Respond `2xx` quickly; the StoryOS API does not retry (check server logs on failure).
- Validate `X-StoryOS-Secret` if you set one.
- Idempotency: include a client-generated id in a future version if you need deduplication.

## Code

- **`server/agentosWebhook.js`** — `fetch` helper  
- **`server/discussStream.js`** — accumulates per-agent text (same rules as the UI: reset on `refine_start`)  
- **`server/createApp.js`** — fires webhook after the response stream ends  
