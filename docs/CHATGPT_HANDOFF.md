# StoryOS — full context (paste this to ChatGPT / any AI)

Use this document **without opening GitHub**. It is enough to discuss next steps.

---

## What StoryOS is

**StoryOS** is a **small, cinematic front-end demo** (React + Vite). It is **not** a product with a backend, **not** connected to real AI APIs, and **not** a chat app.

**Intent:** Let someone **watch a fixed “mission” unfold** — like seeing a high-stakes decision get reasoned through step by step: brief → research → analysis → tension → strategy → **critic objection** → **final decision**. The feeling is *“I’m watching judgment happen”*, not *“I’m typing to a bot.”*

**Positioning vs chat UIs (ChatGPT, Claude, etc.):** Those are **conversational** (turn-taking, prompts, replies). StoryOS is **monologic and sequential**: one authored story, no user messages, no streaming. The UI uses a **vertical thread spine** and **typed beats** (e.g. Brief, Tension, Critic, Decision) so it reads as a **live reasoning line**, not a transcript of chat bubbles.

**Live demo URL (if useful):** `https://storyos.vercel.app`

---

## Tech stack

- **React 18** + **Vite 5**
- **Plain CSS** (no component library)
- **Fonts:** Cormorant Garamond (story text), Outfit (UI)
- **Deploy:** typically **Vercel** (static build)

---

## User flow (two screens)

1. **Landing** — Minimal intro: headline *“Watch AI think.”*, short copy, single CTA **“Start a mission”**. Content **fades in**; the button **stays disabled ~1.9s** so the opening feels intentional. On click: **~800ms pause** (anticipation), then **landing fades out ~0.76s**, then the **story view** appears and the timeline **auto-starts** (no second “Start” on first entry).

2. **Story view** — Title **StoryOS**, button shows **Watching…** while the sequence runs, then **Watch again** to replay. A **scrollable timeline** shows beats one after another.

---

## Core architecture (do not break without good reason)

**Single source of narrative:** `src/story/tellStory.js`

- **`STORY_SEQUENCE`** — array of `{ text, type, delay }`. All copy and beat types live here. **Pacing** is mostly these `delay` values plus shared timing constants (see below).
- **`wait(ms)`** — one `Promise` + `setTimeout` wrapper; all delays go through it.
- **`tellStory(onStep, isCancelled)`** — **one `async` `for` loop** over `STORY_SEQUENCE`. Strictly **sequential** (no parallel timers). For each step: optional **anticipation** waits (before **conflict**, **critic**, **final**), then `onStep(step)`, then `wait(step.delay)`, then a **variable micro-gap** before the next step. After the last step: **`REFLECTION_AFTER_FINAL_MS`** (long stillness on the final line), then **`UI_SETTLE_AFTER_REFLECTION_MS`**, then the function returns so the UI can re-enable **Watch again**.

**Types** used in `STORY_SEQUENCE` / CSS: `open`, `default`, `conflict`, `critic`, `final`.  
**Critic** is special: extra anticipation, **left-aligned** “objection” styling, italic, edge animation — **not** the same as `default`.

**React wiring:**

- **`App.jsx`** — `view`: `landing` | `story`; `running` toggles the timeline; `enterStory` handles anticipation + fade + `setRunning(true)`.
- **`StoryTimeline.jsx`** — When `running` is true, waits **`STORY_START_DELAY_MS`**, then calls **`tellStory`**, appending each step to **`revealed`** state; on completion calls **`onRunEnd`**.
- **`StoryEvent.jsx`** — Renders one beat; shows optional **role label** (Brief, Tension, Critic, Decision) for some types; CSS handles motion and variants.
- **`Landing.jsx` / `Landing.css`** — Intro only; **no** story logic.

**Docs in repo:** `README.md` (run + overview), `PROJECT_CONTEXT.md` (detailed handoff, timing table, paste block), this file.

---

## Current story content (theme)

The demo sequence is a **high-stakes startup commit**: runway, competitive reality, a **tension** beat (fundraising narrative vs retention truth), strategy, a **critic** objection, then a **conditional final decision** (vertical, retention bar, pivot rule). Exact strings are in **`STORY_SEQUENCE`** in `tellStory.js`.

---

## Explicit non-goals (today)

- No backend, auth, database, or real LLM calls.
- No user-editable missions in the UI.
- Not trying to clone ChatGPT; it’s a **different metaphor** (watched process vs chat).

---

## How to discuss “next step” with ChatGPT

Paste this file (or the sections you need) and say something like:

- *“StoryOS is described above. We’re staying demo-only. I want to [X].”*
- *“Keep `tellStory` as the single async loop. Propose only copy/CSS/timing changes unless I ask for structure.”*

If you change **timing**, edit **`tellStory.js`** constants and/or `STORY_SEQUENCE` delays. If you change **copy**, edit **`STORY_SEQUENCE`** only. If you change **layout/feel**, edit **`StoryEvent.css`**, **`StoryTimeline.css`**, **`Landing.css`**, **`App.css`**.

---

*Last aligned with the StoryOS repo layout as of this file’s commit; if something drifts, `PROJECT_CONTEXT.md` in the same repo is the detailed source of truth.*
