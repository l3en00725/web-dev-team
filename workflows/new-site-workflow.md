# New Site Workflow

## Overview

Step-by-step workflow for building a new website from scratch using the web-dev-team Hub.

**Duration:** Varies by complexity  
**Agents Involved:** All five agents  
**Skills Used:** Most skills (excluding Redirects)

---

## Phase 0: Repository Verification (REQUIRED — FIRST STEP)

**Purpose:** Verify repository context before any work begins  
**Agent:** Orchestrator (Claude)  
**When:** Immediately after cloning Hub or starting a new project  
**Critical:** This phase MUST pass before any other work begins

### Step 0.1: Verify Git Repository

**Command:**
```bash
git rev-parse --is-inside-work-tree
```

**Expected output:** `true`

**If false:** STOP — Must be inside a Git repository to proceed

### Step 0.2: Check Current Remotes

**Command:**
```bash
git remote -v
```

**Orchestrator displays output verbatim** — no interpretation

Example output:
```
origin  https://github.com/web-dev-team/template-repo.git (fetch)
origin  https://github.com/web-dev-team/template-repo.git (push)
```

### Step 0.3: Compare Against Expected Repository

**Expected repository info comes from:**
1. `.project-repo.json` file (recommended — created during init or kickoff)
2. Explicit user confirmation during orchestrator startup

**Compare:**
- Current `origin` remote
- Expected repository from `.project-repo.json` or user input

### Step 0.4: Handle Mismatch (if detected)

**If `origin` ≠ expected repo:**

**🚫 HARD STOP**

Orchestrator provides exact fix commands (no suggestions):

```
Option A — Replace origin (most common)
git remote set-url origin https://github.com/owner/repo-name.git

Option B — Remove + re-add origin
git remote remove origin
git remote add origin https://github.com/owner/repo-name.git

Option C — Abort and re-clone correctly
cd ..
rm -rf [project-name]
git clone https://github.com/owner/repo-name.git
```

**Nothing proceeds until fix is executed and verified.**

### Step 0.5: Verification Re-Check

After fix execution:
- Orchestrator re-runs `git remote -v`
- Verifies `origin` matches expected repository
- User confirms fix is complete

### Step 0.6: Create `.project-repo.json` (Recommended)

If not already present, create:

**File:** `.project-repo.json`

```json
{
  "project": "Project Name",
  "expected_remote": "https://github.com/owner/repo-name.git",
  "owner": "github-username-or-org",
  "type": "website"
}
```

**Why this matters:**
- Machine-verifiable truth (not memory)
- Prevents accidental commits to wrong repo
- Can be checked in CI/CD or pre-commit hooks
- Explicit project identity

**Phase 0 Gate:**
- ✅ Git repository verified
- ✅ Remote origin matches expected repository
- ✅ `.project-repo.json` exists (recommended)
- ✅ User explicitly confirms verification is complete

**Only then can Phase 1 (Initialization) begin.**

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

### Step 1.3: Complete Site Kickoff

**Skill:** Site Kickoff  
**Owner:** Entry Gate

Answer all prompts:
- [ ] Site type classification
- [ ] Primary goal
- [ ] Distribution strategy
- [ ] Distribution-specific requirements
- [ ] Content strategy
- [ ] Repo graduation confirmation
- [ ] App linkage check
- [ ] Required integrations
- [ ] LLM confirmation

**Outputs:**
- `project-profile.json`
- `constraints.md`

---

## Phase 2: Repository Setup

### Step 2.1: Repo Graduation

**Skill:** Repo Graduation  
**Owner:** Builder Agent

- [ ] New GitHub repo created
- [ ] Fresh git history initialized
- [ ] Code pushed to new repo
- [ ] Vercel project created
- [ ] Vercel linked to new repo
- [ ] Hub fully detached

### Step 2.2: Environment Variables

**Skill:** Env Variable Setup  
**Owner:** Builder Agent

- [ ] `.env.example` created
- [ ] `.env.local` populated
- [ ] Vercel env vars configured
- [ ] Supabase connection verified

