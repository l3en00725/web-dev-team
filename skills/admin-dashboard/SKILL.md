---
name: admin-dashboard
description: Full backend admin interface for site management. Includes analytics, performance monitoring, lead management, content creation with AI assistance, and social publishing. Use after build is complete, before deployment.
owner: Admin/QA Agent
trigger: After Builder and Content Agents complete, before deploy
llm: Claude
---

# Admin Dashboard Skill

## Purpose

Single interface for site owners to manage, monitor, and publish content. Provides comprehensive backend functionality without requiring technical knowledge.

---

## ⚠️ CRITICAL: Template-Based Implementation

**This skill uses a standardized admin dashboard template located in the Hub repository.**

**Template Location:** `/admin-dashboard-web-dev/` (in the `web-dev-team` Hub repo)

**What's Included:**
- ✅ 20 Admin Pages (dashboard, content, donors, email, events, forms, people, settings, social, users)
- ✅ 28 API Endpoints (full CRUD + social media management)
- ✅ 10 React/Astro Components (layouts, navigation, social composer)
- ✅ Complete Clerk authentication integration
- ✅ Supabase database schema (`schema.sql`)
- ✅ Full documentation (setup checklist, dependencies, API reference)

**Implementation Process:**
1. **Copy template files** from Hub repo to project
2. **Install dependencies** (see `admin-dashboard-web-dev/docs/DEPENDENCIES.md`)
3. **Set up database** (run `schema.sql` in Supabase)
4. **Configure authentication** (Clerk setup - see `skills/clerk-authentication/SKILL.md`)
5. **Customize branding** (logo, colors, navigation)
6. **Set environment variables** (see `.env.example` in template)

**Full Setup Guide:** See `admin-dashboard-web-dev/docs/SETUP-CHECKLIST.md` (60-90 minute setup)

**Template Reference:** `admin-dashboard-web-dev/README.md`

---

## Trigger

After Builder and Content Agents complete their work, before deployment.

---

## Required Environment Variables

**See `admin-dashboard-web-dev/.env.example` for complete list.**

**Core (Required):**
```
PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Optional (Based on features used):**
```
GA_MEASUREMENT_ID=
ANTHROPIC_API_KEY=
KEYWORDS_API_KEY=
GOOGLE_SEARCH_CONSOLE_API_KEY=
RESEND_API_KEY=          # For email campaigns
OPENAI_API_KEY=          # For AI content generation
UPLOAD_POST_API_KEY=     # For social media posting
```

---

## Implementation Steps

### Step 1: Copy Template Files

From the Hub repo (`web-dev-team/admin-dashboard-web-dev/`), copy to your project:

```bash
# Admin pages
cp -r admin-dashboard-web-dev/src/pages/admin your-project/src/pages/

