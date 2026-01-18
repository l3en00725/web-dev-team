---
name: imagery-workflow
description: Handles image generation via Gemini and optimization for web performance. Use when site needs custom imagery, hero images, or AI-generated visuals based on inspiration or prompts.
owner: Design/Imagery Agent (Gemini)
trigger: When site needs custom imagery beyond stock photos
llm: Gemini
---

# Imagery Workflow Skill

## Purpose

Generate and optimize images for site performance. Ensures all imagery meets web performance standards while maintaining visual quality.

---

## IMPORTANT: Manual Asset Generation

> **Since Design happens in the external Gemini Web Interface (Design Director Gem), the user may generate assets there. The Builder must expect assets to be manually placed in `/public/assets/` before the build phase begins.**

### How Assets Are Created in Video-Led Workflow

1. **During Design Extraction (Phase 5):** The Design Director Gem analyzes the reference video and outputs `asset_prompts` in the `layout-manifest.json`
2. **User generates assets:** Using the prompts from the manifest, the user generates images in Gemini Web Interface
3. **User downloads assets:** Generated images are downloaded and placed in `/public/assets/`
4. **Builder verifies:** Before building, Builder scans the manifest and verifies all referenced assets exist

### Asset Checklist Before Build

Before proceeding to the Build phase, verify:

- [ ] All assets referenced in `layout-manifest.json` layers exist in `/public/assets/`
- [ ] Asset filenames match exactly what's specified in the manifest
- [ ] Images are in web-optimized formats (WebP preferred)
- [ ] Images meet size thresholds (hero: 200kb, content: 100kb)

### If Assets Are Missing

If the Builder encounters missing assets:
1. Create a placeholder `<div>` with red border
2. Log a warning: `"WARNING: Missing asset [filename]"`
3. Continue building — do not block
4. User must add missing assets before QA phase

---

## Trigger

When site needs:
- Custom hero images
- AI-generated illustrations
- Brand-specific visuals
- Images that stock photos can't provide
- **Assets specified in `layout-manifest.json` asset_prompts**

---

## File Size Thresholds

| Image Type | Max Size |
|------------|----------|
| Hero image | 200kb |
| Content image | 100kb |
| Thumbnail | 30kb |
| Background pattern | 50kb |

---

## Supported Formats

| Format | Use Case | Browser Support |
|--------|----------|-----------------|
| WebP | Default for all images | 97%+ |
| AVIF | Best compression (where supported) | 85%+ |
| PNG | Fallback, transparency | 100% |
| JPEG | Fallback, photos | 100% |

---

## Workflow

### Part 1: Image Generation

#### Step 1: Receive Generation Request

**Input formats:**

| Input Type | Example |
|------------|---------|
| Text prompt | "Modern office space with natural lighting" |
| Style reference | "Like the hero image on [site]" |
| Design tokens | Use colors from `design-tokens.json` |

#### Step 2: Generate with Gemini

```typescript
// src/utils/image-generation.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);

export async function generateImage(prompt: string, options?: {
  style?: string;
  aspectRatio?: '16:9' | '1:1' | '4:3';
  colorPalette?: string[];
}): Promise<Buffer> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  
  const enhancedPrompt = buildPrompt(prompt, options);
  
  const result = await model.generateContent(enhancedPrompt);
  // Process and return image buffer
  
  return imageBuffer;
}

function buildPrompt(base: string, options?: any): string {
  let prompt = base;
  
  if (options?.style) {
    prompt += `. Style: ${options.style}`;
  }
  
  if (options?.colorPalette) {
    prompt += `. Use these colors: ${options.colorPalette.join(', ')}`;
  }
  
  return prompt;
}
```

#### Step 3: Save Generated Images

Store in `/assets/images/generated/`:

```
/assets/images/
  /generated/
    - hero-home-001.png
    - hero-about-001.png
    - illustration-service-001.png
```

---

### Part 2: Image Optimization

#### Step 4: Compress Images