---

## Phase 3: Architecture

### Step 3.1: Strategy Definition

**Agent:** Architect Agent (Claude Opus)

Create:
- [ ] `strategy.md` — Site goals, audience, positioning
- [ ] `site-structure.json` — Page hierarchy and routes
- [ ] `content-schema.md` — Content types and fields
- [ ] `seo-requirements.md` — Metadata rules per page type
- [ ] `constraints.md` — Technical limitations

### Step 3.2: Keyword Validation

**Skill:** Keywords API  
**Owner:** Architect Agent

- [ ] Seed keywords identified
- [ ] Search volume validated
- [ ] Zero-volume keywords flagged
- [ ] `keyword-data.json` generated

### Step 3.3: Location Strategy (if Local SEO)

**Skill:** Local SEO Location Builder (planning)  
**Owner:** Architect Agent

- [ ] Target locations listed
- [ ] Slug pattern defined
- [ ] Internal linking rules specified

---

## Phase 4: Design

### Step 4.1: Design Inspiration Review (OPTIONAL BUT STRONGLY RECOMMENDED)

**Phase:** 3A — Design Inspiration Review  
**Skill:** Design System (Analysis Phase)  
**Owner:** Design/Imagery Agent (Gemini — **OUTSIDE Cursor**)

**When to use this phase:**
- ANY site where visual quality matters
- Not limited to illustrated sites
- Applies to minimalist, editorial, cinematic, motion-heavy, or any design-forward site

**Process:**
1. [ ] User visits Awwwards (or similar high-quality site gallery)
2. [ ] User captures screenshots OR screen recording of 2-3 relevant sites
3. [ ] User uploads to Gemini in a separate conversation (NOT in Cursor)
4. [ ] User pastes the **Design Inspiration Prompt** (see `/design/design-inspiration-prompt.md`)
5. [ ] Gemini analyzes and returns design intelligence (NOT code)
6. [ ] User reviews output for quality and clarity
7. [ ] User saves output as `design-analysis.md` in project root

**What this phase produces:**
- Overall design style description
- Layout & spacing philosophy
- Typography hierarchy rules
- Color usage strategy
- Motion & scroll behavior patterns
- Section composition guidelines
- Anti-patterns to avoid

**Gate:** User confirms design analysis is complete and saved before proceeding.

**Critical notes:**
- This is descriptive analysis, NOT executable code
- Gemini output must be reviewed before Builder uses it
- If illustration is needed, rules will emerge from this phase
- This phase may result in motion, layout, or minimalist guidance instead

### Step 4.2: Design Tokens

**Skill:** Design System  
**Owner:** Design/Imagery Agent

- [ ] `design-tokens.json` generated
- [ ] `effects.md` created
- [ ] Color contrast verified (WCAG 2.1 AA)

### Step 4.3: Brand Assets

**Skill:** Design System  
**Owner:** Design/Imagery Agent

- [ ] Favicon (all sizes) created
- [ ] App icons (PWA) created
- [ ] Assets stored in `/public/`

---

## Phase 5: Build

### Step 5.1: Project Structure

**Agent:** Builder Agent (Cursor Auto)

**GEO Schema Requirements (for Local SEO sites — MANDATORY):**

Before Build phase can complete (if distribution strategy = "local-seo" or "multi-state-national"):

1. **LocalBusiness Schema:**
   - [ ] Present on homepage (if applicable)
   - [ ] Includes GeoCoordinates (lat/lng)
   - [ ] Includes service area (GeoCircle or areaServed)

2. **Place Schema:**
   - [ ] Present on all location pages
   - [ ] Includes GeoCoordinates
   - [ ] Includes service area if applicable

3. **Enhanced Schema:**
   - [ ] GeoCircle for service boundaries
   - [ ] City list in areaServed (if applicable)

**Gate Check (Orchestrator enforces):**
- [ ] LocalBusiness schema verified (if local SEO)
- [ ] Place schema verified (if location pages)
- [ ] GeoCoordinates present
- [ ] Service area defined

