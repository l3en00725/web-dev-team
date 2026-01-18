---
name: imagery-workflow
description: Handles AI image generation via OpenAI DALL-E 3, including exceptional prompt crafting, transparency handling, and optimization for web performance. Use when site needs custom imagery, hero images, icons, or AI-generated visuals.
owner: Design/Imagery Agent
trigger: When site needs custom imagery beyond stock photos
llm: Claude (prompt generation) + OpenAI API (image generation)
---

# Imagery Workflow Skill

## Purpose

Generate exceptional AI images and optimize them for site performance. This skill covers:
1. **Prompt Generation** — Creating detailed, production-quality prompts
2. **Image Generation** — Calling OpenAI DALL-E 3 API
3. **Post-Processing** — Background removal, color correction, optimization
4. **Asset Management** — Proper naming, placement, and manifest generation

---

## Prerequisites

Before starting this phase:

- [ ] `OPENAI_API_KEY` added to `.env`
- [ ] `design-tokens.json` exists (color palette, typography)
- [ ] `design-analysis.md` exists (if Phase 3A was completed)
- [ ] `image-requirements.json` created (what images are needed)

---

## Environment Variable Required

```bash
# .env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Orchestrator must verify this exists before proceeding.**

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
- AI-generated icons (with transparency)
- Illustrations and graphics
- Brand-specific visuals
- Abstract backgrounds
- Images that stock photos can't provide
- **Assets specified in `layout-manifest.json` asset_prompts**

---

## File Size Thresholds

| Image Type | Max Size |
|------------|----------|
| Hero image | 200kb |
| Feature image | 100kb |
| Icon | 50kb |
| Illustration | 80kb |
| Background pattern | 50kb |
| Thumbnail | 30kb |

---

## Supported Formats

| Format | Use Case | Transparency |
|--------|----------|--------------|
| PNG | Icons, illustrations requiring transparency | ✅ Yes |
| WebP | Default for all web images | ✅ Yes (lossy) |
| AVIF | Best compression (where supported) | ✅ Yes |
| JPEG | Photos, no transparency needed | ❌ No |

---

## Workflow Overview

```
Phase 4: Imagery

4.1 — Prerequisites Check
    ├── Verify OPENAI_API_KEY in .env
    ├── Verify design-tokens.json exists
    └── Gate: All prerequisites met

4.2 — Image Requirements Review
    ├── Create/review image-requirements.json
    ├── Define all images needed with full specs
    └── Gate: User confirms requirements complete

4.3 — Prompt Generation (Claude)
    ├── Generate exceptional DALL-E 3 prompts
    ├── Include transparency specs where needed
    ├── Output: image-prompts.json
    └── Gate: User reviews and approves prompts

4.4 — Image Generation (OpenAI API)
    ├── Call DALL-E 3 for each approved prompt
    ├── Save to /assets/images/generated/
    └── Gate: User reviews generated images

4.5 — Post-Processing
    ├── Background removal (where transparency required)
    ├── Color correction to match tokens
    ├── Edge cleanup
    └── Gate: All post-processing complete

4.6 — Optimization & Variants
    ├── Compress to meet size thresholds
    ├── Generate responsive variants
    ├── Move to final placement folders
    └── Gate: All images under size limits

4.7 — Manifest Generation
    ├── Update image-manifest.json
    ├── Verify all images documented
    └── Gate: Manifest complete, all images ready
```

---

## Part 1: Image Requirements

### Step 1.1: Create Image Requirements

Create `image-requirements.json` using the template at `/templates/image-requirements.json`.

**Key sections:**

1. **style_context** — Visual direction from design tokens and analysis
2. **images[]** — Array of all images needed with full specifications
3. **post_processing_workflows** — How to handle transparency, etc.
4. **api_configuration** — OpenAI API settings

### Step 1.2: Define Each Image Completely

For EACH image, specify:

```json
{
  "id": "icon-analytics",
  "type": "icon",
  "context": {
    "page": "Homepage",
    "section": "Features grid",
    "purpose": "Visual identifier for analytics feature",
    "usage": "Will display on both light AND dark backgrounds"
  },
  "subject": {
    "description": "Bar chart with upward trend arrow",
    "key_elements": ["3-4 vertical bars", "upward arrow", "clean geometry"],
    "mood": "Professional, optimistic"
  },
  "technical_requirements": {
    "dimensions": { "width": 512, "height": 512, "aspect_ratio": "1:1" },
    "transparency": {
      "required": true,
      "background_type": "transparent",
      "background_spec": "Generate on solid white (#FFFFFF) for removal",
      "edge_quality": "Clean, crisp, anti-aliased edges"
    },
    "file_format": { "primary": "png", "alpha_channel": true }
  },
  "style_requirements": {
    "render_style": "3D rendered, soft plastic material",
    "lighting": "Soft studio lighting from top-left",
    "colors": "Primary blue (#0066FF) for bars, accent (#00D4AA) for arrow",
    "detail_level": "Medium, clean geometry"
  },
  "avoid": [
    "Text or labels",
    "Shadows extending beyond object",
    "Complex textures"
  ]
}
```

---

## Part 2: Exceptional Prompt Generation

### The Anatomy of an Exceptional DALL-E 3 Prompt

```
[STYLE] + [SUBJECT] + [COMPOSITION] + [LIGHTING] + [COLORS] + [BACKGROUND] + [TECHNICAL] + [AVOID]
```

**Minimum prompt length: 150-300 words**

### Step 2.1: Prompt Generation Mode

The Orchestrator provides this prompt to Claude:

```
Enter IMAGE PROMPT GENERATION MODE.

