import { useCallback, useRef, useState } from 'react'
import { Landing } from './components/Landing'
import { StoryTimeline } from './components/StoryTimeline'
import './App.css'

export default function App() {
  const [view, setView] = useState('landing')
  const [landingExiting, setLandingExiting] = useState(false)
  const [running, setRunning] = useState(false)
  const enteringRef = useRef(false)
  const handleRunEnd = useCallback(() => setRunning(false), [])

  const enterStory = useCallback(() => {
    if (enteringRef.current) return
    enteringRef.current = true
    setLandingExiting(true)
    window.setTimeout(() => {
      setView('story')
      setRunning(true)
      setLandingExiting(false)
      enteringRef.current = false
    }, 520)
  }, [])

  return (
    <div className="app">
      {view === 'landing' && (
        <Landing exiting={landingExiting} onEnterStory={enterStory} />
      )}

      {view === 'story' && (
        <div className="app__story">
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
      )}
    </div>
  )
}
