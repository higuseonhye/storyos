# StoryOS — research signals, upgrades, and governance worldview

This note ties **recent research / product trends** to concrete StoryOS directions, plus a **policy & “civilization-scale”** lens (worldview, automation, bounded self-improvement). It is not legal advice.

---

## 1. Recent research & tech trends (selected)

| Direction | Why it matters for StoryOS | Pointers |
|-----------|---------------------------|----------|
| **When multi-agent deliberation helps (and when it doesn’t)** | *DeliberationBench* reports that naïve multi-LLM deliberation often loses to simpler baselines at higher cost — so StoryOS should treat “more voices” as a **UX + epistemics** choice, not a guarantee of quality. Product implication: expose **protocol** (parallel voices vs. sequential critique vs. single merged answer) and measure user outcomes. | [DeliberationBench (arXiv:2601.08835)](https://arxiv.org/abs/2601.08835) |
| **Structured multi-agent + human critical thinking** | *Perspectra*-style UIs (targeted experts, threading, argument maps) increased critical-thinking behaviors vs. group-chat baselines. StoryOS already has **roles**; next step is **threads / @-roles / map view** for long missions. | [Perspectra (arXiv:2509.20553)](https://arxiv.org/abs/2509.20553) |
| **Human-in-the-loop agentic systems** | *Magentic-UI* emphasizes **co-planning**, **guards**, and **memory** with human oversight — aligns with StoryOS pins, tool transparency, and “Stop”. | [Microsoft Research — Magentic-UI](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/) |
| **Deliberative quality in LLMs** | Work on **belief revision** and **deliberative norms** under controlled conditions — useful for a future **Facilitator** agent that enforces turn-taking, evidence requests, and disagreement capture. | e.g. OpenReview “Can AI Deliberate?” (search title) |
| **Participatory “constitutions”** | *Public Constitutional AI* frames **stakeholder deliberation** on principles and case-law-like refinement — maps to **tenant-defined panel charters** (what agents must never do, citation rules, risk tiers). | [Public Constitutional AI (arXiv:2406.16696)](https://arxiv.org/abs/2406.16696) |
| **MCP & tools** | Standard tool surfaces (MCP) + **audited** tool execution are now table stakes for serious deployments — StoryOS already integrates MCP; next is **allowlists**, **logging**, and **per-tenant server lists**. | [modelcontextprotocol.io](https://modelcontextprotocol.io) |

---

## 2. Recommended product upgrades (from the above)

1. **Deliberation mode selector** — `parallel_panel` (today) vs. `sequential_critique` vs. `merge_best` (inspired by DeliberationBench baselines).  
2. **Facilitator / clerk agent** — lightweight model pass that summarizes **agreement / disagreement / open questions** after each round.  
3. **Perspectra-like affordances** — optional **thread** per sub-question; **mind-map** or “claim → support → risk” panel.  
4. **Action guards** — confirm before high-impact MCP tools (filesystem, network, payments).  
5. **Run artifacts** — export transcript + tool log + model IDs for audit (Magentic-style traceability).  
6. **Charter layer** — YAML/JSON **panel constitution** per workspace (roles, red lines, citation requirements).

---

## 3. Worldview & policy — concepts you care about

### AI “civilization” without mystique

- Treat “civilization” as **institutions**: roles, norms, enforcement, memory, and **legibility** to humans — not an emergent soul in the weights. StoryOS already **dramatizes** reasoning; the serious counterpart is **governance artifacts** (charters, logs, approvals).

### Recursive self-improvement (RSI)

- **Unbounded RSI** (models rewriting their own objectives without oversight) is not something to productize casually.  
- **Bounded refinement** (what StoryOS does with `SELF_IMPROVE_MAX_ROUNDS`) is closer to **editing** than RSI: fixed rounds, human-visible output, no silent self-modification of system prompts on disk.

### Automation

- Automate **orchestration** (tool routing, summarization, formatting), not **final accountability**. Default stance: **human approves** irreversible or externally visible actions; automation speeds the **draft**, not the **commit**.

### Worldview layering

1. **User worldview** — pinned insights + topic framing (already in UI).  
2. **Org policy** — charter file + tool allowlist + model allowlist.  
3. **Societal / legal** — retention, EU AI Act–style logging, consumer protection — operationalize in deployment guides, not only in model prompts.

### Practical “north star”

> **Make trade-offs visible, tools legible, and humans able to say no — at every layer.**

---

## 4. Theater curtain (UX)

The red **stage curtain** in the app is a deliberate metaphor: the panel is a **performance of reasoning** — useful for intuition — while **governance** (pins, provider switch, MCP limits) is the **backstage** contract that keeps it safe and inspectable.

---

*Last updated: 2026-03 — verify arXiv / links periodically.*
