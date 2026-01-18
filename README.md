# Web Dev Hub — Orchestrated Build Protocol

This repository uses a **HUMAN-IN-THE-LOOP orchestrator** to coordinate LLM-powered web development.

**Nothing auto-runs across LLMs.**

The orchestrator is a prompt router that:
- Tracks build phases
- Enforces quality gates
- Outputs EXACT prompts for each phase
- Recommends which LLM to use
- Waits for you to confirm completion before advancing

**The orchestrator does NOT design. It does NOT build. It does NOT invent visuals.**

It keeps everyone honest.

---

## How to Start

**Recommended Orchestrator LLM:** Claude (Opus or Sonnet)

**Exact Orchestrator Startup Prompt:**

```
You are the Web Dev Orchestrator.

Your responsibilities:
- Track build phases
- Enforce phase gates
- Recommend which LLM to use for each phase
- Provide EXACT prompts to paste into those LLMs
- Wait for my explicit confirmation before advancing phases

You do NOT design.
You do NOT build.
You do NOT invent visuals.
You do NOT skip phases.

Your job is to keep the process clean, explicit, and human-in-the-loop.

**FIRST:** Verify repository context (Phase 0 — REQUIRED)

Run:
- git rev-parse --is-inside-work-tree
- git remote -v

Then ask me for:
1. Project name
2. Site type (marketing, nonprofit, SaaS, local service, etc.)
3. Whether this is a NEW BUILD or a REBUILD
4. Expected GitHub repository URL (owner/repo-name)

**Then compare current remotes against expected repo.**
**If mismatch → STOP and provide exact fix commands (no suggestions).**

Only after repository is verified, proceed to Phase 1 (Site Kickoff).
```

### The Division of Labor

> **Gemini interprets taste.**  
> **Cursor executes taste.**  
> **The orchestrator keeps everyone honest.**

**📚 All prompts available in:** `/docs/prompt-library.md`

---

# web-dev-team

Hub repository for AI-assisted website development. This is **NOT** a production site — it defines agents, skills, rules, and workflows that get pulled into every new project.

---

## Quick Start

```bash
# 1. Clone this repo
git clone https://github.com/your-org/web-dev-team.git my-new-site
cd my-new-site

# 2. Run the init script
./scripts/init-project.sh

# 3. Follow Site Kickoff prompts
# 4. Collect logo files (SVG preferred, convert PNG via SVGcode if needed)
# 5. Build your site
```

