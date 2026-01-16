# System Rules

## Overview

Eight non-negotiable rules that govern the web-dev-team system. These rules are hard gates — no exceptions without documented override and explicit approval.

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
