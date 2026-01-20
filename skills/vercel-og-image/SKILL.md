---
name: vercel-og-image
description: Generates Open Graph images for social sharing using Vercel OG. Use during build to ensure every page has a properly sized OG image.
owner: Builder Agent (implements), Design Agent (provides direction)
trigger: During build — required for all public pages
llm: Cursor Auto (Builder), Gemini (Design)
---

# Vercel OG Image Skill

## Purpose

Automated OG image generation for consistent social previews. Ensures every public page has a properly branded, correctly sized Open Graph image.

---

## Trigger

During build — required for all public pages.

---

## Prerequisites

From Design Agent:
- [ ] `design-tokens.json` — Colors, fonts
- [ ] OG image direction — Layout, style preferences

---

## Sizing Requirements

| Property | Value |
|----------|-------|
| Width | 1200px |
| Height | 630px |
| Format | PNG or JPEG |
| Max file size | 8MB (Vercel limit) |

---

## Workflow

### Step 1: Hero-Locked OG Renderer (MANDATORY)

**Critical Rule:** OG images must visually match the homepage hero section. This is a HERO-LOCKED renderer, not a generic banner generator.

**Before creating the OG endpoint, you MUST:**

1. **Read hero section from `layout-manifest.json`:**
   - Locate the hero section (id: "hero")
   - Extract `content.h1_classes` and `content.h2_classes`
   - Extract `layers` array for background treatment
   - Extract typography values: font family, weight, letter spacing, line height

2. **Understand Hero-Locked Philosophy:**
   - OG image is a "cinematic hero snapshot"
   - Typography, spacing, and layout must mirror the hero exactly
   - Background treatment must match hero layers
   - This is intentionally opinionated (no generic layouts)
   - Contrast increased +10-15% for social feed compression

### Step 2: Receive Design Direction

**Primary Source:** Hero section from `layout-manifest.json`

**From Design Agent's `effects.md` (if additional direction provided):**

```markdown
## OG Image Style

- Background: Match hero layers (gradients, overlays)
- Title: Match hero h1_classes typography
- Subtitle: Match hero h2_classes typography
- Layout: Match hero positioning (not centered)
- Contrast: +10-15% boost for social feed compression
```

### Step 3: Create Hero-Locked OG Image Endpoint

**Using @vercel/og with Hero-Locked Implementation:**

