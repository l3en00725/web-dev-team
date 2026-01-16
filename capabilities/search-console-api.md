# Google Search Console API Playbook

## Overview

Google Search Console API provides access to search performance data and sitemap management for verified properties.

---

## API Details

| Property | Value |
|----------|-------|
| Base URL | `https://www.googleapis.com/webmasters/v3/` |
| Auth | OAuth 2.0 |
| Rate Limit | Varies by endpoint |
| Cost | Free |

---

## Environment Variable

```
GOOGLE_SEARCH_CONSOLE_API_KEY=your_service_account_key_json
```

---

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Search Console API"

### 2. Create Service Account

1. Go to APIs & Services → Credentials
2. Create Credentials → Service Account
3. Download JSON key file
4. Store as environment variable or secure file

### 3. Add Service Account to Search Console

1. Go to [Search Console](https://search.google.com/search-console)
2. Select property
3. Settings → Users and permissions
4. Add user → Enter service account email
5. Grant "Full" permission

---

## API Endpoints

### List Sites

```
GET https://www.googleapis.com/webmasters/v3/sites
```

### Submit Sitemap

```
PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}
```

### List Sitemaps

```
GET https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps
```

### Search Analytics

```
POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
```

---

## Implementation

### Authentication

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(import.meta.env.GOOGLE_SEARCH_CONSOLE_API_KEY),
  scopes: ['https://www.googleapis.com/auth/webmasters']
});

const searchconsole = google.searchconsole({ version: 'v1', auth });
```

### Submit Sitemap

```typescript
export async function submitSitemap(
  siteUrl: string,
  sitemapUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // URL encode the site URL
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
    
    await searchconsole.sitemaps.submit({
      siteUrl: encodedSiteUrl,
      feedpath: encodedSitemapUrl
    });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

### List Sitemaps

```typescript
interface SitemapInfo {
  path: string;
  lastSubmitted: string;
  isPending: boolean;
  isSitemapsIndex: boolean;
  lastDownloaded?: string;
  warnings?: number;
  errors?: number;
}

export async function listSitemaps(
  siteUrl: string
): Promise<SitemapInfo[]> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  
  const response = await searchconsole.sitemaps.list({
    siteUrl: encodedSiteUrl
  });
  
  return (response.data.sitemap || []).map(sitemap => ({
    path: sitemap.path || '',
    lastSubmitted: sitemap.lastSubmitted || '',
    isPending: sitemap.isPending || false,
    isSitemapsIndex: sitemap.isSitemapsIndex || false,
    lastDownloaded: sitemap.lastDownloaded,
    warnings: sitemap.warnings,
    errors: sitemap.errors
  }));
}
```

### Get Search Analytics

```typescript
interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows: SearchAnalyticsRow[];
  responseAggregationType: string;
}

export async function getSearchAnalytics(
  siteUrl: string,
  options: {
    startDate: string;
    endDate: string;
    dimensions?: ('date' | 'query' | 'page' | 'country' | 'device')[];
    rowLimit?: number;
  }
): Promise<SearchAnalyticsResponse> {
  const {
    startDate,
    endDate,
    dimensions = ['query'],
    rowLimit = 1000
  } = options;
  
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  
  const response = await searchconsole.searchanalytics.query({
    siteUrl: encodedSiteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit
    }
  });
  
  return {
    rows: response.data.rows || [],
    responseAggregationType: response.data.responseAggregationType || ''
  };
}
```

### Request URL Inspection

```typescript
export async function inspectUrl(
  siteUrl: string,
  inspectionUrl: string
): Promise<{
  indexStatusResult?: {
    verdict: string;
    coverageState: string;
    robotsTxtState: string;
    indexingState: string;
    lastCrawlTime?: string;
  };
}> {
  const response = await searchconsole.urlInspection.index.inspect({
    requestBody: {
      siteUrl,
      inspectionUrl
    }
  });
  
  return {
    indexStatusResult: response.data.inspectionResult?.indexStatusResult
  };
}
```

---

## Common Use Cases

### Auto-Submit Sitemap on Deploy

```typescript
// In deploy script or webhook
export async function onDeploy(siteUrl: string) {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  
  const result = await submitSitemap(siteUrl, sitemapUrl);
  
  if (result.success) {
    console.log('Sitemap submitted successfully');
  } else {
    console.error('Sitemap submission failed:', result.error);
  }
}
```

### Get Top Queries

```typescript
export async function getTopQueries(
  siteUrl: string,
  days: number = 28
): Promise<{ query: string; clicks: number; impressions: number; ctr: number; position: number }[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  
  const data = await getSearchAnalytics(siteUrl, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 100
  });
  
  return data.rows.map(row => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  }));
}
```

### Monitor Indexing Status

```typescript
export async function checkIndexingStatus(
  siteUrl: string,
  urls: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const url of urls) {
    try {
      const inspection = await inspectUrl(siteUrl, url);
      results.set(url, inspection.indexStatusResult?.verdict || 'UNKNOWN');
    } catch (error) {
      results.set(url, 'ERROR');
    }
    
    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
```

---

## Response Structures

### Search Analytics Response

```json
{
  "rows": [
    {
      "keys": ["plumber austin tx"],
      "clicks": 150,
      "impressions": 2500,
      "ctr": 0.06,
      "position": 4.2
    }
  ],
  "responseAggregationType": "byPage"
}
```

### URL Inspection Response

```json
{
  "inspectionResult": {
    "inspectionResultLink": "https://search.google.com/search-console/...",
    "indexStatusResult": {
      "verdict": "PASS",
      "coverageState": "Submitted and indexed",
      "robotsTxtState": "ALLOWED",
      "indexingState": "INDEXING_ALLOWED",
      "lastCrawlTime": "2026-01-15T10:30:00Z"
    }
  }
}
```

---

## Best Practices

1. **Verify property first** — API only works for verified sites
2. **Use service account** — More reliable than user OAuth
3. **Handle rate limits** — Add delays between requests
4. **Monitor errors** — Check sitemap errors regularly
5. **Request reindexing sparingly** — Don't abuse URL inspection
