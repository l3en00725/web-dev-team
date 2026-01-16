---
name: local-seo-location-builder
description: Mechanical generation of city/state/location pages for local SEO sites. Use when Site Kickoff identifies Local SEO or Multi-State distribution mode. Enforces slug patterns and internal linking rules.
owner: Builder Agent (executes), Architect Agent (defines locations)
trigger: When distribution strategy includes Local SEO or Multi-State
llm: Cursor Auto (Builder), Claude Opus (Architect)
---

# Local SEO Location Builder Skill

## Purpose

Generate location-based pages at scale with consistent structure and linking. Ensures every target location has a properly optimized page without manual creation.

---

## Trigger

When Site Kickoff identifies:
- Distribution Strategy: **Local SEO**
- Distribution Strategy: **Multi-State / National**

---

## Prerequisites

From Architect Agent:
- [ ] List of target cities/towns/states
- [ ] Slug pattern defined
- [ ] Internal linking rules specified
- [ ] Content schema for location pages

---

## Workflow

### Step 1: Receive Location List from Architect

**Input Format: locations-config.json**

```json
{
  "strategy": "local-seo",
  "service": "plumbing",
  "slugPattern": "/[service]/[city]-[state]/",
  "locations": [
    {
      "city": "Austin",
      "state": "TX",
      "stateFullName": "Texas",
      "primary": true,
      "nearbyLocations": ["Round Rock", "Cedar Park", "Pflugerville"]
    },
    {
      "city": "Round Rock",
      "state": "TX",
      "stateFullName": "Texas",
      "primary": false,
      "nearbyLocations": ["Austin", "Cedar Park", "Georgetown"]
    }
  ],
  "internalLinking": {
    "strategy": "nearby-cities",
    "maxLinks": 5,
    "includeStateHub": true
  }
}
```

### Step 2: Generate Location Pages

For each location in the list:

```astro
---
// src/pages/[service]/[location].astro
import { getCollection } from 'astro:content';
import LocationLayout from '@/layouts/LocationLayout.astro';
import { generateLocationSchema } from '@/utils/schema';

export async function getStaticPaths() {
  const locations = await getCollection('locations');
  return locations.map(location => ({
    params: { 
      service: location.data.service,
      location: `${location.data.city.toLowerCase()}-${location.data.state.toLowerCase()}`
    },
    props: { location: location.data }
  }));
}

const { location } = Astro.props;
const schema = generateLocationSchema(location);
---

<LocationLayout 
  title={`${location.service} in ${location.city}, ${location.state}`}
  description={location.metaDescription}
  schema={schema}
>
  <h1>{location.service} in {location.city}, {location.stateFullName}</h1>
  
  <!-- Content sections from content schema -->
  <section class="services">
    <!-- Services offered in this location -->
  </section>
  
  <section class="service-area">
    <!-- Nearby locations with internal links -->
  </section>
  
  <section class="testimonials">
    <!-- Location-specific testimonials -->
  </section>
  
  <section class="faq">
    <!-- Location-specific FAQs -->
  </section>
</LocationLayout>
```

### Step 3: Apply Slug Pattern

**Supported Patterns:**

| Pattern | Example URL |
|---------|-------------|
| `/services/[city]-[state]/` | `/services/austin-tx/` |
| `/[service]/[city]-[state]/` | `/plumbing/austin-tx/` |
| `/locations/[state]/[city]/` | `/locations/texas/austin/` |
| `/[city]-[state]-[service]/` | `/austin-tx-plumbing/` |

**Implementation:**

```typescript
// src/utils/location-urls.ts
export function generateLocationSlug(
  pattern: string,
  location: Location,
  service: string
): string {
  return pattern
    .replace('[city]', location.city.toLowerCase().replace(/\s+/g, '-'))
    .replace('[state]', location.state.toLowerCase())
    .replace('[service]', service.toLowerCase().replace(/\s+/g, '-'));
}
```

### Step 4: Implement Internal Linking

**Linking Strategies:**

| Strategy | Description |
|----------|-------------|
| Nearby Cities | Link to geographically close locations |
| Same State | Link to other cities in same state |
| State Hub | Link to state-level page |
| Service Cross-Link | Link to other services in same city |

**Implementation:**

```astro
---
// Internal linking component
const { currentLocation, allLocations, maxLinks = 5 } = Astro.props;

const nearbyLinks = allLocations
  .filter(loc => 
    currentLocation.nearbyLocations.includes(loc.city) &&
    loc.state === currentLocation.state
  )
  .slice(0, maxLinks);
---

<nav class="nearby-locations" aria-label="Nearby service areas">
  <h3>We Also Serve</h3>
  <ul>
    {nearbyLinks.map(loc => (
      <li>
        <a href={generateLocationSlug(loc)}>
          {loc.service} in {loc.city}, {loc.state}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

### Step 5: Create Location Content Schema

**Content Collection Definition:**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const locations = defineCollection({
  type: 'data',
  schema: z.object({
    city: z.string(),
    state: z.string(),
    stateFullName: z.string(),
    service: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string().max(160),
    h1: z.string(),
    intro: z.string(),
    services: z.array(z.object({
      name: z.string(),
      description: z.string()
    })),
    testimonials: z.array(z.object({
      quote: z.string(),
      author: z.string(),
      location: z.string()
    })).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })),
    nearbyLocations: z.array(z.string()),
    primary: z.boolean().default(false)
  })
});

export const collections = { locations };
```

### Step 6: Generate locations.json Manifest

```json
{
  "generatedAt": "2026-01-16T00:00:00Z",
  "totalLocations": 25,
  "slugPattern": "/plumbing/[city]-[state]/",
  "locations": [
    {
      "city": "Austin",
      "state": "TX",
      "slug": "/plumbing/austin-tx/",
      "primary": true,
      "internalLinks": 5
    }
  ],
  "stateHubs": [
    {
      "state": "TX",
      "slug": "/plumbing/texas/",
      "citiesCount": 15
    }
  ]
}
```

---

## Hard Limits

- **No invented locations** — Only generate pages for locations in the approved list
- **No slug changes** — Once generated, slugs cannot be modified
- **One page per location** — No duplicate location pages
- **Consistent structure** — All location pages follow same template

---

## Required Outputs

| Output | Description |
|--------|-------------|
| Location pages | One page per location |
| Correct slugs | Matching defined pattern |
| Internal links | Implemented per rules |
| `locations.json` | Manifest of all locations |
| Content schema | For Content Agent to populate |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing location list | **STOP** — Architect must provide |
| Missing slug pattern | **STOP** — Architect must define |
| Duplicate locations | **STOP** — Resolve duplicates |
| Broken internal links | Fix before proceeding |

---

## SEO Requirements

Each location page must have:

- [ ] Unique meta title with city + state + service
- [ ] Unique meta description (< 160 chars)
- [ ] H1 with location name
- [ ] LocalBusiness schema
- [ ] Service schema
- [ ] BreadcrumbList schema
- [ ] Internal links to nearby locations
- [ ] FAQ schema (if FAQs present)

---

## Success Criteria

Local SEO Location Builder is complete when:

- [ ] All locations have pages
- [ ] Slugs match defined pattern
- [ ] Internal linking implemented
- [ ] `locations.json` generated
- [ ] Content schema ready for Content Agent
- [ ] No duplicate pages
- [ ] All pages build successfully
