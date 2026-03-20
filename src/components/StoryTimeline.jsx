import { useEffect, useRef, useState } from 'react'
import { StoryEvent } from './StoryEvent'
import './StoryTimeline.css'

/** ~10s arc: seven beats spaced across the window */
const EVENTS = [
  { id: 'init', title: 'Mission Initialized', tone: 'open' },
  { id: 'research', title: 'Research Agent', tone: 'default' },
  { id: 'analysis', title: 'Analysis Agent', tone: 'default' },
  { id: 'conflict', title: 'Conflict', tone: 'conflict' },
  { id: 'strategy', title: 'Strategy Agent', tone: 'default' },
  { id: 'critic', title: 'Critic Agent', tone: 'default' },
  { id: 'final', title: 'Final Decision', tone: 'final' },
]

const TOTAL_MS = 10_000
const delays = EVENTS.map((_, i) => Math.round((TOTAL_MS / (EVENTS.length + 1)) * (i + 1)))

export function StoryTimeline() {
  const listRef = useRef(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const timers = delays.map((ms, i) =>
      setTimeout(() => setShown(i + 1), ms),
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (shown === 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('.story-event')
    items[shown - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [shown])

  return (
    <section className="story-timeline" aria-label="StoryOS sequence">
      <ul className="story-timeline__list" ref={listRef}>
        {EVENTS.map((ev, i) => (
          <li key={ev.id} className="story-timeline__item">
            <StoryEvent title={ev.title} tone={ev.tone} show={i < shown} />
          </li>
        ))}
      </ul>
    </section>
  )
}
