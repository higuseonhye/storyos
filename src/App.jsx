import { useCallback, useRef, useState } from 'react'
import { Landing } from './components/Landing'
import { StoryTimeline } from './components/StoryTimeline'
import './App.css'

/** ms after CTA click — landing stays up; builds “something is about to happen” */
const PAUSE_BEFORE_LANDING_FADE_MS = 800

/** ms landing opacity transition (must align with CSS `.landing`) */
const LANDING_FADE_OUT_MS = 760

export default function App() {
  const [view, setView] = useState('landing')
  const [landingExiting, setLandingExiting] = useState(false)
  const [anticipating, setAnticipating] = useState(false)
  const [running, setRunning] = useState(false)
  const enteringRef = useRef(false)
  const handleRunEnd = useCallback(() => setRunning(false), [])

  const enterStory = useCallback(() => {
    if (enteringRef.current) return
    enteringRef.current = true
    setAnticipating(true)

    window.setTimeout(() => {
      setLandingExiting(true)
      window.setTimeout(() => {
        setView('story')
        setRunning(true)
        setLandingExiting(false)
        setAnticipating(false)
        enteringRef.current = false
      }, LANDING_FADE_OUT_MS)
    }, PAUSE_BEFORE_LANDING_FADE_MS)
  }, [])

  return (
    <div className="app">
      {view === 'landing' && (
        <Landing
          exiting={landingExiting}
          anticipating={anticipating}
          onEnterStory={enterStory}
        />
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
              {running ? 'Watching…' : 'Watch again'}
            </button>
          </header>

          <StoryTimeline running={running} onRunEnd={handleRunEnd} />
        </div>
      )}
    </div>
  )
}
