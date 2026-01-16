# Product Requirements Document

## Intro / Metadata
**Project:** web-dev-team  
**Team:** Solo (Ben) + AI Agents  
**Status:** Discovery  
**Last Updated:** January 16, 2026  

---

## 1. Description
A hub repository that defines agents, skills, rules, and workflows for AI-assisted website development — enabling consistent, high-quality site builds from a single prompt while enforcing architectural decisions before implementation begins.

---

## 2. Background & Problem Statement

### Why this project exists
Past website builds become messy mid-project due to missing architecture. Decisions get made on the fly, causing drift, rework, and inconsistent quality. There is no system to enforce structure, lock decisions, or gate quality before deployment.

### Evidence
- Builds drift mid-project without proper architectural foundations
- Same logic (forms, OG images, local SEO pages) gets rebuilt from scratch each time
- No gates to catch performance or SEO issues before deploy
- Wrong LLMs used for wrong tasks, wasting cost or quality
- Tribal knowledge required — nothing is documented

### What success looks like
- Every site starts with the same clear structure
- Decisions are locked before build begins
- The right LLM handles the right task (cost efficiency)
- Nothing ships without passing quality gates
- One prompt can kick off a full build (eventually)
- System is scalable and eventually sellable

---

## 3. Goals

### User Goals
- Build websites without reinventing architecture each time
- Never forget critical steps (SEO, performance, env vars)
- Get AI assistance that's structured, not chaotic

### Business Goals
- Reduce build time and rework
- Consistent quality across all sites
- Cost-conscious LLM usage
- Scalable system that could be productized

### Experience Goals
- Feels like working with a competent team
- Dummy-proof — impossible to skip critical steps
- Clear handoffs between agents

---

## 4. Success Metrics

### User Metrics
- Time from kickoff to deploy reduced by 50%
- Zero mid-build architectural changes
- All sites pass PageSpeed 95+ on mobile and desktop

### Business Metrics
- LLM costs per site predictable and controlled
- Sites require no post-launch structural fixes
- System reusable across unlimited projects

### Counter-Metrics (must not get worse)
- Build quality (no shortcuts for speed)
- SEO fundamentals (no skipped metadata or schema)
- Security (no exposed env vars or public admin)

---

## 5. Target Audience & User Stories

### Primary User
Solo developer or small team building SEO-focused websites using AI assistance. Comfortable with code but wants structure and guardrails to prevent drift.

### User Stories

**As a developer,** I want to start every site with the same foundation, so that I don't reinvent architecture each time.

**As a developer,** I want the system to block me from deploying if quality gates fail, so that I never ship a slow or broken site.

**As a developer,** I want AI agents with clear roles and LLM assignments, so that I get quality where it matters and save cost where I can.

---

## 6. Features & Requirements (Scope In)

### 6.1 Agents (Who Thinks)

Five agents with locked LLM assignments.

#### Architect Agent
- **Purpose:** Defines what a site is before anything is built. Owns structure, strategy, and constraints.
- **LLM:** Claude Opus
- **Responsibilities:**
  - Defines site type (local service, SaaS marketing, content site, etc.)
  - Defines page and route structure
  - Defines content schemas
  - Defines SEO requirements
  - Defines performance and quality constraints
  - Validates keywords via Keywords API before committing to pages
- **Required Outputs:**
  - `strategy.md`
  - `site-structure.json`
  - `content-schema.md`
  - `seo-requirements.md`
  - `constraints.md`
- **Hard Limits:**
  - Cannot write code
  - Cannot make visual design decisions
  - Cannot write content
  - Cannot change slugs after defined

#### Builder Agent
- **Purpose:** Implements the site exactly as defined by Architect. Executes decisions, does not make them.
- **LLM:** Cursor Auto
- **Responsibilities:**
  - Implements Astro project structure
  - Creates pages, routes, layouts per `site-structure.json`
  - Wires content data into components
  - Applies SEO requirements mechanically
  - Ensures site builds and deploys successfully
- **Required Outputs:**
  - Valid Astro project
  - All pages rendering
  - SEO hooks implemented
  - Successful local build
  - 404 page
  - Sitemap route
  - robots.txt
- **Hard Limits:**
  - Cannot invent new pages or features
  - Cannot modify architecture decisions
  - Cannot make visual design decisions
  - Cannot write marketing copy

#### Design/Imagery Agent
- **Purpose:** Handles visual direction, design tokens, imagery generation, and optimization.
- **LLM:** Gemini
- **Responsibilities:**
  - Analyzes visual inspiration (screenshots, Dribbble, uploads)
  - Produces design tokens (colors, typography, spacing)
  - Specifies animation/effect direction
  - Generates images via Gemini
  - Optimizes images for web performance
  - Provides OG image direction
  - Creates favicon and app icons
