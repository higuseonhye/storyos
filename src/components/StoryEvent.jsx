import './StoryEvent.css'

export function StoryEvent({ agent, message, type = 'default', isVisible }) {
  return (
    <div className={`story-event ${type} ${isVisible ? 'visible' : ''}`}>
      {agent && (
        <span className="story-event__agent">{agent}</span>
      )}
      <p className="story-event__message">{message}</p>
    </div>
  )
}