```typescript
// src/utils/image-optimizer.ts
import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: string;
  format: string;
}

export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  options?: {
    maxWidth?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'png' | 'jpeg';
  }
): Promise<OptimizationResult> {
  const {
    maxWidth = 1920,
    quality = 80,
    format = 'webp'
  } = options || {};
  
  const inputBuffer = await readFile(inputPath);
  const originalSize = inputBuffer.length;
  
  let pipeline = sharp(inputBuffer)
    .resize({ width: maxWidth, withoutEnlargement: true });
  
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
  }
  
  const outputBuffer = await pipeline.toBuffer();
  const optimizedSize = outputBuffer.length;
  
  const filename = inputPath.split('/').pop()?.replace(/\.[^.]+$/, `.${format}`);
  const outputPath = join(outputDir, filename!);
  
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, outputBuffer);
  
  return {
    originalSize,
    optimizedSize,
    savings: `${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`,
    format
  };
}
```

#### Step 5: Generate Responsive Sizes

```typescript
export async function generateResponsiveSizes(
  inputPath: string,
  outputDir: string
): Promise<{
  mobile: string;
  tablet: string;
  desktop: string;
}> {
  const sizes = {
    mobile: 640,
    tablet: 1024,
    desktop: 1920
  };
  
  const results: Record<string, string> = {};
  
  for (const [name, width] of Object.entries(sizes)) {
    const result = await optimizeImage(inputPath, outputDir, {
      maxWidth: width,
      format: 'webp'
    });
    
    const filename = inputPath.split('/').pop()?.replace(/\.[^.]+$/, `-${name}.webp`);
    results[name] = join(outputDir, filename!);
  }
  
  return results as { mobile: string; tablet: string; desktop: string };
}
```

#### Step 6: Enforce Size Thresholds

```typescript
export async function validateImageSize(
  imagePath: string,
  type: 'hero' | 'content' | 'thumbnail' | 'background'
): Promise<{ valid: boolean; size: number; threshold: number; message: string }> {
  const thresholds = {
    hero: 200 * 1024,      // 200kb
    content: 100 * 1024,   // 100kb
    thumbnail: 30 * 1024,  // 30kb
    background: 50 * 1024  // 50kb
  };
  
  const buffer = await readFile(imagePath);
  const size = buffer.length;
  const threshold = thresholds[type];
  
  return {
    valid: size <= threshold,
    size,
    threshold,
    message: size <= threshold 
      ? `✓ Image within threshold (${(size / 1024).toFixed(1)}kb / ${(threshold / 1024).toFixed(0)}kb)`
      : `✗ Image exceeds threshold (${(size / 1024).toFixed(1)}kb / ${(threshold / 1024).toFixed(0)}kb)`
  };
}
```

---

### Part 3: Asset Management

#### Step 7: Generate Image Manifest

**image-manifest.json:**

```json
{
  "generatedAt": "2026-01-16T00:00:00Z",
  "images": [
    {
      "id": "hero-home",
      "type": "hero",
      "originalPath": "/assets/images/generated/hero-home-001.png",
      "optimizedPath": "/assets/images/optimized/hero-home.webp",
      "responsive": {
        "mobile": "/assets/images/optimized/hero-home-mobile.webp",
        "tablet": "/assets/images/optimized/hero-home-tablet.webp",
        "desktop": "/assets/images/optimized/hero-home-desktop.webp"
      },
      "originalSize": 2500000,
      "optimizedSize": 180000,
      "savings": "92.8%",
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "altText": null,
      "usedOn": ["/"]
    }
  ],
  "summary": {
    "totalImages": 15,
    "totalOriginalSize": "45MB",
    "totalOptimizedSize": "2.5MB",
    "totalSavings": "94.4%"
  }
}
```

#### Step 8: Astro Image Integration

```astro
---
// src/components/OptimizedImage.astro
import { Image } from 'astro:assets';

export interface Props {
  src: string;
  alt: string;
  class?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
}

const { 
  src, 
  alt, 
  class: className,
  loading = 'lazy',
  sizes = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px'
} = Astro.props;

// Import image dynamically
const images = import.meta.glob('/assets/images/**/*.{png,jpg,jpeg,webp,avif}');
const image = images[src];
---

{image && (
  <Image
    src={image()}
    alt={alt}
    class={className}
    loading={loading}
    sizes={sizes}
    widths={[640, 1024, 1920]}
    formats={['avif', 'webp']}
  />
)}
```

---

## Hard Limits

- **No unoptimized images** in production
- **No images above threshold** without documented override
- **No missing alt text** — Content Agent must provide
- **All images must have responsive variants**

---

## Required Outputs

| Output | Description |
|--------|-------------|
| Generated images | In `/assets/images/generated/` |
| Optimized images | In `/assets/images/optimized/` |
| Responsive variants | Mobile, tablet, desktop sizes |
| `image-manifest.json` | Complete image inventory |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Image exceeds threshold | **FLAG** — Optimize further |
| Missing alt text | **STOP** — Content Agent must provide |
| Generation fails | Retry or use fallback |
| Optimization fails | Manual intervention required |

---

## Success Criteria

Imagery Workflow Skill is complete when:

- [ ] All required images generated
- [ ] All images optimized and under thresholds
- [ ] Responsive variants created
- [ ] `image-manifest.json` generated
- [ ] Alt text assigned to all images
- [ ] Images integrated with Astro Image
