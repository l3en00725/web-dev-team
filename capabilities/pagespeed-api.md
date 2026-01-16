# PageSpeed Insights API Playbook

## Overview

Google PageSpeed Insights API provides performance metrics, Core Web Vitals, and optimization recommendations for web pages.

---

## API Details

| Property | Value |
|----------|-------|
| Base URL | `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` |
| Auth | API Key (optional but recommended) |
| Rate Limit | 400 queries/100 seconds (with key) |
| Cost | Free |

---

## Environment Variable

```
PAGESPEED_API_KEY=your_google_cloud_api_key
```

**Note:** API works without a key but with stricter rate limits.

---

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "PageSpeed Insights API"

### 2. Create API Key

1. Go to APIs & Services → Credentials
2. Create Credentials → API Key
3. Restrict key to PageSpeed Insights API (recommended)

---

## API Endpoints

### Run PageSpeed Test

```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `url` | Yes | URL to analyze |
| `strategy` | No | `mobile` or `desktop` (default: mobile) |
| `category` | No | Categories to include (can repeat) |
| `key` | No | API key |

**Categories:**
- `performance`
- `accessibility`
- `best-practices`
- `seo`
- `pwa`

---

## Implementation

### Basic Request

```typescript
const PAGESPEED_API_KEY = import.meta.env.PAGESPEED_API_KEY;

interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: {
      'largest-contentful-paint': { numericValue: number };
      'cumulative-layout-shift': { numericValue: number };
      'max-potential-fid': { numericValue: number };
      'total-blocking-time': { numericValue: number };
      'speed-index': { numericValue: number };
    };
  };
}

export async function runPageSpeedTest(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedResponse> {
  const params = new URLSearchParams({
    url,
    strategy,
    category: 'performance',
    category: 'accessibility',
    category: 'best-practices',
    category: 'seo',
    ...(PAGESPEED_API_KEY && { key: PAGESPEED_API_KEY })
  });
  
  const response = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`PageSpeed API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Parse Results

```typescript
interface ParsedResults {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number;
    cls: number;
    fid: number;
    tbt: number;
  };
  passed: boolean;
}

export function parseResults(response: PageSpeedResponse): ParsedResults {
  const { categories, audits } = response.lighthouseResult;
  
  const scores = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100)
  };
  
  const coreWebVitals = {
    lcp: audits['largest-contentful-paint'].numericValue / 1000,
    cls: audits['cumulative-layout-shift'].numericValue,
    fid: audits['max-potential-fid']?.numericValue || 0,
    tbt: audits['total-blocking-time'].numericValue
  };
  
  const passed = 
    scores.performance >= 95 &&
    scores.accessibility >= 90 &&
    scores.bestPractices >= 90 &&
    scores.seo >= 90;
  
  return { scores, coreWebVitals, passed };
}
```

### Batch Testing

```typescript
export async function testMultiplePages(
  baseUrl: string,
  paths: string[]
): Promise<Map<string, ParsedResults>> {
  const results = new Map<string, ParsedResults>();
  
  for (const path of paths) {
    const url = `${baseUrl}${path}`;
    
    // Test mobile
    const mobileResponse = await runPageSpeedTest(url, 'mobile');
    results.set(`${path} (mobile)`, parseResults(mobileResponse));
    
    // Test desktop
    const desktopResponse = await runPageSpeedTest(url, 'desktop');
    results.set(`${path} (desktop)`, parseResults(desktopResponse));
    
    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return results;
}
```

---

## Response Structure

```json
{
  "lighthouseResult": {
    "requestedUrl": "https://example.com",
    "finalUrl": "https://example.com/",
    "categories": {
      "performance": {
        "id": "performance",
        "title": "Performance",
        "score": 0.95
      },
      "accessibility": {
        "id": "accessibility",
        "title": "Accessibility",
        "score": 0.92
      }
    },
    "audits": {
      "largest-contentful-paint": {
        "id": "largest-contentful-paint",
        "title": "Largest Contentful Paint",
        "numericValue": 1234.56,
        "displayValue": "1.2 s"
      }
    }
  }
}
```

---

## Thresholds

### Required Scores

| Metric | Minimum |
|--------|---------|
| Performance | 95 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4s | > 4s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

---

## Error Handling

```typescript
export async function safePageSpeedTest(url: string) {
  try {
    const response = await runPageSpeedTest(url);
    return { success: true, data: parseResults(response) };
  } catch (error) {
    if (error.message.includes('429')) {
      // Rate limited - wait and retry
      await new Promise(resolve => setTimeout(resolve, 60000));
      return safePageSpeedTest(url);
    }
    
    return { 
      success: false, 
      error: error.message,
      data: null 
    };
  }
}
```

---

## Best Practices

1. **Cache results** — Don't re-test unchanged pages
2. **Test preview URLs** — Not production during development
3. **Batch with delays** — Respect rate limits
4. **Test key pages** — Homepage, top landing pages
5. **Both strategies** — Always test mobile AND desktop
