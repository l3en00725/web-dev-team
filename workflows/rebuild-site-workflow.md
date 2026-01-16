# Rebuild Site Workflow

## Overview

Step-by-step workflow for rebuilding an existing website while preserving SEO equity through proper redirects.

**Duration:** Varies by complexity  
**Agents Involved:** All five agents  
**Skills Used:** All skills (including Redirects)

---

## Key Differences from New Site

| Aspect | New Site | Rebuild |
|--------|----------|---------|
| Redirects | Not needed | **Required** |
| URL Collection | N/A | Must gather old URLs |
| SEO Equity | N/A | Must preserve |
| Content | Create new | Migrate + improve |
| Analytics | Fresh start | Preserve history |

---

## Phase 1: Discovery

### Step 1.1: Audit Existing Site

Before cloning Hub, gather information from the existing site:

**Collect:**
- [ ] Current sitemap.xml
- [ ] Search Console URL list
- [ ] Analytics data (top pages, traffic)
- [ ] Existing content inventory
- [ ] Current meta titles/descriptions
- [ ] Existing schema markup
- [ ] Backlink profile (from Ahrefs, SEMrush, etc.)

**Document in:** `existing-site-audit.md`

### Step 1.2: Identify High-Value URLs

URLs that MUST be preserved or redirected:

- [ ] Pages with significant traffic
- [ ] Pages with backlinks
- [ ] Pages ranking for keywords
- [ ] Pages with social shares

**Output:** `high-value-urls.json`

```json
{
  "collectedAt": "2026-01-16T00:00:00Z",
  "urls": [
    {
      "url": "/services/plumbing/",
      "monthlyTraffic": 1500,
      "backlinks": 25,
      "rankingKeywords": ["plumber austin", "austin plumbing"],
      "priority": "critical"
    }
  ]
}
```

---

## Phase 2: Initialization

### Step 2.1: Clone Hub Repository

```bash
git clone https://github.com/your-org/web-dev-team.git [project-name]
cd [project-name]
```

### Step 2.2: Run Init Script

```bash
./scripts/init-project.sh
```

### Step 2.3: Complete Site Kickoff

**Important:** When prompted, indicate this is a **rebuild**.

Answer all prompts:
- [ ] Site type classification
- [ ] Primary goal
- [ ] Distribution strategy
- [ ] **Indicate this is a REBUILD**
- [ ] Content strategy (migration + new)
- [ ] Repo graduation confirmation
- [ ] App linkage check
- [ ] Required integrations
- [ ] LLM confirmation

**Outputs:**
- `project-profile.json` (with `isRebuild: true`)
- `constraints.md`

---

## Phase 3: Repository Setup

### Step 3.1: Repo Graduation

**Skill:** Repo Graduation  
**Owner:** Builder Agent

- [ ] New GitHub repo created
- [ ] Fresh git history initialized
- [ ] Code pushed to new repo
- [ ] Vercel project created
- [ ] Vercel linked to new repo

### Step 3.2: Environment Variables

**Skill:** Env Variable Setup  
**Owner:** Builder Agent

- [ ] `.env.example` created
- [ ] `.env.local` populated
- [ ] Vercel env vars configured
- [ ] Supabase connection verified

---

## Phase 4: Redirect Planning

### Step 4.1: Collect All Old URLs

**Skill:** Redirects  
**Owner:** Architect Agent

Methods:
1. Download existing sitemap.xml
2. Export from Search Console
3. Crawl with Screaming Frog
4. Export from Analytics

**Output:** `old-urls.json`

### Step 4.2: Plan New URL Structure

**Agent:** Architect Agent

Create new site structure considering:
- SEO improvements
- Keyword optimization
- User experience
- Technical requirements

**Output:** `site-structure.json`

### Step 4.3: Create Redirect Mapping

**Skill:** Redirects  
**Owner:** Architect Agent

Map every old URL to its new destination:

```json
{
  "redirects": [
    {
      "from": "/old-url/",
      "to": "/new-url/",
      "type": 301,
      "reason": "URL restructure",
      "traffic": 1500,
      "priority": "critical"
    }
  ]
}
```

**Output:** `redirects.json`

### Step 4.4: Review Redirect Mapping

Before proceeding:
- [ ] All high-value URLs have redirects
- [ ] No redirect chains
- [ ] Redirects go to relevant content
- [ ] Pattern-based redirects cover bulk URLs

---

## Phase 5: Architecture