```typescript
// src/pages/api/og.ts
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';
import layoutManifest from '../../data/layout-manifest.json';

/**
 * HERO-LOCKED OG Image Renderer
 * 
 * This OG renderer is intentionally opinionated to match the homepage hero section.
 * It reads typography, layout, and background treatment from layout-manifest.json
 * to ensure visual consistency between the live hero and social preview images.
 * 
 * Why this diverges from generic layouts:
 * - OG images should be a "cinematic hero snapshot," not a generic banner
 * - Visual consistency builds brand recognition in social feeds
 * - Hero typography and spacing are carefully designed and should be preserved
 * 
 * Why contrast and spacing differ slightly from live hero:
 * - Social feeds compress images, reducing contrast
 * - +10-15% contrast boost ensures readability in compressed feeds
 * - Slightly tighter spacing compensates for feed compression
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Default Title';
  const subtitle = url.searchParams.get('subtitle') || '';
  const type = url.searchParams.get('type') || 'page';
  
  // Read hero section from layout-manifest.json
  const heroSection = layoutManifest.sections.find(s => s.id === 'hero');
  if (!heroSection) {
    throw new Error('Hero section not found in layout-manifest.json');
  }
  
  // Extract typography from hero h1_classes and h2_classes
  // Parse Tailwind classes to extract: font family, weight, letter spacing, line height
  const h1Classes = heroSection.content?.h1_classes || '';
  const h2Classes = heroSection.content?.h2_classes || '';
  
  // Extract font family from design tokens or hero classes
  // Example: "font-display" maps to display font family from design-tokens.json
  const designTokens = await import('../../data/design-tokens.json').catch(() => null);
  const fontFamily = designTokens?.typography?.display?.fontFamily || 'Inter';
  
  // Extract background treatment from hero layers
  const heroLayers = heroSection.layers || [];
  const backgroundLayer = heroLayers.find(l => l.type === 'background' || l.type === 'overlay');
  const backgroundGradient = backgroundLayer?.classes?.includes('gradient') 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' // Extract from classes
    : '#0f172a';
  
  // Load hero font (must match hero font family)
  const fontData = await fetch(
    new URL(`/fonts/${fontFamily}-Bold.ttf`, request.url)
  ).then(res => res.arrayBuffer()).catch(() => null);
  
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          // HERO-LOCKED: Match hero positioning (not vertically centered)
          // Hero content is typically positioned lower, not centered
          alignItems: 'center',
          justifyContent: 'flex-start', // NOT center - matches hero positioning
          paddingTop: 200, // Positioned lower, matching hero layout
          // Match hero background treatment
          backgroundColor: '#0f172a',
          backgroundImage: backgroundGradient,
          // Increase contrast +10-15% for social feed compression
          filter: 'contrast(1.12)', // +12% contrast boost
        },
        children: [
          // Background layers matching hero (if hero uses asset layers)
          heroLayers.filter(l => l.type === 'asset').map(layer => ({
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${layer.src})`,
                backgroundSize: 'cover',
                opacity: 0.8, // Slightly reduced for OG compression
              }
            }
          })),
          // Gradient overlays matching hero layers
          heroLayers.filter(l => l.type === 'overlay').map(layer => ({
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: 0,
                // Extract gradient from layer classes
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
              }
            }
          })),
          // H1 Title - Match hero h1_classes typography
          {
            type: 'div',
            props: {
              style: {
                // Extract from h1_classes: text-6xl md:text-8xl font-display font-bold tracking-tight
                fontSize: 96, // Matches text-8xl (hero desktop size)
                fontWeight: 700, // font-bold
                fontFamily: fontFamily,
                letterSpacing: '-0.02em', // tracking-tight
                lineHeight: 1.1, // Matches hero line height
                color: '#ffffff', // text-white
                textAlign: 'center',
                maxWidth: '80%',
                // HERO-LOCKED: Match hero drop shadow
                textShadow: '0 4px 12px rgba(0,0,0,0.5)', // drop-shadow-xl equivalent
              },
              children: title
            }
          },
          // H2 Subtitle - Match hero h2_classes typography
          subtitle && {
            type: 'div',
            props: {
              style: {
                // Extract from h2_classes: text-xl md:text-2xl text-white/80 mt-4
                fontSize: 32, // Matches text-2xl (hero desktop size)
                fontWeight: 400,
                fontFamily: fontFamily,
                color: 'rgba(255,255,255,0.8)', // text-white/80
                marginTop: 16, // mt-4 - HERO-LOCKED: Closer spacing than default
                textAlign: 'center',
                maxWidth: '70%',
              },
              children: subtitle
            }
          }
        ].filter(Boolean)
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: fontData ? [
        {
          name: fontFamily,
          data: fontData,
          weight: 700,
        }
      ] : undefined
    }
  );
};
```

**Key Implementation Notes:**

1. **Read from layout-manifest.json:** The OG renderer MUST read the hero section to extract typography and layout values.

2. **Parse Tailwind classes:** Extract font family, weight, letter spacing, and line height from `h1_classes` and `h2_classes`.

3. **Match hero positioning:** NOT vertically centered. Hero content is typically positioned lower (paddingTop: 200).

4. **Match hero background:** Apply same gradient overlays and asset layers from hero `layers` array.

5. **Contrast boost:** Apply +10-15% contrast increase (filter: 'contrast(1.12)') for social feed compression.

6. **Comments required:** Code must explain why OG design diverges from generic layouts and why contrast differs.

### Step 3: Create OG Image Variants

**Different templates for different page types:**

```typescript
// src/utils/og-templates.ts
export const ogTemplates = {
  default: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    titleColor: 'white',
    subtitleColor: '#94a3b8',
  },
  blog: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    titleColor: 'white',
    subtitleColor: '#bfdbfe',
    showAuthor: true,
  },
  service: {
    background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    titleColor: 'white',
    subtitleColor: '#a7f3d0',
  },
  location: {
    background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
    titleColor: 'white',
    subtitleColor: '#fed7aa',
    showLocation: true,
  }
};
```

### Step 4: Implement in SEO Component

```astro
---
// src/components/SEO.astro
const { title, description, type = 'page' } = Astro.props;