- **Required Outputs:**
  - `design-tokens.json`
  - `effects.md`
  - Optimized images
  - Favicon + app icons
- **Hard Limits:**
  - Cannot implement (Builder does that)
  - Cannot invent styles without inspiration input

#### Content Agent
- **Purpose:** Writes SEO copy, metadata, and page content following Architect's schemas.
- **LLM:** Claude
- **Responsibilities:**
  - Writes page content following content schemas
  - Optimizes copy using Keywords API
  - Writes meta descriptions
  - Provides alt text for images
  - Follows AI-friendly content patterns (question → answer → depth)
  - Writes FAQ content
- **Hard Limits:**
  - Cannot change page structure
  - Cannot add pages
  - Must follow heading hierarchy (H1 → H2 → H3)

#### Admin/QA Agent
- **Purpose:** Verifies build readiness, sets up admin backend, connects publishing channels, fixes issues before deployment.
- **LLM:** Claude
- **Responsibilities:**
  - Verifies all pages render without errors
  - Verifies no 401s, 404s, or console errors
  - Verifies SEO metadata on all pages
  - Verifies env vars in Vercel
  - Checks internal links (no broken links)
  - Checks for index bloat
  - Runs PageSpeed Insights (95+ required)
  - Sets up admin dashboard
  - Connects Analytics, Search Console, Bing Webmaster
  - Configures social publishing
  - Runs pre-launch checklist
  - Approves or rejects deployment
- **Hard Limits:**
  - Cannot approve deploy if checks fail
  - Cannot add pages or features
  - Cannot make architectural decisions

---

### 6.2 Rules (System Guardrails)

Eight non-negotiable rules.

| # | Rule |
|---|------|
| 1 | No build without Site Kickoff Skill completing |
| 2 | Hub repo is for development only — production sites must graduate to their own repo |
| 3 | LLM per agent must be confirmed before proceeding |
| 4 | Missing distribution strategy = stop |
| 5 | Missing env vars = stop |
| 6 | Performance must pass 95+ (mobile + desktop) before deploy |
| 7 | Admin Agent must approve deployment |
| 8 | No deploy without Google Analytics + Search Console connected |

---

### 6.3 Skills (What Must Never Be Forgotten)

Fourteen reusable, mandatory capabilities.

---

#### Skill 1: Site Kickoff Skill

```yaml
---
name: site-kickoff
description: Initializes every new website build from the Hub repo. Determines site type, page distribution strategy, and required integrations. Blocks build if critical decisions are missing.
---
```

**Purpose:** Eliminate memory load and enforce repeatable, high-quality site starts.

**Owner:** Entry gate — runs before any agent

**Trigger:** Immediately after importing Hub repo

**Workflow:**

Step 1: Site Classification
- Site Type: Marketing/Brand, Local SEO Service, Content/Blog, SaaS/App Frontend, E-commerce, Vacation Rental
- Primary Goal: Lead generation, Organic SEO traffic, Brand authority, Conversion/booking, Content distribution

Step 2: Page Distribution Strategy
- Local SEO (city/town based)
- Multi-State / National
- Global / Worldwide
- SaaS / App-First
- Hybrid

Step 3: Distribution-Specific Requirements
- If Local SEO: list of cities, slug pattern, internal linking rules
- If Multi-State: list of states, hierarchical structure, canonical rules
- If Global: country/language targets, i18n strategy
- If SaaS: feature pages, use-case pages, persona pages
- If Hybrid: precedence rules, SEO priority order

Step 4: Content Strategy
- Pillar/cluster intent
- Primary topics
- Target keyword themes

Step 5: Repo Graduation Reminder
- Confirm new repo name
- Confirm Hub is not final destination

Step 6: App Linkage Check
- Does this site link to an existing app?
- If yes: App URL, Sign Up URL, Sign In URL, Shared Supabase?

Step 7: Required Integrations
- Analytics (GA4, Plausible)
- Forms (webhooks, CRM, email)
- CMS source
- Industry-specific APIs
- Bing Places (if Local SEO)

Step 8: LLM Confirmation
- Architect Agent → Claude Opus
- Builder Agent → Cursor Auto
- Design/Imagery Agent → Gemini
- Content Agent → Claude
- Admin/QA Agent → Claude

**Required Outputs:**
- `project-profile.json`
- `constraints.md`
- Confirmed site type and distribution strategy
- Repo graduation acknowledged

**Failure Condition:**
- Incomplete classification = stop
- Missing distribution strategy = stop
- Repo graduation not confirmed = stop

---

#### Skill 2: Repo Graduation Skill

