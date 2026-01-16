---
name: keywords-api
description: Integrates Keywords Everywhere API to validate page strategy and optimize content. Use when (1) Architect Agent validates keyword viability before committing to pages, or (2) Content Agent needs related keywords for copy optimization.
owner: Architect Agent (strategy), Content Agent (optimization)
trigger: During strategy validation and content creation
llm: Claude Opus (Architect), Claude (Content)
---

# Keywords API Skill

## Purpose

Fetch search volume, competition, and related keywords to inform page strategy and optimize content. Prevents building pages for keywords no one searches for.

---

## Owners

| Agent | Usage |
|-------|-------|
| Architect Agent | Strategy validation — before committing to pages |
| Content Agent | Copy optimization — during content creation |

---

## Required Environment Variable

```
KEYWORDS_API_KEY=your_keywords_everywhere_api_key
```

---

## API Reference

**Base URL:** `https://api.keywordseverywhere.com/v1/`

**Endpoints:**
- `get_keyword_data` — Volume, CPC, competition for keywords
- `get_related_keywords` — Related keywords for a seed term

---

## Workflow: Architect Agent Usage

### Purpose
Validate keyword viability before committing to page structure.

### Process

1. **Input seed keywords** from site strategy
2. **Call API** for search volume + competition
3. **Flag keywords** with zero/low volume
4. **Prioritize** low-competition, high-intent queries
5. **Inform** page structure decisions

### API Call Example

```typescript
// src/utils/keywords-api.ts
const KEYWORDS_API_KEY = import.meta.env.KEYWORDS_API_KEY;

interface KeywordData {
  keyword: string;
  vol: number;
  cpc: number;
  competition: number;
}

export async function getKeywordData(keywords: string[]): Promise<KeywordData[]> {
  const response = await fetch('https://api.keywordseverywhere.com/v1/get_keyword_data', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEYWORDS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      country: 'us',
      currency: 'USD',
      dataSource: 'gkp',
      kw: keywords
    })
  });
  
  const data = await response.json();
  return data.data;
}
```

### Decision Matrix

| Volume | Competition | Action |
|--------|-------------|--------|
| High (>1000) | Low (<0.3) | **Priority** — Build page |
| High (>1000) | High (>0.7) | Consider — May be difficult |
| Medium (100-1000) | Low (<0.3) | **Good target** — Build page |
| Low (<100) | Any | Flag — Review necessity |
| Zero | Any | **Do not build** — No search demand |

### Output: keyword-data.json

```json
{
  "analyzedAt": "2026-01-16T00:00:00Z",
  "keywords": [
    {
      "keyword": "plumber austin tx",
      "volume": 2400,
      "cpc": 45.50,
      "competition": 0.65,
      "recommendation": "priority",
      "notes": "High volume, moderate competition"
    },
    {
      "keyword": "emergency plumber austin",
      "volume": 880,
      "cpc": 52.00,
      "competition": 0.45,
      "recommendation": "priority",
      "notes": "Good volume, lower competition, high intent"
    }
  ],
  "flagged": [
    {
      "keyword": "plumber 78701",
      "volume": 0,
      "reason": "Zero search volume"
    }
  ]
}
```

---

## Workflow: Content Agent Usage

### Purpose
Optimize copy with related keywords for better SEO coverage.

### Process

1. **Input target keyword** for page
2. **Call API** for related keywords
3. **Use in headings**, meta, body copy
4. **Natural integration** — not keyword stuffing

### API Call Example

```typescript
export async function getRelatedKeywords(keyword: string): Promise<string[]> {
  const response = await fetch('https://api.keywordseverywhere.com/v1/get_related_keywords', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEYWORDS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      country: 'us',
      currency: 'USD',
      dataSource: 'gkp',
      kw: keyword
    })
  });
  
  const data = await response.json();
  return data.data.map((item: any) => item.keyword);
}
```

### Content Integration Guidelines

**Primary Keyword Placement:**
- H1 (required)
- Meta title (required)
- Meta description (required)
- First paragraph (required)
- URL slug (required)

**Related Keywords Placement:**
- H2 headings (natural fit)
- Body paragraphs (sprinkled naturally)
- Image alt text (where relevant)
- FAQ questions (if applicable)

### Bing Optimization Note

Bing favors exact-match keywords more than Google. Ensure:
- Primary keyword appears exactly as searched
- Location + service combinations for local SEO
- Don't over-optimize (still needs to read naturally)

---

## Rate Limiting

Keywords Everywhere has usage limits. Best practices:

1. **Batch requests** — Send multiple keywords in one call
2. **Cache results** — Store in `keyword-data.json`
3. **Reuse data** — Don't re-fetch for same keywords
4. **Monitor usage** — Track API credits

---

## Required Outputs

| Output | Owner | Description |
|--------|-------|-------------|
| `keyword-data.json` | Architect | Volume/competition analysis |
| Optimized content | Content | Copy using related keywords |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing API key | **STOP** — Configure env var |
| Zero volume on primary keywords | **FLAG** — Review with Architect |
| API rate limit exceeded | Cache and wait |
| API error | Retry or manual research |

---

## Integration with Other Skills

| Skill | Integration |
|-------|-------------|
| Site Kickoff | Identifies target keyword themes |
| Local SEO Location Builder | Validates location keywords |
| Schema/SEO Metadata | Informs meta optimization |
| Admin Dashboard | Displays keyword data |

---

## Success Criteria

Keywords API Skill is complete when:

- [ ] API key configured
- [ ] Keyword data fetched for all target terms
- [ ] Zero-volume keywords flagged
- [ ] `keyword-data.json` generated
- [ ] Content optimized with related keywords
- [ ] Bing exact-match strategy applied
