---
name: redirects
description: Maps old URLs to new URLs for site rebuilds. Use when rebuilding an existing site to preserve SEO equity. Optional — only for rebuilds.
owner: Architect Agent (defines), Builder Agent (implements)
trigger: Site Kickoff identifies this as a rebuild
llm: Claude Opus (Architect), Cursor Auto (Builder)
---

# Redirects Skill

## Purpose

Preserve SEO equity when rebuilding sites with URL changes. Ensures old URLs properly redirect to new URLs, maintaining search rankings and preventing 404 errors.

---

## Trigger

When Site Kickoff identifies the project as a **rebuild** of an existing site.

---

## When to Use

| Scenario | Use Redirects? |
|----------|----------------|
| New site (no existing URLs) | No |
| Rebuild with same URLs | No |
| Rebuild with URL changes | **Yes** |
| Domain migration | **Yes** |
| Site restructure | **Yes** |

---

## Redirect Types

| Type | Code | Use Case |
|------|------|----------|
| Permanent | 301 | Default — URL has permanently moved |
| Temporary | 302 | Rare — URL will return to original |

**Default:** Always use 301 unless there's a specific reason for 302.

---

## Workflow

### Step 1: Architect Collects Old URLs

**Methods to gather old URLs:**

1. **Sitemap:** Download existing sitemap.xml
2. **Crawl:** Use Screaming Frog or similar
3. **Search Console:** Export indexed URLs
4. **Analytics:** Export pages with traffic

**old-urls.json:**

```json
{
  "collectedAt": "2026-01-16T00:00:00Z",
  "source": "sitemap + search console",
  "urls": [
    "/services/plumbing/",
    "/services/plumbing/emergency/",
    "/services/plumbing/drain-cleaning/",
    "/about-us/",
    "/contact-us/",
    "/blog/how-to-fix-leaky-faucet/",
    "/locations/austin/",
    "/locations/round-rock/"
  ]
}
```

### Step 2: Map Old URLs to New URLs

**Architect creates mapping:**

```json
{
  "mappedAt": "2026-01-16T00:00:00Z",
  "mappedBy": "Architect Agent",
  "redirects": [
    {
      "from": "/services/plumbing/",
      "to": "/plumbing-services/",
      "type": 301,
      "reason": "Simplified URL structure"
    },
    {
      "from": "/services/plumbing/emergency/",
      "to": "/plumbing-services/emergency-plumber/",
      "type": 301,
      "reason": "Added keyword to URL"
    },
    {
      "from": "/about-us/",
      "to": "/about/",
      "type": 301,
      "reason": "Shortened URL"
    },
    {
      "from": "/contact-us/",
      "to": "/contact/",
      "type": 301,
      "reason": "Shortened URL"
    },
    {
      "from": "/blog/how-to-fix-leaky-faucet/",
      "to": "/blog/fix-leaky-faucet-guide/",
      "type": 301,
      "reason": "Improved keyword targeting"
    },
    {
      "from": "/locations/austin/",
      "to": "/plumbing/austin-tx/",
      "type": 301,
      "reason": "New location page structure"
    }
  ],
  "wildcards": [
    {
      "pattern": "/locations/:city/",
      "to": "/plumbing/:city-tx/",
      "type": 301,
      "reason": "Bulk location redirect"
    }
  ]
}
```

### Step 3: Generate Redirect Rules

**Option A: Vercel Config (vercel.json)**

```json
{
  "redirects": [
    {
      "source": "/services/plumbing/",
      "destination": "/plumbing-services/",
      "permanent": true
    },
    {
      "source": "/services/plumbing/emergency/",
      "destination": "/plumbing-services/emergency-plumber/",
      "permanent": true
    },
    {
      "source": "/about-us/",
      "destination": "/about/",
      "permanent": true
    },
    {
      "source": "/contact-us/",
      "destination": "/contact/",
      "permanent": true
    },
    {
      "source": "/blog/how-to-fix-leaky-faucet/",
      "destination": "/blog/fix-leaky-faucet-guide/",
      "permanent": true
    },
    {
      "source": "/locations/:city/",
      "destination": "/plumbing/:city-tx/",
      "permanent": true
    }
  ]
}
```