Context files loaded:
- design-tokens.json (color palette: primary #0066FF, accent #00D4AA, etc.)
- design-analysis.md (visual style direction)
- image-requirements.json (what images are needed)

For EACH image in image-requirements.json, generate a DALL-E 3 prompt.

PROMPT STRUCTURE (follow exactly):

1. STYLE (20-30 words)
   - Artistic/render style in detail
   - Material qualities
   - Overall aesthetic

2. SUBJECT (30-50 words)
   - Exactly what the image depicts
   - Key elements that MUST appear
   - Relationships between elements

3. COMPOSITION (20-30 words)
   - Framing and positioning
   - Where focal point should be
   - Safe zones for text overlay (if applicable)

4. LIGHTING (20-30 words)
   - Light source direction and quality
   - Shadow style and intensity
   - Atmospheric effects

5. COLORS (20-30 words)
   - Reference EXACT hex codes from design tokens
   - How colors are distributed
   - Color temperature and saturation

6. BACKGROUND (30-50 words)
   - For TRANSPARENT images:
     "isolated on solid pure white (#FFFFFF) background with absolutely 
     no shadows or reflections extending beyond the object boundary, 
     clean crisp anti-aliased edges suitable for compositing on any 
     background color including dark backgrounds"
   - For SOLID backgrounds: exact color and any gradients
   - For SCENE backgrounds: full description

7. TECHNICAL (10-20 words)
   - Aspect ratio
   - Where to position main subject
   - Cropping considerations

8. AVOID (list 5-8 things)
   - Specific things that should NOT appear
   - Common AI pitfalls to prevent

OUTPUT FORMAT for each image:

---
**Image ID:** {id}
**Type:** {type}

**Full Prompt:**
{complete prompt, 150-300 words, no line breaks within the prompt}

**API Parameters:**
- model: "dall-e-3"
- size: "{size based on aspect ratio}"
- quality: "hd"
- style: "vivid" or "natural"

**Post-Processing Required:**
- [ ] {list each required step}

**Transparency Required:** {true/false}
---

Generate prompts for ALL images in requirements.
Wait for user approval before proceeding to generation.
```

### Step 2.2: Example Exceptional Prompts

**BAD prompt (too vague):**
> "Analytics icon with chart"

**EXCEPTIONAL prompt (production-ready):**
> "A 3D rendered icon of a bar chart with an upward trend arrow, soft plastic material with subtle glass reflections and gentle surface gradients, featuring three vertical bars of ascending heights representing data growth with a bold upward-pointing arrow emerging from behind the tallest bar, studio lighting from top-left at 45-degree angle creating soft ambient occlusion shadows beneath each element, using bright electric blue (#0066FF) as the primary color for the bars with smooth gradient from darker base to lighter top, and vibrant mint green (#00D4AA) for the upward arrow creating visual emphasis on growth, isolated on solid pure white (#FFFFFF) background with absolutely no shadows or reflections extending beyond the object boundary and no ground plane shadow, clean crisp anti-aliased edges suitable for compositing on any background color including both light and dark themes, square 1:1 composition with the chart centered and filling approximately 80% of the frame with equal padding on all sides, medium detail level with clean smooth geometry and no complex textures, no text labels numbers or data values on the chart, no harsh specular highlights or reflective glare, no photorealistic textures or materials, no complex backgrounds or environmental elements, no thin lines that may not render well at small sizes"

**For hero images requiring transparency: NO**

> "Cinematic ultra-wide view of abstract data visualization in a vast dark ethereal space, flowing streams and ribbons of luminous energy representing data movement through an infinite digital network, volumetric god rays piercing through a mysterious atmosphere with dramatic rim lighting illuminating crystalline abstract forms that seem to float and flow, deep navy (#1a1a2e) background atmosphere fading gradually to pure black (#0a0a0f) at the edges with subtle electric blue (#0066FF) atmospheric glow and scattered particle dust catching the light, strong sense of infinite depth achieved through soft bokeh light particles in the extreme foreground and distant glowing network nodes fading into the background haze, dynamic diagonal composition with energy flowing from bottom-left corner toward top-right creating visual movement and tension, main visual interest concentrated in the right two-thirds of the frame leaving clean dark negative space on the left side suitable for headline text overlay without competing with imagery, photorealistic cinematic lighting quality applied to completely abstract non-representational flowing glass ribbon and pure light forms, absolutely no recognizable user interface elements or computer/phone device screens, no human figures faces or hands, no readable text numbers or binary code sequences, no circuit board patterns or cliché technology imagery like chips or wires, no flat static composition, 16:9 ultra-wide aspect ratio with the primary focal point positioned at the right-third vertical intersection following rule of thirds"

---

## Part 3: Image Generation

### Step 3.1: OpenAI API Integration

```typescript
// src/utils/openai-image-generation.ts
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerationOptions {
  prompt: string;
  size: '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
}

interface GenerationResult {
  success: boolean;
  imagePath?: string;
  revisedPrompt?: string;
  error?: string;
}

export async function generateImage(
  imageId: string,
  options: GenerationOptions
): Promise<GenerationResult> {
  try {
    console.log(`Generating image: ${imageId}`);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: options.prompt,
      n: 1,
      size: options.size,
      quality: options.quality,
      style: options.style,
      response_format: 'b64_json',
    });

    const imageData = response.data[0];
    
    if (!imageData.b64_json) {
      throw new Error('No image data returned');
    }

    // Save to generated folder
    const outputDir = './assets/images/generated';
    await mkdir(outputDir, { recursive: true });
    
    const outputPath = join(outputDir, `${imageId}.png`);
    const buffer = Buffer.from(imageData.b64_json, 'base64');
    await writeFile(outputPath, buffer);

    console.log(`✓ Generated: ${outputPath}`);
    
    return {
      success: true,
      imagePath: outputPath,
      revisedPrompt: imageData.revised_prompt,
    };
  } catch (error) {
    console.error(`✗ Failed to generate ${imageId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Rate-limited batch generation
export async function generateBatch(
  images: Array<{ id: string; options: GenerationOptions }>,
  delayMs: number = 2000
): Promise<Map<string, GenerationResult>> {
  const results = new Map<string, GenerationResult>();
  
  for (const image of images) {
    const result = await generateImage(image.id, image.options);
    results.set(image.id, result);
    
    // Rate limit delay
    if (images.indexOf(image) < images.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}
```

### Step 3.2: Size Mapping

| Aspect Ratio | DALL-E 3 Size | Use Case |
|--------------|---------------|----------|
| 1:1 | 1024x1024 | Icons, profile images, thumbnails |
| 16:9 | 1792x1024 | Hero images, banners |
| 9:16 | 1024x1792 | Mobile heroes, vertical banners |

---

## Part 4: Post-Processing

### Step 4.1: Background Removal (Critical for Transparency)

**DALL-E 3 does NOT generate transparent PNGs.**

For all images with `transparency.required = true`:

```typescript
// src/utils/background-removal.ts
import Jimp from 'jimp';
import { removeBackground } from '@imgly/background-removal-node';

export async function removeBackgroundFromImage(
  inputPath: string,
  outputPath: string
): Promise<void> {
  // Using @imgly/background-removal-node (runs locally, no API needed)
  const blob = await removeBackground(inputPath, {
    output: {
      format: 'image/png',
      quality: 1,
    },
  });
  
  const buffer = Buffer.from(await blob.arrayBuffer());
  await writeFile(outputPath, buffer);
  
  console.log(`✓ Background removed: ${outputPath}`);
}

// Alternative: Using remove.bg API
export async function removeBackgroundAPI(
  inputPath: string,
  outputPath: string,
  apiKey: string
): Promise<void> {
  const formData = new FormData();
  formData.append('image_file', await readFile(inputPath));
  formData.append('size', 'auto');
  
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`remove.bg API error: ${response.statusText}`);
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
}
```

### Step 4.2: Edge Cleanup

After background removal, verify edges:

```typescript
export async function verifyTransparency(
  imagePath: string
): Promise<{ clean: boolean; issues: string[] }> {
  const image = await Jimp.read(imagePath);
  const issues: string[] = [];
  
  // Check for white fringing on edges
  // Check alpha channel is properly set
  // Check edges are anti-aliased
  
  // Scan border pixels
  const width = image.getWidth();
  const height = image.getHeight();
  
  let hasWhiteFringe = false;
  let hasHardEdges = false;
  
  // Check perimeter for issues
  for (let x = 0; x < width; x++) {
    const topPixel = image.getPixelColor(x, 0);
    const bottomPixel = image.getPixelColor(x, height - 1);
    // Analyze alpha and color values...
  }
  
  if (hasWhiteFringe) issues.push('White fringing detected on edges');
  if (hasHardEdges) issues.push('Hard edges detected, may need anti-aliasing');
  
  return {
    clean: issues.length === 0,
    issues,
  };
}
```

### Step 4.3: Color Correction

Match generated colors to exact design tokens:

```typescript
export async function adjustColorsToTokens(
  imagePath: string,
  outputPath: string,
  colorMap: Record<string, string> // { "generated": "target" }
): Promise<void> {
  const image = await Jimp.read(imagePath);
  
  // For each pixel, find closest color in map and adjust
  // This is a simplified version — production would use more sophisticated color matching
  
  image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y, idx) => {
    // Color adjustment logic
  });
  
  await image.writeAsync(outputPath);
}
```

---

## Part 5: Optimization

### Step 5.1: Compress Images

```typescript
import sharp from 'sharp';

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: {
    maxWidth?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'png' | 'jpeg';
    preserveAlpha?: boolean;
  }
): Promise<{ originalSize: number; optimizedSize: number; savings: string }> {
  const {
    maxWidth = 1920,
    quality = 85,
    format = 'webp',
    preserveAlpha = true
  } = options;
  
  const inputBuffer = await readFile(inputPath);
  const originalSize = inputBuffer.length;
  
  let pipeline = sharp(inputBuffer)
    .resize({ width: maxWidth, withoutEnlargement: true });
  
  // Handle format with alpha preservation
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ 
        quality, 
        alphaQuality: preserveAlpha ? 100 : undefined 
      });
      break;
    case 'png':
      pipeline = pipeline.png({ 
        quality,
        compressionLevel: 9 
      });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
  }
  
  const outputBuffer = await pipeline.toBuffer();
  const optimizedSize = outputBuffer.length;
  
  await writeFile(outputPath, outputBuffer);
  
  return {
    originalSize,
    optimizedSize,
    savings: `${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`
  };
}
```

### Step 5.2: Generate Responsive Variants

```typescript
export async function generateResponsiveSizes(
  inputPath: string,
  outputDir: string,
  sizes: number[] = [640, 1024, 1920],
  preserveAlpha: boolean = false
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const basename = inputPath.split('/').pop()?.replace(/\.[^.]+$/, '');
  
  for (const width of sizes) {
    const filename = `${basename}-${width}w.webp`;
    const outputPath = join(outputDir, filename);
    
    await optimizeImage(inputPath, outputPath, {
      maxWidth: width,
      format: 'webp',
      preserveAlpha
    });
    
    results[`${width}w`] = outputPath;
  }
  
  return results;
}
```

---

## Part 6: Asset Management

### Step 6.1: File Naming Convention

**Pattern:** `{type}-{identifier}.{extension}`

| Type | Prefix | Example |
|------|--------|---------|
| Hero | `hero-` | `hero-home.png`, `hero-about.png` |
| Feature | `feature-` | `feature-analytics.png` |
| Icon | `icon-` | `icon-dashboard.png` |
| Illustration | `illust-` | `illust-empty-state.png` |
| Background | `bg-` | `bg-gradient-dark.png` |
| Photo | `photo-` | `photo-team.jpg` |

### Step 6.2: Folder Structure

```
/assets/images/
├── generated/           # Raw DALL-E output (temporary)
│   ├── hero-home.png
│   └── icon-analytics.png
├── processed/           # After background removal (temporary)
│   └── icon-analytics.png
├── optimized/           # Final optimized versions
│   ├── hero/
│   │   ├── hero-home.webp
│   │   ├── hero-home-640w.webp
│   │   ├── hero-home-1024w.webp
│   │   └── hero-home-1920w.webp
│   ├── icons/
│   │   ├── icon-analytics.png
│   │   ├── icon-analytics-64w.png
│   │   ├── icon-analytics-128w.png
│   │   └── icon-analytics-256w.png
│   ├── illustrations/
│   ├── backgrounds/
│   └── features/
└── manifest.json
```

### Step 6.3: Image Manifest

**image-manifest.json:**

```json
{
  "generatedAt": "2026-01-18T00:00:00Z",
  "generator": "openai-dall-e-3",
  "images": [
    {
      "id": "icon-analytics",
      "type": "icon",
      "transparency": true,
      "originalPrompt": "A 3D rendered icon of a bar chart...",
      "revisedPrompt": "DALL-E's revised version if different",
      "paths": {
        "original": "/assets/images/generated/icon-analytics.png",
        "processed": "/assets/images/processed/icon-analytics.png",
        "optimized": {
          "64w": "/assets/images/optimized/icons/icon-analytics-64w.png",
          "128w": "/assets/images/optimized/icons/icon-analytics-128w.png",
          "256w": "/assets/images/optimized/icons/icon-analytics-256w.png",
          "512w": "/assets/images/optimized/icons/icon-analytics.png"
        }
      },
      "dimensions": { "width": 512, "height": 512 },
      "fileSize": {
        "original": 245000,
        "optimized": 42000
      },
      "altText": null,
      "usedOn": ["/", "/features"],
      "generatedAt": "2026-01-18T00:00:00Z",
      "approved": true
    }
  ],
  "summary": {
    "totalImages": 15,
    "withTransparency": 8,
    "totalOriginalSize": "12MB",
    "totalOptimizedSize": "1.8MB",
    "overallSavings": "85%"
  }
}
```

---

## Hard Limits

- **No unoptimized images** in production
- **No images above threshold** without documented override
- **No missing alt text** — Content Agent must provide
- **All transparent images must pass edge verification**
- **All images must have responsive variants**
- **Prompts must be 150+ words minimum**

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `image-requirements.json` | Full specs for all needed images |
| `image-prompts.json` | Generated prompts for each image |
| Generated images | In `/assets/images/generated/` |
| Processed images | In `/assets/images/processed/` (after bg removal) |
| Optimized images | In `/assets/images/optimized/{type}/` |
| Responsive variants | Multiple sizes per image |
| `image-manifest.json` | Complete image inventory |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing OPENAI_API_KEY | **STOP** — Add to .env |
| Prompt too short (<100 words) | **REJECT** — Rewrite prompt |
| Image exceeds size threshold | **FLAG** — Optimize further |
| Background removal leaves fringing | **FLAG** — Manual cleanup |
| Missing alt text | **STOP** — Content Agent must provide |
| API generation fails | Retry up to 3 times, then flag |

---

## Success Criteria

Imagery Workflow Skill is complete when:

- [ ] `OPENAI_API_KEY` verified in .env
- [ ] `image-requirements.json` complete with all specs
- [ ] Prompts generated and approved (150+ words each)
- [ ] All images generated via DALL-E 3
- [ ] Background removal complete (where needed)
- [ ] Edge verification passed (for transparent images)
- [ ] All images optimized and under thresholds
- [ ] Responsive variants created
- [ ] Files in correct folders with correct names
- [ ] `image-manifest.json` generated
- [ ] Alt text assigned to all images (Content Agent)
- [ ] Images integrated with site components

---

## Orchestrator Prompts for This Phase

### Check Prerequisites

```
Check Phase 4 (Imagery) Prerequisites:

Required:
- [ ] OPENAI_API_KEY in .env
- [ ] design-tokens.json exists
- [ ] design-analysis.md exists (if Phase 3A done)

If missing, STOP and provide instructions to add.
```

### Trigger Prompt Generation

```
Enter IMAGE PROMPT GENERATION MODE.

Load context from:
- design-tokens.json
- design-analysis.md (if exists)
- image-requirements.json

Generate exceptional DALL-E 3 prompts following the structure in 
/skills/imagery-workflow/SKILL.md Part 2.

Each prompt must be 150-300 words minimum.
Include exact hex codes from design tokens.
Specify transparency requirements explicitly.
List 5-8 things to avoid.

Output as structured JSON for programmatic use.
Wait for approval before generation.
```

### After Generation

```
Image generation complete.

Review generated images in /assets/images/generated/

For each image:
1. Does it match the intended style?
2. Are colors close to design tokens?
3. Is composition correct for intended use?

Mark images as:
- ✅ Approved — proceed to post-processing
- 🔄 Regenerate — provide feedback for new prompt
- ❌ Skip — will use alternative (stock, custom, etc.)

Confirm to proceed to post-processing.
```
