# Content Schema

## Project: [PROJECT_NAME]
## Last Updated: [DATE]
## Owner: Architect Agent

---

## Overview

This document defines the content types, their fields, and validation rules for the site. Builder Agent implements these as Astro Content Collections or Supabase tables. Content Agent follows these schemas when creating content.

---

## Content Types

### Page (Base Type)

All page types inherit these fields:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | Max 60 chars |
| slug | string | Yes | Unique, lowercase, hyphens only |
| metaTitle | string | Yes | Max 60 chars |
| metaDescription | string | Yes | Max 160 chars |
| h1 | string | Yes | Max 70 chars |
| publishedAt | date | Yes | ISO 8601 |
| updatedAt | date | No | ISO 8601 |
| status | enum | Yes | draft, published, archived |
| noindex | boolean | No | Default: false |

---

### Blog Post

Extends: Page

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| author | reference | Yes | Must exist in Authors |
| category | string | No | From predefined list |
| tags | string[] | No | Max 10 tags |
| featuredImage | image | Yes | Min 1200x630 |
| featuredImageAlt | string | Yes | Max 125 chars |
| excerpt | string | Yes | Max 200 chars |
| content | markdown | Yes | Min 500 words |
| faqs | FAQ[] | No | See FAQ type |
| readingTime | number | Auto | Calculated |

**Content Structure:**
```markdown
# {h1}

{intro paragraph - include primary keyword}

## {H2 Section}

{content}

### {H3 Subsection} (optional)

{content}

## {H2 Section}

{content}

## Frequently Asked Questions

### {Question}
{Answer}
```

---

### Service Page

Extends: Page

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| intro | markdown | Yes | 100-300 words |
| features | Feature[] | Yes | Min 3 features |
| benefits | string[] | Yes | Min 3 benefits |
| process | ProcessStep[] | No | Ordered steps |
| pricing | Pricing | No | See Pricing type |
| faqs | FAQ[] | Yes | Min 3 FAQs |
| cta | CTA | Yes | See CTA type |
| relatedServices | reference[] | No | Max 3 |

**Feature Type:**
| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| description | string | Yes |
| icon | string | No |

**ProcessStep Type:**
| Field | Type | Required |
|-------|------|----------|
| step | number | Yes |
| title | string | Yes |
| description | string | Yes |

---

### Location Page

Extends: Page

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| city | string | Yes | |
| state | string | Yes | 2-letter code |
| stateFullName | string | Yes | |
| service | string | Yes | |
| intro | markdown | Yes | 150-300 words |
| serviceArea | string[] | No | Nearby areas served |
| testimonials | Testimonial[] | No | Location-specific |
| faqs | FAQ[] | Yes | Min 3, location-specific |
| nearbyLocations | string[] | Yes | For internal linking |
| address | Address | No | If physical location |
| phone | string | No | Local number |
| hours | string[] | No | Operating hours |

**Address Type:**
| Field | Type | Required |
|-------|------|----------|
| street | string | Yes |
| city | string | Yes |
| state | string | Yes |
| zip | string | Yes |
| lat | number | No |
| lng | number | No |

---

### Author (E-E-A-T)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Full name |
| slug | string | Yes | Unique |
| bio | markdown | Yes | 100-300 words |
| shortBio | string | Yes | Max 160 chars |
| credentials | string[] | Yes | Min 1 |
| photo | image | Yes | Square, min 400x400 |
| photoAlt | string | Yes | |
| jobTitle | string | Yes | |
| expertise | string[] | Yes | Min 2 areas |
| socialLinks | SocialLinks | No | |
| email | string | No | |

**SocialLinks Type:**
| Field | Type | Required |
|-------|------|----------|
| linkedin | url | No |
| twitter | url | No |
| website | url | No |

---

### FAQ

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| question | string | Yes | End with ? |
| answer | string | Yes | 50-300 words |

---

### Testimonial

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| quote | string | Yes | Max 500 chars |
| author | string | Yes | |
| company | string | No | |
| location | string | No | City, State |
| rating | number | No | 1-5 |
| image | image | No | |

---

### CTA (Call to Action)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| headline | string | Yes | Max 70 chars |
| description | string | No | Max 150 chars |
| buttonText | string | Yes | Max 30 chars |
| buttonUrl | string | Yes | Valid URL or path |
| style | enum | No | primary, secondary |

---

### Pricing

| Field | Type | Required |
|-------|------|----------|
| showPricing | boolean | Yes |
| startingAt | string | No |
| packages | Package[] | No |
| disclaimer | string | No |

**Package Type:**
| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| price | string | Yes |
| description | string | Yes |
| features | string[] | Yes |
| cta | CTA | Yes |
| popular | boolean | No |

---

## Validation Rules

### Text Fields
- No placeholder text (lorem ipsum)
- No ALL CAPS (except acronyms)
- Proper punctuation
- No trailing whitespace

### Images
- Must have alt text
- Must be optimized (under size thresholds)
- Must have appropriate dimensions

### URLs/Slugs
- Lowercase only
- Hyphens for spaces
- No special characters
- No trailing slashes in slugs

### Dates
- ISO 8601 format
- publishedAt cannot be future for published content
- updatedAt must be >= publishedAt

---

## Content Relationships

```
Author ─────────────┐
                    │
                    ▼
Blog Post ◄─────── Category
    │
    ├──► FAQ[]
    │
    └──► Tags[]

Service Page ◄───── Related Services
    │
    ├──► Feature[]
    ├──► FAQ[]
    └──► CTA

Location Page ◄──── Nearby Locations
    │
    ├──► Testimonial[]
    └──► FAQ[]
```

---

## Implementation Notes

### For Builder Agent

1. Implement as Astro Content Collections with Zod schemas
2. Create TypeScript types for all content types
3. Validate on build
4. Generate error messages for invalid content

### For Content Agent

1. Follow all field requirements
2. Use AI-friendly content patterns
3. Include keywords naturally
4. Maintain heading hierarchy
5. Provide all required fields before marking as published
