# StoryOS

**Live demo:** [storyos.vercel.app](https://storyos.vercel.app/)

Cinematic front-end demo: a **quiet landing** (“Watch AI think.”) → **Start a mission** / **Try the demo** fades into the story view, where one **`STORY_SEQUENCE`** and async **`tellStory()`** run (no parallel timers). **Conflict** reads as a **disruption**; **Final** uses slower entrance, glow, and a **reflection pause** before the button returns. Use **Start** on the story screen to replay.

```bash
npm install
npm run dev
```

No backend, no API, no real AI.

**Architecture & pacing details:** [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