```yaml
---
name: repo-graduation
description: Ensures every production site moves from the Hub repo to its own dedicated repository. Use immediately after Site Kickoff Skill completes. Blocks build if graduation is skipped.
---
```

**Purpose:** Enforce separation between Hub (system) and production site repos.

**Owner:** Builder Agent

**Trigger:** After Site Kickoff Skill completes

**Workflow:**
1. Prompt user to create new GitHub repo
2. Confirm new repo name and URL
3. Confirm Vercel project is linked to new repo
4. Detach Hub repo as origin
5. Block build if any step is skipped

**Required Output:**
- New repo URL confirmed
- Vercel project linked to new repo
- Hub detached

**Failure Condition:**
- Graduation skipped = stop

---

#### Skill 3: Env Variable Setup Skill

```yaml
---
name: env-variable-setup
description: Ensures all required environment variables exist locally and in Vercel before build proceeds. Use after Repo Graduation Skill. Blocks build if vars are missing.
---
```

**Purpose:** Prevent builds from failing due to missing env vars.

**Owner:** Builder Agent

**Trigger:** After Repo Graduation Skill

**Required Vars (minimum):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GA_MEASUREMENT_ID`
- `ANTHROPIC_API_KEY`
- `KEYWORDS_API_KEY`
- Integration-specific keys as needed

**Workflow:**
1. Generate `.env.example` with all required keys
2. Prompt user to create `.env.local` with real values
3. Confirm Vercel project has matching env vars
4. Confirm Supabase project exists and is linked

**Required Output:**
- `.env.example` in repo
- `.env.local` exists locally
- Vercel env vars confirmed
- Supabase connection confirmed

**Failure Condition:**
- Missing required vars = stop

---

#### Skill 4: Webhook/Forms Skill

```yaml
---
name: webhook-forms
description: Simple form handling via webhooks with lead storage in Supabase. Use when a site needs contact forms or lead capture. No bloated form builders.
---
```

**Purpose:** Webhook-first forms that store leads and expose endpoints for integrations.

**Owner:** Builder Agent

**Trigger:** When site requires forms

**Workflow:**
1. Create simple form component(s) in Astro
2. Configure webhook endpoint
3. Create Supabase table for leads
4. Store submissions in Supabase
5. Expose webhook URLs in admin dashboard

**Supported Integrations:**
- CRM connections
- Email notifications
- Zapier webhooks

**Hard Limits:**
- No form builders (Typeform, Jotform, etc.)
- Simple fields only (name, email, phone, message)

**Required Output:**
- Form component(s)
- Webhook endpoint configured
- Supabase leads table
- Webhook URLs visible in admin
- Confirmed submissions work

---

#### Skill 5: Keywords API Skill

```yaml
---
name: keywords-api
description: Integrates Keywords Everywhere API to validate page strategy and optimize content. Use when (1) Architect Agent validates keyword viability before committing to pages, or (2) Content Agent needs related keywords for copy optimization.
---
```

**Purpose:** Fetch search volume, competition, and related keywords.

**Owners:**
- Architect Agent (strategy validation)
- Content Agent (copy optimization)

**Required Env Var:**
- `KEYWORDS_API_KEY`

**Workflow:**

Architect Agent Usage:
1. Input seed keywords from site strategy
2. Call API for search volume + competition
3. Flag keywords with zero/low volume
4. Target low-competition, high-intent queries first
5. Inform page structure decisions

Content Agent Usage:
1. Input target keyword for page
2. Call API for related keywords
3. Use in headings, meta, body copy

**Required Output:**
- `keyword-data.json` per page or site

**Failure Condition:**
- Missing API key = stop
- Zero volume on primary keywords = flag for review

---

#### Skill 6: Local SEO Location Builder Skill

```yaml
---
name: local-seo-location-builder
description: Mechanical generation of city/state/location pages for local SEO sites. Use when Site Kickoff identifies Local SEO or Multi-State distribution mode. Enforces slug patterns and internal linking rules.
---
```

**Purpose:** Generate location-based pages at scale with consistent structure and linking.

**Owner:** Builder Agent (executes), Architect Agent (defines locations)

**Trigger:** When distribution strategy includes Local SEO or Multi-State

**Required Inputs (from Architect):**
- List of target cities/towns/states
- Slug pattern
- Internal linking rules between locations

**Workflow:**
1. Receive location list from Architect
2. Generate one page per location
3. Apply defined slug pattern
4. Implement internal linking between location pages
5. Create location content schema for Content Agent

**Slug Pattern Examples:**
- `/services/[city]-[state]/`
- `/[service]/[city]-[state]/`
- `/locations/[state]/[city]/`

**Hard Limits:**
- No invented locations
- No slug changes after generation
- One page per location only

**Required Output:**
- Location pages generated
- Slugs match defined pattern
- Internal links implemented
- `locations.json` manifest

**Failure Condition:**
- Missing location list = stop
- Missing slug pattern = stop

---

#### Skill 7: Schema/SEO Metadata Skill

```yaml
---
name: schema-seo-metadata
description: Ensures consistent SEO metadata, structured data (JSON-LD), sitemap, and robots.txt across all pages. Use during build to enforce metadata requirements defined by Architect Agent.
---
```

**Purpose:** Mechanical application of SEO metadata, schema markup, and crawl directives.

**Owner:** Builder Agent (implements), Content Agent (provides copy)

**Trigger:** Every build — required for all sites

**Required Inputs (from Architect):**
- Metadata requirements per page type
- Heading structure rules (H1 → H2 → H3)
- Schema type per page

**Supported Schema Types:**
- LocalBusiness
- Service
- Article / BlogPosting
- FAQPage
- HowTo
- Product
- BreadcrumbList
- Organization
- Person (for E-E-A-T author bios)

**Workflow:**
1. Receive SEO requirements from Architect
2. Create metadata components/utilities
3. Implement per-page: title, description, OG tags
4. Implement JSON-LD schema per page type
5. Enforce heading hierarchy
6. Generate `sitemap.xml`
7. Generate `robots.txt`
8. Implement FAQ schema where applicable
9. Implement author/Person schema for E-E-A-T

**Hard Limits:**
- No missing meta titles
- No missing meta descriptions
- No duplicate H1s
- No pages without schema
- Sitemap must include all public pages

**Required Output:**
- Metadata component(s)
- JSON-LD schema per page
- Heading structure validated
- `sitemap.xml`
- `robots.txt`
- `seo-checklist.md` confirming coverage

**Failure Condition:**
- Missing metadata on any page = stop
- Missing schema on any page = flag for review

---

#### Skill 8: PageSpeed/Pre-Commit Skill

```yaml
---
name: pagespeed-pre-commit
description: Runs PageSpeed Insights before deployment, checks internal links, flags index bloat, and fails build if thresholds are not met. Use as final quality gate before Admin Agent approval.
---
```

**Purpose:** Prevent slow or broken sites from shipping.

**Owner:** Admin/QA Agent

**Trigger:** Before deployment — required for all sites

**Required Env Var:**
- `PAGESPEED_API_KEY` (optional — can use public API with rate limits)

**Workflow:**
1. Build site locally or in preview
2. Run PageSpeed Insights API against preview URL
3. Check scores against thresholds
4. Check all internal links (no broken links)
5. Flag thin pages (potential index bloat)
6. Pass = proceed to deploy approval
7. Fail = block deploy, report issues

**Thresholds:**
| Metric | Minimum Score |
|--------|---------------|
| Performance (Mobile) | 95 |
| Performance (Desktop) | 95 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

**Additional Checks:**
- Internal link validation (no 404s)
- Thin page detection (flag pages under threshold)
- Core Web Vitals pass

**Hard Limits:**
- No deploy if Performance < 95
- No deploy if broken internal links
- No exceptions without documented override

**Required Output:**
- `pagespeed-report.json`
- `link-check-report.json`
- Scores visible in admin dashboard
- Pass/fail status

**Failure Condition:**
- Below threshold = stop deployment
- Broken links found = stop deployment
- API error = retry or manual check required

---

#### Skill 9: Vercel OG Image Skill

```yaml
---
name: vercel-og-image
description: Generates Open Graph images for social sharing using Vercel OG. Use during build to ensure every page has a properly sized OG image.
---
```

**Purpose:** Automated OG image generation for consistent social previews.

**Owner:** Builder Agent (implements), Design Agent (provides direction)

**Trigger:** During build — required for all public pages

**Workflow:**
1. Receive OG design direction from Design Agent (colors, fonts, layout)
2. Create Vercel OG image endpoint (`/api/og`)
3. Generate dynamic images per page using title + metadata
4. Validate correct sizing (1200x630)
5. Confirm OG meta tags reference generated images

**Sizing Requirements:**
- Width: 1200px
- Height: 630px
- Format: PNG or JPEG

**Hard Limits:**
- No missing OG images on public pages
- No incorrect dimensions
- No broken OG URLs

**Required Output:**
- `/api/og` endpoint
- OG images generated per page
- OG meta tags implemented
- `og-checklist.md` confirming coverage

**Failure Condition:**
- Missing OG image on any public page = flag for review
- Incorrect dimensions = stop

---

#### Skill 10: Design System Skill

```yaml
---
name: design-system
description: Translates visual inspiration (screenshots, Dribbble, uploads) into implementable design tokens, effect specifications, and brand assets. Use when starting a new site to establish visual direction before Builder implements.
---
```

**Purpose:** Convert visual inspiration into structured outputs Builder Agent can execute.

**Owner:** Design/Imagery Agent (Gemini)

**Trigger:** After Site Kickoff, before Builder begins components

**Workflow:**

Part 1: Inspiration Intake
1. User provides inspiration (screenshot, Dribbble URL, upload)
2. Design Agent analyzes visual patterns
3. Extracts: colors, typography, spacing, effects, mood

Part 2: Design Token Output
1. Generate `design-tokens.json`:
   - Colors (primary, secondary, neutral, accent)
   - Typography (font families, scale, weights)
   - Spacing (base unit, scale)
   - Border radius, shadows
2. Generate `effects.md`:
   - Animation library recommendation (Framer Motion, GSAP, or CSS-only)
   - Effect descriptions per component type
   - Scroll behaviors, hover states, transitions

Part 3: Brand Assets
1. Generate favicon (multiple sizes)
2. Generate app icons (PWA manifest)
3. Store in `/public/`

**Supported Animation Libraries:**
- Framer Motion (React)
- GSAP (any)
- Astro native transitions
- CSS-only (simple fades, transforms)

**Required Output:**
- `design-tokens.json`
- `effects.md`
- Inspiration images stored in `/references/inspiration/`
- Favicon (16x16, 32x32, 180x180)
- App icons for PWA

**Hard Limits:**
- No implementation (Builder does that)
- No inventing styles without inspiration input
- Tokens must be complete before Builder starts components

---

#### Skill 11: Imagery Workflow Skill

```yaml
---
name: imagery-workflow
description: Handles image generation via Gemini and optimization for web performance. Use when site needs custom imagery, hero images, or AI-generated visuals based on inspiration or prompts.
---
```

**Purpose:** Generate and optimize images for site performance.

**Owner:** Design/Imagery Agent (Gemini)

**Trigger:** When site needs custom imagery beyond stock photos

**Workflow:**

Image Generation:
1. Receive prompt or inspiration from user
2. Generate image via Gemini
3. Output to `/assets/images/generated/`

Image Optimization:
1. Compress to web-friendly size
2. Convert to modern formats (WebP, AVIF)
3. Generate responsive sizes (mobile, tablet, desktop)
4. Enforce max file size thresholds

**File Size Thresholds:**
| Type | Max Size |
|------|----------|
| Hero image | 200kb |
| Content image | 100kb |
| Thumbnail | 30kb |

**Supported Formats:**
- WebP (default)
- AVIF (where supported)
- PNG fallback

**Required Output:**
- Optimized images in `/assets/images/`
- Responsive variants generated
- `image-manifest.json` listing all images + sizes

**Hard Limits:**
- No unoptimized images in production
- No images above threshold without override
- No missing alt text (Content Agent provides)

**Failure Condition:**
- Image exceeds threshold = flag for optimization
- Missing alt text = stop

---

#### Skill 12: Pixels/Media API Skill

```yaml
---
name: pixels-media-api
description: Fetches stock images from Pexels or Unsplash APIs when Gemini-generated imagery is not needed. Optional per site.
---
```

**Purpose:** Provide stock imagery when AI generation isn't required.

**Owner:** Design/Imagery Agent

**Trigger:** When site needs stock photos (optional)

**Required Env Var:**
- `PEXELS_API_KEY` or `UNSPLASH_API_KEY`

**Workflow:**
1. Receive image brief from Content or Design Agent
2. Query Pexels/Unsplash API with keywords
3. Select best match
4. Download and optimize via Imagery Workflow Skill
5. Store in `/assets/images/stock/`

**Hard Limits:**
- Must run through optimization (no raw stock images)
- Proper attribution if required by license
- No mixing stock and AI images without design consistency check

**Required Output:**
- Stock images downloaded
- Optimized via Imagery Workflow Skill
- Attribution logged if required

**Failure Condition:**
- Missing API key when skill is activated = stop
- Unoptimized stock image = stop

---

#### Skill 13: Admin Dashboard Skill

```yaml
---
name: admin-dashboard
description: Full backend admin interface for site management. Includes analytics, performance monitoring, lead management, content creation with AI assistance, and social publishing. Use after build is complete, before deployment.
---
```

**Purpose:** Single interface for site owners to manage, monitor, and publish content.

**Owner:** Admin/QA Agent

**Trigger:** After Builder and Content Agents complete, before deploy

**Required Env Vars:**
- `GA_MEASUREMENT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` (Claude for AI content)
- `KEYWORDS_API_KEY`
- `GOOGLE_SEARCH_CONSOLE_API_KEY`

**Dashboard Sections:**

1. Analytics
   - Google Analytics connection + guided setup
   - Key metrics: sessions, users, bounce rate, top pages
   - Search Console connection + guided setup
   - Bing Webmaster Tools connection + guided setup
   - Bing Places setup (if Local SEO)

2. Performance
   - PageSpeed Insights scores (mobile + desktop)
   - Core Web Vitals summary
   - Historical tracking

3. Forms & Leads
   - Form submissions from Supabase
   - Webhook URLs for CRM/Zapier (easy copy button)
   - Lead export

4. Content Creation
   
   Structure Enforcement:
   - H1 (required, one only)
   - H2s (major sections)
   - H3s (subsections)
   - Body paragraphs
   
   AI Assistance (Claude API):
   - Generate draft from topic/keyword
   - Revise/improve existing content
   - Auto-generate meta description
   - Heading suggestions
   - AI-friendly content templates (question → answer → depth pattern)
   
   SEO Features:
   - Target keyword field (ties into Keywords API)
   - Related keyword suggestions
   - SEO score/checklist
   - Schema auto-generated per content type
   
   Previews:
   - SEO preview (Google results appearance)
   - Social preview (LinkedIn/Medium appearance)
   
   Media:
   - Image picker (generated + stock library)
   - Alt text suggestions (AI-assisted)
   
   Internal Linking:
   - Suggest links to other site pages
   - Auto-detect linking opportunities in content
   
   Workflow:
   - Save as draft
   - Schedule publish
   - Publish now

5. Author Management (E-E-A-T)
   - Author bios
   - Credentials
   - Photos
   - Links to author schema

6. Content Refresh Tracking
   - Content age tracking
   - Flag old content for refresh
   - Prioritize updates over new posts

7. Sitemap Submission
   - Auto-submit sitemap to Search Console API on deploy
   - Manual resubmit option

8. Social Publishing
   - LinkedIn connection
   - Medium connection
   - One-click publish to selected platforms
   - Canonical URL auto-set

9. Pre-Launch Checklist
   - Human-verified final gate
   - All sections checked
   - Sign-off before deploy

**UI Requirements:**
- Clean, polished interface
- Mobile-friendly
- Fast loading
- Intuitive content editor

**Required Output:**
- Admin route(s) configured
- All sections functional
- AI content assistance working
- Social connections verified
- Auth protecting admin access
- Pre-launch checklist passed

**Hard Limits:**
- No public access (auth required)
- No editing site structure
- No publishing without H1 + meta description

**Failure Condition:**
- Missing Supabase = stop
- Missing Claude API key = disable AI features
- Missing Analytics = flag, continue

---

#### Skill 14: CMS/Content Connector Skill

```yaml
---
name: cms-content-connector
description: Sets up structured content system using file-based CMS or API. No Sanity. Use during build to establish how content is stored and accessed.
---
```

**Purpose:** Deterministic, structured content that Builder and Content Agents can rely on.

**Owner:** Builder Agent (implements), Architect Agent (defines schema)

**Trigger:** During build — required for all sites with dynamic content

**Supported CMS Options:**
| Option | When to Use |
|--------|-------------|
| Markdown + JSON (file-based) | Simple sites, blogs, local SEO pages |
| Astro Content Collections | Structured content with type safety |
| Supabase tables | Dynamic content, user-generated, frequent updates |
| External API | Headless CMS integration (not Sanity) |

**Workflow:**
1. Architect defines content schema (`content-schema.md`)
2. Builder implements CMS structure
3. Content Agent populates content
4. Content stored in `/content/` or Supabase

**File-Based Structure:**
```
/content/
  /pages/
  /posts/
  /locations/
  /services/
  /authors/
