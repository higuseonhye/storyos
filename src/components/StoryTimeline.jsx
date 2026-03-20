import { useEffect, useRef, useState } from 'react'
import { StoryEvent } from './StoryEvent'
import './StoryTimeline.css'

const MISSION_EVENTS = [
  { agent: null, message: 'Mission Initialized', type: 'default' },
  { agent: 'Research Agent', message: 'Scanning market signals...', type: 'default' },
  { agent: 'Analysis Agent', message: 'Patterns emerging...', type: 'default' },
  { agent: 'Conflict Event', message: 'Conflicting data detected', type: 'conflict' },
  { agent: 'Strategy Agent', message: 'Generating possible paths', type: 'default' },
  { agent: 'Critic Agent', message: 'Evaluating risks', type: 'default' },
  { agent: 'Final Decision', message: 'Recommendation ready', type: 'decision' },
]

export function StoryTimeline({ isRunning, onComplete }) {
  const containerRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    setVisibleCount(0)
    const delays = MISSION_EVENTS.map((_, i) => 1200 + Math.random() * 800)

    const timers = MISSION_EVENTS.map((_, i) => {
      const totalDelay = delays.slice(0, i + 1).reduce((a, b) => a + b, 0)
      return setTimeout(() => {
        setVisibleCount((c) => c + 1)
      }, totalDelay)
    })

    const completeDelay = delays.reduce((a, b) => a + b, 0) + 1500
    const completeTimer = setTimeout(onComplete, completeDelay)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(completeTimer)
    }
  }, [isRunning, onComplete])

  useEffect(() => {
    if (!containerRef.current || visibleCount === 0) return
    const last = containerRef.current.lastElementChild
    last?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [visibleCount])

  return (
    <div className="story-timeline" ref={containerRef}>
      {!isRunning && visibleCount === 0 && (
        <p className="story-timeline__placeholder">
          Awaiting mission start...
        </p>
      )}
      {MISSION_EVENTS.map((event, i) => (
        <StoryEvent
          key={i}
          agent={event.agent}
          message={event.message}
          type={event.type}
          isVisible={i < visibleCount}
        />
      ))}
    </div>
  )
}

