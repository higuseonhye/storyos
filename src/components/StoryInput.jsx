import { useState } from 'react'
import './StoryInput.css'

export function StoryInput({ onStart, disabled }) {
  const [note, setNote] = useState('')

  return (
    <div className="story-input">
      <label className="story-input__label" htmlFor="mission-note">
        Mission
      </label>
      <input
        id="mission-note"
        className="story-input__field"
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional"
      />
      <button
        type="button"
        className="story-input__start"
        onClick={onStart}
        disabled={disabled}
      >
        {disabled ? 'In progress' : 'Begin'}
      </button>
    </div>
  )
}