**Mobile Optimization Requirements (MANDATORY FOR ALL SITES):**

Before Build phase can complete:

1. **Viewport Meta Tag:**
   - [ ] Present in all layouts
   - [ ] Correct format: `<meta name="viewport" content="width=device-width, initial-scale=1">`

2. **Responsive Design:**
   - [ ] Mobile-first approach implemented
   - [ ] Tailwind responsive prefixes used (`sm:`, `md:`, `lg:`)
   - [ ] All pages tested at 375px width

3. **No Horizontal Scroll:**
   - [ ] Homepage tested at 375px (no horizontal scroll)
   - [ ] All key pages tested at 375px
   - [ ] Content fits within viewport

4. **Touch Targets:**
   - [ ] All buttons ≥ 44x44px
   - [ ] All links have adequate touch area
   - [ ] Adequate spacing between interactive elements

5. **Typography:**
   - [ ] Base font size ≥ 16px
   - [ ] Line height ≥ 1.5
   - [ ] Text contrast meets WCAG AA

6. **Images:**
   - [ ] Responsive images (srcset or responsive)
   - [ ] Images scale properly on mobile

7. **Navigation:**
   - [ ] Mobile navigation functional
   - [ ] Hamburger menu or mobile nav pattern
   - [ ] Works without JavaScript (progressive enhancement)

8. **Forms:**
   - [ ] Input fields properly sized
   - [ ] Submit buttons touch-friendly
   - [ ] Forms usable on mobile

**Gate Check (Orchestrator enforces):**
- [ ] Viewport meta tag verified
- [ ] No horizontal scroll at 375px
- [ ] Touch targets adequate size
- [ ] Base font size ≥ 16px
- [ ] Mobile navigation functional
- [ ] Forms usable on mobile

**Cannot proceed to Content phase without mobile optimization verification.**

- [ ] Astro project initialized
- [ ] Dependencies installed
- [ ] File structure created
- [ ] Design tokens applied to CSS

### Step 5.2: CMS Setup

**Skill:** CMS/Content Connector  
**Owner:** Builder Agent

- [ ] CMS option selected
- [ ] Content collections configured
- [ ] Schemas implemented with Zod
- [ ] Content loading utilities created

### Step 5.3: Page Implementation

**Agent:** Builder Agent

- [ ] All pages from `site-structure.json` created
- [ ] Layouts implemented
- [ ] Components built
- [ ] Routes configured
- [ ] **Logo in header/navigation links to homepage** (`<a href="/" aria-label="Home">` around logo)

### Step 5.4: Location Pages (if Local SEO)

**Skill:** Local SEO Location Builder  
**Owner:** Builder Agent

- [ ] Location pages generated
- [ ] Slugs match pattern
- [ ] Internal linking implemented
- [ ] `locations.json` manifest created

### Step 5.5: SEO Implementation

**Skill:** Schema/SEO Metadata  
**Owner:** Builder Agent

- [ ] SEO component created
- [ ] Schema generators implemented
- [ ] sitemap.xml configured
- [ ] robots.txt configured

### Step 5.6: Forms

**Skill:** Webhook/Forms  
**Owner:** Builder Agent

- [ ] Form components created
- [ ] API endpoint configured
- [ ] Supabase leads table created
- [ ] Webhook URLs configured

### Step 5.7: OG Images

**Skill:** Vercel OG Image  
**Owner:** Builder Agent

- [ ] `/api/og` endpoint created
- [ ] OG meta tags implemented
- [ ] All pages have OG images

### Step 5.8: Phase 5 Cleanup (Optional but Recommended)

**Owner:** Orchestrator

- [ ] Review files created during Phase 5
- [ ] Delete `*-test.astro` files in components (if any)
- [ ] Delete `*-demo.astro` files in components (if any)
- [ ] Delete `*-test.astro` files in pages (if any)
- [ ] Flag unused imports for manual cleanup (if any)
- [ ] Keep all production components, pages, and config files

**Cleanup options:**
1. Delete test/demo files (recommended)
2. Skip cleanup

