import './StoryEvent.css'

export function StoryEvent({ text, type, show }) {
  return (
    <article
      className={`story-event story-event--${type} ${show ? 'story-event--show' : ''}`}
      aria-hidden={!show}
    >
      <p className="story-event__text">{text}</p>
    </article>
  )
}