```

**E-E-A-T Support:**
- Author content type with credentials, bio, photo
- Source citations field
- Case study content type
- Review/testimonial content type

**Required Output:**
- CMS structure implemented
- Content schema enforced
- Content loading working in Astro
- Author management supported
- `content-manifest.json` listing all content types

**Hard Limits:**
- No Sanity
- No content without schema
- No untyped content collections

**Failure Condition:**
- Missing content schema = stop
- Content doesn't match schema = stop

---

#### Skill 15: Social Publishing Skill

```yaml
---
name: social-publishing
description: Connects site to social platforms for content distribution. LinkedIn and Medium for v1. Use after Admin Dashboard is configured.
---
```

**Purpose:** Enable content distribution from admin backend to social platforms.

**Owner:** Admin/QA Agent

**Trigger:** After Admin Dashboard Skill, optional per site

**Supported Platforms (v1):**
- LinkedIn
- Medium

**Future Platforms:**
- Twitter/X (not now)

**Workflow:**
1. User authenticates social accounts in admin
2. Content created via Admin Dashboard content posting
3. User selects platforms to publish to
4. Format content per platform requirements
5. Publish or schedule

**Platform Requirements:**

LinkedIn:
- Headline (< 150 chars)
- Body text
- Image (optional)
- Link to original content

Medium:
- Title
- Body (Markdown supported)
- Tags
- Canonical URL to original content

**Required Env Vars:**
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `MEDIUM_ACCESS_TOKEN`

**Bing Visibility Note:**
Bing uses social engagement (likes, shares, comments) as a ranking factor. Consistent social promotion via this skill helps Bing visibility.

**Required Output:**
- Social connections configured in admin
- Publish interface working
- Published content logged

**Hard Limits:**
- No auto-publishing without user confirmation
- No publishing without canonical URL set
- No platforms beyond v1 scope

**Failure Condition:**
- Missing credentials = disable that platform
- API error = log and notify user

---

#### Skill 16: Redirects Skill

```yaml
---
name: redirects
description: Maps old URLs to new URLs for site rebuilds. Use when rebuilding an existing site to preserve SEO equity. Optional — only for rebuilds.
---
```

**Purpose:** Preserve SEO equity when rebuilding sites with URL changes.

**Owner:** Architect Agent (defines), Builder Agent (implements)

**Trigger:** Site Kickoff identifies this as a rebuild

**Workflow:**
1. Architect collects list of old URLs
2. Map old URLs to new URLs
3. Generate redirect rules
4. Implement in Vercel config or middleware
5. Verify redirects work

**Redirect Types:**
- 301 (permanent) — default
- 302 (temporary) — rare

**Required Output:**
- `redirects.json` mapping
- Redirects implemented in `vercel.json` or middleware
- Verification that old URLs redirect correctly

**Failure Condition:**
- Rebuild without redirect mapping = flag for review

---

### 6.4 Folder Structure

```
web-dev-team/
├── /agents/
│   ├── architect.md
│   ├── builder.md
│   ├── design-imagery.md
│   ├── content.md
│   └── admin-qa.md
├── /skills/
│   ├── site-kickoff/
│   │   └── SKILL.md
│   ├── repo-graduation/
│   │   └── SKILL.md
│   ├── env-variable-setup/
│   │   └── SKILL.md
│   ├── webhook-forms/
│   │   └── SKILL.md
│   ├── keywords-api/
│   │   └── SKILL.md
│   ├── local-seo-location-builder/
│   │   └── SKILL.md
│   ├── schema-seo-metadata/
│   │   └── SKILL.md
│   ├── pagespeed-pre-commit/
│   │   └── SKILL.md
│   ├── vercel-og-image/
│   │   └── SKILL.md
│   ├── design-system/
│   │   └── SKILL.md
│   ├── imagery-workflow/
│   │   └── SKILL.md
│   ├── pixels-media-api/
│   │   └── SKILL.md
│   ├── admin-dashboard/
│   │   └── SKILL.md
│   ├── cms-content-connector/
│   │   └── SKILL.md
│   ├── social-publishing/
│   │   └── SKILL.md
│   └── redirects/
│       └── SKILL.md
├── /rules/
│   └── system-rules.md
├── /workflows/
│   ├── new-site-workflow.md
│   └── rebuild-site-workflow.md
├── /capabilities/
│   ├── pagespeed-api.md
│   ├── keywords-api.md
│   ├── vercel-og.md
│   ├── pexels-api.md
│   ├── search-console-api.md
│   └── social-apis.md
├── /scripts/
│   └── init-project.sh
├── /templates/
│   ├── project-profile.json
│   ├── constraints.md
│   ├── strategy.md
│   ├── site-structure.json
│   ├── content-schema.md
│   ├── seo-requirements.md
│   └── design-tokens.json
├── .env.example
├── README.md
└── CURSOR-RULES.md

