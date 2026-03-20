import { useCallback, useState } from 'react'
import { StoryTimeline } from './components/StoryTimeline'
import './App.css'

export default function App() {
  const [running, setRunning] = useState(false)
  const handleRunEnd = useCallback(() => setRunning(false), [])

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__title">StoryOS</p>
        <button
          type="button"
          className="app__start"
          onClick={() => setRunning(true)}
          disabled={running}
        >
          {running ? 'Unfolding…' : 'Start'}
        </button>
      </header>

      <StoryTimeline running={running} onRunEnd={handleRunEnd} />
    </div>
  )
}