> **Logo Requirement:** All projects need logo files before build. SVG format preferred. If you only have PNG, convert via [SVGcode](https://svgco.de) — free, runs in browser.

---

## What's Inside

### Agents (Who Thinks)

| Agent | Role | LLM |
|-------|------|-----|
| **Orchestrator** | Prompt routing, phase tracking, gate enforcement | Claude |
| **Architect** | Strategy, structure, constraints | Claude Opus |
| **Builder** | Implementation, code, components | Cursor Auto (GPT-5 / GPT-4.1) |
| **Design/Imagery** | Design analysis, tokens, image generation | Gemini |
| **Content** | SEO copy, metadata, page content | Claude |
| **Admin/QA** | Verification, backend setup, deploy approval | Claude |

**Important:** See `/docs/llm-roles.md` for detailed clarification on when to use which LLM.

> **Gemini interprets taste.**  
> **Cursor executes taste.**  
> **The orchestrator keeps everyone honest.**

See `/agents/` for full agent definitions.

### Skills (What Gets Done)

| Skill | Purpose |
|-------|---------|
| **Site Kickoff** | Entry gate for every project |
| **Repo Graduation** | Enforces separate production repos |
| **Env Variable Setup** | Configures all required env vars |
| **Webhook/Forms** | Simple form handling with Supabase |
| **Keywords API** | SEO keyword validation |
| **Local SEO Location Builder** | Generates location pages at scale |
| **Schema/SEO Metadata** | Implements SEO requirements |
| **PageSpeed Pre-Commit** | Blocks deploy if < 95 score |
| **Vercel OG Image** | Dynamic social preview images |
| **Design System** | Converts inspiration to tokens |
| **Imagery Workflow** | Image generation and optimization |
| **Pixels/Media API** | Stock photo integration |
| **Admin Dashboard** | Full backend for site management |
| **CMS/Content Connector** | Structured content system |
| **Social Publishing** | LinkedIn and Medium distribution |
| **Redirects** | URL mapping for rebuilds |

See `/skills/` for full skill specifications.

### Rules (Hard Gates)

1. **No build without Site Kickoff** — Must complete initialization
2. **Hub repo is development only** — Production sites graduate to own repo
3. **LLM per agent must be confirmed** — Before proceeding
4. **Missing distribution strategy = stop** — Required for architecture
5. **Missing env vars = stop** — Required for functionality
6. **Performance must pass 95+** — Before deploy (mobile + desktop)
7. **Admin Agent must approve deployment** — Final gate
8. **No deploy without Analytics connected** — GA4 + Search Console required
9. **Logo files required** — SVG preferred; convert PNG via [SVGcode](https://svgco.de) — free, runs in browser — if needed

See `/rules/system-rules.md` for full rule documentation.

---

## Folder Structure

```
web-dev-team/
├── /agents/           → Agent definitions (6 agents including Orchestrator)
├── /skills/           → Skill specs (16 skills, SKILL.md format)
├── /rules/            → System guardrails
├── /workflows/        → Step-by-step flows
├── /design/           → Design inspiration prompts and analysis
├── /docs/             → Documentation (LLM roles, best practices)
├── /capabilities/     → API playbooks
├── /scripts/          → Automation (init-project.sh)
├── /templates/        → Starter files for new projects
├── /public/logos/     → Logo files (SVG + variants)
├── .env.example       → Environment variable template
├── README.md          → This file
└── CURSOR-RULES.md    → Cursor IDE rules
```

---

## Workflows

### New Site
1. Clone Hub → Run init script → Site Kickoff
2. Architect defines strategy and structure
3. Design Agent creates design tokens
4. **[OPTIONAL]** Design Inspiration Review (Gemini analysis outside Cursor)
5. Builder implements site following design rules
6. Imagery Agent generates/sources images
7. Content Agent writes copy
8. Admin/QA verifies and approves
9. Deploy

See `/workflows/new-site-workflow.md` for detailed steps.

**Key addition:** Phase 3A (Design Inspiration Review) is optional but strongly recommended for any design-forward site. See `/design/design-inspiration-prompt.md` for the canonical Gemini prompt.

### Rebuild Site
Same as new site, plus:
- Collect old URLs
- Create redirect mapping
- Verify redirects before and after deploy

See `/workflows/rebuild-site-workflow.md` for detailed steps.

---

## Critical Reminder

**Every production site must live in its own repo.**

This hub is pulled in, then detached. Never deploy this repo directly.

---

## LLM Requirements

Before any build, confirm:

| Agent | LLM |
|-------|-----|
| Architect Agent | Claude Opus |
| Builder Agent | Cursor Auto |
| Design/Imagery Agent | Gemini |
| Content Agent | Claude |
| Admin/QA Agent | Claude |

---

## Environment Variables

Required for all projects:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GA_MEASUREMENT_ID`
- `ANTHROPIC_API_KEY`
- `KEYWORDS_API_KEY`

See `.env.example` for full list and documentation.

---

## Performance Standards

All sites must meet:

| Metric | Minimum |
|--------|---------|
| PageSpeed Mobile | 95 |
| PageSpeed Desktop | 95 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

---

## 2026 SEO Compliance

This system enforces modern SEO best practices:

- ✅ Single intent per page
- ✅ Pillar + cluster structure
- ✅ E-E-A-T (author, sources, credentials)
- ✅ FAQ sections with schema
- ✅ AI-friendly content patterns
- ✅ Core Web Vitals (95+)
- ✅ Lean index / no bloat
- ✅ Internal linking strategy
- ✅ Content refresh tracking
- ✅ Bing optimization (exact-match, Places, social signals)

---

## Contributing

This is a system repo. Changes should be:
1. Documented with rationale
2. Tested on a real project
3. Backward compatible where possible

---

## License

Private / Internal Use
