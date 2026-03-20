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
  App.jsx                 # Title + Start button, `running` state
  App.css
  index.css               # CSS variables, dark theme
  story/
    tellStory.js          # Core: STORY_SEQUENCE, timing exports, tellStory()
  components/
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
  - **Exports:** pacing constants in §5 (`STORY_START_DELAY_MS`, `MICRO_BETWEEN_MS`, anticipation + pre-final)  
  - **`tellStory(onStep, isCancelled)`** — one `for` loop: **anticipation** before **Conflict** and **Final** (two-stage pause before final), then `onStep` → `await wait(step.delay)` → **micro pause** between steps (not after the last) — **no parallel playback**  
  - **`isCancelled()`** — handles unmount, React Strict Mode, and restarts  

**UI flow**

1. User clicks **Start** → `running === true`  
2. `StoryTimeline`’s `useEffect` runs an **async IIFE**: **`await wait(STORY_START_DELAY_MS)`** before `tellStory`, then `tellStory`  
3. Each step: `onStep` → `setRevealed` appends one line  
4. When finished: `onRunEnd()` → `running === false`, button enabled again  

---

## 5. Story order (current copy)

1. Mission Initialized  
2. Research Agent  
3. Analysis Agent  
4. Conflict (disruption: longer anticipation + hold, stronger panel treatment)  
5. Strategy Agent  
6. Critic Agent (longer `delay`; extra pause before final is in the runner)  
7. Final Decision  

**Timing constants** (see `tellStory.js`; import names match exports):

| Constant | ms | Role |
|----------|-----|------|
| `STORY_START_DELAY_MS` | 850 | After **Start**, before first beat (`StoryTimeline`) |
| `MICRO_BETWEEN_MS` | 400 | After each step’s `delay`, before the next (not after last) |
| `PAUSE_BEFORE_FINAL_MS` | 900 | Before **`Final Decision`** is revealed |

**`STORY_SEQUENCE` `delay` values (after line appears):** open/default beats 850–950ms; **Conflict** 2000ms; **Critic** 1800ms; **Final** 0ms.

---

## 6. Design direction

- Dark background, generous spacing, minimal copy  
- Beats: **fade in + slight move up** (~550ms, ease-out curve) in `StoryEvent.css`  
- **Conflict:** break in the flow — extra top margin, higher-contrast border/gradient panel, subtle lift + **~1.03 scale** on reveal; longer **anticipation** pause than between normal beats (`ANTICIPATION_BEFORE_CONFLICT_MS`)  
- **Final:** slightly larger type, more padding, very subtle text glow  
- Layout: mostly centered  

---

## 7. GitHub

- A remote may already be configured (check with `git remote -v`).  
- Commits and pushes happen in your environment.

---

## 8. Paste block for ChatGPT / other AIs

Copy the block below into your first message.

```
I'm building "StoryOS", a cinematic React + Vite demo (no backend, no API, no real AI).
Goal: a single sequential story timeline that feels like "watching something think."

Stack: React 18, Vite 5, plain CSS.

Core code: src/story/tellStory.js
- STORY_SEQUENCE: array of { text, type, delay }
- wait(ms): single Promise + setTimeout
- Exported pacing: STORY_START_DELAY_MS, MICRO_BETWEEN_MS, ANTICIPATION_BEFORE_CONFLICT_MS, PAUSE_BEFORE_FINAL_MS, ANTICIPATION_BEFORE_FINAL_MS (+ STORY_SEQUENCE delays)
- tellStory(onStep, isCancelled): one async for-loop only — no parallel timers; micro-pauses between steps; anticipation pauses before Conflict and before Final (two-stage pause before Final)

UI: App.jsx sets running=true on Start; StoryTimeline awaits STORY_START_DELAY_MS then tellStory; pushes each step onto revealed; StoryEvent: fade/slide; Conflict = disruptive panel + scale pop; Final emphasis. Types: open | default | conflict | final.

Keep this architecture. Help me with: [your request here].
Full notes: PROJECT_CONTEXT.md in the repo root.
```

---

## 9. Quick reference

| Question | Answer |
|----------|--------|
| Where to document context? | **README** = how to run; **PROJECT_CONTEXT.md** = context / handoff |
| What to paste into ChatGPT? | **Section 8** above; replace `[your request here]` |

You can add sections here anytime (e.g. known bugs, next ideas).
