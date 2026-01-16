---
name: design-system
description: Translates visual inspiration (screenshots, Dribbble, uploads) into implementable design tokens, effect specifications, and brand assets. Use when starting a new site to establish visual direction before Builder implements.
owner: Design/Imagery Agent (Gemini)
trigger: After Site Kickoff, before Builder begins components
llm: Gemini
---

# Design System Skill

## Purpose

Convert visual inspiration into structured outputs that Builder Agent can execute. Ensures consistent visual direction across the entire site.

---

## Trigger

After Site Kickoff completes, before Builder Agent begins component work.

---

## Prerequisites

- [ ] Site Kickoff completed
- [ ] `strategy.md` from Architect (brand direction)
- [ ] User-provided inspiration (screenshots, URLs, uploads)

---

## Workflow

### Part 1: Inspiration Intake

#### Step 1: Collect Inspiration

Accept inspiration in multiple formats:

| Format | Example |
|--------|---------|
| Screenshot | Uploaded image file |
| URL | Dribbble, Behance, live site |
| Description | "Modern, minimal, tech-focused" |
| Mood board | Collection of images |

#### Step 2: Analyze Visual Patterns

Using Gemini, analyze inspiration for:

- **Colors:** Primary, secondary, accent, neutral palettes
- **Typography:** Font families, sizes, weights
- **Spacing:** Density, whitespace patterns
- **Effects:** Shadows, gradients, animations
- **Mood:** Professional, playful, minimal, bold

#### Step 3: Document Inspiration

Store in `/references/inspiration/`:

```
/references/
  /inspiration/
    - source-1.png
    - source-2.png
    - analysis.md
```

**analysis.md:**

```markdown
# Inspiration Analysis

## Sources
1. [Dribbble shot name](url) - Reason selected
2. screenshot-1.png - Reason selected

## Key Patterns Identified

### Color
- Dark mode dominant
- Blue accent (#3b82f6)
- High contrast text

### Typography
- Sans-serif headers (likely Inter or similar)
- Clean, readable body text
- Large hero text

### Layout
- Generous whitespace
- Card-based components
- Asymmetric grids

### Effects
- Subtle shadows
- Smooth hover transitions
- Gradient backgrounds
```

---

### Part 2: Design Token Output

#### Step 4: Generate design-tokens.json

```json
{
  "meta": {
    "generatedAt": "2026-01-16T00:00:00Z",
    "inspirationSources": ["dribbble-shot-1", "screenshot-1.png"],
    "theme": "dark"
  },
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      "950": "#172554"
    },
    "secondary": {
      "50": "#f8fafc",
      "100": "#f1f5f9",
      "200": "#e2e8f0",
      "300": "#cbd5e1",
      "400": "#94a3b8",
      "500": "#64748b",
      "600": "#475569",
      "700": "#334155",
      "800": "#1e293b",
      "900": "#0f172a",
      "950": "#020617"
    },
    "accent": {
      "500": "#10b981",
      "600": "#059669"
    },
    "semantic": {
      "success": "#22c55e",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    },
    "background": {
      "primary": "#0f172a",
      "secondary": "#1e293b",
      "tertiary": "#334155"
    },
    "text": {
      "primary": "#f8fafc",
      "secondary": "#94a3b8",
      "muted": "#64748b"
    }
  },
  "typography": {
    "fontFamilies": {
      "heading": "'Inter', sans-serif",
      "body": "'Inter', sans-serif",
      "mono": "'JetBrains Mono', monospace"
    },
    "fontSizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem"
    },
    "fontWeights": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeights": {
      "none": 1,
      "tight": 1.25,
      "snug": 1.375,
      "normal": 1.5,
      "relaxed": 1.625,
      "loose": 2
    },
    "letterSpacing": {
      "tighter": "-0.05em",
      "tight": "-0.025em",
      "normal": "0em",
      "wide": "0.025em",
      "wider": "0.05em"
    }
  },
  "spacing": {
    "base": "4px",
    "scale": {
      "0": "0",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem"
    }
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "base": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "base": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"
  },
  "transitions": {
    "fast": "150ms ease",
    "base": "200ms ease",
    "slow": "300ms ease",
    "slower": "500ms ease"
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }
}
```

#### Step 5: Generate effects.md

