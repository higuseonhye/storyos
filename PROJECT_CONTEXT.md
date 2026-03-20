# StoryOS — project context

> For **humans** and for **pasting into ChatGPT (or another AI)** to continue work.  
> For run instructions only, see `README.md`.

---

## 1. What this is

- **Name:** StoryOS  
- **Type:** Cinematic **demo / prototype** (no backend, no API, no real AI calls)  
- **Intent:** Feels like *watching something think in front of you* — the timeline unfolds as **one continuous story**, in order.

---

## 2. Stack

- React 18 + Vite 5  
- Plain CSS (no UI component library)  
- Fonts (Google): Cormorant Garamond (story tone), Outfit (UI)

---

## 3. Folder layout (essentials)

```
src/
  App.jsx                 # view: landing | story; landing fade then story + `running`
  App.css
  index.css               # CSS variables, dark theme
  story/
    tellStory.js          # Core: STORY_SEQUENCE, timing exports, tellStory()
  components/
    Landing.jsx           # Intro page only (no story logic)
    Landing.css
    StoryTimeline.jsx     # Pre-roll wait, then tellStory; renders `revealed` list
    StoryTimeline.css
    StoryEvent.jsx        # Single line per beat (fade + slight slide up)
    StoryEvent.css
```

---

## 4. Core logic (read this before changing behavior)

**Rule:** Do not scatter many `setTimeout` calls. Use **one async flow** only.

- `src/story/tellStory.js`
  - **`STORY_SEQUENCE`**: `{ text, type, delay }[]`
    - `text` — line shown on screen  
    - `type` — `'open' | 'default' | 'conflict' | 'final'` → CSS variant on `StoryEvent`  
    - `delay` — ms to wait **after** this step appears (before micro-gap / next step)  
  - **`wait(ms)`** — exported; single `Promise` + `setTimeout` for all delays  
  - **Exports:** pacing constants in §5 (start, micro-gaps, conflict/final anticipation, **reflection** after final)  
  - **`tellStory(onStep, isCancelled)`** — one `for` loop: **anticipation** before **Conflict** and **Final** (two-stage pause before final), then `onStep` → `await wait(step.delay)` → **varied micro pauses** (`MICRO_BETWEEN_STEPS_MS`, not a single metronome); after the loop, **`REFLECTION_AFTER_FINAL_MS`** — **no parallel playback**  
  - **`isCancelled()`** — handles unmount, React Strict Mode, and restarts  

**UI flow**

1. Default **`view === 'landing'`** — minimal intro; **Start a mission** or **Try the demo** triggers a short **landing fade-out**, then **`view === 'story'`** and **`running === true`** (timeline starts automatically).  
2. On the story screen, **Watch again** sets `running === true` after a run ends (replay). While playing, the button shows **Watching…**.  
3. `StoryTimeline`’s `useEffect` runs an **async IIFE**: **`await wait(STORY_START_DELAY_MS)`** before `tellStory`, then `tellStory`  
4. Each step: `onStep` → `setRevealed` appends one line  
5. After the story (including **reflection** stillness): `onRunEnd()` → `running === false`, button enabled again  

---

## 5. Story order (current copy)

1. Mission Initialized  
2. Research Agent  
3. Analysis Agent  
4. Conflict (disruption: longer anticipation + hold, stronger panel treatment)  
5. Strategy Agent  
6. Critic Agent (longer `delay`; extra pause before final is in the runner)  
7. Final Decision (slower entrance + glow in CSS; then **reflection** pause before UI “unlocks”)  

**Timing constants** (see `tellStory.js`; import names match exports):

| Constant | ms | Role |
|----------|-----|------|
| `STORY_START_DELAY_MS` | 1180 | After story view is live, before first beat (`StoryTimeline`) |
| `MICRO_BETWEEN_MS` | 400 | Legacy export; gaps use **`MICRO_BETWEEN_STEPS_MS`** array in `tellStory.js` |
| `ANTICIPATION_BEFORE_CONFLICT_MS` | 940 | Stillness before **Conflict** |
| `PAUSE_BEFORE_FINAL_MS` | 920 | First quiet beat before **Final** |
| `ANTICIPATION_BEFORE_FINAL_MS` | 780 | Second beat before **Final** |
| `REFLECTION_AFTER_FINAL_MS` | 5200 | After **Final** is visible; `running` stays true — extended stillness |

**`STORY_SEQUENCE` `delay` values (after line appears):** tuned per beat (e.g. open ~820ms, conflict ~2100ms, critic ~1720ms); **Final** 0ms.

---

