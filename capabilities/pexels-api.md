# Pexels API Playbook

## Overview

Pexels API provides free, high-quality stock photos and videos for commercial use.

---

## API Details

| Property | Value |
|----------|-------|
| Base URL | `https://api.pexels.com/v1/` |
| Auth | API Key (required) |
| Rate Limit | 200 requests/hour |
| Cost | Free |

---

## Environment Variable

```
PEXELS_API_KEY=your_pexels_api_key
```

---

## Setup

### Get API Key

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Create account
3. Request API access
4. Copy API key

---

## API Endpoints

### Search Photos

```
GET https://api.pexels.com/v1/search
```

### Curated Photos

```
GET https://api.pexels.com/v1/curated
```

### Get Photo by ID

```
GET https://api.pexels.com/v1/photos/:id
```

---

## Implementation

### Search Photos

```typescript
const PEXELS_API_KEY = import.meta.env.PEXELS_API_KEY;

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export async function searchPhotos(
  query: string,
  options?: {
    orientation?: 'landscape' | 'portrait' | 'square';
    size?: 'large' | 'medium' | 'small';
    color?: string;
    page?: number;
    perPage?: number;
  }
): Promise<PexelsSearchResponse> {
  const {
    orientation,
    size,
    color,
    page = 1,
    perPage = 15
  } = options || {};
  
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
    ...(orientation && { orientation }),
    ...(size && { size }),
    ...(color && { color })
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
  
  return response.json();
}
```

### Get Curated Photos

```typescript
export async function getCuratedPhotos(
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse> {
  const response = await fetch(
    `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`,
    {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Get Photo by ID

```typescript
export async function getPhotoById(id: number): Promise<PexelsPhoto> {
  const response = await fetch(
    `https://api.pexels.com/v1/photos/${id}`,
    {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Download and Optimize

```typescript
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function downloadAndOptimize(
  photo: PexelsPhoto,
  outputDir: string,
  options?: {
    maxWidth?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
): Promise<{
  path: string;
  originalSize: number;
  optimizedSize: number;
  attribution: string;
}> {
  const {
    maxWidth = 1920,
    quality = 80,
    format = 'webp'
  } = options || {};
  
  // Download original
  const response = await fetch(photo.src.original);
  const buffer = Buffer.from(await response.arrayBuffer());
  const originalSize = buffer.length;
  
  // Optimize
  let pipeline = sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true });
  
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
  }
  
  const optimizedBuffer = await pipeline.toBuffer();
  const optimizedSize = optimizedBuffer.length;
  
  // Save
  await mkdir(outputDir, { recursive: true });
  const filename = `pexels-${photo.id}.${format}`;
  const outputPath = join(outputDir, filename);
  await writeFile(outputPath, optimizedBuffer);
  
  return {
    path: outputPath,
    originalSize,
    optimizedSize,
    attribution: `Photo by ${photo.photographer} on Pexels`
  };
}
```

---

## Response Structure

```json
{
  "total_results": 10000,
  "page": 1,
  "per_page": 15,
  "photos": [
    {
      "id": 2014422,
      "width": 3024,
      "height": 4032,
      "url": "https://www.pexels.com/photo/...",
      "photographer": "Joey Kyber",
      "photographer_url": "https://www.pexels.com/@joey-kyber",
      "photographer_id": 123456,
      "avg_color": "#978E82",
      "src": {
        "original": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg",
        "large2x": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "large": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        "medium": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=350",
        "small": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=130",
        "portrait": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        "landscape": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        "tiny": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280"
      },
      "alt": "Brown Rocks During Golden Hour"
    }
  ],
  "next_page": "https://api.pexels.com/v1/search/?page=2&per_page=15&query=nature"
}
```

---

## Color Options

Available colors for filtering:
- `red`
- `orange`
- `yellow`
- `green`
- `turquoise`
- `blue`
- `violet`
- `pink`
- `brown`
- `black`
- `gray`
- `white`

---

## License

Pexels photos are free to use:
- ✅ Commercial use allowed
- ✅ No attribution required (but appreciated)
- ✅ Modification allowed
- ❌ Cannot sell unmodified copies
- ❌ Cannot imply endorsement

---

## Best Practices

1. **Always optimize** — Never use raw Pexels images
2. **Cache results** — Reduce API calls
3. **Track attribution** — Log photographer info
4. **Use appropriate sizes** — Don't download original if medium works
5. **Handle rate limits** — 200/hour is generous but track usage