```markdown
# Effects Specification

## Animation Library Recommendation

**Recommended:** CSS-only with Astro View Transitions

**Rationale:** Simple site with standard interactions. No need for heavy animation libraries.

---

## Global Transitions

### Page Transitions
- Type: Fade
- Duration: 200ms
- Easing: ease-out

### Hover States
- Duration: 150ms
- Easing: ease

---

## Component Effects

### Buttons
```css
.button {
  transition: all 150ms ease;
}
.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.button:active {
  transform: translateY(0);
}
```

### Cards
```css
.card {
  transition: all 200ms ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Links
```css
.link {
  transition: color 150ms ease;
}
.link:hover {
  color: var(--color-primary-400);
}
```

### Form Inputs
```css
.input {
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-500 / 0.1);
}
```

---

## Scroll Behaviors

### Smooth Scroll
```css
html {
  scroll-behavior: smooth;
}
```

### Scroll Reveal (if needed)
- Trigger: When element enters viewport
- Animation: Fade up
- Duration: 400ms
- Stagger: 100ms between elements

---

## Loading States

### Skeleton
- Background: var(--color-background-tertiary)
- Animation: Shimmer (subtle pulse)
- Duration: 1.5s infinite

### Spinner
- Size: 20px
- Border: 2px
- Color: var(--color-primary-500)
- Animation: Rotate 360deg 0.8s linear infinite

---

## Special Effects

### Hero Section
- Background: Gradient overlay on image
- Optional: Subtle parallax on scroll

### CTAs
- Primary: Solid with hover lift
- Secondary: Outline with fill on hover

### Testimonials
- Card style with quote marks
- Optional: Subtle rotation on hover
```

---

### Part 3: Logo Intake

#### Step 6: Collect Logo Files

**Logo Requirements:**
- SVG format preferred for scalability
- If only PNG exists: convert via [Vectorizer.ai](https://vectorizer.ai)

**Required Variants:**

| Variant | Description | Use Case |
|---------|-------------|----------|
| Full logo | Complete logo with wordmark | Header, footer, OG images |
| Icon-only | Logomark/symbol only | Favicon base, mobile nav, app icon |
| Light version | For dark backgrounds | Dark mode, dark sections |
| Dark version | For light backgrounds | Light mode, light sections |

**Intake Process:**

1. User uploads logo files
2. Check if SVG is available
   - If yes: proceed with SVG
   - If no: convert PNG via Vectorizer.ai
3. Collect all four variants
4. Verify quality and scalability

**Store in `/public/logos/`:**

```
/public/logos/
  - logo-full.svg
  - logo-icon.svg
  - logo-full-light.svg
  - logo-full-dark.svg
  - logo-icon-light.svg
  - logo-icon-dark.svg
```

#### Step 7: Reference Logos in Design Tokens

Add logo paths to `design-tokens.json`:

```json
{
  "logos": {
    "full": {
      "default": "/logos/logo-full.svg",
      "light": "/logos/logo-full-light.svg",
      "dark": "/logos/logo-full-dark.svg"
    },
    "icon": {
      "default": "/logos/logo-icon.svg",
      "light": "/logos/logo-icon-light.svg",
      "dark": "/logos/logo-icon-dark.svg"
    }
  }
}
```

---

### Part 4: Brand Assets

#### Step 8: Generate Favicon

Create favicon in multiple sizes:

| Size | Use |
|------|-----|
| 16x16 | Browser tab |
| 32x32 | Browser tab (retina) |
| 180x180 | Apple touch icon |
| 192x192 | Android Chrome |
| 512x512 | PWA splash |

**Source:** Use the icon-only logo variant as the base for favicon generation.

Store in `/public/`:

```
/public/
  - favicon.ico
  - favicon-16x16.png
  - favicon-32x32.png
  - apple-touch-icon.png
  - android-chrome-192x192.png
  - android-chrome-512x512.png
  - site.webmanifest
```

**site.webmanifest:**

```json
{
  "name": "Site Name",
  "short_name": "Site",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0f172a",
  "background_color": "#0f172a",
  "display": "standalone"
}
```

#### Step 9: Generate CSS Variables

```css
/* src/styles/tokens.css */
:root {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* ... all color tokens */
  
  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  /* ... all typography tokens */
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  /* ... all spacing tokens */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  /* ... all shadow tokens */
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
}
```

---

## Hard Limits

- **No implementation** — Builder Agent does that
- **No inventing styles** without inspiration input
- **Tokens must be complete** before Builder starts components
- **Accessibility** — Color contrast must meet WCAG 2.1 AA (4.5:1)
- **Logo files required before build** — SVG preferred, convert PNG via Vectorizer.ai if needed

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `design-tokens.json` | Complete design system |
| `effects.md` | Animation and effect specs |
| `/references/inspiration/` | Stored inspiration sources |
| Logo files in `/public/logos/` | SVG + all variants (full, icon, light, dark) |
| Favicon set | All required sizes |
| App icons | PWA manifest icons |
| `tokens.css` | CSS variables |

---

## Success Criteria

Design System Skill is complete when:

- [ ] Inspiration collected and analyzed
- [ ] Logo files collected (SVG + all variants)
- [ ] Logos stored in `/public/logos/`
- [ ] Logo paths added to `design-tokens.json`
- [ ] `design-tokens.json` is comprehensive
- [ ] `effects.md` specifies all interactions
- [ ] Color contrast meets accessibility standards
- [ ] Favicon in all required sizes (generated from logo icon)
- [ ] App icons for PWA
- [ ] CSS variables generated
- [ ] Builder Agent can implement without questions