**Option B: Astro Middleware**

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import redirects from './redirects.json';

export const onRequest = defineMiddleware(async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Check exact matches
  const exactMatch = redirects.find(r => r.from === path);
  if (exactMatch) {
    return redirect(exactMatch.to, exactMatch.type);
  }
  
  // Check pattern matches
  for (const rule of redirects.filter(r => r.pattern)) {
    const regex = new RegExp(
      rule.pattern.replace(/:(\w+)/g, '([^/]+)')
    );
    const match = path.match(regex);
    
    if (match) {
      let destination = rule.to;
      const params = rule.pattern.match(/:(\w+)/g) || [];
      
      params.forEach((param, index) => {
        destination = destination.replace(param, match[index + 1]);
      });
      
      return redirect(destination, rule.type);
    }
  }
  
  return next();
});
```

### Step 4: Implement Redirects

**Builder Agent implements:**

1. Add redirects to `vercel.json` or middleware
2. Test each redirect locally
3. Document implementation in `redirects-implemented.md`

### Step 5: Verify Redirects Work

**Verification script:**

```typescript
// scripts/verify-redirects.ts
import redirects from '../src/redirects.json';

async function verifyRedirects(baseUrl: string) {
  const results: {
    from: string;
    to: string;
    status: number;
    success: boolean;
    finalUrl: string;
  }[] = [];
  
  for (const redirect of redirects) {
    try {
      const response = await fetch(`${baseUrl}${redirect.from}`, {
        redirect: 'manual'
      });
      
      const location = response.headers.get('location');
      const status = response.status;
      
      results.push({
        from: redirect.from,
        to: redirect.to,
        status,
        success: status === redirect.type && location?.endsWith(redirect.to),
        finalUrl: location || ''
      });
    } catch (error) {
      results.push({
        from: redirect.from,
        to: redirect.to,
        status: 0,
        success: false,
        finalUrl: `Error: ${error.message}`
      });
    }
  }
  
  return results;
}

// Run verification
const results = await verifyRedirects('https://preview.example.com');
const failed = results.filter(r => !r.success);

if (failed.length > 0) {
  console.error('Failed redirects:', failed);
  process.exit(1);
}

console.log('All redirects verified successfully');
```

---

## Common Patterns

### Trailing Slash Normalization

```json
{
  "source": "/(.*[^/])$",
  "destination": "/$1/",
  "permanent": true
}
```

### WWW to Non-WWW

```json
{
  "source": "/:path*",
  "has": [{ "type": "host", "value": "www.example.com" }],
  "destination": "https://example.com/:path*",
  "permanent": true
}
```

### HTTP to HTTPS

Usually handled by Vercel automatically, but can be explicit:

```json
{
  "source": "/:path*",
  "has": [{ "type": "header", "key": "x-forwarded-proto", "value": "http" }],
  "destination": "https://example.com/:path*",
  "permanent": true
}
```

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `old-urls.json` | Collected URLs from old site |
| `redirects.json` | Complete redirect mapping |
| `vercel.json` or middleware | Implemented redirects |
| Verification results | All redirects tested |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Rebuild without redirect mapping | **FLAG** — Review required |
| Redirect verification fails | **STOP** — Fix before deploy |
| Missing high-traffic URLs | **FLAG** — Review with Architect |

---

## SEO Considerations

### Redirect Chains
Avoid chains (A → B → C). Always redirect directly to final URL.

### Soft 404s
Ensure redirects go to relevant content, not generic pages.

### Internal Links
Update internal links to use new URLs directly (don't rely on redirects).

### Search Console
After launch:
1. Submit new sitemap
2. Use URL Inspection tool
3. Monitor for crawl errors

---

## Success Criteria

Redirects Skill is complete when:

- [ ] All old URLs collected
- [ ] Mapping created and reviewed
- [ ] Redirects implemented
- [ ] All redirects verified working
- [ ] No redirect chains
- [ ] Documentation complete
