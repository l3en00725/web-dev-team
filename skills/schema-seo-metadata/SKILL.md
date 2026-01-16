---
name: schema-seo-metadata
description: Ensures consistent SEO metadata, structured data (JSON-LD), sitemap, and robots.txt across all pages. Use during build to enforce metadata requirements defined by Architect Agent.
owner: Builder Agent (implements), Content Agent (provides copy)
trigger: Every build — required for all sites
llm: Cursor Auto (Builder), Claude (Content)
---

# Schema/SEO Metadata Skill

## Purpose

Mechanical application of SEO metadata, schema markup, and crawl directives. Ensures every page has proper metadata and structured data for search engines.

---

## Trigger

Every build — this skill is **required for all sites**.

---

## Prerequisites

From Architect Agent:
- [ ] `seo-requirements.md` — Metadata rules per page type
- [ ] Heading structure rules (H1 → H2 → H3)
- [ ] Schema type per page type

From Content Agent:
- [ ] Meta titles and descriptions
- [ ] Alt text for images

---

## Supported Schema Types

| Schema Type | Use Case |
|-------------|----------|
| LocalBusiness | Local service businesses |
| Service | Service pages |
| Article / BlogPosting | Blog posts, news |
| FAQPage | FAQ sections |
| HowTo | Tutorial/guide content |
| Product | Product pages |
| BreadcrumbList | Navigation breadcrumbs |
| Organization | Company/brand info |
| Person | Author bios (E-E-A-T) |

---

## Workflow

### Step 1: Create Metadata Components

**Base SEO Component:**

```astro
---
// src/components/SEO.astro
export interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  schema?: object | object[];
}

const { 
  title, 
  description, 
  canonical = Astro.url.href,
  ogImage = '/og-default.png',
  noindex = false,
  schema
} = Astro.props;

const siteName = import.meta.env.SITE_NAME || 'Site Name';
---

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />
{canonical && <link rel="canonical" href={canonical} />}
{noindex && <meta name="robots" content="noindex, nofollow" />}

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content={canonical} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />
<meta property="og:site_name" content={siteName} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={canonical} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={ogImage} />

<!-- JSON-LD Schema -->
{schema && (
  <script type="application/ld+json" set:html={JSON.stringify(
    Array.isArray(schema) ? schema : [schema]
  )} />
)}
```

### Step 2: Implement Schema Generators

**LocalBusiness Schema:**

```typescript
// src/utils/schema.ts
export function generateLocalBusinessSchema(data: {
  name: string;
  description: string;
  url: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  geo?: { lat: number; lng: number };
  hours?: string[];
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": data.name,
    "description": data.description,
    "url": data.url,
    "telephone": data.phone,
    "image": data.image,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address.street,
      "addressLocality": data.address.city,
      "addressRegion": data.address.state,
      "postalCode": data.address.zip,
      "addressCountry": "US"
    },
    ...(data.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": data.geo.lat,
        "longitude": data.geo.lng
      }
    }),
    ...(data.hours && {
      "openingHours": data.hours
    })
  };
}
```

**Article/BlogPosting Schema:**

```typescript
export function generateArticleSchema(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.description,
    "url": data.url,
    "image": data.image,
    "datePublished": data.datePublished,
    "dateModified": data.dateModified || data.datePublished,
    "author": {
      "@type": "Person",
      "name": data.author.name,
      ...(data.author.url && { "url": data.author.url })
    },
    "publisher": {
      "@type": "Organization",
      "name": import.meta.env.SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": import.meta.env.SITE_URL + "/logo.png"
      }
    }
  };
}
```

**FAQPage Schema:**

```typescript
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
```

**BreadcrumbList Schema:**

```typescript
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
```

**Person Schema (E-E-A-T):**

```typescript
export function generatePersonSchema(author: {
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    ...(author.url && { "url": author.url }),
    ...(author.image && { "image": author.image }),
    ...(author.jobTitle && { "jobTitle": author.jobTitle }),
    ...(author.description && { "description": author.description }),
    ...(author.sameAs && { "sameAs": author.sameAs })
  };
}
```

### Step 3: Enforce Heading Hierarchy

