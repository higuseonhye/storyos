import { useEffect, useRef, useState } from 'react'
import { StoryEvent } from './StoryEvent'
import './StoryTimeline.css'

const STEP_MS = 1600

const STEPS = [
  { id: 'init', title: 'Mission Initialized', tone: 'open' },
  { id: 'research', title: 'Research Agent', tone: 'default' },
  { id: 'analysis', title: 'Analysis Agent', tone: 'default' },
  { id: 'conflict', title: 'Conflict', tone: 'conflict' },
  { id: 'strategy', title: 'Strategy Agent', tone: 'default' },
  { id: 'critic', title: 'Critic Agent', tone: 'default' },
  { id: 'final', title: 'Final Decision', tone: 'final' },
]

export function StoryTimeline({ playing, onRest }) {
  const scrollRef = useRef(null)
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (!playing) return

    setVisible(0)
    const timers = []

    for (let i = 0; i < STEPS.length; i++) {
      timers.push(
        setTimeout(() => setVisible(i + 1), STEP_MS * (i + 1)),
      )
    }

    const done = setTimeout(() => {
      onRest()
    }, STEP_MS * (STEPS.length + 1))

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [playing, onRest])

  useEffect(() => {
    if (visible === 0 || !scrollRef.current) return
    const nodes = scrollRef.current.querySelectorAll('.story-event')
    const last = nodes[visible - 1]
    last?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [visible])

  return (
    <section className="story-timeline" aria-label="Story">
      <div className="story-timeline__inner" ref={scrollRef}>
        {playing || visible > 0 ? null : (
          <p className="story-timeline__hush">Quiet until you begin.</p>
        )}
        {STEPS.map((step, i) => (
          <StoryEvent
            key={step.id}
            title={step.title}
            tone={step.tone}
            show={i < visible}
          />
        ))}
      </div>
    </section>
  )
}