## 6. Design direction

- **Landing:** kicker + headline clarify *watching* (not chatting); longer ease-out fade (~0.72s); CTA **Begin watching** / **Enter the demo**  
- Dark background, generous spacing, minimal copy  
- Beats: **fade in + slight move up** (~550ms, ease-out curve) in `StoryEvent.css`  
- **Conflict:** break in the flow — extra top margin, higher-contrast border/gradient panel, subtle lift + **~1.03 scale** on reveal; longer **anticipation** pause than between normal beats (`ANTICIPATION_BEFORE_CONFLICT_MS`)  
- **Final:** slower entrance (~1.1s / ~1.3s), radial highlight; **very slow alternate** glow + text opacity during the hold (reflection); long **`REFLECTION_AFTER_FINAL_MS`** before UI unlocks  
- Layout: mostly centered  

---

## 7. GitHub & deploy

- A remote may already be configured (check with `git remote -v`).  
- **Production (Vercel):** [storyos.vercel.app](https://storyos.vercel.app/)  
- Commits and pushes happen in your environment.

---

## 8. Paste block for ChatGPT / other AIs

Copy the block below into your first message.

```
I'm building "StoryOS", a cinematic React + Vite demo (no backend, no API, no real AI).
Goal: a single sequential story timeline that feels like "watching something think."

Stack: React 18, Vite 5, plain CSS.

App: App.jsx uses view "landing" | "story"; Landing.jsx + Landing.css = quiet intro only (no story logic); CTA fades out then story view mounts and timeline auto-starts.

Core code: src/story/tellStory.js
- STORY_SEQUENCE: array of { text, type, delay }
- wait(ms): single Promise + setTimeout
- Exported pacing: STORY_START_DELAY_MS, MICRO_BETWEEN_MS (legacy), ANTICIPATION_*, REFLECTION_AFTER_FINAL_MS (+ STORY_SEQUENCE); between beats use MICRO_BETWEEN_STEPS_MS array inside tellStory
- tellStory(onStep, isCancelled): one async for-loop — varied micro-gaps, anticipation before Conflict, two-stage before Final, long REFLECTION_AFTER_FINAL_MS (then onRunEnd)

UI: landing → ~0.72s fade, ~740ms handoff; story eases in; Watching… / Watch again; StoryTimeline STORY_START_DELAY_MS then tellStory; Final has ambient hold CSS. Types: open | default | conflict | final.

Keep this architecture. Help me with: [your request here].
Full notes: PROJECT_CONTEXT.md in the repo root.
```

---

## 9. Quick reference

| Question | Answer |
|----------|--------|
| Where to document context? | **README** = how to run; **PROJECT_CONTEXT.md** = context / handoff |
| What to paste into ChatGPT? | **Section 8** above; replace `[your request here]` |

---

## 10. Current stage of development (for planning / discussion)

**Where StoryOS is today**

- **Type:** Cinematic **front-end prototype / demo** — built to *feel* like watching a process think, not to ship production AI.  
- **Scope:** No backend, no API, no live model calls. All beats come from **`STORY_SEQUENCE`** in `tellStory.js`.  
- **UX:** **Landing** → fade → **story view** with **`tellStory`** (anticipation, conflict disruption, final reflection pause). Replay via **Start** on the story screen.  
- **Deploy:** Production build is on **[Vercel](https://storyos.vercel.app/)** (see §7).  
- **Stability:** Core story runner is intentionally small and sequential; docs and timing constants are aligned in this file.

**What it is *not* yet**

- Not a configurable “mission builder,” not user-authored steps in the UI.  
- No auth, accounts, or saved runs.  
- No integration with real agents or streaming output.  
- No automated tests or formal a11y/perf pass (optional next steps).

**Possible next actions** *(pick what matches your goals — discuss and prioritize)*

| Area | Ideas |
|------|--------|
| **Product** | Turn demo into a product narrative: what problem does StoryOS solve for whom? Real AI later vs stay demo-only? |
| **Content** | Richer copy per beat; multiple sequences; load sequence from JSON/markdown; light CMS. |
| **UX** | “Back to landing”; optional sound; subtle progress cue; keyboard (e.g. Enter to start); reduced motion preference. |
| **Engineering** | Vitest/Playwright smoke test; `vercel.json` / build checks in CI; env-based feature flags. |
| **Design** | Mobile/long-landing polish; typography scale audit; locale-ready strings. |

Use this section as the **starting point for the next conversation**: e.g. “We want to prioritize X from §10” or “We’re staying demo-only; refine Y.”

Update §10 when the stage changes.
