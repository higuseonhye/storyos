# StoryOS

**Live demo:** [storyos.vercel.app](https://storyos.vercel.app/)

StoryOS is two experiences:

1. **Live panel** — multi-agent discussion on a small **Express** API with **pluggable LLMs** (`LLM_PROVIDER=openai` or `anthropic`), **function/tool calling** (built-ins + **[MCP](https://modelcontextprotocol.io/)** tools from stdio servers), optional **bounded self-refine** (`SELF_IMPROVE_MAX_ROUNDS`), and **pinned insights** you can add/remove (no opaque “model memory” lock-in).
2. **Scripted demo** — the original cinematic timeline: fixed **`STORY_SEQUENCE`**, **`tellStory()`** loop, typed beats (Brief, Tension, Critic, Decision).

## Quick start (full stack)

```bash
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env

npm run dev:all
```

- **Web:** Vite (default port `5173`) — proxies `/api` → `http://localhost:3001`
- **API:** `node server/index.js` — `PORT` default `3001`

Frontend only:

```bash
npm run dev
```

Without the API, **Open live panel** will show an offline notice; **Watch scripted demo** still works.

## Tools, MCP, providers

- **Built-in tools:** `storyos_datetime`, `storyos_calculator`, `storyos_suggest_memory` (emits a suggestion the UI can keep or delete via **Pinned insights**).
- **MCP:** set **`MCP_SERVERS`** to a JSON array of `{ "id", "command", "args"?, "cwd"? }` — each server’s tools are exposed to the models with stable names `mcp__<id>__<tool>`. MCP `callTool` requests are **serialized** per process to avoid stdio races when three agents run in parallel.
- **Switch models:** **`LLM_PROVIDER=openai`** (default, needs `OPENAI_API_KEY`) or **`LLM_PROVIDER=anthropic`** (needs `ANTHROPIC_API_KEY`). Same tool schema is mapped for Anthropic’s `input_schema`.
- **Self-improvement:** **`SELF_IMPROVE_MAX_ROUNDS`** (0–3) runs an extra tightening pass per agent after the first draft (bounded — not unbounded recursive self-modification).

See **`.env.example`** for all variables.

## Production

- **Static app:** `npm run build` → deploy `dist/` (e.g. Vercel; see `vercel.json`).
- **API:** run `server/` on any Node host (Railway, Render, Fly, etc.). Set keys for your provider, optional models, **`CORS_ORIGIN`**, and optionally **`MCP_SERVERS`**. Each user message runs **three parallel** agent turns (each may use tools / refine).
- **Frontend env:** set **`VITE_API_BASE_URL`** to your API origin (no trailing slash), e.g. `https://api.example.com`, so the browser calls the API directly.

**Checks:** `npm run lint` · `npm run ci` (lint + build).

**Architecture & pacing (demo):** [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) · **Paste for ChatGPT:** [`docs/CHATGPT_HANDOFF.md`](./docs/CHATGPT_HANDOFF.md)
