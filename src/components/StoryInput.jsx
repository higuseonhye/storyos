import './StoryInput.css'

export function StoryInput({ onStart, isRunning }) {
  return (
    <div className="story-input">
      <button
        className="story-input__btn"
        onClick={onStart}
        disabled={isRunning}
      >
        {isRunning ? (
          <span className="story-input__pulse">Running...</span>
        ) : (
          'Start Mission'
        )}
      </button>
    </div>
  )
}