**Gate:** User confirms cleanup preference

---

## Phase 6: Imagery (AI Image Generation)

### Step 6.0: Prerequisites Check

**Skill:** Imagery Workflow  
**Owner:** Orchestrator

- [ ] `OPENAI_API_KEY` verified in `.env`
- [ ] `design-tokens.json` exists
- [ ] `design-analysis.md` exists (if Phase 3A completed)

**Gate:** Cannot proceed without verified API key

### Step 6.1: Image Requirements Definition

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent

- [ ] `image-requirements.json` created using template
- [ ] All required images listed with full specs
- [ ] Each image has: id, type, context, subject, technical_requirements, style_requirements, avoid list
- [ ] Transparency requirements explicitly defined

**Gate:** User confirms requirements are complete

### Step 6.2: Prompt Generation (Claude)

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent (Claude)

- [ ] Exceptional prompts generated (150-300 words each)
- [ ] Exact hex codes from design tokens included
- [ ] Transparency specs included for icons/illustrations
- [ ] AVOID lists included for each prompt
- [ ] Output saved as `image-prompts.json`

**Gate:** User reviews and approves all prompts

### Step 6.3: Image Generation (OpenAI DALL-E 3)

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent (OpenAI API)

- [ ] All approved images generated via DALL-E 3
- [ ] Images saved to `/assets/images/generated/`
- [ ] User reviews each generated image

**Gate:** User approves images (or marks for regeneration)

### Step 6.4: Post-Processing & Refinement

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent

**Automated processing:**
- [ ] Background removal for transparent images (icons, illustrations) — rembg or remove.bg API
- [ ] Initial optimization to meet size thresholds
- [ ] Responsive variants generated

**Manual refinement (Canva AI — if needed):**
- [ ] Review automated results for quality issues
- [ ] If issues found (white fringing, color drift, edge artifacts):
  - Use Canva AI "Remove background" tool for refinement
  - Use "Magic Eraser" for edge cleanup
  - Use color adjustment tools to match exact hex codes from design tokens
  - Export refined images (PNG for transparency, WebP for final)
- [ ] Replace processed images
- [ ] Verify quality again (test transparent images on both light and dark backgrounds)

**For logos (if needed during this phase):**
- [ ] Use Canva AI for logo processing (background removal, color adjustment, edge cleanup)
- [ ] Export logo variants to `/public/logos/`
- [ ] Verify all logo variants exist and are properly named

**Gate:** All images pass quality checks

### Step 6.5: Asset Organization

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent

- [ ] Files moved to correct folders (`/assets/images/optimized/{type}/`)
- [ ] Files named correctly (`{type}-{identifier}.{ext}`)
- [ ] `image-manifest.json` generated with all paths and metadata

**Gate:** Manifest complete, all images in place

### Step 6.6: Phase 4 Cleanup (Optional but Recommended)

**Owner:** Orchestrator

- [ ] Review files created during Phase 4
- [ ] Archive `image-prompts.json` to `/docs/imagery/` (with date suffix)
- [ ] Delete `/assets/images/generated/` (raw DALL-E output — no longer needed)
- [ ] Delete `/assets/images/processed/` (intermediate processing — no longer needed)
- [ ] Keep only `/assets/images/optimized/` (final images)
- [ ] Keep `image-requirements.json` and `image-manifest.json` (reference files)

**Cleanup options:**
1. Archive intermediate files (recommended)
2. Delete temporary files
3. Skip cleanup

**Gate:** User confirms cleanup preference

### Step 6.7: Stock Images (if needed)

**Skill:** Pixels/Media API  
**Owner:** Design/Imagery Agent

- [ ] Stock images fetched (for photos, supplementary images)
- [ ] Images optimized
- [ ] Attribution logged
- [ ] Added to manifest

---

## Phase 7: Content

### Step 7.1: Page Content

**Agent:** Content Agent (Claude)

**AI/LLM Optimization Requirements (MANDATORY):**

Before Content phase can complete:

