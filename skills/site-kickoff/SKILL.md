---
name: site-kickoff
description: Initializes every new website build from the Hub repo. Determines site type, page distribution strategy, and required integrations. Blocks build if critical decisions are missing.
owner: Entry Gate (runs before any agent)
trigger: Immediately after importing Hub repo
llm: Claude Opus
---

# Site Kickoff Skill

## Purpose

Eliminate memory load and enforce repeatable, high-quality site starts. This skill ensures every project begins with the same clear structure and all critical decisions are locked before any agent work begins.

---

## Trigger

Immediately after importing the Hub repo. This is the **first skill** that runs — no exceptions.

---

## Workflow

### Step 1: Site Classification

Determine the type of site being built:

**Site Type Options:**
- Marketing/Brand
- Local SEO Service
- Content/Blog
- SaaS/App Frontend
- E-commerce
- Vacation Rental

**Primary Goal Options:**
- Lead generation
- Organic SEO traffic
- Brand authority
- Conversion/booking
- Content distribution

### Step 2: Page Distribution Strategy

Select the distribution approach:

| Strategy | Description |
|----------|-------------|
| Local SEO | City/town based pages |
| Multi-State / National | State-level hierarchy |
| Global / Worldwide | Country/language targets |
| SaaS / App-First | Feature, use-case, persona pages |
| Hybrid | Multiple strategies with precedence |

### Step 3: Distribution-Specific Requirements

Based on selected strategy, gather additional requirements:

**If Local SEO:**
- List of target cities/towns
- Slug pattern (e.g., `/services/[city]-[state]/`)
- Internal linking rules between locations

**If Multi-State:**
- List of target states
- Hierarchical structure (state → city)
- Canonical rules for overlapping content

**If Global:**
- Country/language targets
- i18n strategy
- hreflang implementation plan

**If SaaS:**
- Feature pages list
- Use-case pages list
- Persona pages list

**If Hybrid:**
- Precedence rules
- SEO priority order
- Conflict resolution

### Step 4: Content Strategy

Define content approach:

- Pillar/cluster intent (main topics + supporting content)
- Primary topics (3-5 main themes)
- Target keyword themes (broad categories)

### Step 5: Repo Graduation Reminder

Confirm understanding that:

- [ ] Hub repo is NOT the final destination
- [ ] Production site will live in its own repo
- [ ] New repo name is decided
- [ ] Vercel project will link to new repo

### Step 6: App Linkage Check

Determine if site connects to an existing app:

- Does this site link to an existing app? (Yes/No)
- If yes:
  - App URL
  - Sign Up URL
  - Sign In URL
  - Shared Supabase project? (Yes/No)

### Step 7: Required Integrations

Identify needed integrations:

**Analytics:**
- [ ] Google Analytics 4
- [ ] Plausible (alternative)

**Forms:**
- [ ] Webhook endpoints
- [ ] CRM connection
- [ ] Email notifications

**CMS Source:**
- [ ] File-based (Markdown/JSON)
- [ ] Astro Content Collections
- [ ] Supabase tables
- [ ] External API

**Industry-Specific:**
- [ ] Bing Places (Local SEO)
- [ ] Other APIs

### Step 8: Logo Collection

Gather logo assets for the project:

**Logo Availability:**
- Does user have logo files? (Yes/No)
- Is SVG available? (Yes/No)
  - If no SVG: Convert PNG via [Vectorizer.ai](https://vectorizer.ai)

**Required Logo Variants:**
- [ ] Full logo (horizontal/primary)
- [ ] Icon-only (logomark/symbol)
- [ ] Light version (for dark backgrounds)
- [ ] Dark version (for light backgrounds)

**Store Location:**
- Confirm logos will be stored in `/public/logos/`
- Reference paths will be added to `design-tokens.json`

**Logo Checklist:**
| Variant | Format | Status |
|---------|--------|--------|
| Full logo | SVG | [ ] |
| Icon-only | SVG | [ ] |
| Light version | SVG | [ ] |
| Dark version | SVG | [ ] |

### Step 9: LLM Confirmation

Confirm agent assignments:

| Agent | Assigned LLM | Confirmed |
|-------|--------------|-----------|
| Architect Agent | Claude Opus | [ ] |
| Builder Agent | Cursor Auto | [ ] |
| Design/Imagery Agent | Gemini | [ ] |
| Content Agent | Claude | [ ] |
| Admin/QA Agent | Claude | [ ] |

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `project-profile.json` | Complete project configuration |
| `constraints.md` | Technical and business constraints |
| Site type confirmed | Classification documented |
| Distribution strategy confirmed | Approach documented |
| Repo graduation acknowledged | User confirmed understanding |
| Logo files collected | SVG variants in `/public/logos/` |

---

## Output Templates

### project-profile.json

```json
{
  "projectName": "",
  "siteType": "",
  "primaryGoal": "",
  "distributionStrategy": "",
  "distributionDetails": {
    "locations": [],
    "slugPattern": "",
    "linkingRules": ""
  },
  "contentStrategy": {
    "pillarTopics": [],
    "targetKeywordThemes": []
  },
  "appLinkage": {
    "hasApp": false,
    "appUrl": "",
    "signUpUrl": "",
    "signInUrl": "",
    "sharedSupabase": false
  },
  "integrations": {
    "analytics": "",
    "forms": [],
    "cms": "",
    "industrySpecific": []
  },
  "llmAssignments": {
    "architect": "Claude Opus",
    "builder": "Cursor Auto",
    "design": "Gemini",
    "content": "Claude",
    "admin": "Claude"
  },
  "logoAssets": {
    "hasLogo": false,
    "hasSvg": false,
    "convertedViaPng": false,
    "variants": {
      "full": "",
      "iconOnly": "",
      "light": "",
      "dark": ""
    },
    "storePath": "/public/logos/"
  },
  "repoGraduationConfirmed": false,
  "newRepoName": "",
  "createdAt": ""
}
```

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Incomplete site classification | **STOP** — Cannot proceed |
| Missing distribution strategy | **STOP** — Cannot proceed |
| Repo graduation not confirmed | **STOP** — Cannot proceed |
| LLM assignments not confirmed | **STOP** — Cannot proceed |
| Logo files not collected | **FLAG** — Design Agent needs logos |

---

## Success Criteria

Site Kickoff is complete when:

- [ ] Site type is classified
- [ ] Primary goal is defined
- [ ] Distribution strategy is selected
- [ ] Distribution-specific requirements are documented
- [ ] Content strategy is outlined
- [ ] Repo graduation is acknowledged
- [ ] App linkage is determined
- [ ] Required integrations are identified
- [ ] Logo files collected (SVG preferred, PNG converted via Vectorizer.ai)
- [ ] LLM assignments are confirmed
- [ ] `project-profile.json` is generated
- [ ] `constraints.md` is generated

---

## Next Steps

After Site Kickoff completes:

1. **Repo Graduation Skill** — Create new repo, detach Hub
2. **Architect Agent** — Begin strategy and structure work
