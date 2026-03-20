# StoryOS

**Live demo:** [storyos.vercel.app](https://storyos.vercel.app/)

Cinematic demo: landing fades in; CTAs unlock after a short beat → **Start a mission** / **Try the demo** → pause, then fade → story. The fixed **`STORY_SEQUENCE`** walks through one **concrete decision** (e.g. *Should we build an AI note-taking app?* — research → tension → recommendation). Pacing is unchanged; **`tellStory()`** handles gaps, conflict beat, reflection, then **Watch again** eases in.

```bash
npm install
npm run dev
```

No backend, no API, no real AI.

**Architecture & pacing details:** [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) (includes **§10 — current stage & next actions** for planning)
