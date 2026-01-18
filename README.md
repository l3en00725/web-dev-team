# web-dev-team

Hub repository for AI-assisted website development. This is **NOT** a production site — it defines agents, skills, rules, and workflows that get pulled into every new project.

---

## 🚀 How to Start a New Project

### Step 1: Clone the Hub

```bash
git clone https://github.com/your-org/web-dev-team.git my-new-site
cd my-new-site
```

### Step 2: Start the Orchestrator

Open a new chat in Cursor and paste this prompt:

```
You are the Orchestrator Agent. 

Read these files:
- /agents/orchestrator.md
- /rules/orchestration-rules.md
- /rules/system-rules.md

Guide me through the entire website build from start to finish.
Start with Phase 0: Site Kickoff.
```

### Step 3: Follow the Orchestrator

The Orchestrator will guide you through every phase:

| Phase | What Happens | Model |
|-------|--------------|-------|
| 0. Kickoff | Define site type, goals, integrations | Claude |
| 1. Architect | Create strategy and structure | Claude Opus |
| 2. Headlines | Write H1, H2, CTAs for design | Claude Sonnet |
| 3. Design | Extract design from video reference | Gemini Web Gem |
| 4. Build | Implement site from manifest | Cursor Auto |
| 5. Content | Write full body copy | Claude Sonnet |
| 6. QA | Verify and approve deployment | Claude |

The Orchestrator will:
- Tell you exactly which model to switch to
- Generate complete, ready-to-paste prompts (no editing needed)
- Verify outputs before proceeding to next phase

---

## Prerequisites

Before starting, you need:

1. **Design Director Gem** configured in Gemini Web Interface
   - See `/agents/design-imagery.md` for Gem setup instructions
2. **Logo files** (SVG preferred)
   - If only PNG: convert via [SVGcode](https://svgco.de) — free, runs in browser
3. **Reference video** for design inspiration
   - Record a 30-60 second screen capture from [Awwwards](https://www.awwwards.com/)

---

## Quick Reference

```bash
# Clone and start
git clone https://github.com/your-org/web-dev-team.git my-new-site
cd my-new-site

# Then paste the Orchestrator prompt into Cursor chat
```

> **Logo Requirement:** All projects need logo files before build. SVG format preferred. If you only have PNG, convert via [SVGcode](https://svgco.de) — free, runs in browser.

---

## What's Inside

### Agents (Who Thinks)

| Agent | Role | LLM |
|-------|------|-----|
| **Architect** | Strategy, structure, constraints | Claude Opus |
| **Builder** | Implementation, code, components | Cursor Auto |
| **Design/Imagery** | Visuals, tokens, image generation | Gemini |
| **Content** | SEO copy, metadata, page content | Claude |
| **Admin/QA** | Verification, backend setup, deploy approval | Claude |

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
├── /agents/           → Agent definitions (5 agents)
├── /skills/           → Skill specs (16 skills, SKILL.md format)
├── /rules/            → System guardrails
├── /workflows/        → Step-by-step flows
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

### New Site (Video-Led Design)
1. **Kickoff** → Define site type, goals, integrations
2. **Architect** → Create strategy, structure, SEO requirements
3. **Content (Headlines)** → Write H1, H2, CTAs (design needs this first!)
4. **Design (External)** → Record video from Awwwards → Extract via Gemini Gem
5. **Build** → Implement from layout-manifest.json (follow exactly!)
6. **Content (Body)** → Write full page content
7. **QA** → Verify PageSpeed 95+, approve deployment
8. **Deploy** → Ship it!

See `/workflows/new-site-workflow.md` for detailed steps.

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

