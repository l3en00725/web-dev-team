# System Rules

## Overview

Eleven non-negotiable rules that govern the web-dev-team system. These rules are hard gates — no exceptions without documented override and explicit approval.

---

## Rule 1: No Build Without Site Kickoff

**Gate Type:** Entry  
**Enforced By:** System  
**Consequence:** Build blocked

### Description
Every project must complete the Site Kickoff Skill before any agent begins work. This ensures:
- Site type is classified
- Distribution strategy is defined
- Required integrations are identified
- LLM assignments are confirmed

### Enforcement
- Site Kickoff must output `project-profile.json`
- Site Kickoff must output `constraints.md`
- Incomplete classification = stop
- Missing distribution strategy = stop

### Override
Not allowed. Site Kickoff is mandatory.

---

## Rule 2: Hub Repo is Development Only

**Gate Type:** Structural  
**Enforced By:** Repo Graduation Skill  
**Consequence:** Build blocked

### Description
The web-dev-team Hub repository is a template and system definition. Production sites must graduate to their own dedicated repository.

### Why
- Keeps Hub clean and reusable
- Prevents accidental changes to system files
- Ensures each site has independent version control
- Required for proper Vercel project linking

### Enforcement
- Repo Graduation Skill runs after Site Kickoff
- New repo URL must be confirmed
- Vercel project must link to new repo
- Hub must be detached as origin

### Override
Not allowed. Every production site needs its own repo.

---

## Rule 3: LLM Per Agent Must Be Confirmed

**Gate Type:** Configuration  
**Enforced By:** Site Kickoff Skill  
**Consequence:** Build blocked

### Description
Each agent has a designated LLM. These assignments must be confirmed before proceeding.

### Assignments
| Agent | LLM | Rationale |
|-------|-----|-----------|
| Architect | Claude Opus | Complex strategy, highest quality |
| Builder | Cursor Auto | Code implementation, speed |
| Design/Imagery | Gemini | Visual analysis, image generation |
| Content | Claude | SEO copy, quality writing |
| Admin/QA | Claude | Verification, checklists |

### Enforcement
- Site Kickoff prompts for LLM confirmation
- No agent work proceeds without confirmation
- Assignments documented in `project-profile.json`

### Override
Requires documented justification. Different LLM must be explicitly approved.

---

## Rule 4: Missing Distribution Strategy = Stop

**Gate Type:** Strategic  
**Enforced By:** Site Kickoff Skill  
**Consequence:** Build blocked

### Description
Every site must have a defined distribution strategy before architecture begins.

### Distribution Types
- **Local SEO** — City/town based pages
- **Multi-State / National** — State-level hierarchy
- **Global / Worldwide** — Country/language targets
- **SaaS / App-First** — Feature, use-case, persona pages
- **Hybrid** — Multiple strategies with precedence rules

### Why
Distribution strategy determines:
- Page structure
- URL patterns
- Internal linking rules
- Content requirements
- SEO approach

### Enforcement
- Site Kickoff requires distribution selection
- Distribution-specific requirements must be documented
- Architect cannot proceed without this

### Override
Not allowed. Distribution strategy is required.

---

## Rule 5: Missing Env Vars = Stop

**Gate Type:** Technical  
**Enforced By:** Env Variable Setup Skill  
**Consequence:** Build blocked

### Description
All required environment variables must exist locally and in Vercel before build proceeds.

### Minimum Required Vars
```
SUPABASE_URL
SUPABASE_ANON_KEY
GA_MEASUREMENT_ID
ANTHROPIC_API_KEY
KEYWORDS_API_KEY
```

### Additional Vars (as needed)
```
PAGESPEED_API_KEY
PEXELS_API_KEY
UNSPLASH_API_KEY
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
MEDIUM_ACCESS_TOKEN
GOOGLE_SEARCH_CONSOLE_API_KEY
```

### Enforcement
- `.env.example` must list all required keys
- `.env.local` must exist with real values
- Vercel project must have matching env vars
- Supabase connection must be verified

### Override
Requires documented justification. Missing vars must have explicit workaround.

---

## Rule 6: Performance Must Pass 95+ Before Deploy

**Gate Type:** Quality  
**Enforced By:** PageSpeed/Pre-Commit Skill, Admin/QA Agent  
**Consequence:** Deployment blocked

### Description
No site deploys without passing performance thresholds.

### Thresholds
| Metric | Minimum Score |
|--------|---------------|
| Performance (Mobile) | 95 |
| Performance (Desktop) | 95 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

### Core Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Enforcement
- PageSpeed API runs against preview URL
- Results documented in `pagespeed-report.json`
- Scores below threshold = deployment blocked
- Admin/QA Agent cannot approve failing sites

### Override
Requires:
- Documented justification
- Mitigation plan
- Explicit approval from Admin/QA Agent
- Override recorded with date and reason

---

## Rule 7: Admin Agent Must Approve Deployment

**Gate Type:** Authority  
**Enforced By:** Admin/QA Agent  
**Consequence:** Deployment blocked

