---
name: og-image-static
description: Creates Open Graph images for social sharing using a static image approach. User screenshots the hero section and resizes to 1200x630.
owner: Builder Agent (implements), User (creates image)
trigger: During build — required for all public pages
llm: Cursor Auto (Builder)
framework: Astro
---

# OG Image (Static) Skill

## Purpose

Simple static OG image generation for consistent social previews. User creates a screenshot of the homepage hero section, resizes it to 1200x630, and saves it as `og-image.png`.

---

## Trigger

During build — required for all public pages.

---

## Prerequisites

- [ ] Homepage hero section is complete and visually finalized
- [ ] User has access to screenshot tools
- [ ] User has access to image editing tools (for resizing)

---

## Sizing Requirements

| Property | Value |
|----------|-------|
| Width | 1200px |
| Height | 630px |
| Format | PNG (recommended) or JPEG |
| File name | `og-image.png` |
| Location | `public/og-image.png` |

---

## Workflow

### Step 1: User Creates OG Image

**Instructions for User:**

1. **Screenshot the homepage hero section:**
   - Navigate to the homepage in your browser
   - Take a full screenshot of the hero section (the main viewport area)
   - Ensure the hero content (headline, subtitle, CTA) is visible and well-composed

2. **Resize the screenshot to 1200x630:**
   - Open the screenshot in an image editor (Photoshop, GIMP, Preview, online tools, etc.)
   - Resize/crop the image to exactly **1200 pixels wide × 630 pixels tall**
   - Maintain aspect ratio and center the hero content
   - Ensure text is readable and not cut off

3. **Save as `og-image.png`:**
   - Save the resized image as `og-image.png`
   - Place it in the `public/` directory of your project
   - Final path: `public/og-image.png`

**Tips:**
- If the hero is taller than 630px, crop from the top/bottom to focus on the main content
- If the hero is wider than 1200px, center the content and crop the sides
- Ensure good contrast and readability (social feeds may compress images slightly)
- The image should represent your brand and homepage hero accurately

### Step 2: Implement OG Meta Tags

**Builder Agent Implementation:**

```astro
---
// src/components/SEO.astro
const { title, description, type = 'page' } = Astro.props;

// Use static OG image from public directory
const ogImageUrl = new URL('/og-image.png', Astro.site);
---

<meta property="og:image" content={ogImageUrl.toString()} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={type} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content={ogImageUrl.toString()} />
```

**Key Points:**
- All pages use the same `og-image.png` from `public/og-image.png`
- OG image URL is absolute (uses `Astro.site`)
- Meta tags include required OG properties
- Twitter Card meta tags included

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `public/og-image.png` | Static OG image (1200x630) created by user |
| OG meta tags | Implemented in SEO component (points to `/og-image.png`) |
| `og-checklist.md` | Verification checklist |

---

## Verification Checklist

**User Task:**
- [ ] Screenshot of homepage hero taken
- [ ] Image resized to exactly 1200x630
- [ ] Image saved as `og-image.png` in `public/` directory
- [ ] Image quality is good (readable text, good contrast)

**Builder Agent Task:**
- [ ] `public/og-image.png` exists
- [ ] OG meta tags present on all public pages
- [ ] OG image URL points to `/og-image.png`
- [ ] OG image dimensions are 1200x630 (verify in meta tags)
- [ ] Twitter Card meta tags present
- [ ] OG image URL is absolute (uses `Astro.site`)

---

## Hard Limits

- **No missing OG images** — `public/og-image.png` must exist
- **No incorrect dimensions** — Must be exactly 1200x630
- **No broken OG URLs** — Image must be accessible at `/og-image.png`
- **No missing meta tags** — All public pages must have OG meta tags

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing `og-image.png` file | **STOP** — User must create image |
| Incorrect dimensions | **STOP** — User must resize to 1200x630 |
| OG image not accessible | **STOP** — Check file path and permissions |
| Missing OG meta tags | **STOP** — Builder must add meta tags |

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

OG Image Skill is complete when:

- [ ] `public/og-image.png` exists (1200x630)
- [ ] OG meta tags implemented in SEO component
- [ ] OG image URL is accessible (`/og-image.png`)
- [ ] All public pages have OG meta tags
- [ ] Tested with social preview tools
- [ ] `og-checklist.md` completed

---

## Notes

**Why Static Images:**
- Simpler implementation (no API endpoints, no dependencies)
- Faster page loads (no dynamic image generation)
- Easier to maintain (single image file)
- User has full control over the visual design

**Limitations:**
- All pages use the same OG image (not page-specific)
- Requires manual update if hero design changes
- User must have image editing tools

**Future Enhancement:**
If page-specific OG images are needed later, this can be extended to support multiple static images or a dynamic approach.
