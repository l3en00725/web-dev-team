---
name: design-system
description: Extracts design systems from video references using the external Design Director Gem. Outputs layout-manifest.json (structure) and design-tokens.json (variables) for Builder to execute.
owner: Design Director Gem (External)
trigger: After Content Headlines, before Builder begins
llm: Gemini (Web Interface)
---

# Design System Skill (External Workflow)

## Purpose

Extract high-fidelity design systems from video references. This skill runs **externally** in the Gemini Web Interface using the Design Director Gem, not inside Cursor.

---

## CRITICAL: This is an External Workflow

> **The Design Director Gem runs in the Gemini Web Interface, NOT in Cursor.**
> 
> You will leave Cursor, go to Gemini, extract the design, and bring the outputs back.

---

## Dual Output Requirement

The Gem outputs **TWO critical files**:

| File | Purpose | Location |
|------|---------|----------|
| `layout-manifest.json` | **Structure** — Sections, layers, z-index, Tailwind classes | `src/data/layout-manifest.json` |
| `design-tokens.json` | **Variables** — Colors, typography, spacing, animations | `src/data/design-tokens.json` |

**Both files must be copied back to the repo before Builder can proceed.**

---

## Trigger

After Content Phase 1 (Headlines) completes, before Builder begins.

**Why this order?** High-quality design is "content-led." The Gem needs the exact headlines to create layouts that fit the content. Generic layouts happen when design precedes content.

---

## Prerequisites

- [ ] Site Kickoff completed
- [ ] `strategy.md` from Architect (brand direction)
- [ ] `site-structure.json` from Architect (page hierarchy)
- [ ] `anchor-copy.md` from Content Phase 1 (headlines, CTAs)

---

## Workflow

### Step 1: Find Inspiration

