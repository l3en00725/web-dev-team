# Keywords Everywhere API Playbook

## Overview

Keywords Everywhere API provides search volume, CPC, competition data, and related keywords for SEO research.

---

## API Details

| Property | Value |
|----------|-------|
| Base URL | `https://api.keywordseverywhere.com/v1/` |
| Auth | API Key (required) |
| Rate Limit | Based on credits |
| Cost | Credit-based (paid) |

---

## Environment Variable

```
KEYWORDS_API_KEY=your_keywords_everywhere_api_key
```

---

## Setup

### 1. Get API Key

1. Go to [Keywords Everywhere](https://keywordseverywhere.com)
2. Create account
3. Purchase credits
4. Get API key from Account → API

### 2. Understand Credits

- Each keyword lookup costs credits
- Bulk lookups are more efficient
- Cache results to minimize usage

---

## API Endpoints

### Get Keyword Data

```
POST https://api.keywordseverywhere.com/v1/get_keyword_data
```

Returns search volume, CPC, and competition for keywords.

### Get Related Keywords

```
POST https://api.keywordseverywhere.com/v1/get_related_keywords
```

Returns related keywords for a seed term.

---

## Implementation

### Get Keyword Data

```typescript
const KEYWORDS_API_KEY = import.meta.env.KEYWORDS_API_KEY;

interface KeywordData {
  keyword: string;
  vol: number;        // Monthly search volume
  cpc: {
    currency: string;
    value: string;
  };
  competition: number; // 0-1
  trend: number[];     // 12-month trend
}

interface KeywordDataResponse {
  data: KeywordData[];
  credits: number;
  time: number;
}

export async function getKeywordData(
  keywords: string[],
  options?: {
    country?: string;
    currency?: string;
  }
): Promise<KeywordDataResponse> {
  const { country = 'us', currency = 'USD' } = options || {};
  
  const response = await fetch(
    'https://api.keywordseverywhere.com/v1/get_keyword_data',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEYWORDS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        country,
        currency,
        dataSource: 'gkp', // Google Keyword Planner
        kw: keywords
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`Keywords API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Get Related Keywords

```typescript
interface RelatedKeyword {
  keyword: string;
  vol: number;
  cpc: {
    currency: string;
    value: string;
  };
  competition: number;
}

interface RelatedKeywordsResponse {
  data: RelatedKeyword[];
  credits: number;
}

export async function getRelatedKeywords(
  keyword: string,
  options?: {
    country?: string;
    limit?: number;
  }
): Promise<RelatedKeywordsResponse> {
  const { country = 'us', limit = 50 } = options || {};
  
  const response = await fetch(
    'https://api.keywordseverywhere.com/v1/get_related_keywords',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEYWORDS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        country,
        dataSource: 'gkp',
        kw: keyword,
        limit
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`Keywords API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Analyze Keywords for Strategy

```typescript
interface KeywordAnalysis {
  keyword: string;
  volume: number;
  competition: number;
  cpc: number;
  recommendation: 'priority' | 'consider' | 'avoid' | 'review';
  reason: string;
}

export function analyzeKeywords(data: KeywordData[]): KeywordAnalysis[] {
  return data.map(kw => {
    const volume = kw.vol;
    const competition = kw.competition;
    const cpc = parseFloat(kw.cpc.value);
    
    let recommendation: KeywordAnalysis['recommendation'];
    let reason: string;
    
    if (volume === 0) {
      recommendation = 'avoid';
      reason = 'Zero search volume';
    } else if (volume >= 1000 && competition < 0.3) {
      recommendation = 'priority';
      reason = 'High volume, low competition';
    } else if (volume >= 100 && competition < 0.5) {
      recommendation = 'priority';
      reason = 'Good volume, moderate competition';
    } else if (volume >= 1000 && competition >= 0.7) {
      recommendation = 'consider';
      reason = 'High volume but competitive';
    } else if (volume < 100 && volume > 0) {
      recommendation = 'review';
      reason = 'Low volume - verify intent';
    } else {
      recommendation = 'consider';
      reason = 'Moderate opportunity';
    }
    
    return {
      keyword: kw.keyword,
      volume,
      competition,
      cpc,
      recommendation,
      reason
    };
  });
}
```

---

## Response Structures

### Keyword Data Response

```json
{
  "data": [
    {
      "keyword": "plumber austin tx",
      "vol": 2400,
      "cpc": {
        "currency": "$",
        "value": "45.50"
      },
      "competition": 0.65,
      "trend": [2100, 2200, 2300, 2400, 2500, 2400, 2300, 2400, 2500, 2600, 2400, 2400]
    }
  ],
  "credits": 1,
  "time": 0.5
}
```

### Related Keywords Response

```json
{
  "data": [
    {
      "keyword": "emergency plumber austin",
      "vol": 880,
      "cpc": {
        "currency": "$",
        "value": "52.00"
      },
      "competition": 0.45
    }
  ],
  "credits": 1
}
```

---

## Caching Strategy

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

interface CachedKeyword {
  keyword: string;
  data: KeywordData;
  cached_at: string;
}

export async function getCachedOrFetch(
  keywords: string[],
  maxAge: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): Promise<KeywordData[]> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - maxAge);
  
  // Check cache
  const { data: cached } = await supabase
    .from('keyword_cache')
    .select('*')
    .in('keyword', keywords)
    .gte('cached_at', cutoff.toISOString());
  
  const cachedKeywords = new Map(
    (cached || []).map(c => [c.keyword, c.data])
  );
  
  // Find uncached keywords
  const uncached = keywords.filter(kw => !cachedKeywords.has(kw));
  
  // Fetch uncached
  if (uncached.length > 0) {
    const response = await getKeywordData(uncached);
    
    // Cache new results
    for (const kw of response.data) {
      await supabase.from('keyword_cache').upsert({
        keyword: kw.keyword,
        data: kw,
        cached_at: now.toISOString()
      });
      cachedKeywords.set(kw.keyword, kw);
    }
  }
  
  return keywords.map(kw => cachedKeywords.get(kw)!).filter(Boolean);
}
```

---

## Best Practices

1. **Batch requests** — Send multiple keywords in one call
2. **Cache aggressively** — Keyword data doesn't change daily
3. **Monitor credits** — Track usage to avoid running out
4. **Prioritize** — Focus on high-intent, low-competition keywords
5. **Local modifiers** — For local SEO, always include location