### Description
Admin/QA Agent has final authority on deployment. No site ships without explicit approval.

### Approval Requirements
- Pre-launch checklist 100% complete
- All pages render without errors
- No broken internal links
- SEO metadata verified
- Analytics connected
- Performance thresholds met

### Approval Process
1. Admin/QA Agent runs all checks
2. Issues documented and fixed
3. Re-verification after fixes
4. Explicit "APPROVED" or "REJECTED" status
5. Approval recorded with timestamp

### Enforcement
- Deployment requires approval status
- Rejected sites cannot deploy
- Approval must be explicit, not assumed

### Override
Not allowed. Admin/QA Agent approval is mandatory.

---

## Rule 8: No Deploy Without Analytics Connected

**Gate Type:** Tracking  
**Enforced By:** Admin/QA Agent  
**Consequence:** Deployment blocked

### Description
Every site must have Google Analytics and Search Console connected before deployment.

### Required Connections
- Google Analytics 4 (GA4)
- Google Search Console
- Bing Webmaster Tools (recommended)
- Bing Places (if Local SEO)

### Why
- Cannot measure success without tracking
- Search Console required for sitemap submission
- Bing visibility requires Webmaster Tools
- Local SEO requires Bing Places

### Enforcement
- Admin Dashboard must show connected status
- GA4 tracking code must be present
- Search Console property must be verified
- Pre-launch checklist includes verification

### Override
Requires:
- Documented justification
- Plan for post-launch connection
- Explicit approval from Admin/QA Agent

---

## Rule 9: Logo Must Link to Homepage

**Gate Type:** UX Standard  
**Enforced By:** Builder Agent  
**Consequence:** Site non-compliant with standard UX patterns

### Description
Every logo in the header or navigation must be clickable and link to the homepage. This is a universal UX pattern that users expect.

### Why
- **Universal expectation** — Users expect logo to be a "home" button
- **Accessibility** — Provides clear navigation path to homepage
- **Professional standard** — Expected behavior on all professional sites
- **User experience** — Quick way to return to homepage from any page

### Enforcement
- Builder Agent must implement logo as link to `/`
- Logo link must include `aria-label="Home"` for accessibility
- Applies to all header/navigation logos (full logo, icon-only, mobile nav, desktop nav, sticky nav)
- QA verification checks logo links to homepage

### Implementation

```astro
<!-- Standard Header Logo -->
<header>
  <nav>
    <a href="/" aria-label="Home">
      <img src="/logos/logo-full.svg" alt="Site Name" />
    </a>
  </nav>
</header>

<!-- Icon-Only Logo -->
<a href="/" aria-label="Home">
  <img src="/logos/logo-icon.svg" alt="Site Name" class="h-8 w-8" />
</a>

<!-- Mobile Navigation Logo -->
<nav class="mobile-nav">
  <a href="/" aria-label="Home">
    <img src="/logos/logo-icon.svg" alt="Site Name" />
  </a>
</nav>
```

### Override
Not allowed. Logo linking to homepage is a standard UX requirement.

---

## Override Documentation Template

When any rule requires an override:

```markdown
## Override Record

**Rule:** [Rule number and name]
**Date:** YYYY-MM-DD
**Project:** [Project name]
**Requested By:** [Name]
**Approved By:** [Name]

### Justification
[Detailed reason why override is necessary]

### Risk Assessment
[What could go wrong]

### Mitigation Plan
[How risks will be addressed]

### Post-Override Actions
[What will be done after override]

### Expiration
[When this override expires or must be revisited]
```

---

## Rule Hierarchy

If rules conflict, follow this priority:

1. **Security** — Never compromise security
2. **Quality** — Performance and SEO thresholds
3. **Process** — Workflow and approval gates
4. **Configuration** — LLM and env var requirements

---

## Rule 10: Icon System Must Use Lucide Icons (SVG-Only)

**Gate Type:** Design Standard  
**Enforced By:** Builder Agent, Orchestrator (Phase 5 gate)  
**Consequence:** Build blocked

### Description
Every website build must use Lucide Icons as the primary and default icon system. SVG format only. No emojis, PNGs, JPGs, or third-party icon images.

### Why
- Ensures visual consistency across all projects
- Maintains professional design quality at scale
- Removes subjective icon decisions
- SVG icons are scalable, performant, and accessible

### Requirements

**Primary Icon Library:**
- **Lucide Icons** — Default and primary icon system
- **Format:** SVG only
- **Installation:** Required at project setup
  - Install via package manager (`lucide-react`, `lucide`, or framework-appropriate variant), OR
  - Create local `/icons/lucide/` folder with copied SVGs from lucide.dev

**Usage Priority:**
Lucide icons must be used first for:
- Feature cards
- Benefit lists
- UI affordances (navigation, CTAs, highlights)
- Abstract concepts (impact, recognition, programs, trust, etc.)

