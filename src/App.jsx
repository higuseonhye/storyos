import { useCallback, useEffect, useRef, useState } from 'react'
import { Landing } from './components/Landing'
import { DiscussionStudio } from './components/DiscussionStudio'
import { StoryTimeline } from './components/StoryTimeline'
import { StageCurtain } from './components/StageCurtain'
import './App.css'

/** ms after CTA click — hush before the curtain falls */
const PAUSE_BEFORE_CURTAIN_MS = 720

/** Must align with `.stage-curtain` transition in StageCurtain.css (~0.92s) */
const CURTAIN_CLOSE_MS = 920

export default function App() {
  const [view, setView] = useState('landing')
  const [anticipating, setAnticipating] = useState(false)
  const [running, setRunning] = useState(false)
  const [theaterOpen, setTheaterOpen] = useState(false)
  const enteringRef = useRef(false)
  const handleRunEnd = useCallback(() => setRunning(false), [])

  /** Opening beat on first paint — curtains part to reveal the house. */
  useEffect(() => {
    const id = requestAnimationFrame(() => setTheaterOpen(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const runAfterCurtainClose = useCallback((fn) => {
    setTheaterOpen(false)
    window.setTimeout(() => {
      fn()
      requestAnimationFrame(() => setTheaterOpen(true))
    }, CURTAIN_CLOSE_MS)
  }, [])

  const transitionFromLanding = useCallback(
    (nextView) => {
      if (enteringRef.current) return
      enteringRef.current = true
      setAnticipating(true)

      window.setTimeout(() => {
        runAfterCurtainClose(() => {
          setView(nextView)
          if (nextView === 'demo') setRunning(true)
          setAnticipating(false)
          enteringRef.current = false
        })
      }, PAUSE_BEFORE_CURTAIN_MS)
    },
    [runAfterCurtainClose],
  )

  const enterLive = useCallback(() => transitionFromLanding('live'), [transitionFromLanding])
  const enterDemo = useCallback(() => transitionFromLanding('demo'), [transitionFromLanding])

  const goHome = useCallback(() => {
    runAfterCurtainClose(() => {
      setView('landing')
      setRunning(false)
    })
  }, [runAfterCurtainClose])

  return (
    <div className="app">
      <StageCurtain open={theaterOpen} />

      {view === 'landing' && (
        <Landing
          anticipating={anticipating}
          onEnterLive={enterLive}
          onEnterDemo={enterDemo}
        />
      )}

      {view === 'live' && <DiscussionStudio onBack={goHome} />}

      {view === 'demo' && (
        <div className="app__story">
          <header className="app__header">
            <p className="app__title">StoryOS</p>
            <div className="app__header-actions">
              <button type="button" className="app__ghost" onClick={goHome}>
                Home
              </button>
              <button
                type="button"
                className="app__start"
                onClick={() => setRunning(true)}
                disabled={running}
              >
                {running ? 'Watching…' : 'Watch again'}
              </button>
            </div>
          </header>

          <StoryTimeline running={running} onRunEnd={handleRunEnd} />
        </div>
      )}
    </div>
  )
}
