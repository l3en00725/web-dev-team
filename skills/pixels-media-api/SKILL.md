---
name: pixels-media-api
description: Fetches stock images from Pexels or Unsplash APIs when Gemini-generated imagery is not needed. Optional per site.
owner: Design/Imagery Agent
trigger: When site needs stock photos (optional)
llm: Gemini
---

# Pixels/Media API Skill

## Purpose

Provide stock imagery when AI generation isn't required. Fetches, downloads, and optimizes stock photos from Pexels or Unsplash.

---

## Trigger

Optional — when site needs stock photos instead of AI-generated images.

---

## Required Environment Variables

```
PEXELS_API_KEY=your_pexels_api_key
# OR
UNSPLASH_API_KEY=your_unsplash_api_key
```

---

## Supported APIs

| API | Rate Limit | License |
|-----|------------|---------|
| Pexels | 200 requests/hour | Free for commercial use |
| Unsplash | 50 requests/hour | Free for commercial use |

---

## Workflow

### Step 1: Receive Image Brief

From Content or Design Agent:

```json
{
  "query": "modern office workspace",
  "orientation": "landscape",
  "size": "large",
  "color": "blue",
  "usage": "hero",
  "page": "about"
}
```

### Step 2: Query Pexels API

```typescript
// src/utils/pexels-api.ts
const PEXELS_API_KEY = import.meta.env.PEXELS_API_KEY;

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  alt: string;
}

interface PexelsSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
}

export async function searchPexels(
  query: string,
  options?: {
    orientation?: 'landscape' | 'portrait' | 'square';
    size?: 'large' | 'medium' | 'small';
    color?: string;
    perPage?: number;
  }
): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(options?.perPage || 10),
    ...(options?.orientation && { orientation: options.orientation }),
    ...(options?.size && { size: options.size }),
    ...(options?.color && { color: options.color })
  });
  
  const response = await fetch(
    `https://api.pexels.com/v1/search?${params}`,
    {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }
  
  const data: PexelsSearchResult = await response.json();
  return data.photos;
}
```

### Step 3: Query Unsplash API (Alternative)

```typescript
// src/utils/unsplash-api.ts
const UNSPLASH_API_KEY = import.meta.env.UNSPLASH_API_KEY;

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  description: string;
  alt_description: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

export async function searchUnsplash(
  query: string,
  options?: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
    color?: string;
    perPage?: number;
  }
): Promise<UnsplashPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(options?.perPage || 10),
    ...(options?.orientation && { orientation: options.orientation }),
    ...(options?.color && { color: options.color })
  });
  
  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.results;
}
```

### Step 4: Select Best Match

```typescript
export function selectBestImage(
  photos: (PexelsPhoto | UnsplashPhoto)[],
  criteria: {
    minWidth?: number;
    minHeight?: number;
    preferredAspectRatio?: number;
  }
): PexelsPhoto | UnsplashPhoto | null {
  const { 
    minWidth = 1200, 
    minHeight = 800,
    preferredAspectRatio = 16/9 
  } = criteria;
  
  // Filter by minimum dimensions
  const suitable = photos.filter(photo => 
    photo.width >= minWidth && photo.height >= minHeight
  );
  
  if (suitable.length === 0) return null;
  
  // Sort by closest aspect ratio match
  suitable.sort((a, b) => {
    const ratioA = a.width / a.height;
    const ratioB = b.width / b.height;
    const diffA = Math.abs(ratioA - preferredAspectRatio);
    const diffB = Math.abs(ratioB - preferredAspectRatio);
    return diffA - diffB;
  });
  
  return suitable[0];
}
```

### Step 5: Download and Optimize

```typescript
import { optimizeImage, generateResponsiveSizes } from './image-optimizer';

export async function downloadAndOptimize(
  photo: PexelsPhoto | UnsplashPhoto,
  outputDir: string,
  filename: string
): Promise<{
  path: string;
  responsive: { mobile: string; tablet: string; desktop: string };
  attribution: string;
}> {
  // Get download URL
  const downloadUrl = 'src' in photo 
    ? photo.src.original 
    : photo.urls.full;
  
  // Download image
  const response = await fetch(downloadUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  
  // Save original
  const originalPath = `${outputDir}/stock/${filename}.jpg`;
  await writeFile(originalPath, buffer);
  
  // Optimize
  await optimizeImage(originalPath, `${outputDir}/optimized`, {
    format: 'webp',
    quality: 80
  });
  
  // Generate responsive sizes
  const responsive = await generateResponsiveSizes(
    originalPath,
    `${outputDir}/optimized`
  );
  
  // Build attribution
  const attribution = 'photographer' in photo
    ? `Photo by ${photo.photographer} on Pexels`
    : `Photo by ${photo.user.name} on Unsplash`;
  
  return {
    path: `${outputDir}/optimized/${filename}.webp`,
    responsive,
    attribution
  };
}
```

### Step 6: Store in Stock Directory

```
/assets/images/
  /stock/
    - hero-about-original.jpg
    - team-photo-original.jpg
  /optimized/
    - hero-about.webp
    - hero-about-mobile.webp
    - hero-about-tablet.webp
    - hero-about-desktop.webp
```

### Step 7: Log Attribution

**stock-attribution.json:**

```json
{
  "images": [
    {
      "filename": "hero-about.webp",
      "source": "pexels",
      "photographer": "John Doe",
      "photographerUrl": "https://pexels.com/@johndoe",
      "originalUrl": "https://pexels.com/photo/12345",
      "license": "Pexels License",
      "downloadedAt": "2026-01-16T00:00:00Z"
    }
  ]
}
```

---

## Hard Limits

- **Must run through optimization** — No raw stock images
- **Proper attribution** if required by license
- **No mixing stock and AI images** without design consistency check
- **Respect rate limits** — Cache results

---

## Required Outputs

| Output | Description |
|--------|-------------|
| Stock images | Downloaded to `/assets/images/stock/` |
| Optimized images | Processed via Imagery Workflow |
| `stock-attribution.json` | Attribution records |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing API key | **STOP** — Configure env var |
| API rate limit exceeded | Wait and retry |
| No suitable images found | Try different query or use AI generation |
| Unoptimized stock image | **STOP** — Must optimize |

---

## Design Consistency Check

When mixing stock and AI images:

1. Compare color palettes
2. Check lighting consistency
3. Verify style compatibility
4. Apply color grading if needed

---

## Success Criteria

Pixels/Media API Skill is complete when:

- [ ] API key configured
- [ ] Stock images downloaded
- [ ] All images optimized
- [ ] Attribution logged
- [ ] Design consistency verified
- [ ] Images integrated with site