**Heading Validation Utility:**

```typescript
// src/utils/heading-validator.ts
export function validateHeadingHierarchy(html: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const headings = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
  
  let h1Count = 0;
  let lastLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.match(/<h([1-6])/i)?.[1] || '0');
    
    // Check for single H1
    if (level === 1) {
      h1Count++;
      if (h1Count > 1) {
        errors.push(`Multiple H1 tags found (heading ${index + 1})`);
      }
    }
    
    // Check for skipped levels
    if (lastLevel > 0 && level > lastLevel + 1) {
      errors.push(`Skipped heading level: H${lastLevel} to H${level} (heading ${index + 1})`);
    }
    
    lastLevel = level;
  });
  
  if (h1Count === 0) {
    errors.push('No H1 tag found');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Step 4: Generate sitemap.xml

```typescript
// src/pages/sitemap.xml.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const pages = await getCollection('pages');
  const posts = await getCollection('posts');
  const locations = await getCollection('locations');
  
  const allUrls = [
    // Static pages
    { url: site, lastmod: new Date().toISOString(), priority: 1.0 },
    // Dynamic pages
    ...pages.map(page => ({
      url: `${site}${page.slug}/`,
      lastmod: page.data.updatedAt || page.data.publishedAt,
      priority: 0.8
    })),
    // Blog posts
    ...posts.map(post => ({
      url: `${site}blog/${post.slug}/`,
      lastmod: post.data.updatedAt || post.data.publishedAt,
      priority: 0.6
    })),
    // Location pages
    ...locations.map(loc => ({
      url: `${site}${loc.data.service}/${loc.data.city.toLowerCase()}-${loc.data.state.toLowerCase()}/`,
      lastmod: new Date().toISOString(),
      priority: 0.7
    }))
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
```

### Step 5: Generate robots.txt

```typescript
// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${site}sitemap.xml
`;
  
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' }
  });
};
```

### Step 6: Create SEO Checklist

**seo-checklist.md:**

```markdown
# SEO Checklist

## Meta Tags
- [ ] Every page has unique meta title
- [ ] Every page has unique meta description (< 160 chars)
- [ ] Canonical URLs set correctly
- [ ] OG tags present on all pages
- [ ] Twitter cards configured

## Headings
- [ ] Every page has exactly one H1
- [ ] Heading hierarchy is correct (H1 → H2 → H3)
- [ ] No skipped heading levels

## Schema Markup
- [ ] Organization schema on homepage
- [ ] LocalBusiness schema (if applicable)
- [ ] Article schema on blog posts
- [ ] FAQPage schema on FAQ sections
- [ ] BreadcrumbList on all pages
- [ ] Person schema for authors

## Technical
- [ ] sitemap.xml generates correctly
- [ ] robots.txt configured
- [ ] All images have alt text
- [ ] No broken internal links
- [ ] No duplicate content

## Verification
- [ ] Schema validated with Google Rich Results Test
- [ ] Meta tags verified with social preview tools
```

---

## Hard Limits

- **No missing meta titles** — Every page must have one
- **No missing meta descriptions** — Every page must have one
- **No duplicate H1s** — Exactly one H1 per page
- **No pages without schema** — At minimum, BreadcrumbList
- **Sitemap must include all public pages**

---

## Required Outputs

| Output | Description |
|--------|-------------|
| SEO component(s) | Reusable metadata components |
| Schema generators | Utilities for all schema types |
| Heading validation | Utility to check hierarchy |
| `sitemap.xml` | Dynamic sitemap generation |
| `robots.txt` | Crawl directives |
| `seo-checklist.md` | Verification checklist |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing metadata on any page | **STOP** — Must fix |
| Missing schema on any page | **FLAG** — Review required |
| Invalid heading hierarchy | **STOP** — Must fix |
| Sitemap not generating | **STOP** — Must fix |

---

## Success Criteria

Schema/SEO Metadata Skill is complete when:

- [ ] All pages have meta title and description
- [ ] All pages have OG tags
- [ ] All pages have appropriate schema
- [ ] Heading hierarchy validated
- [ ] sitemap.xml working
- [ ] robots.txt configured
- [ ] seo-checklist.md completed
