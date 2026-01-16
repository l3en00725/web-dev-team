---
name: cms-content-connector
description: Sets up structured content system using file-based CMS or API. No Sanity. Use during build to establish how content is stored and accessed.
owner: Builder Agent (implements), Architect Agent (defines schema)
trigger: During build — required for all sites with dynamic content
llm: Cursor Auto (Builder), Claude Opus (Architect)
---

# CMS/Content Connector Skill

## Purpose

Deterministic, structured content that Builder and Content Agents can rely on. Establishes how content is stored, validated, and accessed.

---

## Trigger

During build — required for all sites with dynamic content.

---

## Supported CMS Options

| Option | When to Use |
|--------|-------------|
| Markdown + JSON (file-based) | Simple sites, blogs, local SEO pages |
| Astro Content Collections | Structured content with type safety |
| Supabase tables | Dynamic content, user-generated, frequent updates |
| External API | Headless CMS integration (not Sanity) |

**Hard Limit:** No Sanity.

---

## Workflow

### Step 1: Architect Defines Content Schema

**content-schema.md:**

```markdown
# Content Schema

## Page Types

### Blog Post
- title: string (required)
- slug: string (required, unique)
- publishedAt: date (required)
- updatedAt: date
- author: reference to Author (required)
- category: string
- tags: string[]
- featuredImage: image
- excerpt: string (max 200 chars)
- content: markdown (required)
- faqs: FAQ[]
- status: 'draft' | 'published' | 'archived'

### Service Page
- title: string (required)
- slug: string (required, unique)
- metaDescription: string (required, max 160)
- h1: string (required)
- intro: markdown
- features: Feature[]
- pricing: Pricing (optional)
- faqs: FAQ[]
- cta: CTA

### Location Page
- city: string (required)
- state: string (required)
- slug: string (required)
- metaDescription: string (required)
- services: string[]
- testimonials: Testimonial[]
- faqs: FAQ[]
- nearbyLocations: string[]

### Author (E-E-A-T)
- name: string (required)
- slug: string (required)
- bio: markdown (required)
- credentials: string[]
- photo: image
- socialLinks: SocialLinks
- expertise: string[]
```

### Step 2: Builder Implements CMS Structure

**Option A: Astro Content Collections**

```typescript
// src/content/config.ts
import { defineCollection, z, reference } from 'astro:content';

const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    credentials: z.array(z.string()).optional(),
    photo: z.string().optional(),
    socialLinks: z.object({
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      website: z.string().url().optional()
    }).optional(),
    expertise: z.array(z.string()).optional()
  })
});

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    author: reference('authors'),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featuredImage: image().optional(),
    excerpt: z.string().max(200).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft')
  })
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string().max(160),
    h1: z.string(),
    features: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional()
    })).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional()
  })
});

const locations = defineCollection({
  type: 'data',
  schema: z.object({
    city: z.string(),
    state: z.string(),
    stateFullName: z.string(),
    metaDescription: z.string().max(160),
    services: z.array(z.string()),
    testimonials: z.array(z.object({
      quote: z.string(),
      author: z.string(),
      location: z.string().optional()
    })).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })),
    nearbyLocations: z.array(z.string())
  })
});

export const collections = {
  authors,
  posts,
  services,
  locations
};
```

**File Structure:**

```
/content/
  /authors/
    john-doe.json
    jane-smith.json
  /posts/
    how-to-fix-leaky-faucet.md
    plumbing-maintenance-tips.md
  /services/
    emergency-plumbing.md
    drain-cleaning.md
  /locations/
    austin-tx.json
    round-rock-tx.json
```

**Option B: Supabase Tables**

```sql
-- Authors table
CREATE TABLE authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT NOT NULL,
  credentials TEXT[],
  photo TEXT,
  social_links JSONB DEFAULT '{}',
  expertise TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES authors(id),
  category TEXT,
  tags TEXT[],
  featured_image TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  faqs JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read authors"
  ON authors FOR SELECT
  USING (true);
```

### Step 3: Content Agent Populates Content

Using the defined schema, Content Agent creates:

**Example Post (Markdown):**

