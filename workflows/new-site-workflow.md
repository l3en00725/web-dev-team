# New Site Workflow (Video-Led Design)

## Overview

Step-by-step workflow for building a new website using the **Video-Led Design** approach. Design extraction happens externally in the Gemini Web Interface, then feeds back into this repository.

**Duration:** Varies by complexity  
**Agents Involved:** Orchestrator, Architect, Content, Design Gem (External), Builder, Admin/QA  
**Key Change:** Content headlines are written BEFORE design to enable content-led layouts.

---

## Workflow Summary

| Phase | Name | Model/Interface | Key Output |
|-------|------|-----------------|------------|
| 1 | Initialization | — | Cloned repo, init script run |
| 2 | Kickoff | Claude | `project-profile.json`, `constraints.md` |
| 3 | Architecture | Claude Opus | `strategy.md`, `site-structure.json`, `seo-requirements.md` |
| 4 | Content - Headlines | Claude Sonnet | `anchor-copy.md` |
| 5 | Design (External) | Gemini Web Gem | `layout-manifest.json`, `design-tokens.json`, assets |
| 6 | Build | Cursor Auto | Working pages from manifest |
| 7 | Content - Body | Claude Sonnet | Full page content |
| 8 | QA | Claude | PageSpeed 95+, all checks pass |
| 9 | Deployment | — | Live site |

---

## Phase 1: Initialization

### Step 1.1: Clone Hub Repository

```bash
git clone https://github.com/your-org/web-dev-team.git [project-name]
cd [project-name]
```

### Step 1.2: Run Init Script

```bash
./scripts/init-project.sh
```

This script will:
- Prompt for new project name
- Create new GitHub repository
- Remove Hub's git history
- Initialize fresh git
- Push to new repo

### Step 1.3: Repo Graduation (if in Hub)

**Skill:** Repo Graduation  
**Owner:** Builder Agent

- [ ] New GitHub repo created
- [ ] Fresh git history initialized
- [ ] Code pushed to new repo
- [ ] Vercel project created
- [ ] Hub fully detached

---

## Phase 2: Site Kickoff

**Model:** Claude  
**Owner:** Orchestrator Agent

### Prompt:
```
You are the Orchestrator Agent. Read /skills/site-kickoff/SKILL.md and /rules/system-rules.md.

Guide me through Site Kickoff. Ask me about:
1. Site type (Marketing, Local SEO, SaaS, etc.)
2. Primary goal (Lead gen, SEO traffic, conversions)
3. Distribution strategy (Local, Multi-state, Global, SaaS)
4. Required integrations
5. Logo files

Output project-profile.json and constraints.md when complete.
```

### Checklist:
- [ ] Site type classification
- [ ] Primary goal
- [ ] Distribution strategy
- [ ] Distribution-specific requirements
- [ ] App linkage check
- [ ] Required integrations
- [ ] Logo files collected

### Outputs:
- [ ] `project-profile.json`
- [ ] `constraints.md`

### Gate:
**Cannot proceed to Phase 3 until both files exist.**

---

## Phase 3: Architecture

**Model:** Claude Opus  
**Owner:** Architect Agent

### Prompt:
```
You are the Architect Agent. Read /agents/architect.md and review project-profile.json.

Create the following strategy documents:
1. strategy.md — Site goals, audience, positioning, brand direction
2. site-structure.json — Complete page hierarchy with slugs
3. content-schema.md — Content types and field definitions
4. seo-requirements.md — Metadata rules per page type

Output the full file contents for each.
```

### Checklist:
- [ ] `strategy.md` — Site goals, audience, positioning
- [ ] `site-structure.json` — Page hierarchy and routes
- [ ] `content-schema.md` — Content types and fields
- [ ] `seo-requirements.md` — Metadata rules per page type

### Optional (if applicable):
- [ ] Keyword validation via Keywords API
- [ ] Location strategy (if Local SEO)

### Gate:
**Cannot proceed to Phase 4 until all 4 files exist.**

---

## Phase 4: Content - Headlines (Anchor Copy)

**Model:** Claude Sonnet  
**Owner:** Content Agent

> **WHY THIS PHASE EXISTS:** High-quality design is "content-led." The Design Gem needs to know the exact headlines to create layouts that fit the content. Generic layouts happen when design precedes content.

### Prompt:
```
You are the Content Agent. Read site-structure.json.

We need "Anchor Content" for the design phase. Write ONLY:
- H1 Headline
- H2 Subheadline  
- CTA button text

For these pages:
- Homepage
- Key landing pages (from site-structure.json)

Output as anchor-copy.md.

IMPORTANT: Do NOT write body paragraphs yet. This copy will drive the visual design.
```

