import './StoryEvent.css'

export function StoryEvent({ title, tone, show }) {
  return (
    <article
      className={`story-event story-event--${tone} ${show ? 'story-event--show' : ''}`}
      aria-hidden={!show}
    >
      <p className="story-event__title">{title}</p>
    </article>
  )
}