const ogImageUrl = new URL('/api/og', Astro.site);
ogImageUrl.searchParams.set('title', title);
ogImageUrl.searchParams.set('subtitle', description.slice(0, 100));
ogImageUrl.searchParams.set('type', type);
---

<meta property="og:image" content={ogImageUrl.toString()} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:image" content={ogImageUrl.toString()} />
```

### Step 5: Validate OG Images

**Validation checklist:**

```typescript
// src/utils/og-validator.ts
export async function validateOGImage(url: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      errors.push(`OG image returned ${response.status}`);
      return { valid: false, errors };
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('image')) {
      errors.push(`Invalid content type: ${contentType}`);
    }
    
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    if (contentLength > 8 * 1024 * 1024) {
      errors.push(`Image too large: ${(contentLength / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Check dimensions (would need to parse image)
    // This is a simplified check
    
  } catch (error) {
    errors.push(`Failed to fetch OG image: ${error}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Step 6: Generate OG Checklist

**og-checklist.md:**

```markdown
# OG Image Checklist

## Configuration
- [ ] @vercel/og installed
- [ ] /api/og endpoint created
- [ ] **OG renderer is hero-locked (reads from layout-manifest.json)**
- [ ] **OG typography matches hero h1_classes and h2_classes**
- [ ] **OG layout positioning matches hero (not generic centered)**
- [ ] **OG background treatment matches hero layers**
- [ ] Design tokens applied

## Pages Covered
- [ ] Homepage
- [ ] About page
- [ ] Service pages
- [ ] Blog posts
- [ ] Location pages
- [ ] Contact page

## Validation
- [ ] All images 1200x630
- [ ] All images under 8MB
- [ ] All images load correctly
- [ ] Tested with social preview tools

## Social Preview Testing
- [ ] Facebook Sharing Debugger
- [ ] Twitter Card Validator
- [ ] LinkedIn Post Inspector
```

---

## Hard Limits

- **No missing OG images** on public pages
- **No incorrect dimensions** — Must be 1200x630
- **No broken OG URLs** — Must return valid image
- **No generic OG layouts** — Must be hero-locked (read from layout-manifest.json)
- **No mismatched typography** — Must match hero h1_classes and h2_classes
- **No generic centered layouts** — Must match hero positioning (not vertically centered)

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `/api/og` endpoint | **Hero-locked** dynamic OG image generation (reads from layout-manifest.json) |
| OG images per page | Generated for all public pages (visually matching hero) |
| OG meta tags | Implemented in SEO component |
| `og-checklist.md` | Verification checklist (includes hero-locked verification) |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing OG image on public page | **FLAG** — Must fix |
| Incorrect dimensions | **STOP** — Must fix |
| OG endpoint returns error | **STOP** — Must fix |

---

## Testing Tools

| Tool | URL |
|------|-----|
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ |
| OpenGraph.xyz | https://www.opengraph.xyz/ |

---

## Success Criteria

Vercel OG Image Skill is complete when:

- [ ] `/api/og` endpoint working
- [ ] **OG renderer is hero-locked (reads from layout-manifest.json)**
- [ ] **OG typography matches hero h1_classes and h2_classes**
- [ ] **OG layout positioning matches hero (not generic centered)**
- [ ] **OG background treatment matches hero layers**
- [ ] All public pages have OG images
- [ ] Images are 1200x630
- [ ] Design tokens applied
- [ ] Meta tags implemented
- [ ] Tested with social preview tools
- [ ] `og-checklist.md` completed