### Step 5.1: Strategy Definition

**Agent:** Architect Agent (Claude Opus)

Create:
- [ ] `strategy.md` — Updated goals, audience, positioning
- [ ] `site-structure.json` — New page hierarchy
- [ ] `content-schema.md` — Content types and fields
- [ ] `seo-requirements.md` — Metadata rules

### Step 5.2: Keyword Validation

**Skill:** Keywords API  
**Owner:** Architect Agent

- [ ] Existing ranking keywords preserved
- [ ] New keyword opportunities identified
- [ ] `keyword-data.json` generated

### Step 5.3: Content Migration Plan

Plan how existing content will be migrated:

| Content Type | Action |
|--------------|--------|
| High-performing pages | Migrate and improve |
| Thin pages | Consolidate or remove |
| Outdated content | Rewrite |
| Missing content | Create new |

**Output:** `content-migration-plan.md`

---

## Phase 6: Design

### Step 6.1: Design Direction

**Skill:** Design System  
**Owner:** Design/Imagery Agent

Consider:
- Existing brand elements to preserve
- New design improvements
- User expectations

### Step 6.2: Design Tokens

- [ ] `design-tokens.json` generated
- [ ] `effects.md` created
- [ ] Brand consistency maintained

### Step 6.3: Brand Assets

- [ ] Favicon updated (or preserved)
- [ ] App icons created
- [ ] Assets stored in `/public/`

---

## Phase 7: Build

### Step 7.1: Project Structure

**Agent:** Builder Agent

- [ ] Astro project initialized
- [ ] Dependencies installed
- [ ] Design tokens applied

### Step 7.2: CMS Setup

**Skill:** CMS/Content Connector  
**Owner:** Builder Agent

- [ ] CMS structure matches migration plan
- [ ] Content collections configured
- [ ] Migration scripts prepared

### Step 7.3: Page Implementation

- [ ] All pages from `site-structure.json` created
- [ ] New URL structure implemented
- [ ] Layouts and components built

### Step 7.4: Redirect Implementation

**Skill:** Redirects  
**Owner:** Builder Agent

- [ ] Redirects added to `vercel.json`
- [ ] Or middleware implemented
- [ ] Pattern-based redirects configured

### Step 7.5: SEO Implementation

**Skill:** Schema/SEO Metadata  
**Owner:** Builder Agent

- [ ] SEO component created
- [ ] Schema markup preserved/improved
- [ ] sitemap.xml configured
- [ ] robots.txt configured

### Step 7.6: Forms

**Skill:** Webhook/Forms  
**Owner:** Builder Agent

- [ ] Form components created
- [ ] Existing form submissions migrated (if applicable)

### Step 7.7: OG Images

**Skill:** Vercel OG Image  
**Owner:** Builder Agent

- [ ] OG images implemented
- [ ] Social preview consistency maintained

---

## Phase 8: Content Migration

### Step 8.1: Migrate Existing Content

**Agent:** Content Agent

- [ ] High-performing content migrated
- [ ] Content improved during migration
- [ ] New schema applied

### Step 8.2: Improve Metadata

- [ ] Meta titles optimized
- [ ] Meta descriptions improved
- [ ] Alt text updated

### Step 8.3: Create New Content

- [ ] Gap content created
- [ ] FAQ sections added
- [ ] Author bios created/updated

### Step 8.4: Preserve E-E-A-T Signals

- [ ] Author information maintained
- [ ] Publication dates preserved where appropriate
- [ ] Credentials updated

---

## Phase 9: Imagery

### Step 9.1: Migrate Existing Images

- [ ] Valuable images migrated
- [ ] Images re-optimized
- [ ] Alt text preserved/improved

### Step 9.2: New Images (if needed)

- [ ] New images generated or sourced
- [ ] Optimized for web
- [ ] Responsive variants created

---

## Phase 10: Admin Setup

### Step 10.1: Admin Dashboard

**Skill:** Admin Dashboard  
**Owner:** Admin/QA Agent

- [ ] Admin routes configured
- [ ] Historical data preserved (if possible)

### Step 10.2: Analytics Continuity

**Important:** Maintain analytics continuity:

- [ ] Same GA4 property (if possible)
- [ ] Search Console property transferred
- [ ] Bing Webmaster Tools updated

### Step 10.3: Social Publishing

- [ ] Social connections maintained
- [ ] Canonical URLs updated

---

## Phase 11: Quality Assurance

