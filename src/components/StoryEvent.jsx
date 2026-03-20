import './StoryEvent.css'

/** Live thread roles — not chat bubbles; orient the viewer in the process */
const ROLE_LABEL = {
  open: 'Brief',
  default: null,
  conflict: 'Tension',
  critic: 'Critic',
  final: 'Decision',
}

export function StoryEvent({ text, type, show, roleLabel }) {
  const role = roleLabel ?? ROLE_LABEL[type] ?? null

  return (
    <article
      className={`story-event story-event--${type} ${show ? 'story-event--show' : ''}`}
      aria-hidden={!show}
    >
      {role ? (
        <span className="story-event__role" aria-hidden="true">
          {role}
        </span>
      ) : null}
      <p className="story-event__text">{text}</p>
    </article>
  )
}
