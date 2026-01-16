---
name: pagespeed-pre-commit
description: Runs PageSpeed Insights before deployment, checks internal links, flags index bloat, and fails build if thresholds are not met. Use as final quality gate before Admin Agent approval.
owner: Admin/QA Agent
trigger: Before deployment — required for all sites
llm: Claude
---

# PageSpeed/Pre-Commit Skill

## Purpose

Prevent slow or broken sites from shipping. This skill is the final quality gate that ensures performance thresholds are met before deployment.

---

## Trigger

Before deployment — this skill is **required for all sites**.

---

## Prerequisites

- [ ] Site built and deployed to preview URL
- [ ] All pages rendering correctly
- [ ] Content populated

---

## Performance Thresholds

### Required Scores

| Metric | Minimum Score |
|--------|---------------|
| Performance (Mobile) | 95 |
| Performance (Desktop) | 95 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

### Core Web Vitals

| Metric | Threshold |
|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

---

## Workflow

### Step 1: Build Site to Preview

```bash
# Build locally
npm run build

# Or deploy to Vercel preview
vercel --prod=false
```

### Step 2: Run PageSpeed Insights API

```typescript
// src/utils/pagespeed.ts
const PAGESPEED_API_KEY = import.meta.env.PAGESPEED_API_KEY;

interface PageSpeedResult {
  url: string;
  scores: {
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
  passed: boolean;
}

export async function runPageSpeedTest(
  url: string, 
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedResult> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${PAGESPEED_API_KEY}`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  const categories = data.lighthouseResult.categories;
  const audits = data.lighthouseResult.audits;
  
  const scores = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100)
  };
  
  const coreWebVitals = {
    lcp: audits['largest-contentful-paint'].numericValue / 1000,
    fid: audits['max-potential-fid']?.numericValue || 0,
    cls: audits['cumulative-layout-shift'].numericValue
  };
  
  const passed = 
    scores.performance >= 95 &&
    scores.accessibility >= 90 &&
    scores.bestPractices >= 90 &&
    scores.seo >= 90 &&
    coreWebVitals.lcp < 2.5 &&
    coreWebVitals.cls < 0.1;
  
  return { url, scores, coreWebVitals, passed };
}
```

### Step 3: Test Key Pages

```typescript
export async function runFullPageSpeedAudit(
  baseUrl: string,
  pages: string[]
): Promise<{
  results: PageSpeedResult[];
  allPassed: boolean;
  report: object;
}> {
  const results: PageSpeedResult[] = [];
  
  for (const page of pages) {
    const url = `${baseUrl}${page}`;
    
    // Test both mobile and desktop
    const mobileResult = await runPageSpeedTest(url, 'mobile');
    const desktopResult = await runPageSpeedTest(url, 'desktop');
    
    results.push({
      ...mobileResult,
      url: `${url} (mobile)`
    });
    results.push({
      ...desktopResult,
      url: `${url} (desktop)`
    });
    
    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const allPassed = results.every(r => r.passed);
  
  return {
    results,
    allPassed,
    report: generateReport(results)
  };
}
```

### Step 4: Check Internal Links

```typescript
// src/utils/link-checker.ts
export async function checkInternalLinks(
  baseUrl: string,
  pages: string[]
): Promise<{
  valid: string[];
  broken: string[];
  report: object;
}> {
  const valid: string[] = [];
  const broken: string[] = [];
  const checked = new Set<string>();
  
  for (const page of pages) {
    const url = `${baseUrl}${page}`;
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract internal links
      const links = html.match(/href="(\/[^"]+)"/g) || [];
      
      for (const link of links) {
        const href = link.match(/href="([^"]+)"/)?.[1];
        if (!href || checked.has(href)) continue;
        
        checked.add(href);
        
        const linkUrl = `${baseUrl}${href}`;
        const linkResponse = await fetch(linkUrl, { method: 'HEAD' });
        
        if (linkResponse.ok) {
          valid.push(href);
        } else {
          broken.push(`${href} (${linkResponse.status})`);
        }
      }
    } catch (error) {
      broken.push(`${page} (fetch error)`);
    }
  }
  
  return {
    valid,
    broken,
    report: {
      totalChecked: checked.size,
      validCount: valid.length,
      brokenCount: broken.length,
      brokenLinks: broken
    }
  };
}
```

### Step 5: Flag Thin Pages (Index Bloat)

```typescript
// src/utils/thin-page-detector.ts
export async function detectThinPages(
  baseUrl: string,
  pages: string[],
  minWordCount: number = 300
): Promise<{
  adequate: string[];
  thin: string[];
  report: object;
}> {
  const adequate: string[] = [];
  const thin: string[] = [];
  
  for (const page of pages) {
    const url = `${baseUrl}${page}`;
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Strip HTML tags and count words
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const wordCount = text.split(' ').length;
      
      if (wordCount >= minWordCount) {
        adequate.push(page);
      } else {
        thin.push(`${page} (${wordCount} words)`);
      }
    } catch (error) {
      thin.push(`${page} (error)`);
    }
  }
  
  return {
    adequate,
    thin,
    report: {
      totalPages: pages.length,
      adequateCount: adequate.length,
      thinCount: thin.length,
      thinPages: thin,
      threshold: minWordCount
    }
  };
}
```

### Step 6: Generate Reports

**pagespeed-report.json:**

```json
{
  "generatedAt": "2026-01-16T00:00:00Z",
  "baseUrl": "https://preview.example.com",
  "passed": true,
  "summary": {
    "totalPages": 10,
    "passedPages": 10,
    "failedPages": 0
  },
  "results": [
    {
      "url": "/ (mobile)",
      "scores": {
        "performance": 98,
        "accessibility": 95,
        "bestPractices": 100,
        "seo": 100
      },
      "coreWebVitals": {
        "lcp": 1.2,
        "fid": 45,
        "cls": 0.02
      },
      "passed": true
    }
  ]
}
```

**link-check-report.json:**

```json
{
  "generatedAt": "2026-01-16T00:00:00Z",
  "baseUrl": "https://preview.example.com",
  "passed": true,
  "summary": {
    "totalChecked": 45,
    "valid": 45,
    "broken": 0
  },
  "brokenLinks": []
}
```

---

## Hard Limits

- **No deploy if Performance < 95** (mobile or desktop)
- **No deploy if broken internal links exist**
- **No exceptions without documented override**

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `pagespeed-report.json` | Full performance audit |
| `link-check-report.json` | Internal link validation |
| Scores in admin dashboard | Visible to site owner |
| Pass/fail status | Clear deployment gate |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Performance < 95 | **STOP** — Cannot deploy |
| Broken internal links | **STOP** — Cannot deploy |
| API error | Retry or manual check |
| Thin pages detected | **FLAG** — Review required |

---

## Troubleshooting

### Low Performance Score

Common causes and fixes:

| Issue | Fix |
|-------|-----|
| Large images | Optimize with Astro Image |
| Render-blocking CSS | Inline critical CSS |
| Unused JavaScript | Remove or lazy load |
| No caching headers | Configure in Vercel |
| Large fonts | Subset fonts, use display: swap |

### High CLS

| Issue | Fix |
|-------|-----|
| Images without dimensions | Add width/height |
| Dynamic content injection | Reserve space |
| Web fonts causing shift | Use font-display: swap |

### Slow LCP

| Issue | Fix |
|-------|-----|
| Large hero image | Optimize, use srcset |
| Slow server response | Check hosting |
| Render-blocking resources | Defer non-critical |

---

## Success Criteria

PageSpeed/Pre-Commit Skill is complete when:

- [ ] All key pages tested (mobile + desktop)
- [ ] Performance ≥ 95 on all pages
- [ ] Accessibility ≥ 90 on all pages
- [ ] Best Practices ≥ 90 on all pages
- [ ] SEO ≥ 90 on all pages
- [ ] Core Web Vitals passing
- [ ] No broken internal links
- [ ] Thin pages reviewed (if any)
- [ ] Reports generated
- [ ] Admin Agent can proceed with approval