# Admin API endpoints
cp -r admin-dashboard-web-dev/src/pages/api/* your-project/src/pages/api/

# Admin components
cp -r admin-dashboard-web-dev/src/components/admin your-project/src/components/

# Utilities
cp admin-dashboard-web-dev/src/utils/clerk.ts your-project/src/utils/

# Middleware (merge with existing if needed)
cp admin-dashboard-web-dev/src/middleware.ts.example your-project/src/middleware.ts
```

### Step 2: Install Dependencies

See `admin-dashboard-web-dev/docs/DEPENDENCIES.md` for complete list.

**Core dependencies:**
```bash
npm install @clerk/astro@^2.11.0 @supabase/supabase-js@^2.39.0 react@19.2.3 react-dom@19.2.3
npm install @radix-ui/react-dialog@1.1.15 @radix-ui/react-tabs@1.1.13 lucide-react@0.562.0
```

### Step 3: Set Up Database

Run `admin-dashboard-web-dev/schema.sql` in your Supabase SQL Editor.

### Step 4: Configure Authentication

Follow `skills/clerk-authentication/SKILL.md` for complete Clerk setup.

### Step 5: Update Super Admin Email

Replace `'ben@bluehomesgroup.com'` with your email in:
- `src/middleware.ts`
- `src/utils/clerk.ts`
- `src/pages/api/add-user.ts`

### Step 6: Customize Branding

- Logo: Update in `src/components/admin/AdminLayout.astro`
- Colors: Edit `tailwind.config.mjs` brand colors
- Navigation: Modify `src/components/admin/AdminSidebar.astro`

---

## Dashboard Sections

**All sections are pre-implemented in the template. Customize as needed for your project.**

### 1. Analytics

**Features:**
- Google Analytics connection + guided setup
- Key metrics: sessions, users, bounce rate, top pages
- Search Console connection + guided setup
- Bing Webmaster Tools connection + guided setup
- Bing Places setup (if Local SEO)

**Implementation:**

```typescript
// src/lib/analytics.ts
export async function getAnalyticsData(propertyId: string, dateRange: { start: string; end: string }) {
  // Google Analytics Data API v1
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'date' }]
      })
    }
  );
  
  return response.json();
}
```

---

### 2. Performance

**Features:**
- PageSpeed Insights scores (mobile + desktop)
- Core Web Vitals summary
- Historical tracking

**Display:**

```typescript
interface PerformanceMetrics {
  mobile: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  desktop: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  lastChecked: string;
}
```

---

### 3. Forms & Leads

**Features:**
- Form submissions from Supabase
- Webhook URLs for CRM/Zapier (easy copy button)
- Lead export (CSV, JSON)
- Lead status management

**Supabase Query:**

```typescript
export async function getLeads(options?: {
  limit?: number;
  offset?: number;
  formType?: string;
  processed?: boolean;
}) {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10));
  if (options?.formType) query = query.eq('form_type', options.formType);
  if (options?.processed !== undefined) query = query.eq('processed', options.processed);
  
  return query;
}
```

---

### 4. Content Creation

**Structure Enforcement:**
- H1 (required, one only)
- H2s (major sections)
- H3s (subsections)
- Body paragraphs

**AI Assistance (Claude API):**

```typescript
// src/lib/content-ai.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY
});

export async function generateDraft(topic: string, targetKeyword: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Write a blog post about "${topic}" targeting the keyword "${targetKeyword}".
      
      Follow this structure:
      1. H1 title (include keyword)
      2. Introduction paragraph (mention keyword in first 100 words)
      3. H2 sections covering main points
      4. H3 subsections where appropriate
      5. FAQ section with 3-5 questions
      
      Use the question → answer → depth pattern for AI-friendly content.
      Keep paragraphs short (2-3 sentences).
      Include a clear call-to-action.`
    }]
  });
  
  return response.content[0].text;
}

export async function generateMetaDescription(content: string, keyword: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a meta description (max 155 characters) for this content. Include the keyword "${keyword}". Make it compelling with a clear value proposition.\n\nContent:\n${content.slice(0, 1000)}`
    }]
  });
  
  return response.content[0].text;
}

export async function suggestHeadings(topic: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Suggest an H1 and 4-6 H2 headings for a blog post about "${topic}". Format as JSON: { "h1": "...", "h2s": ["...", "..."] }`
    }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

**SEO Features:**
- Target keyword field (ties into Keywords API)
- Related keyword suggestions
- SEO score/checklist
- Schema auto-generated per content type

**Previews:**
- SEO preview (Google results appearance)
- Social preview (LinkedIn/Medium appearance)

**Media:**
- Image picker (generated + stock library)
- Alt text suggestions (AI-assisted)

**Internal Linking:**
- Suggest links to other site pages
- Auto-detect linking opportunities in content

**Workflow:**
- Save as draft
- Schedule publish
- Publish now

---

### 5. Author Management (E-E-A-T)

**Features:**
- Author bios
- Credentials
- Photos
- Links to author schema

**Schema:**

```typescript
interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  credentials: string[];
  photo: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  expertise: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

### 6. Content Refresh Tracking

**Features:**
- Content age tracking
- Flag old content for refresh
- Prioritize updates over new posts

**Implementation:**

```typescript
export async function getContentForRefresh(maxAgeDays: number = 180) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
  
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, published_at, updated_at')
    .lt('updated_at', cutoffDate.toISOString())
    .eq('status', 'published')
    .order('updated_at', { ascending: true });
  
  return data?.map(post => ({
    ...post,
    daysSinceUpdate: Math.floor(
      (Date.now() - new Date(post.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    )
  }));
}
```

---

### 7. Sitemap Submission

**Features:**
- Auto-submit sitemap to Search Console API on deploy
- Manual resubmit option

**Implementation:**

```typescript
export async function submitSitemap(siteUrl: string) {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  return response.ok;
}
```

---

### 8. Social Publishing

**Features:**
- LinkedIn connection
- Medium connection
- One-click publish to selected platforms
- Canonical URL auto-set

See: Social Publishing Skill for full implementation.

---

### 9. Pre-Launch Checklist

**Human-verified final gate:**

```typescript
const preLaunchChecklist = {
  technical: [
    { id: 'pages-render', label: 'All pages render without errors', checked: false },
    { id: 'no-console-errors', label: 'No console errors', checked: false },
    { id: 'no-404s', label: 'No 404s on internal links', checked: false },
    { id: 'sitemap', label: 'Sitemap.xml generates correctly', checked: false },
    { id: 'robots', label: 'robots.txt configured', checked: false },
    { id: 'ssl', label: 'SSL certificate active', checked: false },
    { id: 'redirects', label: 'Redirects working (if rebuild)', checked: false }
  ],
  seo: [
    { id: 'meta-titles', label: 'Every page has unique meta title', checked: false },
    { id: 'meta-descriptions', label: 'Every page has unique meta description', checked: false },
    { id: 'h1s', label: 'Every page has proper H1', checked: false },
    { id: 'schema', label: 'Schema markup on all pages', checked: false },
    { id: 'alt-text', label: 'Images have alt text', checked: false },
    { id: 'internal-links', label: 'Internal linking implemented', checked: false }
  ],
  performance: [
    { id: 'pagespeed-mobile', label: 'PageSpeed 95+ mobile', checked: false },
    { id: 'pagespeed-desktop', label: 'PageSpeed 95+ desktop', checked: false },
    { id: 'cwv', label: 'Core Web Vitals pass', checked: false },
    { id: 'images-optimized', label: 'Images optimized', checked: false }
  ],
  analytics: [
    { id: 'ga-connected', label: 'Google Analytics connected', checked: false },
    { id: 'gsc-connected', label: 'Search Console connected', checked: false },
    { id: 'sitemap-submitted', label: 'Sitemap submitted to Search Console', checked: false },
    { id: 'bing-connected', label: 'Bing Webmaster Tools connected', checked: false }
  ],
  admin: [
    { id: 'admin-accessible', label: 'Admin dashboard accessible', checked: false },
    { id: 'auth-working', label: 'Auth protecting admin routes', checked: false },
    { id: 'forms-working', label: 'Form submissions working', checked: false },
    { id: 'content-editor', label: 'Content editor functional', checked: false },
    { id: 'social-connections', label: 'Social connections configured', checked: false }
  ]
};
```

---

## UI Requirements

- Clean, polished interface
- Mobile-friendly
- Fast loading
- Intuitive content editor
- Reference: Linear, Notion, or Vercel dashboard aesthetics

---

## Hard Limits

- **No public access** — Auth required
- **No editing site structure** — Only content
- **No publishing without H1 + meta description**

---

## Required Outputs

| Output | Description |
|--------|-------------|
| Admin route(s) | `/admin/*` protected routes |
| All sections functional | As specified above |
| AI content assistance | Claude integration working |
| Social connections | Verified and functional |
| Auth | Protecting admin access |
| Pre-launch checklist | 100% complete before deploy |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing Supabase | **STOP** — Cannot proceed |
| Missing Claude API key | Disable AI features, continue |
| Missing Analytics | **FLAG** — Continue with warning |

---

## Success Criteria

Admin Dashboard Skill is complete when:

- [ ] Template files copied from Hub repo to project
- [ ] All dependencies installed (see `DEPENDENCIES.md`)
- [ ] Database schema applied (`schema.sql` run in Supabase)
- [ ] Clerk authentication configured and working
- [ ] Super admin email updated in all required files
- [ ] Branding customized (logo, colors, navigation)
- [ ] All environment variables set (local + production)
- [ ] Admin dashboard accessible at `/admin`
- [ ] All 9 sections functional (dashboard, users, content, forms, social, etc.)
- [ ] Auth protecting admin routes
- [ ] Forms/leads management working
- [ ] Content editor functional
- [ ] Social publishing configured (if using)
- [ ] Pre-launch checklist available and accessible