- [ ] Go to [Awwwards](https://www.awwwards.com/) to find a reference site
- [ ] Browse Sites of the Day, Nominees, or Collections for inspiration
- [ ] Pick a site that matches your desired vibe/aesthetic

### Step 2: Record Video

- [ ] Open the reference site in your browser
- [ ] Record a 30-60 second screen capture showing:
  - Hero section and initial viewport
  - Scrolling behavior and animations
  - Hover interactions on buttons/cards
  - Key page sections
- [ ] Save the video file

### Step 3: Prepare Other Inputs

- [ ] **Anchor Copy:** Have `anchor-copy.md` content ready (H1, H2, CTAs from Content Phase 1)
- [ ] **Project Context:** Have `project-profile.json` context ready (site type, brand direction)

### Step 4: Open Design Director Gem

- [ ] Go to [Gemini Web Interface](https://gemini.google.com)
- [ ] Open the **"Design Director (Web Dev Team)"** Gem

### Step 5: Upload & Extract

Upload the reference video, then use this prompt:

```
Extract the design system for this content based on the video.

ANCHOR COPY:
[Paste contents of anchor-copy.md here]

PROJECT CONTEXT:
Site Type: [from project-profile.json]
Brand Direction: [from strategy.md]
Primary Goal: [from project-profile.json]

OUTPUT:
1. layout-manifest.json — Full structure with sections, layers, z-index, Tailwind classes
2. design-tokens.json — Colors, typography, spacing, animations
3. Asset prompts — Descriptions for any background images needed

Match the schema in templates/layout-manifest.json.
```

### Step 6: Copy Outputs Back to Cursor

After the Gem responds:

1. **Create `src/data/layout-manifest.json`**
   - Copy the layout manifest JSON from the Gem's response
   - Paste into `src/data/layout-manifest.json`
   - Verify JSON is valid (no syntax errors)

2. **Create `src/data/design-tokens.json`**
   - Copy the design tokens JSON from the Gem's response
   - Paste into `src/data/design-tokens.json`
   - Verify JSON is valid

3. **Generate/Download Assets**
   - Review `asset_prompts` in the manifest
   - Generate images using the prompts (in Gemini or other tool)
   - Download to `/public/assets/`

### Step 7: Verify Before Proceeding

- [ ] `src/data/layout-manifest.json` exists and is valid JSON
- [ ] `src/data/design-tokens.json` exists and is valid JSON
- [ ] All assets referenced in manifest exist in `/public/assets/`
- [ ] Asset filenames match exactly what's in the manifest

---

## What the Gem Extracts

### From Video Analysis

| Category | What's Extracted |
|----------|------------------|
| DOM Structure | Section hierarchy, container nesting |
| Z-Index Layering | Background layers, content layers, overlays |
| Motion Physics | Animation timing, easing, scroll behaviors |
| Tailwind Classes | Exact utility classes for each element |
| Color Palette | Hex values mapped to semantic names |
| Typography | Font families, sizes, weights, line heights |
| Spacing Patterns | Padding, margins, gaps |

### Output: layout-manifest.json

```json
{
  "meta": { "generatedAt": "", "referenceVideo": "", "siteType": "" },
  "design_dna": { "vibe": "", "font_recommendations": "" },
  "tailwind_config": {
    "extend": {
      "colors": {},
      "backgroundImage": {},
      "animation": {},
      "keyframes": {}
    }
  },
  "sections": [
    {
      "id": "hero",
      "type": "immersive_viewport",
      "height": "h-screen",
      "layout_engine": "absolute-layering",
      "layers": [
        { "z": 0, "type": "asset", "src": "hero-bg.webp", "classes": "..." },
        { "z": 10, "type": "content", "classes": "..." }
      ],
      "content": {
        "h1_classes": "text-8xl font-bold",
        "cta_classes": "rounded-full bg-white px-8 py-4"
      }
    }
  ],
  "asset_prompts": []
}
```

### Output: design-tokens.json

Standard design tokens including:
- Colors (primary, secondary, accent, semantic)
- Typography (families, sizes, weights, line heights)
- Spacing scale
- Border radius
- Shadows
- Transitions
- Breakpoints

See `templates/design-tokens.json` for full schema.

---

## Logo Intake (Still Required)

Logos are still collected during this phase:

**Logo Requirements:**
- SVG format preferred for scalability
- If only PNG exists: convert via SVGcode (https://svgco.de) — free, runs in browser

**Required Variants:**

| Variant | Description | Use Case |
|---------|-------------|----------|
| Full logo | Complete logo with wordmark | Header, footer, OG images |
| Icon-only | Logomark/symbol only | Favicon base, mobile nav, app icon |
| Light version | For dark backgrounds | Dark mode, dark sections |
| Dark version | For light backgrounds | Light mode, light sections |

**Store in `/public/logos/`**

---

## Favicon Generation

Create favicon in multiple sizes from the icon-only logo:

| Size | Use |
|------|-----|
| 16x16 | Browser tab |
| 32x32 | Browser tab (retina) |
| 180x180 | Apple touch icon |
| 192x192 | Android Chrome |
| 512x512 | PWA splash |

Store in `/public/`

---

## Hard Limits

- **External workflow only** — Gem runs in Gemini Web Interface, not Cursor
- **Dual output required** — Both `layout-manifest.json` AND `design-tokens.json`
- **Content-first** — Headlines must exist before design extraction
- **Assets must be verified** — All referenced assets must exist before Builder starts
- **Accessibility** — Color contrast must meet WCAG 2.1 AA (4.5:1)

---

## Required Outputs

| Output | Location | Description |
|--------|----------|-------------|
| `layout-manifest.json` | `src/data/` | Page structure, layers, Tailwind classes |
| `design-tokens.json` | `src/data/` | Colors, typography, spacing |
| Assets | `/public/assets/` | Background images, textures |
| Logo files | `/public/logos/` | SVG + all variants |
| Favicon set | `/public/` | All required sizes |
| App icons | `/public/` | PWA manifest icons |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Gem outputs invalid JSON | Ask Gem to "fix the JSON syntax and output valid JSON only" |
| Missing sections in manifest | Ask Gem to "add the [section name] section with layers and classes" |
| Unclear layer structure | Ask Gem to "clarify the z-index layering for the hero section" |
| Wrong Tailwind classes | Ask Gem to "use standard Tailwind v3 utility classes" |
| Assets not generated | Use the `asset_prompts` to generate images manually |

---

## Success Criteria

Design System Skill is complete when:

- [ ] `src/data/layout-manifest.json` exists and is valid
- [ ] `src/data/design-tokens.json` exists and is valid
- [ ] All assets referenced in manifest exist in `/public/assets/`
- [ ] Logo files collected (SVG + all variants) in `/public/logos/`
- [ ] Favicon in all required sizes
- [ ] App icons for PWA
- [ ] Color contrast meets accessibility standards
- [ ] Builder Agent can implement without questions
