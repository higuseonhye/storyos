/**
 * One continuous story: sequence + a single async runner.
 * All pacing goes through the loop below — no parallel timers.
 */

/**
 * ms between steps — slight variation so rhythm feels less metronomic.
 * Index aligns with gap after step i (before step i+1); length = steps - 1.
 */
const MICRO_BETWEEN_STEPS_MS = [405, 370, 418, 372, 392, 358]

/** @deprecated use MICRO_BETWEEN_STEPS_MS; kept for docs / imports */
export const MICRO_BETWEEN_MS = 400

/** Tiny extra hush right before conflict anticipation stacks */
const CONFLICT_LEAD_IN_MS = 240

/** ms “thinking” pause before the final line (first beat of anticipation) */
export const PAUSE_BEFORE_FINAL_MS = 940

/**
 * ms extra stillness before Final appears — stacked after PAUSE_BEFORE_FINAL_MS
 * so it feels like something is about to resolve, not “next item loading”.
 */
export const ANTICIPATION_BEFORE_FINAL_MS = 800

/** ms hush before Conflict — longer than micro-gaps; reads as disruption, not “loading” */
export const ANTICIPATION_BEFORE_CONFLICT_MS = 1040

/**
 * ms after story view is live, before the first beat — “thinking is starting”.
 */
export const STORY_START_DELAY_MS = 1080

/**
 * ms after the final line is on screen — hold for reflection (≥ ~2–3s of still story UI).
 */
export const REFLECTION_AFTER_FINAL_MS = 5200

/**
 * ms after reflection, before `onRunEnd` — avoids a sharp UI “snap”.
 */
export const UI_SETTLE_AFTER_REFLECTION_MS = 750

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Fixed demo: one concrete decision — AI note-taking startup (copy only; pacing unchanged). */
export const STORY_SEQUENCE = [
  {
    text: 'Should we build an AI note-taking app?',
    type: 'open',
    delay: 830,
  },
  {
    text: 'Research — Market is crowded with strong incumbents',
    type: 'default',
    delay: 910,
  },
  {
    text: 'Analysis — Most products compete on similar features',
    type: 'default',
    delay: 865,
  },
  {
    text: 'High demand, but low differentiation',
    type: 'conflict',
    delay: 2150,
  },
  {
    text: 'Strategy — Focus on a niche or unique workflow',
    type: 'default',
    delay: 895,
  },
  {
    text: 'Critic — Risk: low retention without clear value',
    type: 'default',
    delay: 1680,
  },
  {
    text: 'Not recommended without a strong angle',
    type: 'final',
    delay: 0,
  },
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
      await wait(CONFLICT_LEAD_IN_MS)
      if (isCancelled()) return
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
    if (isCancelled()) return
    await wait(UI_SETTLE_AFTER_REFLECTION_MS)
  }
}
