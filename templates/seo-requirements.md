# SEO Requirements

## Project: [PROJECT_NAME]
## Last Updated: [DATE]
## Owner: Architect Agent

---

## Overview

This document defines SEO requirements for all page types. Builder Agent implements these mechanically. Content Agent provides the copy that fills these requirements.

---

## Global Requirements

### Every Page Must Have

- [ ] Unique meta title (max 60 chars)
- [ ] Unique meta description (max 160 chars)
- [ ] Exactly one H1 tag
- [ ] Proper heading hierarchy (H1 → H2 → H3, no skipping)
- [ ] Canonical URL
- [ ] Open Graph tags (title, description, image)
- [ ] Twitter Card tags
- [ ] At least one schema type
- [ ] BreadcrumbList schema
- [ ] **DateModified field in frontmatter/metadata (MANDATORY for AI/LLM indexing)**

### Image Requirements

- [ ] All images have alt text
- [ ] Alt text is descriptive (not "image" or filename)
- [ ] Alt text includes keywords where natural
- [ ] Images are optimized (WebP, under thresholds)
- [ ] Images have width and height attributes

### Link Requirements

- [ ] All internal links work (no 404s)
- [ ] External links have rel="noopener" (if target="_blank")
- [ ] Important links are not JavaScript-only
- [ ] Anchor text is descriptive

---

## Page-Specific Requirements

### Homepage

**Meta Title Pattern:**
```
{Site Name} | {Tagline/Primary Keyword}
```

**Meta Description Pattern:**
```
{Value proposition}. {Key benefit}. {CTA or differentiator}.
```

**Schema Types:**
- Organization
- WebSite
- (LocalBusiness if applicable)

**H1:** Site name or primary value proposition

**Content Requirements:**
- Clear value proposition above fold
- Primary services/offerings highlighted
- Trust signals (testimonials, logos)
- Clear CTAs

---

### Service Pages

**Meta Title Pattern:**
```
{Service Name} Services | {Site Name}
```
or
```
{Service Name} in {Location} | {Site Name}
```

**Meta Description Pattern:**
```
{Service description}. {Key benefit}. {CTA}. {Differentiator}.
```

**Schema Types:**
- Service
- BreadcrumbList
- FAQPage (if FAQs present)

**H1:** Include service name and location (if local)

**Content Requirements:**
- Service description (what it is)
- Benefits (why choose this)
- Process (how it works)
- FAQs (min 3)
- CTA

**Heading Structure:**
```
H1: {Service} in {Location}
  H2: What is {Service}?
  H2: Benefits of {Service}
  H2: Our {Service} Process
    H3: Step 1
    H3: Step 2
  H2: Frequently Asked Questions
    H3: Question 1?
    H3: Question 2?
  H2: Get Started Today
```

---

### Location Pages

**Meta Title Pattern:**
```
{Service} in {City}, {State} | {Site Name}
```

**Meta Description Pattern:**
```
Professional {service} in {city}, {state}. {Key benefit}. {Local differentiator}. Call {phone} for {CTA}.
```

**Schema Types:**
- LocalBusiness
- Service
- BreadcrumbList
- FAQPage

**H1:** Must include city and state

**Content Requirements:**
- Location-specific intro
- Services offered in this location
- Service area coverage
- Local testimonials (if available)
- Location-specific FAQs
- Contact information
- Links to nearby locations

**Internal Linking:**
- Link to 3-5 nearby location pages
- Link to main service page
- Link from service page back to location

---

### Blog Posts

**Meta Title Pattern:**
```
{Post Title} | {Site Name} Blog
```

**Meta Description Pattern:**
```
{Summary of post}. {What reader will learn}. {Read time or CTA}.
```

**Schema Types:**
- Article (or BlogPosting)
- BreadcrumbList
- Person (author)
- FAQPage (if FAQs present)

**H1:** Post title (include primary keyword)

**Content Requirements:**
- Primary keyword in first 100 words
- AI-friendly structure (question → answer → depth)
- Short paragraphs (2-3 sentences)
- Subheadings every 200-300 words
- Internal links to related content
- Author attribution

**Heading Structure:**
```
H1: {Post Title with Keyword}
  H2: {Section answering main question}
  H2: {Supporting section}
    H3: {Subsection}
    H3: {Subsection}
  H2: {Additional context}
  H2: Frequently Asked Questions (optional)
    H3: Question?
  H2: Conclusion/Next Steps
```

---

### About Page

**Meta Title Pattern:**
```
About Us | {Site Name}
```

**Meta Description Pattern:**
```
Learn about {site name}. {Mission/story}. {Differentiator}. {Trust signal}.
```

**Schema Types:**
- Organization
- BreadcrumbList

**Content Requirements:**
- Company story/mission
- Team information (E-E-A-T)
- Credentials/certifications
- Trust signals

---

### Contact Page

**Meta Title Pattern:**
```
Contact Us | {Site Name}
```

**Meta Description Pattern:**
```
Contact {site name} for {service}. {Contact methods}. {Response time or CTA}.
```

**Schema Types:**
- LocalBusiness (with contact info)
- BreadcrumbList

**Content Requirements:**
- Contact form
- Phone number
- Email address
- Physical address (if applicable)
- Hours of operation
- Map (if local business)

---

## Schema Markup Reference

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{Site Name}",
  "url": "{Site URL}",
  "logo": "{Logo URL}",
  "description": "{Site Description}",
  "sameAs": [
    "{LinkedIn URL}",
    "{Facebook URL}"
  ]
}
```

### LocalBusiness

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{Business Name}",
  "description": "{Description}",
  "url": "{URL}",
  "telephone": "{Phone}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{Street}",
    "addressLocality": "{City}",
    "addressRegion": "{State}",
    "postalCode": "{ZIP}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{Lat}",
    "longitude": "{Lng}"
  },
  "openingHours": ["Mo-Fr 08:00-17:00"]
}
```

### Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Title}",
  "description": "{Description}",
  "image": "{Image URL}",
  "datePublished": "{ISO Date}",
  "dateModified": "{ISO Date}",
  "author": {
    "@type": "Person",
    "name": "{Author Name}",
    "url": "{Author URL}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{Site Name}",
    "logo": {
      "@type": "ImageObject",
      "url": "{Logo URL}"
    }
  }
}
```

### FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Question}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{Answer}"
      }
    }
  ]
}
```

### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{Home URL}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{Page Name}",
      "item": "{Page URL}"
    }
  ]
}
```

---

## Technical SEO Checklist

### Crawlability
- [ ] sitemap.xml exists and is valid
- [ ] robots.txt configured correctly
- [ ] No accidental noindex tags
- [ ] No orphan pages
- [ ] XML sitemap submitted to Search Console

### Performance
- [ ] PageSpeed 95+ mobile
- [ ] PageSpeed 95+ desktop
- [ ] Core Web Vitals passing
- [ ] Images lazy loaded
- [ ] CSS/JS optimized

### Mobile Optimization (MANDATORY — 2026 REQUIREMENT)

**All sites MUST pass mobile optimization checks before Build phase completes.**

**Required Checks:**
- [ ] Viewport meta tag present (`<meta name="viewport" content="width=device-width, initial-scale=1">`)
- [ ] Mobile-first responsive design implemented
- [ ] No horizontal scroll at 375px width (test all pages)
- [ ] Touch targets minimum 44x44px (iOS) / 48x48px (Android)
- [ ] Base font size minimum 16px (prevents iOS zoom)
- [ ] Line height minimum 1.5 for readability
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Images responsive (srcset or responsive images)
- [ ] Mobile navigation functional (hamburger menu or mobile nav)
- [ ] Forms usable on mobile (proper input sizes, touch-friendly)
- [ ] No JavaScript-only navigation (must work without JS)

**Testing Requirements:**
- Test all pages at 375px width (iPhone SE size)
- Verify no horizontal scroll on any page
- Test touch interactions (buttons, links, forms)
- Verify mobile navigation works
- Check font sizes are readable without zoom

**Gate Enforcement:**
- Orchestrator blocks progression if mobile optimization fails
- Builder must fix mobile issues before Content phase
- Cannot skip mobile optimization checks

### Security
- [ ] HTTPS enabled
- [ ] No mixed content
- [ ] Security headers configured

---

## AI/LLM Optimization Requirements (2026 MANDATORY)

### Content Structure for AI Indexing

**Question-Answer Format (REQUIRED):**
- Use H2 headings for questions (e.g., "How do I...?", "What is...?")
- Use H3 or paragraphs for direct answers
- Apply to FAQ sections, tutorials, and problem-solving content
- Use FAQPage schema for FAQ sections
- Use HowTo schema for step-by-step guides

**Content Freshness (REQUIRED):**
- Every page must have `datePublished` in frontmatter
- Every page must have `dateModified` in frontmatter
- Update `dateModified` when content changes
- Mark evergreen content explicitly
- Review content older than 6 months for freshness

**Author Attribution (REQUIRED for E-E-A-T):**
- All blog posts must have author with Person schema
- Author must include credentials (for YMYL topics)
- Author bio must be linked from content
- Person schema must include jobTitle, description, sameAs

### Structured Data for AI/LLM

**Required Schemas:**
- [ ] FAQPage schema (for FAQ sections)
- [ ] HowTo schema (for tutorials/guides)
- [ ] Article schema with dateModified (for blog posts)
- [ ] Person schema (for authors)
- [ ] Review/AggregateRating schema (if applicable)

**GEO Schema (for Local SEO sites):**
- [ ] Place schema on location pages
- [ ] GeoCircle for service areas
- [ ] Enhanced LocalBusiness with areaServed
- [ ] GeoCoordinates with lat/lng

### Technical Requirements

**llms.txt File (REQUIRED):**
- [ ] Create `/public/llms.txt` file
- [ ] List main content pages
- [ ] Include sitemap reference
- [ ] Document content structure

**Bing/IndexNow (RECOMMENDED):**
- [ ] Bing Webmaster Tools configured
- [ ] sitemap.xml submitted to Bing
- [ ] IndexNow endpoint configured (optional)

**Server-Side Rendering:**
- [ ] All critical content server-rendered (not client-only)
- [ ] Content visible without JavaScript
- [ ] Semantic HTML structure

---

## GEO Schema Requirements (Local SEO Sites)

### LocalBusiness Schema

**Required Fields:**
- name
- description
- url
- telephone
- address (PostalAddress)
- geo (GeoCoordinates with lat/lng)

**Optional but Recommended:**
- image
- openingHours
- priceRange
- areaServed (GeoCircle or City list)

### Place Schema (Location Pages)

**Required Fields:**
- name
- description
- address (PostalAddress)
- geo (GeoCoordinates)

**Service Area (GeoCircle):**
- geoMidpoint (GeoCoordinates)
- geoRadius (Distance with value and unitCode)

### Example: Enhanced LocalBusiness with Service Area

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Example Plumbing",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Austin",
    "addressRegion": "TX",
    "postalCode": "78701"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 30.2672,
    "longitude": -97.7431
  },
  "areaServed": [
    {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 30.2672,
        "longitude": -97.7431
      },
      "geoRadius": {
        "@type": "Distance",
        "value": 25,
        "unitCode": "SMI"
      }
    },
    {
      "@type": "City",
      "name": "Austin"
    },
    {
      "@type": "City",
      "name": "Round Rock"
    }
  ]
}
```