```markdown
---
title: "How to Fix a Leaky Faucet: Complete Guide"
publishedAt: 2026-01-15
author: john-doe
category: "DIY Plumbing"
tags: ["faucet repair", "DIY", "plumbing tips"]
featuredImage: "./images/leaky-faucet.jpg"
excerpt: "Learn how to fix a leaky faucet in 30 minutes with basic tools."
status: published
faqs:
  - question: "How long does it take to fix a leaky faucet?"
    answer: "Most faucet repairs take 15-30 minutes for someone with basic DIY skills."
  - question: "Do I need special tools?"
    answer: "Basic tools like adjustable wrench, screwdriver, and plumber's tape are usually sufficient."
---

# How to Fix a Leaky Faucet: Complete Guide

A leaky faucet wastes water and money. Here's how to fix it yourself.

## What Causes a Leaky Faucet?

The most common causes are...

## Tools You'll Need

Before starting, gather these tools...

## Step-by-Step Repair Guide

### Step 1: Turn Off the Water

First, locate the shut-off valves...
```

### Step 4: Create Content Loading Utilities

```typescript
// src/lib/content.ts
import { getCollection, getEntry } from 'astro:content';

export async function getAllPosts(options?: { 
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
}) {
  const posts = await getCollection('posts', ({ data }) => {
    if (options?.status) {
      return data.status === options.status;
    }
    return data.status === 'published';
  });
  
  const sorted = posts.sort((a, b) => 
    b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  
  return options?.limit ? sorted.slice(0, options.limit) : sorted;
}

export async function getPostBySlug(slug: string) {
  return getEntry('posts', slug);
}

export async function getAuthor(slug: string) {
  return getEntry('authors', slug);
}

export async function getPostsByAuthor(authorSlug: string) {
  const posts = await getAllPosts();
  return posts.filter(post => post.data.author.slug === authorSlug);
}

export async function getPostsByCategory(category: string) {
  const posts = await getAllPosts();
  return posts.filter(post => post.data.category === category);
}

export async function getRelatedPosts(currentSlug: string, limit: number = 3) {
  const current = await getPostBySlug(currentSlug);
  if (!current) return [];
  
  const allPosts = await getAllPosts();
  
  // Find posts with matching tags or category
  return allPosts
    .filter(post => post.slug !== currentSlug)
    .filter(post => 
      post.data.category === current.data.category ||
      post.data.tags?.some(tag => current.data.tags?.includes(tag))
    )
    .slice(0, limit);
}
```

### Step 5: Generate Content Manifest

**content-manifest.json:**

```json
{
  "generatedAt": "2026-01-16T00:00:00Z",
  "contentTypes": [
    {
      "name": "posts",
      "type": "content",
      "count": 15,
      "schema": "src/content/config.ts"
    },
    {
      "name": "authors",
      "type": "data",
      "count": 3,
      "schema": "src/content/config.ts"
    },
    {
      "name": "services",
      "type": "content",
      "count": 8,
      "schema": "src/content/config.ts"
    },
    {
      "name": "locations",
      "type": "data",
      "count": 25,
      "schema": "src/content/config.ts"
    }
  ],
  "totalContent": 51,
  "cmsType": "astro-content-collections"
}
```

---

## E-E-A-T Support

### Author Content Type

Every site must support:

- **Name** — Full name
- **Bio** — Professional biography
- **Credentials** — Qualifications, certifications
- **Photo** — Professional headshot
- **Social links** — LinkedIn, professional profiles
- **Expertise** — Areas of knowledge

### Source Citations

Content schema should support:

```typescript
sources: z.array(z.object({
  title: z.string(),
  url: z.string().url(),
  accessedAt: z.date().optional()
})).optional()
```

### Case Studies / Testimonials

```typescript
testimonials: z.array(z.object({
  quote: z.string(),
  author: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional()
})).optional()
```

---

## Hard Limits

- **No Sanity** — Use file-based or Supabase
- **No content without schema** — All content must be typed
- **No untyped content collections** — Zod validation required

---

## Required Outputs

| Output | Description |
|--------|-------------|
| CMS structure | Implemented per chosen option |
| Content schema | Enforced with Zod |
| Content loading | Working in Astro |
| Author management | Supported |
| `content-manifest.json` | Inventory of all content |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing content schema | **STOP** — Architect must define |
| Content doesn't match schema | **STOP** — Fix validation errors |
| No author support | **STOP** — Required for E-E-A-T |

---

## Success Criteria

CMS/Content Connector Skill is complete when:

- [ ] CMS option selected and implemented
- [ ] Content schema enforced with Zod
- [ ] Content collections configured
- [ ] Content loading utilities created
- [ ] Author management supported
- [ ] E-E-A-T fields available
- [ ] `content-manifest.json` generated
- [ ] Content Agent can populate content
