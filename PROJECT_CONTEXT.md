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
    tellStory.js          # Core: STORY_SEQUENCE + tellStory()
  components/
    StoryTimeline.jsx     # When running, runs tellStory; renders `revealed` list
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
  - **`tellStory(onStep, isCancelled)`** — one `for` loop: optional pause before **final**, then `onStep` → `await wait(step.delay)` → **micro pause** between steps (not after the last) — **no parallel playback**  
  - **`isCancelled()`** — handles unmount, React Strict Mode, and restarts  

**UI flow**

1. User clicks **Start** → `running === true`  
2. `StoryTimeline`’s `useEffect` runs an **async IIFE**: short **`await wait(...)`** before `tellStory` (“thinking begins”), then `tellStory`  
3. Each step: `onStep` → `setRevealed` appends one line  
4. When finished: `onRunEnd()` → `running === false`, button enabled again  

---

## 5. Story order (current copy)

1. Mission Initialized  
2. Research Agent  
3. Analysis Agent  
4. Conflict (emphasis, longer `delay`)  
5. Strategy Agent  
6. Critic Agent (longer `delay`; extra pause before final is in the runner)  
7. Final Decision  

Timing: **`STORY_SEQUENCE`** delays, plus **`MICRO_BETWEEN_MS`**, **`PAUSE_BEFORE_FINAL_MS`** in `tellStory.js`, and the pre-story **`wait`** in `StoryTimeline.jsx`.

---

## 6. Design direction

- Dark background, generous spacing, minimal copy  
- Beats: **fade in + slight move up** (`StoryEvent.css`)  
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
- tellStory(onStep, isCancelled): one async for-loop only — no parallel timers; micro-pauses between steps; extra pause before the final beat

UI: App.jsx sets running=true on Start; StoryTimeline awaits a short delay then tellStory; pushes each step onto revealed; StoryEvent renders text with fade/slide; types: open | default | conflict | final. Conflict and Critic use longer delays for pacing.

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