1. **llms.txt File:**
   - [ ] Create `/public/llms.txt`
   - [ ] List main content pages
   - [ ] Include sitemap reference

2. **Content Freshness:**
   - [ ] All content has `datePublished` in frontmatter
   - [ ] All content has `dateModified` in frontmatter
   - [ ] Update `dateModified` when content changes

3. **Question-Answer Format:**
   - [ ] FAQ sections use H2 for questions
   - [ ] Tutorials use HowTo schema
   - [ ] Problem-solving content follows Q&A pattern

4. **Author Attribution:**
   - [ ] All blog posts have author with Person schema
   - [ ] Author credentials included (for YMYL topics)

**Gate Check (Orchestrator enforces):**
- [ ] llms.txt exists
- [ ] All content has lastUpdated dates
- [ ] Question-answer format verified
- [ ] FAQ/HowTo schema present
- [ ] Author attribution complete

**Cannot proceed to QA phase without these checks passing.**

- [ ] All pages have content matching schema
- [ ] Keywords naturally integrated
- [ ] Heading hierarchy correct

### Step 7.2: Metadata

**Agent:** Content Agent

- [ ] All meta titles written
- [ ] All meta descriptions written (< 160 chars)
- [ ] All images have alt text

### Step 7.3: FAQ Content

**Agent:** Content Agent

- [ ] FAQ sections written
- [ ] Question → answer → depth pattern followed

### Step 7.4: Author Bios

**Agent:** Content Agent

- [ ] Author profiles created
- [ ] Credentials documented
- [ ] Photos assigned

---

## Phase 8: Admin Setup

### Step 8.1: Admin Dashboard

**Skill:** Admin Dashboard  
**Owner:** Admin/QA Agent (Claude)

### Step 8.2: Bing Webmaster Tools & IndexNow Setup (REQUIRED for AI/LLM Visibility)

**Purpose:** Ensure site is indexed by Bing (used by many LLM-powered search tools)

**Owner:** Admin/QA Agent (Claude)

**Process:**

1. **Bing Webmaster Tools Setup:**
   - [ ] Create Bing Webmaster Tools account
   - [ ] Add and verify site
   - [ ] Submit sitemap.xml
   - [ ] Configure IndexNow endpoint (optional but recommended)

2. **IndexNow Configuration (Optional):**
   - [ ] Generate IndexNow API key
   - [ ] Configure endpoint: `https://api.indexnow.org/IndexNow`
   - [ ] Add to build process (notify on content updates)

3. **Verification:**
   - [ ] Confirm site appears in Bing Webmaster Tools
   - [ ] Verify sitemap is processed
   - [ ] Test IndexNow endpoint (if configured)

**Gate:** Site verified in Bing Webmaster Tools, sitemap submitted

**Why this matters:**
- Many LLM-powered search tools use Bing's index
- IndexNow speeds up indexing of new/updated content
- Required for AI Overview visibility

- [ ] Admin routes configured
- [ ] Auth protecting admin
- [ ] All sections implemented

### Step 8.2: Analytics Connections

**Skill:** Admin Dashboard  
**Owner:** Admin/QA Agent

- [ ] Google Analytics connected
- [ ] Search Console connected
- [ ] Bing Webmaster Tools connected
- [ ] Bing Places configured (if Local SEO)

### Step 8.3: Social Publishing (if needed)

**Skill:** Social Publishing  
**Owner:** Admin/QA Agent

- [ ] LinkedIn connected
- [ ] Medium connected
- [ ] Publish interface working

---

## Phase 9: Quality Assurance

### Step 9.1: Build Verification

**Agent:** Admin/QA Agent

- [ ] `npm run build` passes
- [ ] All pages render
- [ ] No console errors

### Step 9.2: Performance Testing

**Skill:** PageSpeed/Pre-Commit  
**Owner:** Admin/QA Agent

- [ ] PageSpeed 95+ mobile
- [ ] PageSpeed 95+ desktop
- [ ] Core Web Vitals pass
- [ ] `pagespeed-report.json` generated

### Step 9.3: Link Validation

