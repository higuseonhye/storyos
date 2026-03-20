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

### Same-site deploy (Vercel: frontend + API together)

This repo includes **`api/index.js`**, which runs the Express stack as a **Vercel serverless** function. All `/api/*` routes are rewritten to it (`vercel.json`).

1. Connect the repo to **Vercel** (framework: Vite, or leave auto-detect; `vercel.json` sets `build` + `outputDirectory`).
2. In **Vercel → Project → Settings → Environment Variables** (Production + Preview as needed), set:
   - **`OPENAI_API_KEY`** — your key (or use Anthropic below).
   - Optionally **`OPENAI_MODEL`**, **`LLM_PROVIDER`**, **`ANTHROPIC_API_KEY`**, **`ANTHROPIC_MODEL`** — same meanings as `.env.example`.
3. **Do not set `VITE_API_BASE_URL`** for this setup — the browser should call **`/api/...`** on the **same** origin (`storyos.vercel.app`).
4. Redeploy. **`MCP_SERVERS` is ignored on Vercel** (stdio MCP needs a long-running Node process); use **Railway/Render/Fly** for the full API + MCP if you need that.

**Limits:** Long panel streams may hit **serverless max duration** (e.g. 10s on Hobby, up to 60s with Pro and `maxDuration` in `api/index.js`). Upgrade plan or host the API elsewhere if hits time out.

### Split deploy (static + API elsewhere)

- **Static app:** `npm run build` → deploy `dist/` anywhere.
- **API:** run `server/index.js` on Railway, Render, Fly, etc. Set keys, **`CORS_ORIGIN`** to your site, optional **`MCP_SERVERS`**.
- **Frontend env:** set **`VITE_API_BASE_URL`** to that API origin (no trailing slash).

**Checks:** `npm run lint` · `npm run ci` (lint + build).

**Research & governance lens:** [`docs/RESEARCH_AND_GOVERNANCE.md`](./docs/RESEARCH_AND_GOVERNANCE.md)

**Architecture & pacing (demo):** [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) · **Paste for ChatGPT:** [`docs/CHATGPT_HANDOFF.md`](./docs/CHATGPT_HANDOFF.md)
