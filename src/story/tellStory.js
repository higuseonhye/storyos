/**
 * One continuous story: sequence + a single async runner.
 * All pacing goes through the loop below — no parallel timers.
 */

/** ms between steps (after each step's own delay), for breathing room */
export const MICRO_BETWEEN_MS = 400

/** ms “thinking” pause before the final line (first beat of anticipation) */
export const PAUSE_BEFORE_FINAL_MS = 900

/**
 * ms extra stillness before Final appears — stacked after PAUSE_BEFORE_FINAL_MS
 * so it feels like something is about to resolve, not “next item loading”.
 */
export const ANTICIPATION_BEFORE_FINAL_MS = 720

/** ms hush before Conflict — tension before the turn */
export const ANTICIPATION_BEFORE_CONFLICT_MS = 680

/** ms after Start, before the first beat (used by StoryTimeline) */
export const STORY_START_DELAY_MS = 850

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const STORY_SEQUENCE = [
  { text: 'Mission Initialized', type: 'open', delay: 850 },
  { text: 'Research Agent', type: 'default', delay: 950 },
  { text: 'Analysis Agent', type: 'default', delay: 950 },
  { text: 'Conflict', type: 'conflict', delay: 2000 },
  { text: 'Strategy Agent', type: 'default', delay: 950 },
  { text: 'Critic Agent', type: 'default', delay: 1800 },
  { text: 'Final Decision', type: 'final', delay: 0 },
]

/**
 * Runs steps strictly in order. Calls onStep before each pause.
 * Stops early if isCancelled() is true (unmount or new run).
 */
export async function tellStory(onStep, isCancelled) {
  const steps = STORY_SEQUENCE

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (isCancelled()) return

    if (step.type === 'conflict') {
      await wait(ANTICIPATION_BEFORE_CONFLICT_MS)
      if (isCancelled()) return
    }

    if (step.type === 'final') {
      await wait(PAUSE_BEFORE_FINAL_MS)
      if (isCancelled()) return
      await wait(ANTICIPATION_BEFORE_FINAL_MS)
      if (isCancelled()) return
    }

    onStep(step)
    if (isCancelled()) return
    await wait(step.delay)

    if (i < steps.length - 1) {
      await wait(MICRO_BETWEEN_MS)
      if (isCancelled()) return
    }
  }
}
