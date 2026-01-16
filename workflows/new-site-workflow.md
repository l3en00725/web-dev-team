# New Site Workflow

## Overview

Step-by-step workflow for building a new website from scratch using the web-dev-team Hub.

**Duration:** Varies by complexity  
**Agents Involved:** All five agents  
**Skills Used:** Most skills (excluding Redirects)

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

### Step 4.1: Inspiration Intake

**Skill:** Design System  
**Owner:** Design/Imagery Agent (Gemini)

- [ ] Inspiration collected (screenshots, URLs)
- [ ] Visual patterns analyzed
- [ ] Inspiration documented in `/references/inspiration/`

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

---

## Phase 6: Imagery

### Step 6.1: Image Generation (if needed)

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent

- [ ] Images generated via Gemini
- [ ] Images optimized
- [ ] Responsive variants created

### Step 6.2: Stock Images (if needed)

**Skill:** Pixels/Media API  
**Owner:** Design/Imagery Agent

- [ ] Stock images fetched
- [ ] Images optimized
- [ ] Attribution logged

### Step 6.3: Image Manifest

**Skill:** Imagery Workflow  
**Owner:** Design/Imagery Agent

- [ ] `image-manifest.json` generated
- [ ] All images under thresholds
- [ ] Alt text assigned (by Content Agent)

---

## Phase 7: Content

### Step 7.1: Page Content

**Agent:** Content Agent (Claude)

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