### Checklist:
- [ ] H1 headlines for all key pages
- [ ] H2 subheadlines for all key pages
- [ ] CTA button text for all key pages
- [ ] Output saved as `anchor-copy.md`

### Gate:
**Cannot proceed to Phase 5 until `anchor-copy.md` exists with headlines for all key pages.**

---

## Phase 5: Design Extraction (External Gem)

**Interface:** Gemini Web — Design Director (Web Dev Team) Gem  
**Owner:** User (with Design Gem)

> **THIS IS AN AIR-GAPPED PHASE.** You will leave Cursor, go to Gemini Web Interface, extract the design, and bring the outputs back.

### Step 5.1: Find Inspiration

- [ ] Go to [Awwwards](https://www.awwwards.com/) to find a reference site
- [ ] Browse Sites of the Day, Nominees, or Collections for inspiration
- [ ] Pick a site that matches your desired vibe/aesthetic

### Step 5.2: Record Video

- [ ] Open the reference site in your browser
- [ ] Record a 30-60 second screen capture showing:
  - Hero section and initial viewport
  - Scrolling behavior and animations
  - Hover interactions on buttons/cards
  - Key page sections
- [ ] Save the video file

### Step 5.3: Prepare Other Inputs

- [ ] Have `anchor-copy.md` content ready to paste (H1, H2, CTAs from Phase 4)
- [ ] Have `project-profile.json` context ready (site type, brand direction)

### Step 5.4: Open Design Gem

- [ ] Go to [Gemini Web Interface](https://gemini.google.com)
- [ ] Open the **"Design Director (Web Dev Team)"** Gem

### Step 5.5: Upload & Extract

Upload the video, then use this prompt:
```
Extract the design system for this content based on the video.

ANCHOR COPY:
[Paste contents of anchor-copy.md here]

PROJECT CONTEXT:
[Paste relevant info from project-profile.json]

OUTPUT:
1. layout-manifest.json — Full structure with sections, layers, z-index, Tailwind classes
2. design-tokens.json — Colors, typography, spacing, animations
3. Asset prompts — Descriptions for any background images needed
```

### Step 5.6: Copy Outputs Back to Cursor

- [ ] Create `src/data/layout-manifest.json` — paste the layout manifest JSON
- [ ] Create `src/data/design-tokens.json` — paste the design tokens JSON
- [ ] Download/generate any assets to `/public/assets/`

### Step 5.7: Verify Assets

- [ ] Check `layout-manifest.json` for asset references (e.g., `hero-bg.webp`)
- [ ] Confirm each referenced asset exists in `/public/assets/`
- [ ] If missing, generate with Gem or create placeholder

### Outputs:
- [ ] `src/data/layout-manifest.json`
- [ ] `src/data/design-tokens.json`
- [ ] All referenced assets in `/public/assets/`

### Gate:
**Cannot proceed to Phase 6 until all files exist and JSON is valid.**

---

## Phase 6: Build

**Model:** Cursor Auto  
**Owner:** Builder Agent

### Prompt:
```
You are the Builder Agent. Read /agents/builder.md.

I have placed the design spec in:
- src/data/layout-manifest.json (Page Blueprint)
- src/data/design-tokens.json (Global Variables)

Execute these steps in order:

1. CONFIG: Apply tailwind_config.extend from layout-manifest.json to tailwind.config.mjs

2. ASSET VERIFICATION: Scan layout-manifest.json for all asset references in the layers arrays. Verify each exists in /public/assets/. If missing, create a placeholder div with a red border and log: "WARNING: Missing asset [filename]"

3. BUILD: Implement the Homepage using the exact layers, z-index, and classes defined in the manifest.

STRICT RULE: Follow the manifest exactly. Do not refactor into a standard grid unless the JSON specifies it. Do not invent layouts.
```

### Checklist:
- [ ] Tailwind config updated with manifest extensions
- [ ] Assets verified (or placeholders created)
- [ ] Homepage built from manifest
- [ ] All pages from `site-structure.json` created
- [ ] Layouts match manifest exactly
- [ ] CMS/content structure set up
- [ ] Forms implemented
- [ ] SEO components created
- [ ] `npm run build` passes

### Gate:
**Cannot proceed to Phase 7 until build passes and pages render.**

---

## Phase 7: Content - Body

**Model:** Claude Sonnet  
**Owner:** Content Agent

### Prompt:
```
You are the Content Agent. Read /agents/content.md, site-structure.json, and content-schema.md.

The layout is built. Now write the full body content:
1. Body paragraphs for all pages
2. FAQ sections (question → answer → depth pattern)
3. Feature descriptions
4. Service details
5. Meta descriptions (< 160 chars)
6. Alt text for images

Follow the content schema exactly. Use keywords naturally.
```

### Checklist:
- [ ] Body content for all pages
- [ ] FAQ sections written
- [ ] Meta titles (< 60 chars)
- [ ] Meta descriptions (< 160 chars)
- [ ] Image alt text
- [ ] Keywords naturally integrated
- [ ] Heading hierarchy correct (H1 → H2 → H3)

### Gate:
**Cannot proceed to Phase 8 until all pages have complete content.**

---

## Phase 8: Quality Assurance

**Model:** Claude  
**Owner:** Admin/QA Agent

### Prompt:
```
You are the Admin/QA Agent. Read /agents/admin-qa.md and /skills/pagespeed-pre-commit/SKILL.md.

Run the full QA checklist:
1. Build verification — npm run build passes
2. All pages render without errors
3. PageSpeed 95+ (mobile and desktop)
4. All internal links valid
5. SEO metadata on all pages
6. Schema markup implemented
7. Analytics connected
8. Forms working

Do not approve deployment until all checks pass.
```

### Checklist:
- [ ] `npm run build` passes
- [ ] All pages render
- [ ] No console errors
- [ ] PageSpeed 95+ mobile
- [ ] PageSpeed 95+ desktop
- [ ] All internal links valid
- [ ] Meta titles on all pages
- [ ] Meta descriptions on all pages
- [ ] Schema markup implemented
- [ ] Google Analytics connected
- [ ] Search Console connected
- [ ] Forms submit successfully

### Gate:
**Cannot proceed to Phase 9 until QA Agent explicitly approves deployment.**

---

## Phase 9: Deployment

**Owner:** Admin/QA Agent

### Step 9.1: Final Approval

- [ ] All QA checks passed
- [ ] Deployment explicitly approved
- [ ] Approval documented with timestamp

### Step 9.2: Deploy to Production

```bash
vercel --prod
```

### Step 9.3: Post-Deploy Verification

- [ ] Production site loads
- [ ] Analytics tracking
- [ ] Forms submitting
- [ ] Sitemap submitted to Search Console

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 1: INITIALIZATION                     │
│  Clone Hub → Init Script → Repo Graduation                      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 2: KICKOFF (Claude)                   │
│  Site Type → Goals → Integrations → project-profile.json        │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 3: ARCHITECTURE (Claude Opus)         │
│  Strategy → Structure → Schema → SEO Requirements               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 4: CONTENT - HEADLINES (Sonnet)       │
│  H1 → H2 → CTAs → anchor-copy.md                                │
│  ⚠️ CRITICAL: Design needs this content first!                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 5: DESIGN (Gemini Web Gem)            │
│  ⚠️ EXTERNAL: Leave Cursor → Gemini Web Interface               │
│  Video + Headlines → layout-manifest.json + design-tokens.json  │
│  → Copy outputs back to Cursor                                  │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 6: BUILD (Cursor Auto)                │
│  Config → Asset Verify → Build from Manifest                    │
│  ⚠️ STRICT: Follow manifest exactly, no improvising             │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 7: CONTENT - BODY (Sonnet)            │
│  Body Copy → FAQs → Meta → Alt Text                             │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 8: QA (Claude)                        │
│  Build → Performance → Links → SEO → Analytics                  │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 9: DEPLOYMENT                         │
│  Approval → Deploy → Verify                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Time Estimates

| Phase | Typical Duration |
|-------|------------------|
| Initialization | 30 minutes |
| Kickoff | 30 minutes |
| Architecture | 2-4 hours |
| Content - Headlines | 30-60 minutes |
| Design (External) | 1-2 hours |
| Build | 4-8 hours |
| Content - Body | 2-4 hours |
| QA | 2-4 hours |
| Deployment | 30 minutes |
| **Total** | **12-24 hours** |

*Times vary based on site complexity and number of pages.*

---

## Quick Reference: Model Switching

| Phase | Model | Where |
|-------|-------|-------|
| Kickoff | Claude | Cursor |
| Architecture | Claude Opus | Cursor |
| Content - Headlines | Claude Sonnet | Cursor |
| Design | Gemini | **Web Interface (External)** |
| Build | Cursor Auto | Cursor |
| Content - Body | Claude Sonnet | Cursor |
| QA | Claude | Cursor |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Design Gem outputs invalid JSON | Ask Gem to "fix the JSON syntax" |
| Missing assets after design | Generate with Gem or create placeholders |
| Builder deviates from manifest | Re-prompt with "Follow the manifest exactly" |
| Generic layouts despite manifest | Check if manifest has proper layer definitions |
| Headlines don't fit layout | Re-run design extraction with updated headlines |