**Styling Standards:**
- Consistent stroke-based icons only
- Standard sizes:
  - 24px for inline/UI icons
  - 28–32px for feature or section icons
- Icons inherit current text color unless explicitly overridden

**Prohibited:**
- ❌ Emojis as icons
- ❌ Mixed icon styles on the same page
- ❌ Image-based icons (PNG/JPG/WebP)
- ❌ Multiple icon libraries in the same project

### Enforcement
- Builder Agent must install Lucide icons at project setup
- Orchestrator verifies icon system in Phase 5 (Build) gate
- No UI work proceeds without Lucide icons installed
- Icon usage must be consistent across all sections

### Project Setup Checklist (Required)
Before any UI work begins:
- [ ] Lucide icons installed or SVGs added locally
- [ ] Icon usage rule acknowledged
- [ ] No emojis or image icons introduced
- [ ] Icons used consistently across all sections

### Fallback Rule
If a suitable Lucide icon does not exist:
- Request approval before introducing any alternative icon source
- Document the exception in `/imagery/icons.md`

### Override
Requires:
- Documented justification
- Approval from Architect Agent
- Exception recorded in `/imagery/icons.md`
- Plan to migrate to Lucide when suitable icon becomes available

---

## Rule 11: Local Dev Server Management (ONE Persistent Server)

**Gate Type:** Workflow Efficiency  
**Enforced By:** Builder Agent, Orchestrator (Phase 5 instructions)  
**Consequence:** Inefficient workflow, multiple servers causing confusion

### Description
Every project must use ONE persistent local development server during the Build phase. Never launch multiple servers. Keep the server running continuously. Local development and Vercel deployment are completely separate environments.

### Why
- Prevents port conflicts and server confusion
- Eliminates friction when switching between local dev and Vercel deployment
- Saves time by avoiding unnecessary server restarts
- Ensures clear separation between development and production environments

### Requirements

**Server Management:**
- **Start server ONCE** at the beginning of Build Phase: `npm run dev`
- **Keep server running** throughout the entire Build Phase
- **DO NOT stop server** after deploying to Vercel
- **DO NOT launch multiple servers** — use the existing one
- **Changes auto-reload** — no need to restart server

**Local Development vs Vercel Deployment:**
- **Local Dev:** `http://localhost:4321/` (your development environment)
- **Vercel Deployment:** `https://your-site.vercel.app` (production, separate)

**These are SEPARATE:**
- Local dev server = your development environment (localhost)
- Vercel deployment = production environment (hosted)
- You can have BOTH running at the same time
- Changes to local files don't affect Vercel until you deploy

**Workflow:**
1. Start local dev server ONCE: `npm run dev`
2. Keep server running continuously
3. Make changes locally (server auto-reloads)
4. Test locally at `http://localhost:4321/`
5. Deploy to Vercel when ready: `git push`
6. **Keep local server running** after deployment
7. Continue working locally for tweaks
8. Deploy again when ready

### Prohibited Actions
- ❌ Stopping local server after deploying to Vercel
- ❌ Starting a new server after deploying to Vercel
- ❌ Launching multiple dev servers simultaneously
- ❌ Running `npm run dev` multiple times
- ❌ Deploying to Vercel for every local change

### Required Actions
- ✅ Start local dev server ONCE at Build Phase start
- ✅ Keep server running continuously
- ✅ Work locally, test locally, deploy separately
- ✅ Return to local dev immediately after deployment

### Verification Checklist
Before Build Phase:
- [ ] Check if dev server is already running (`lsof -ti:4321`)
- [ ] If not running, start ONCE: `npm run dev`
- [ ] If running, use existing server (don't start new one)

During Build Phase:
- [ ] Dev server running on `http://localhost:4321/`
- [ ] Server stays running (not stopped/restarted)
- [ ] Changes auto-reload (no manual restart needed)

After Vercel Deployment:
- [ ] Local dev server still running
- [ ] Continue working locally
- [ ] Deploy to Vercel separately when ready

### Enforcement
- Builder Agent checks server status at Build Phase start
- Orchestrator provides clear instructions for server management
- System reminds user to keep server running
- Port conflict warnings direct user to use existing server

### Override
Not recommended. One persistent server is the most efficient workflow. Override only if:
- Port 4321 is truly unavailable and cannot be freed
- Alternative development setup is explicitly required
- Exception documented with justification

---

## Compliance Verification

Before any deployment, verify:

- [ ] Rule 1: Site Kickoff completed
- [ ] Rule 2: Site in own repo (not Hub)
- [ ] Rule 3: LLM assignments confirmed
- [ ] Rule 4: Distribution strategy defined
- [ ] Rule 5: All env vars present
- [ ] Rule 6: PageSpeed 95+ achieved
- [ ] Rule 7: Admin/QA approval received
- [ ] Rule 8: Analytics connected
- [ ] Rule 9: Logo links to homepage
- [ ] Rule 10: Lucide icons installed and used consistently
- [ ] Rule 11: One persistent local dev server running (not multiple servers)
