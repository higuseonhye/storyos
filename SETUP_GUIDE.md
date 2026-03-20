# StoryOS — Setup guide (buyer onboarding)

Use this after you unzip or clone the template.

## Prerequisites

- **Node.js 18+** (20 LTS recommended)
- **npm** (comes with Node)
- An **OpenAI** or **Anthropic** API key with billing enabled (provider-dependent)

## 3-step install

### 1. Install dependencies

```bash
cd storyos
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

- Default path: set **`OPENAI_API_KEY`** (required unless you switch provider).
- Anthropic path: set **`LLM_PROVIDER=anthropic`** and **`ANTHROPIC_API_KEY`**.

Never commit `.env`. Use your host’s secret store in production (e.g. Vercel → Environment Variables).

### 3. Run the stack

```bash
npm run dev:all
```

Open **http://localhost:5173** → **Open live panel**. You should see a green-ish status line: backend provider and model, not a red “API key” warning.

---

## First-run checklist

- [ ] `npm install` completed with no errors
- [ ] `.env` exists and contains a valid **`OPENAI_API_KEY`** (or Anthropic vars)
- [ ] `npm run dev:all` shows both **api** and **web** processes
- [ ] Browser: **Live panel** loads; header shows **`Backend: openai`** (or **`anthropic`**) and a model name
- [ ] Send a short message — three columns stream text in parallel
- [ ] **Pinned insights**: optional; models may suggest lines you can remove

If anything fails, read the **Top 5 mistakes** below.

---

## Top 5 common mistakes

1. **Empty or wrong API key** — Local: the API process **exits immediately** and prints missing variable names. Fix `.env` and restart. If you used `STORYOS_SKIP_ENV_CHECK=1`, the server starts but the UI shows **which** key is missing via `/api/health`.

2. **Only running Vite** (`npm run dev`) — The UI will load but the panel cannot reach the API. Use **`npm run dev:all`** or run **`npm run server`** in a second terminal.

3. **Anthropic without switching provider** — You must set **`LLM_PROVIDER=anthropic`** and **`ANTHROPIC_API_KEY`**. OpenAI keys are not used when Anthropic is selected.

4. **Production: secrets only in `.env` on your laptop** — Vercel (and similar) do **not** read your local `.env`. Add **`OPENAI_API_KEY`** (and friends) in the project **Environment Variables** UI, then **redeploy**.

5. **MCP on Vercel** — **`MCP_SERVERS`** is for **long-running Node** (Railway, Render, Fly, local). Serverless cannot reliably run stdio MCP children. Deploy the full `server/index.js` elsewhere if you need MCP.

---

## Useful commands

| Command | When |
|---------|------|
| `npm run server` | API only (port from `PORT`, default `3001`) |
| `npm run dev` | Frontend only (expects API elsewhere or proxy) |
| `npm run ci` | Before shipping: lint + production build |

**Important:** type **`npm run ci`** only — no extra words. (`npm run ci passes` makes npm run `vite build passes`, which breaks the build.)

---

## AgentOS (optional)

If you use StoryOS as a shell for **AgentOS** or a human-approval queue:

- Set **`STORYOS_MODE=agentOS`** and **`AGENTOS_WEBHOOK_URL`** on the **server** (see `.env.example`).
- Set **`VITE_MODE=agentOS`** if you want the **AgentOS** badge in the UI (rebuild after changing).

Full payload and security notes: **[docs/AGENTOS.md](./docs/AGENTOS.md)**.

---

## Getting help

- Check **README.md** (architecture, FAQ).
- Check **CUSTOMIZATION.md** if behavior is “wrong” but the stack runs (often prompts or agent list).

Enjoy shipping.
