/**
 * One continuous story: sequence + a single async runner.
 * All pacing goes through the loop below — no parallel timers.
 */

/**
 * ms between steps — slight variation so rhythm feels less metronomic.
 * Index aligns with gap after step i (before step i+1); length = steps - 1.
 */
const MICRO_BETWEEN_STEPS_MS = [390, 365, 410, 380, 355, 400]

/** @deprecated use MICRO_BETWEEN_STEPS_MS; kept for docs / imports */
export const MICRO_BETWEEN_MS = 400

/** ms “thinking” pause before the final line (first beat of anticipation) */
export const PAUSE_BEFORE_FINAL_MS = 920

/**
 * ms extra stillness before Final appears — stacked after PAUSE_BEFORE_FINAL_MS
 * so it feels like something is about to resolve, not “next item loading”.
 */
export const ANTICIPATION_BEFORE_FINAL_MS = 780

/** ms hush before Conflict — longer than micro-gaps; reads as disruption, not “loading” */
export const ANTICIPATION_BEFORE_CONFLICT_MS = 940

/**
 * ms after story view is live, before the first beat — room to land after the transition.
 */
export const STORY_START_DELAY_MS = 1180

/**
 * ms after the final line is on screen — story is complete but UI stays “still”
 * (button still “Unfolding…”) so it feels like an ending, not an immediate reset.
 */
export const REFLECTION_AFTER_FINAL_MS = 5200

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const STORY_SEQUENCE = [
  { text: 'Mission Initialized', type: 'open', delay: 820 },
  { text: 'Research Agent', type: 'default', delay: 920 },
  { text: 'Analysis Agent', type: 'default', delay: 880 },
  { text: 'Conflict', type: 'conflict', delay: 2100 },
  { text: 'Strategy Agent', type: 'default', delay: 900 },
  { text: 'Critic Agent', type: 'default', delay: 1720 },
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
      const micro =
        MICRO_BETWEEN_STEPS_MS[i] ?? MICRO_BETWEEN_STEPS_MS[MICRO_BETWEEN_STEPS_MS.length - 1]
      await wait(micro)
      if (isCancelled()) return
    }
  }

  if (!isCancelled()) {
    await wait(REFLECTION_AFTER_FINAL_MS)
  }
}
