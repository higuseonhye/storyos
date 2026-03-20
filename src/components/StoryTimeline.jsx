import { useEffect, useRef, useState } from 'react'
import { STORY_START_DELAY_MS, tellStory, wait } from '../story/tellStory'
import { StoryEvent } from './StoryEvent'
import './StoryTimeline.css'

export function StoryTimeline({ running, onRunEnd }) {
  const listRef = useRef(null)
  const runTokenRef = useRef(0)
  const [revealed, setRevealed] = useState([])

  useEffect(() => {
    if (!running) return

    let alive = true
    const token = ++runTokenRef.current
    setRevealed([])

    ;(async () => {
      await wait(STORY_START_DELAY_MS)
      if (!alive || token !== runTokenRef.current) return

      await tellStory(
        (step) => {
          if (!alive || token !== runTokenRef.current) return
          setRevealed((prev) => [
            ...prev,
            { text: step.text, type: step.type, key: `${token}-${prev.length}` },
          ])
        },
        () => !alive || token !== runTokenRef.current,
      )
      if (alive && token === runTokenRef.current) onRunEnd()
    })()

    return () => {
      alive = false
      runTokenRef.current += 1
    }
  }, [running, onRunEnd])

  useEffect(() => {
    if (revealed.length === 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('.story-event')
    items[items.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [revealed.length])

  return (
    <section className="story-timeline" aria-live="polite" aria-label="Story">
      <div className="story-timeline__list" ref={listRef}>
        {revealed.length === 0 && !running && (
          <p className="story-timeline__hint">Begin when you are ready.</p>
        )}
        {revealed.map((step) => (
          <div key={step.key} className="story-timeline__row">
            <StoryEvent text={step.text} type={step.type} show />
          </div>
        ))}
      </div>
    </section>
  )
}
