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

### Step 1: Receive Design Direction

From Design Agent's `effects.md`:

```markdown
## OG Image Style

- Background: Gradient using primary colors
- Title: Large, bold, centered
- Subtitle: Smaller, below title
- Logo: Bottom right corner
- Pattern: Subtle geometric overlay
```

### Step 2: Create OG Image Endpoint

**Using @vercel/og:**

```typescript
// src/pages/api/og.ts
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Default Title';
  const subtitle = url.searchParams.get('subtitle') || '';
  const type = url.searchParams.get('type') || 'page';
  
  // Load fonts (optional)
  const fontData = await fetch(
    new URL('/fonts/Inter-Bold.ttf', request.url)
  ).then(res => res.arrayBuffer());
  
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        },
        children: [
          // Logo
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 40,
                left: 40,
                display: 'flex',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: 'https://yoursite.com/logo-white.png',
                    width: 150,
                    height: 40,
                  }
                }
              ]
            }
          },
          // Title
          {
            type: 'div',
            props: {
              style: {
                fontSize: 64,
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                maxWidth: '80%',
                lineHeight: 1.2,
              },
              children: title
            }
          },
          // Subtitle
          subtitle && {
            type: 'div',
            props: {
              style: {
                fontSize: 32,
                color: '#94a3b8',
                marginTop: 20,
                textAlign: 'center',
                maxWidth: '70%',
              },
              children: subtitle
            }
          },
          // Type badge
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 40,
                right: 40,
                fontSize: 24,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              },
              children: type
            }
          }
        ].filter(Boolean)
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
        }
      ]
    }
  );
};
```

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

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `/api/og` endpoint | Dynamic OG image generation |
| OG images per page | Generated for all public pages |
| OG meta tags | Implemented in SEO component |
| `og-checklist.md` | Verification checklist |

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
- [ ] All public pages have OG images
- [ ] Images are 1200x630
- [ ] Design tokens applied
- [ ] Meta tags implemented
- [ ] Tested with social preview tools
- [ ] `og-checklist.md` completed
