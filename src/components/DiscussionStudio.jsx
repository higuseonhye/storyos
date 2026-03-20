import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StoryEvent } from './StoryEvent'
import { postDiscussStream, readNdjsonStream } from '../lib/discussStream'
import { apiUrl } from '../lib/apiBase.js'
import './DiscussionStudio.css'

const EMPTY_BUFFERS = () => ({ strategist: '', skeptic: '', operator: '' })

function mapAccentToStoryType(accent) {
  if (accent === 'critic') return 'critic'
  if (accent === 'portfolio') return 'conflict'
  return 'default'
}

/** User-facing copy for fetch/stream failures (avoid blank confusion + raw stack traces). */
function formatStreamError(err) {
  if (err?.name === 'AbortError') return null
  if (!(err instanceof Error))
    return 'Something went wrong. Check the backend and try again.'
  const m = err.message || ''
  const lower = m.toLowerCase()
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  ) {
    return 'Could not reach the API. Run npm run dev:all (or npm run server) and ensure the Vite proxy or VITE_API_BASE_URL points at it.'
  }
  if (
    lower.includes('unauthorized') ||
    lower.includes('401') ||
    lower.includes('invalid api key') ||
    lower.includes('incorrect api key')
  ) {
    return 'The provider rejected the API key. Set OPENAI_API_KEY or ANTHROPIC_API_KEY (and LLM_PROVIDER) in .env or your host’s environment, then restart.'
  }
  if (lower.includes('429') || lower.includes('rate limit')) {
    return 'The model provider rate-limited this request. Wait briefly and try again.'
  }
  if (lower.includes('quota') || lower.includes('insufficient_quota')) {
    return 'Billing or quota issue with your AI provider — check the provider dashboard.'
  }
  if (lower.includes('stream error') || m === 'Stream error') {
    return 'The live stream was interrupted before completion. Nothing was added to the transcript — send your message again.'
  }
  const trimmed = m.length > 220 ? `${m.slice(0, 220)}…` : m
  return trimmed.trim() ? trimmed : 'Something went wrong. Try again.'
}

