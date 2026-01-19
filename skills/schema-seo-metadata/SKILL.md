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
- [ ] GEO requirements (if local SEO site)

From Content Agent:
- [ ] Meta titles and descriptions
- [ ] Alt text for images
- [ ] Content with lastUpdated dates
- [ ] Question-answer format content

---

## Supported Schema Types

| Schema Type | Use Case |
|-------------|----------|
| LocalBusiness | Local service businesses |
| Place | Geographic locations (cities, service areas) |
| GeoCircle | Service area boundaries |
| Service | Service pages |
| Article / BlogPosting | Blog posts, news |
| FAQPage | FAQ sections |
| HowTo | Tutorial/guide content |
| Product | Product pages |
| BreadcrumbList | Navigation breadcrumbs |
| Organization | Company/brand info |
| Person | Author bios (E-E-A-T) |
| Review / AggregateRating | Customer reviews and ratings |

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

**Place Schema (for location pages):**

```typescript
export function generatePlaceSchema(data: {
  name: string;
  description: string;
  address: {
    street?: string;
    city: string;
    state: string;
    zip?: string;
  };
  geo: { lat: number; lng: number };
  serviceArea?: {
    radius: number; // in miles or km
    unit: 'mi' | 'km';
  };
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": data.name,
    "description": data.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": data.address.city,
      "addressRegion": data.address.state,
      "addressCountry": "US",
      ...(data.address.street && { "streetAddress": data.address.street }),
      ...(data.address.zip && { "postalCode": data.address.zip })
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.geo.lat,
      "longitude": data.geo.lng
    }
  };

  // Add GeoCircle for service area if provided
  if (data.serviceArea) {
    schema["areaServed"] = {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": data.geo.lat,
        "longitude": data.geo.lng
      },
      "geoRadius": {
        "@type": "Distance",
        "value": data.serviceArea.radius,
        "unitCode": data.serviceArea.unit === 'mi' ? 'SMI' : 'KMT'
      }
    };
  }

  return schema;
}
```

**Enhanced LocalBusiness with Service Area:**

```typescript
export function generateLocalBusinessWithServiceArea(data: {
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
  geo: { lat: number; lng: number };
  serviceArea: {
    radius: number;
    unit: 'mi' | 'km';
    cities?: string[]; // List of cities served
  };
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
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.geo.lat,
      "longitude": data.geo.lng
    },
    "areaServed": [
      {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": data.geo.lat,
          "longitude": data.geo.lng
        },
        "geoRadius": {
          "@type": "Distance",
          "value": data.serviceArea.radius,
          "unitCode": data.serviceArea.unit === 'mi' ? 'SMI' : 'KMT'
        }
      },
      ...(data.serviceArea.cities || []).map(city => ({
        "@type": "City",
        "name": city
      }))
    ],
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

**HowTo Schema (for tutorials/guides):**

```typescript
export function generateHowToSchema(data: {
  name: string;
  description: string;
  image?: string;
  totalTime?: string; // ISO 8601 duration (e.g., "PT30M")
  steps: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    ...(data.image && { "image": data.image }),
    ...(data.totalTime && { "totalTime": data.totalTime }),
    "step": data.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image }),
      ...(step.url && { "url": step.url })
    }))
  };
}
```

**Review/AggregateRating Schema:**

```typescript
export function generateReviewSchema(data: {
  itemReviewed: {
    name: string;
    type: string; // "LocalBusiness", "Service", etc.
  };
  ratingValue: number; // 1-5
  bestRating?: number; // Default 5
  worstRating?: number; // Default 1
  reviewCount?: number;
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    ratingValue: number;
  }>;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": data.itemReviewed.type,
      "name": data.itemReviewed.name
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": data.ratingValue,
      "bestRating": data.bestRating || 5,
      "worstRating": data.worstRating || 1
    }
  };

  if (data.reviewCount) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": data.ratingValue,
      "reviewCount": data.reviewCount,
      "bestRating": data.bestRating || 5,
      "worstRating": data.worstRating || 1
    };
  }

  if (data.reviews && data.reviews.length > 0) {
    schema["review"] = data.reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.ratingValue
      }
    }));
  }

  return schema;
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
  credentials?: string[]; // Certifications, degrees, etc.
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    ...(author.url && { "url": author.url }),
    ...(author.image && { "image": author.image }),
    ...(author.jobTitle && { "jobTitle": author.jobTitle }),
    ...(author.description && { "description": author.description }),
    ...(author.sameAs && { "sameAs": author.sameAs }),
    ...(author.credentials && { "hasCredential": author.credentials.map(cred => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": cred
    })) })
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

### Step 6: Generate llms.txt (AI/LLM Indexing)

**Purpose:** Help AI agents understand and index your content properly.

```typescript
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const pages = await getCollection('pages');
  const posts = await getCollection('posts');
  
  const llmsTxt = `# llms.txt — AI/LLM Indexing Guide

# Site Information
Site: ${site}
Language: en-US
Last Updated: ${new Date().toISOString()}

# Content Structure
## Main Pages
${pages.map(p => `- ${site}${p.slug}`).join('\n')}

## Blog Posts
${posts.map(p => `- ${site}blog/${p.slug}`).join('\n')}

# Sitemap
Sitemap: ${site}sitemap.xml

# Content Guidelines
- All content follows question-answer format
- FAQ schema present on relevant pages
- Author attribution with Person schema
- Content freshness tracked (lastUpdated dates)

# Contact
For questions about content usage, see /contact/
`;
  
  return new Response(llmsTxt, {
    headers: { 'Content-Type': 'text/plain' }
  });
};
```

**Alternative: Static llms.txt file**

If dynamic generation isn't needed, create `/public/llms.txt`:

```
# llms.txt — AI/LLM Indexing Guide

# Site Information
Site: https://example.com
Language: en-US

# Sitemap
Sitemap: https://example.com/sitemap.xml

# Content Guidelines
- All content follows question-answer format
- FAQ schema present on relevant pages
- Author attribution with Person schema
- Content freshness tracked (lastUpdated dates)
```

### Step 7: Create SEO Checklist

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
| Schema generators | Utilities for all schema types (including Place, GeoCircle, HowTo) |
| Heading validation | Utility to check hierarchy |
| `sitemap.xml` | Dynamic sitemap generation |
| `robots.txt` | Crawl directives |
| `llms.txt` | AI/LLM indexing guide |
| `seo-checklist.md` | Verification checklist |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing metadata on any page | **STOP** — Must fix |
| Missing schema on any page | **STOP** — Must fix |
| Missing GEO schema (if local SEO) | **STOP** — Must add Place/GeoCircle schema |
| Missing llms.txt | **STOP** — Must create for AI/LLM indexing |
| Invalid heading hierarchy | **STOP** — Must fix |
| Sitemap not generating | **STOP** — Must fix |
| Missing dateModified in content | **STOP** — Must add for content freshness |

---

## Success Criteria

Schema/SEO Metadata Skill is complete when:

- [ ] All pages have meta title and description
- [ ] All pages have OG tags
- [ ] All pages have appropriate schema
- [ ] GEO schema present (Place, GeoCircle) if local SEO
- [ ] HowTo schema present for tutorial content
- [ ] Review/AggregateRating schema present (if applicable)
- [ ] Heading hierarchy validated
- [ ] sitemap.xml working
- [ ] robots.txt configured
- [ ] llms.txt created in /public/
- [ ] DateModified fields in all content schemas
- [ ] seo-checklist.md completed