---

### 6.8 README.md Specification

The README.md should include:

```markdown
# web-dev-team

Hub repository for AI-assisted website development. This is NOT a production site — it defines agents, skills, rules, and workflows that get pulled into every new project.

## Quick Start

1. Clone this repo
2. Run `./scripts/init-project.sh`
3. Follow Site Kickoff prompts
4. Build your site

## What's Inside

### Agents (Who Thinks)
| Agent | Role | LLM |
|-------|------|-----|
| Architect | Strategy, structure, constraints | Claude Opus |
| Builder | Implementation, code, components | Cursor Auto |
| Design/Imagery | Visuals, tokens, image generation | Gemini |
| Content | SEO copy, metadata, page content | Claude |
| Admin/QA | Verification, backend setup, deploy approval | Claude |

### Skills (What Gets Done)
See `/skills/` for full documentation. Key skills:
- Site Kickoff — entry gate for every project
- Repo Graduation — enforces separate production repos
- PageSpeed Pre-Commit — blocks deploy if < 95 score
- Admin Dashboard — full backend for site management

### Rules (Hard Gates)
1. No build without Site Kickoff
2. Hub repo is for development only — production sites graduate
3. LLM per agent must be confirmed
4. Missing distribution strategy = stop
5. Missing env vars = stop
6. Performance must pass 95+ before deploy
7. Admin Agent must approve deployment
8. No deploy without Analytics + Search Console connected

## Folder Structure

```
/agents/      → Agent definitions
/skills/      → Skill specs (SKILL.md format)
/rules/       → System guardrails
/workflows/   → Step-by-step flows
/capabilities/→ API playbooks
/scripts/     → Automation (init-project.sh)
/templates/   → Starter files for new projects
```

## Critical Reminder

**Every production site must live in its own repo.**

This hub is pulled in, then detached. Never deploy this repo directly.

## LLM Requirements

Before any build, confirm:
- Architect Agent → Claude Opus
- Builder Agent → Cursor Auto
- Design/Imagery Agent → Gemini
- Content Agent → Claude
- Admin/QA Agent → Claude
```
```

---

### 6.5 Bootstrap Script

`/scripts/init-project.sh`

**Purpose:** Automate new project creation from Hub.

**What it does:**
1. Prompts for new project name
2. Creates GitHub repo via GitHub CLI (`gh repo create`)
3. Clones Hub as starting point
4. Removes Hub's `.git` folder
5. Initializes fresh git history
6. Pushes to new repo
7. Prompts to link Vercel project
8. Triggers Site Kickoff Skill

**Usage:**
```bash
./scripts/init-project.sh
```

---

### 6.6 Global Cursor Rule

Add to Cursor settings:

```
For any new website project:
1. Pull the web-dev-team Hub repo
2. Run `/scripts/init-project.sh`
3. Never skip Site Kickoff
4. Confirm LLM per agent before proceeding
```

---

### 6.7 2026 SEO Fundamentals Compliance

This system enforces 2026 SEO best practices:

| Requirement | How System Enforces |
|-------------|---------------------|
| Single intent per page | Architect defines in `strategy.md` |
| Pillar + cluster structure | Architect defines in `site-structure.json` |
| E-E-A-T (author, sources) | CMS supports authors; Admin manages credentials |
| FAQ sections + schema | Schema/SEO Metadata Skill |
| AI-friendly content | Admin Dashboard content templates |
| Core Web Vitals (95+) | PageSpeed/Pre-Commit Skill |
| Lean index / no bloat | PageSpeed Skill flags thin pages |
| Internal linking | Admin Dashboard suggestions |
| Content refresh | Admin Dashboard age tracking |
| Bing exact-match keywords | Content Agent guidance |
| Bing Webmaster + Places | Admin Dashboard setup |
| Social signals for Bing | Social Publishing Skill |
| Low-competition keywords first | Keywords API Skill |

---

## 7. Out of Scope (Scope Out)

Explicitly excluded from v1:

| Item | Reason |
|------|--------|
| Sanity CMS | Too complex, not deterministic |
| Twitter/X integration | API instability, add later |
| YouTube integration | Future phase |
| i18n / multi-language | Only if Global distribution selected |
| E-commerce checkout | Separate system |
| User authentication flows | Sites link to app, don't handle auth |
| Monorepo support | Always separate repos |
| Custom analytics dashboards | Use GA4 |

---

## 8. Designs & Visual References

No designs yet.

Admin Dashboard UI should be:
- Clean, minimal
- Fast loading
- Mobile-friendly
- Intuitive content editor with live previews

Reference: Linear, Notion, or Vercel dashboard aesthetics.

---

## 9. Open Questions & Risks

### Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Supabase schema for leads + content? | Builder Agent | To define |
| Admin auth method (Supabase Auth, Clerk, etc.)? | Builder Agent | To decide |
| Exact Keywords Everywhere API integration pattern? | Builder Agent | To implement |
| Search Console API setup for sitemap submission? | Admin Agent | To implement |

### Known Risks

| Risk | Mitigation |
|------|------------|
| Gemini image quality inconsistent | Pixels/Media API as fallback |
| Keywords API rate limits | Cache results, batch requests |
| PageSpeed API rate limits | Use preview URLs, cache results |
| Social API changes | Modular design, easy to swap |

### External Dependencies

- GitHub CLI (`gh`) for repo creation
- Vercel for deployment + OG images
- Supabase for database + auth
- Google APIs (Analytics, Search Console, PageSpeed)
- Bing Webmaster Tools
- Keywords Everywhere API
- Anthropic API (Claude)
- LinkedIn API
- Medium API
- Pexels/Unsplash APIs (optional)