function loadLearnings() {
  try {
    const raw = sessionStorage.getItem('storyos_learnings')
    if (!raw) return []
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function DiscussionStudio({ onBack }) {
  const [topic, setTopic] = useState(
    () => sessionStorage.getItem('storyos_topic') || '',
  )
  const [learnings, setLearnings] = useState(loadLearnings)
  const [history, setHistory] = useState([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [buffers, setBuffers] = useState(EMPTY_BUFFERS)
  const [activeAgents, setActiveAgents] = useState({})
  const [toolHint, setToolHint] = useState({})
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const abortRef = useRef(null)
  const bottomRef = useRef(null)

  const agentMeta = useMemo(
    () => [
      { id: 'strategist', label: 'Strategist', accent: 'portfolio' },
      { id: 'skeptic', label: 'Skeptic', accent: 'critic' },
      { id: 'operator', label: 'Operator', accent: 'default' },
    ],
    [],
  )

  useEffect(() => {
    sessionStorage.setItem('storyos_topic', topic)
  }, [topic])

  useEffect(() => {
    sessionStorage.setItem('storyos_learnings', JSON.stringify(learnings))
  }, [learnings])

  useEffect(() => {
    let cancelled = false
    const url = apiUrl('/api/health')
    fetch(url)
      .then(async (r) => {
        const text = await r.text()
        let j = {}
        try {
          j = text ? JSON.parse(text) : {}
        } catch {
          j = { parseError: true, raw: text.slice(0, 120) }
        }
        if (!r.ok) {
          j = {
            ...j,
            ok: false,
            ai: false,
            httpStatus: r.status,
            httpStatusText: r.statusText,
          }
        }
        return j
      })
      .then((j) => {
        if (!cancelled) setHealth(j)
      })
      .catch((err) => {
        if (!cancelled)
          setHealth({
            ok: false,
            ai: false,
            provider: 'openai',
            networkError: err instanceof Error ? err.message : String(err),
          })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history.length, streaming, buffers])

  const runRound = useCallback(async () => {
    const userMessage = draft.trim()
    if (!userMessage || streaming) return

    setError(null)
    setDraft('')
    setStreaming(true)
    setBuffers(EMPTY_BUFFERS())
    setActiveAgents({})
    setToolHint({})

    const historyForApi = [...history]

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const nextBuffers = EMPTY_BUFFERS()

    try {
      const res = await postDiscussStream({
        topic,
        history: historyForApi,
        userMessage,
        panelMemory: learnings,
        signal: ac.signal,
      })

      for await (const ev of readNdjsonStream(res.body)) {
        if (ac.signal.aborted) break
        const type = ev.type
        if (type === 'agent_start') {
          setActiveAgents((a) => ({ ...a, [ev.id]: true }))
        }
        if (type === 'tool_start' && ev.id && ev.tool) {
          setActiveAgents((a) => ({ ...a, [ev.id]: true }))
          setToolHint((h) => ({ ...h, [ev.id]: String(ev.tool) }))
        }
        if (type === 'tool_end' && ev.id) {
          setToolHint((h) => {
            const n = { ...h }
            delete n[ev.id]
            return n
          })
        }
        if (type === 'refine_start' && ev.id) {
          nextBuffers[ev.id] = ''
          setBuffers({ ...nextBuffers })
        }
        if (type === 'learning_suggest' && ev.id && typeof ev.text === 'string') {
          const t = ev.text.trim()
          if (t)
            setLearnings((L) => (L.includes(t) ? L : [...L, t]))
        }
        if (type === 'token' && ev.id && typeof ev.text === 'string') {
          nextBuffers[ev.id] = (nextBuffers[ev.id] || '') + ev.text
          setBuffers({ ...nextBuffers })
        }
        if (type === 'agent_end') {
          setActiveAgents((a) => ({ ...a, [ev.id]: false }))
          if (ev.id) {
            setToolHint((h) => {
              const n = { ...h }
              delete n[ev.id]
              return n
            })
          }
        }
        if (type === 'error') {
          throw new Error(ev.message || 'Stream error')
        }
      }

      setHistory((h) => [
        ...h,
        { role: 'user', content: userMessage },
        { role: 'round', agents: { ...nextBuffers } },
      ])
    } catch (e) {
      if (e?.name === 'AbortError') return
      const msg = formatStreamError(e)
      if (msg) setError(msg)
    } finally {
      setStreaming(false)
      setActiveAgents({})
      abortRef.current = null
    }
  }, [draft, history, learnings, streaming, topic])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const aiReady = health?.ai === true
  const missingKeys = Array.isArray(health?.missingEnv) ? health.missingEnv : []
  const configHint =
    typeof health?.configHint === 'string' && health.configHint.trim()
      ? health.configHint.trim()
      : null

  const agentOsShell = import.meta.env.VITE_MODE === 'agentOS'

  return (
    <div className="discussion-studio">
      <header className="discussion-studio__header">
        <div className="discussion-studio__brand">
          <button type="button" className="discussion-studio__back" onClick={onBack}>
            ← Home
          </button>
          <p className="discussion-studio__title">
          StoryOS · Live panel
          {agentOsShell ? (
            <span className="discussion-studio__mode-badge" title="AgentOS demo shell">
              {' '}
              · AgentOS
            </span>
          ) : null}
        </p>
        </div>
        <p className="discussion-studio__tagline" id="panel-desc">
          Three independent voices — one transcript. Steer the debate; watch it unfold in real time.
        </p>
        {health && !aiReady ? (
          <p className="discussion-studio__warn" role="status">
            {missingKeys.length > 0 ? (
              <>
                <strong>API key not configured.</strong> Set{' '}
                {missingKeys.map((k, i) => (
                  <span key={k}>
                    {i > 0 ? ', ' : null}
                    <code>{k}</code>
                  </span>
                ))}{' '}
                in <code>.env</code> (local) or your host&apos;s environment variables, then restart / redeploy.
              </>
            ) : (
              <>
                AI backend unavailable — run <code>npm run dev:all</code> or <code>npm run server</code> and set{' '}
                {health.provider === 'anthropic' ? (
                  <>
                    <code>ANTHROPIC_API_KEY</code> (with <code>LLM_PROVIDER=anthropic</code>)
                  </>
                ) : (
                  <code>OPENAI_API_KEY</code>
                )}{' '}
                in <code>.env</code>.
              </>
            )}
            {configHint ? (
              <>
                <br />
                <span className="discussion-studio__warn-detail">{configHint}</span>
              </>
            ) : null}
            {typeof health.httpStatus === 'number' ? (
              <>
                <br />
                <span className="discussion-studio__warn-detail">
                  HTTP {health.httpStatus} on <code>{apiUrl('/api/health')}</code>
                  {health.httpStatus === 404
                    ? ' — API route not deployed (redeploy from latest Git; check Vercel build logs for Functions).'
                    : ''}
                </span>
              </>
            ) : null}
            {health.networkError ? (
              <>
                <br />
                <span className="discussion-studio__warn-detail">Network: {health.networkError}</span>
              </>
            ) : null}
            {health.ai === false &&
            health.ok !== false &&
            !health.httpStatus &&
            missingKeys.length === 0 ? (
              <>
                <br />
                <span className="discussion-studio__warn-detail">
                  API replied but <code>ai: false</code> — confirm env vars on the server (e.g.{' '}
                  <code>OPENAI_API_KEY</code> or <code>ANTHROPIC_API_KEY</code> + <code>LLM_PROVIDER</code>) and
                  redeploy after changes.
                </span>
              </>
            ) : null}
          </p>
        ) : null}
        {health && aiReady ? (
          <p className="discussion-studio__meta" role="status">
            Backend: <strong>{health.provider}</strong> · {health.model}
            {typeof health.tools?.total === 'number'
              ? ` · ${health.tools.total} tools (${health.tools.mcp || 0} from MCP)`
              : ''}
            {typeof health.refineRounds === 'number' && health.refineRounds > 0
              ? ` · self-refine ×${health.refineRounds}`
              : ''}
          </p>
        ) : null}
      </header>

      <section className="discussion-studio__memory" aria-labelledby="memory-heading">
        <h2 id="memory-heading" className="discussion-studio__memory-heading">
          Pinned insights
        </h2>
        <p className="discussion-studio__memory-help">
          Fed into every round as durable context. Models can suggest lines via{' '}
          <code>storyos_suggest_memory</code> — you can remove any pin (no vendor lock-in on what the
          panel remembers).
        </p>
        {learnings.length === 0 ? (
          <p className="discussion-studio__memory-empty">None yet.</p>
        ) : (
          <ul className="discussion-studio__memory-list">
            {learnings.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`} className="discussion-studio__memory-item">
                <span className="discussion-studio__memory-text">{line}</span>
                <button
                  type="button"
                  className="discussion-studio__memory-remove"
                  onClick={() => setLearnings((L) => L.filter((_, j) => j !== i))}
                  aria-label={`Remove pinned insight ${i + 1}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {learnings.length > 0 ? (
          <button
            type="button"
            className="discussion-studio__memory-clear"
            onClick={() => setLearnings([])}
          >
            Clear all pins
          </button>
        ) : null}
      </section>

      <section className="discussion-studio__setup" aria-labelledby="topic-label">
        <label id="topic-label" className="discussion-studio__label" htmlFor="topic-field">
          Decision / context (stays pinned for the session)
        </label>
        <textarea
          id="topic-field"
          className="discussion-studio__topic"
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Six months runway — ship a narrow vertical vs. a broad launch for fundraising narrative…"
          disabled={streaming}
        />
      </section>

      <section
        className="discussion-studio__live"
        aria-labelledby="live-heading"
        aria-describedby="panel-desc"
      >
        <h2 id="live-heading" className="visually-hidden">
          Live agent columns
        </h2>
        <div className="discussion-studio__columns">
          {agentMeta.map((a) => (
            <div
              key={a.id}
              className={`discussion-studio__column discussion-studio__column--${a.accent} ${
                activeAgents[a.id] ? 'discussion-studio__column--typing' : ''
              }`}
            >
              <p className="discussion-studio__column-label">{a.label}</p>
              {toolHint[a.id] ? (
                <p className="discussion-studio__tool-hint" aria-live="polite">
                  Tool: <code>{toolHint[a.id]}</code>
                </p>
              ) : null}
              <div
                className="discussion-studio__stream"
                aria-live="polite"
                aria-busy={!!activeAgents[a.id]}
              >
                {streaming || buffers[a.id] ? (
                  <p className="discussion-studio__stream-text">{buffers[a.id]}</p>
                ) : (
                  <p className="discussion-studio__stream-placeholder">
                    Waiting for your message…
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && !streaming ? (
          <p className="discussion-studio__stream-fallback" role="status">
            Stream stopped — any text above may be incomplete. See the message below, fix the issue, then send
            again. Your last message was not added to the transcript.
          </p>
        ) : null}
      </section>

      <section className="discussion-studio__transcript" aria-label="Discussion transcript">
        <h2 className="discussion-studio__transcript-heading">Transcript</h2>
        <div className="discussion-studio__transcript-inner">
          {history.length === 0 && !streaming ? (
            <p className="discussion-studio__empty">
              Set context above, then send a message — the panel answers in parallel, live.
            </p>
          ) : null}

          {history.map((turn, i) => {
            if (turn.role === 'user') {
              return (
                <article key={`u-${i}`} className="discussion-studio__user-turn">
                  <span className="discussion-studio__user-badge">You</span>
                  <p className="discussion-studio__user-text">{turn.content}</p>
                </article>
              )
            }
            if (turn.role === 'round' && turn.agents) {
              return (
                <div key={`r-${i}`} className="discussion-studio__round">
                  {agentMeta.map((a) => {
                    const text = turn.agents[a.id]
                    if (!text?.trim()) return null
                    const t = mapAccentToStoryType(a.accent)
                    return (
                      <div key={a.id} className="discussion-studio__round-row">
                        <StoryEvent text={text} type={t} show roleLabel={a.label} />
                      </div>
                    )
                  })}
                </div>
              )
            }
            return null
          })}
          <div ref={bottomRef} />
        </div>
      </section>

      <footer className="discussion-studio__composer">
        {error ? (
          <p className="discussion-studio__error" role="alert">
            {error}
          </p>
        ) : null}
        <label className="visually-hidden" htmlFor="composer-field">
          Your message to the panel
        </label>
        <textarea
          id="composer-field"
          className="discussion-studio__input"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Challenge the panel, ask for a decision, or add a constraint…"
          disabled={streaming || !aiReady}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              void runRound()
            }
          }}
        />
        <div className="discussion-studio__actions">
          {streaming ? (
            <button type="button" className="discussion-studio__stop" onClick={stop}>
              Stop
            </button>
          ) : null}
          <button
            type="button"
            className="discussion-studio__send"
            onClick={() => void runRound()}
            disabled={streaming || !draft.trim() || !aiReady}
          >
            {streaming ? 'Panel is thinking…' : 'Send to panel'}
          </button>
        </div>
        <p className="discussion-studio__hint">Tip: Ctrl+Enter / ⌘+Enter to send</p>
      </footer>
    </div>
  )
}