### Step 11.1: Build Verification

- [ ] `npm run build` passes
- [ ] All pages render
- [ ] No console errors

### Step 11.2: Redirect Verification

**Skill:** Redirects  
**Owner:** Admin/QA Agent

- [ ] All redirects tested
- [ ] No redirect chains
- [ ] No redirect loops
- [ ] High-value URLs verified

### Step 11.3: Performance Testing

**Skill:** PageSpeed/Pre-Commit  
**Owner:** Admin/QA Agent

- [ ] PageSpeed 95+ mobile
- [ ] PageSpeed 95+ desktop
- [ ] Performance equal or better than old site

### Step 11.4: SEO Verification

- [ ] All pages have metadata
- [ ] Schema markup correct
- [ ] Internal links updated to new URLs

### Step 11.5: Content Verification

- [ ] All migrated content displays correctly
- [ ] No broken images
- [ ] No placeholder text

---

## Phase 12: Deployment

### Step 12.1: Pre-Launch Checklist

Complete all sections with extra attention to:
- [ ] **All redirects verified**
- [ ] **High-value URLs preserved**
- [ ] **Analytics continuity confirmed**

### Step 12.2: Final Approval

- [ ] All checks passed
- [ ] Redirect mapping approved
- [ ] Deployment explicitly approved

### Step 12.3: Deploy to Production

```bash
vercel --prod
```

### Step 12.4: Post-Deploy Verification

**Critical for rebuilds:**

- [ ] Test all redirects on production
- [ ] Verify high-value URLs redirect correctly
- [ ] Submit new sitemap to Search Console
- [ ] Request re-indexing of key pages
- [ ] Monitor Search Console for crawl errors

---

## Phase 13: Post-Launch Monitoring

### Week 1

- [ ] Monitor Search Console for 404 errors
- [ ] Check redirect performance
- [ ] Verify traffic levels
- [ ] Fix any missed redirects

### Week 2-4

- [ ] Track ranking changes
- [ ] Monitor organic traffic
- [ ] Address any indexing issues
- [ ] Update any missed redirects

### Month 2-3

- [ ] Compare traffic to pre-rebuild
- [ ] Analyze ranking recovery
- [ ] Document lessons learned

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 1: DISCOVERY                          │
│  Audit Existing Site → Identify High-Value URLs                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 2: INITIALIZATION                     │
│  Clone Hub → Init Script → Site Kickoff (mark as REBUILD)       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 3: REPO SETUP                         │
│  Repo Graduation → Env Variables                                │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 4: REDIRECT PLANNING                  │
│  Collect Old URLs → Plan New Structure → Create Mapping         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 5: ARCHITECTURE                       │
│  Strategy → Structure → Schema → Content Migration Plan         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 6-7: DESIGN & BUILD                   │
│  Design Tokens → Pages → REDIRECTS → SEO → Forms                │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 8-9: CONTENT & IMAGERY                │
│  Migrate Content → Improve → Create New → Optimize Images       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 10: ADMIN SETUP                       │
│  Dashboard → Analytics Continuity → Social                      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 11: QA                                │
│  Build → REDIRECT VERIFICATION → Performance → SEO              │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 12: DEPLOYMENT                        │
│  Checklist → Approval → Deploy → VERIFY REDIRECTS               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 13: POST-LAUNCH                       │
│  Monitor → Fix Issues → Track Recovery → Document               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Time Estimates

| Phase | Typical Duration |
|-------|------------------|
| Discovery | 2-4 hours |
| Initialization | 30 minutes |
| Repo Setup | 30 minutes |
| Redirect Planning | 2-4 hours |
| Architecture | 2-4 hours |
| Design | 2-4 hours |
| Build | 8-16 hours |
| Content Migration | 4-12 hours |
| Imagery | 2-4 hours |
| Admin Setup | 2-4 hours |
| QA | 4-6 hours |
| Deployment | 1-2 hours |
| Post-Launch (Week 1) | Ongoing |
| **Total** | **32-64 hours** |

*Rebuilds typically take 30-50% longer than new sites due to redirect planning, content migration, and additional verification.*

---

## Critical Success Factors

1. **Complete redirect coverage** — Every old URL must go somewhere
2. **High-value URL preservation** — Traffic pages must redirect correctly
3. **Analytics continuity** — Don't lose historical data
4. **Content quality improvement** — Rebuild should improve, not just migrate
5. **Post-launch monitoring** — Catch and fix issues quickly
