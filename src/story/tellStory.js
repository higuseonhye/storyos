/**
 * One continuous story: sequence + a single async runner.
 * All pacing goes through the loop below — no parallel timers.
 */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const STORY_SEQUENCE = [
  { text: 'Mission Initialized', type: 'open', delay: 850 },
  { text: 'Research Agent', type: 'default', delay: 950 },
  { text: 'Analysis Agent', type: 'default', delay: 950 },
  { text: 'Conflict', type: 'conflict', delay: 2400 },
  { text: 'Strategy Agent', type: 'default', delay: 950 },
  { text: 'Critic Agent', type: 'default', delay: 2100 },
  { text: 'Final Decision', type: 'final', delay: 0 },
]

/**
 * Runs steps strictly in order. Calls onStep before each pause.
 * Stops early if isCancelled() is true (unmount or new run).
 */
export async function tellStory(onStep, isCancelled) {
  for (const step of STORY_SEQUENCE) {
    if (isCancelled()) return
    onStep(step)
    if (isCancelled()) return
    await wait(step.delay)
  }
}