**Skill:** PageSpeed/Pre-Commit  
**Owner:** Admin/QA Agent

- [ ] All internal links valid
- [ ] No 404s
- [ ] `link-check-report.json` generated

### Step 9.4: SEO Verification

**Agent:** Admin/QA Agent

- [ ] All pages have meta titles
- [ ] All pages have meta descriptions
- [ ] All pages have schema markup
- [ ] `seo-checklist.md` completed

### Step 9.5: OG Image Verification

**Skill:** Vercel OG Image  
**Owner:** Admin/QA Agent

- [ ] All OG images 1200x630
- [ ] Tested with social preview tools
- [ ] `og-checklist.md` completed

### Step 9.6: Phase 9 Cleanup (Optional but Recommended)

**Owner:** Orchestrator

- [ ] Review files created during Phase 9
- [ ] Archive QA reports to `/docs/qa/`:
  - `pagespeed-report.json` → `/docs/qa/pagespeed-report-YYYYMMDD.json`
  - `link-check-report.json` → `/docs/qa/link-check-report-YYYYMMDD.json`
  - `seo-checklist.md` → `/docs/qa/seo-checklist-YYYYMMDD.md`
  - `og-checklist.md` → `/docs/qa/og-checklist-YYYYMMDD.md`
- [ ] Delete temporary QA notes (if any)
- [ ] Keep final QA approval documentation

**Cleanup options:**
1. Archive QA reports to `/docs/qa/` (recommended)
2. Delete temporary files
3. Skip cleanup

**Gate:** User confirms cleanup preference

---

## Phase 10: Deployment

### Step 10.1: Pre-Launch Checklist

**Skill:** Admin Dashboard  
**Owner:** Admin/QA Agent

Complete all sections:
- [ ] Technical checks
- [ ] SEO checks
- [ ] Performance checks
- [ ] Analytics checks
- [ ] Admin checks

### Step 10.2: Final Approval

**Agent:** Admin/QA Agent

- [ ] All checks passed
- [ ] Deployment explicitly approved
- [ ] Approval documented with timestamp

### Step 10.3: Deploy to Production

```bash
vercel --prod
```

### Step 10.4: Post-Deploy Verification

- [ ] Production site loads
- [ ] Analytics tracking
- [ ] Forms submitting
- [ ] Sitemap submitted to Search Console

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 0: REPO VERIFICATION                  │
│  Verify Git repo → Check remotes → Match expected → Create .project-repo.json │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 1: INITIALIZATION                     │
│  Clone Hub → Init Script → Site Kickoff                         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 2: REPO SETUP                         │
│  Repo Graduation → Env Variables                                │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 3: ARCHITECTURE                       │
│  Architect Agent: Strategy → Structure → Schema → SEO Reqs      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 4: DESIGN                             │
│  Design Agent: Inspiration → Tokens → Assets                    │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 5: BUILD                              │
│  Builder Agent: Structure → CMS → Pages → SEO → Forms → OG      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 6: IMAGERY                            │
│  Design Agent: Generate/Fetch → Optimize → Manifest             │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 7: CONTENT                            │
│  Content Agent: Pages → Metadata → FAQs → Authors               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 8: ADMIN SETUP                        │
│  Admin Agent: Dashboard → Analytics → Social                    │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 9: QA                                 │
│  Admin Agent: Build → Performance → Links → SEO → OG            │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 10: DEPLOYMENT                        │
│  Admin Agent: Checklist → Approval → Deploy → Verify            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Time Estimates

| Phase | Typical Duration |
|-------|------------------|
| Initialization | 30 minutes |
| Repo Setup | 30 minutes |
| Architecture | 2-4 hours |
| Design | 2-4 hours |
| Build | 8-16 hours |
| Imagery | 2-4 hours |
| Content | 4-8 hours |
| Admin Setup | 2-4 hours |
| QA | 2-4 hours |
| Deployment | 1 hour |
| **Total** | **24-48 hours** |

*Times vary significantly based on site complexity, number of pages, and content requirements.*
