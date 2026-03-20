# StoryOS — Customization guide

How to adapt the template without hunting the whole repo.

## Change agent personas

1. **Backend (source of truth)** — Edit **`server/agents.js`**:
   - Each entry has `id`, `label`, `shortLabel`, `accent`, and **`systemPrompt`**.
   - Keep **`id`** values stable if you don’t want to touch the UI stream keys (`strategist`, `skeptic`, `operator`).

2. **Frontend labels** — Mirror agent metadata in **`src/components/DiscussionStudio.jsx`** inside **`agentMeta`** (ids must match **`server/agents.js`**).

3. **Transcript formatting** — **`server/discussStream.js`** uses **`AGENTS`** from **`server/agents.js`** for history labels; no change needed if you only edited **`agents.js`**.

## Add a new agent (fourth voice)

1. Append an object to **`AGENTS`** in **`server/agents.js`** with a new **`id`**.
2. Add the same **`id`** to **`agentMeta`** in **`DiscussionStudio.jsx`**.
3. Extend **`EMPTY_BUFFERS`** / **`EMPTY_BUFFERS()`** usage: today it is **`{ strategist, skeptic, operator }`**. Add your id there and anywhere **`nextBuffers`** is keyed.
4. Run **`npm run lint`** and exercise the panel — streaming events use **`ev.id`**; the backend already iterates **`AGENTS`**.

(If you prefer fewer files to touch, start by only editing prompts in **`agents.js`** for the three existing roles.)

## Where to edit prompts

| Piece | File | What it does |
|-------|------|----------------|
| Per-agent voice | **`server/agents.js`** | `systemPrompt` for each role |
| Shared rules (length, tools, tone) | **`server/discussStream.js`** | String built in **`streamOne`** after `agent.systemPrompt` |
| User message framing | **`server/discussStream.js`** | **`buildUserPayload()`** |

After changes, restart **`npm run server`** / **`npm run dev:all`**.

## Add a built-in tool

1. Open **`server/tools/builtin.js`**.
2. Register a handler in **`BUILTIN_HANDLERS`** with a unique name, e.g. **`storyos_my_tool`**.
3. Add a **`chatCompletionTool`** entry in **`BUILTIN_OPENAI_TOOLS`** (name, description, JSON Schema for arguments).
4. Implement the handler to return a **string** (or structured text) the model can read.

Tools are merged with MCP tools in **`server/createApp.js`**; the OpenAI/Anthropic runners handle the loop.

## Connect an MCP server

1. Use a **long-running** Node host (local **`npm run server`**, Railway, etc.) — **not** Vercel serverless.
2. Set **`MCP_SERVERS`** in `.env` to a **JSON array** of:

   ```json
   { "id": "short-id", "command": "npx", "args": ["-y", "@scope/mcp-server"], "cwd": "/optional/path" }
   ```

3. Tools appear as **`mcp__<id>__<toolName>`** to the model.
4. Restart the API. With **`DEBUG=true`**, MCP summary lines print to the server console.

## UI-only tweaks

- **Styles:** **`src/components/DiscussionStudio.css`**
- **Stream / health behavior:** **`src/components/DiscussionStudio.jsx`**
- **API base URL:** **`src/lib/apiBase.js`** + **`VITE_API_BASE_URL`**

## Environment flags (reminder)

See **`.env.example`** for every variable. Common tuning:

- **`SELF_IMPROVE_MAX_ROUNDS`** — extra refinement pass per agent (0–3).
- **`MAX_TOOL_STEPS`** — cap tool iterations per agent turn.
- **`DEBUG=true`** — verbose StoryOS debug logs on the server.

## AgentOS webhook

To POST each completed panel round to your own API, configure **`STORYOS_MODE`**, **`AGENTOS_WEBHOOK_URL`**, and **`VITE_MODE`** as in **`.env.example`**. See **[docs/AGENTOS.md](./docs/AGENTOS.md)**.
