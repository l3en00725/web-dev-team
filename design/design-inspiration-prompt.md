# Design Inspiration Prompt

**For use with: Gemini (OUTSIDE Cursor)**

**Phase:** 3A — Design Inspiration Review

---

## The Canonical Gemini Prompt

Copy and paste this prompt into Gemini when analyzing design inspiration:

```
You are a design analysis engine.

I will provide:
- A screen recording OR screenshots of a website
- This site is for visual inspiration ONLY

Your task:
Analyze the design and interaction patterns and output DESIGN INTELLIGENCE — not code.

DO NOT:
- Write HTML, CSS, JS, or framework-specific code
- Suggest libraries or tools
- Invent new features not visible in the recording

FOCUS ON:

1. VISUAL LANGUAGE
- Overall aesthetic (minimal, playful, editorial, cinematic, illustrated, etc.)
- Use of color (muted vs saturated, contrast strategy)
- Typography feel (rounded, sharp, expressive, restrained)
- Illustration or imagery style (if applicable)

2. SPATIAL & LAYOUT PATTERNS
- Section structure (full-bleed, contained, overlapping, stacked)
- Use of negative space
- Rhythm and pacing between sections
- How content is framed on scroll

3. SCROLL & MOTION BEHAVIOR
- Parallax usage (if any)
- Sticky sections or pinned content
- Reveal patterns (fade, slide, scale, stagger)
- Ambient motion (subtle loops, background movement)

4. INTERACTION FEEL
- Button and hover behavior
- Card interactions
- Whether motion feels playful, refined, heavy, or restrained

5. WHAT MAKES IT FEEL "HIGH-END"
- 3–5 specific reasons this site feels premium or polished

OUTPUT FORMAT:

## Design Summary
(1–2 paragraphs)

## Key Visual Principles
(bulleted list)

## Layout & Scroll Patterns
(bulleted list)

## Motion & Interaction Principles
(bulleted list)

## Notes for a Builder
(clear descriptive guidance, no code)

This output will be used to CREATE design rules later.
```

---

## Phase Completion Prompt (Back to Orchestrator)

After Gemini responds with the design analysis, paste this back into **Claude (Orchestrator)**:

```
Phase 3A (Design Inspiration Review) is COMPLETE.

I have reviewed Gemini's design analysis and approve it as inspiration.

Next step requested:
Design Codification.

Your task:
- Tell me which files need to be created or updated
- Tell me which LLM should perform that work
- Provide the EXACT prompt to use
- Confirm that this phase is DOCUMENTATION ONLY (no code)

Do not proceed without my confirmation.
```

**Why this matters:**
- You explicitly approve taste before codification
- You force the orchestrator to slow down
- You prevent the "oops I built everything" problem

---

## Design Codification Prompt (Claude — Documentation Mode)

The orchestrator will provide this prompt. Paste it into **Claude** to translate design inspiration into documented rules:

```
Enter DESIGN CODIFICATION MODE.

Context:
- Design tokens exist
- Gemini design analysis is approved
- This phase is DOCUMENTATION ONLY

Your task:
Translate the approved design inspiration into clear, reusable design guidance.

Create or update documentation files such as:
- Visual principles
- Motion principles
- Layout and spacing patterns
- Component behavior rules

Rules:
- DO NOT write or modify production code
- DO NOT create components
- DO NOT assume illustration unless explicitly stated
- Keep guidance descriptive and implementation-agnostic

Output:
Clear design rules that a Builder can follow without interpretation.

Wait for my confirmation before advancing.
```

**Why this matters:**
- Separates taste interpretation from execution
- Creates a paper trail of design decisions
- Builder gets unambiguous guidance

---

## Builder Handoff Prompt (Cursor Auto)

Only after codification is approved, paste this into **Cursor**:

```
You are the Builder Agent.

Context:
- Design tokens are finalized
- Design guidance files are approved
- This project follows the Web Dev Hub rules

Your task:
Implement the site strictly according to:
- Design tokens
- Codified design rules
- Site structure and taxonomy

Rules:
- Do NOT invent new visual styles
- Do NOT deviate from documented patterns
- Ask for clarification if guidance is missing
- Optimize for performance and accessibility

Begin with the highest-priority page only.
```

**Why this matters:**
- Builder knows to follow rules, not invent
- Reduces "averaging out" of strong direction
- Forces asking questions instead of guessing

---

## When to Use This Prompt

Use this phase for ANY site where visual quality matters:
- ✅ Minimalist/editorial sites
- ✅ Motion-heavy sites
- ✅ Illustration-focused sites
- ✅ Cinematic sites
- ✅ E-commerce with strong visual identity
- ✅ Portfolio/agency sites

This is **NOT** just for illustrated sites.

---

## How to Use

1. **Visit Awwwards** (or Dribbble, Behance, etc.)
2. **Find 2-3 sites** that match the vibe you want
3. **Capture screenshots OR screen recording** showing:
   - Homepage
   - Key sections
   - Typography in context
   - Motion/scroll behavior (if recording)
   - Color usage
4. **Open Gemini in a separate conversation** (NOT inside Cursor)
5. **Upload your screenshots/video**
6. **Paste the prompt above**
7. **Review Gemini's output** for quality and clarity
8. **Save output as `design-analysis.md`** in your project root

---

## What This Produces

Gemini will return **descriptive design intelligence**, not code:

- "Typography uses a large display serif for headlines (80-120px) with tight tracking (-0.02em), paired with a neutral sans-serif for body (16-18px, 1.6 line-height)"
- "Layout follows a 12-column grid with asymmetric content placement — hero text occupies columns 1-7, leaving white space on the right"
- "Motion is subtle — parallax on scroll at 0.3x speed, fade-in transitions at 200ms ease-out"
- "Color palette is monochromatic with a single accent color used sparingly for CTAs"

**This is NOT executable code. It is design direction.**

---

## Critical Rules

1. **Gemini ONLY analyzes design** — it does NOT build
2. **This output must be reviewed** before Builder uses it
3. **If illustration is needed**, rules will emerge from this analysis
4. **Motion, layout, minimalism** are equally valid outputs
5. **Save the output** — Builder will reference it during implementation

---

## Example Output Structure

```markdown
# Design Analysis: [Site Name]

## Overall Style
Modern editorial with cinematic hero sections and restrained animation.

## Layout Philosophy
- 12-column grid, asymmetric compositions
- Generous white space (min 80px vertical rhythm)
- Full-bleed imagery with text overlays
- Sticky navigation with blur backdrop

## Typography Hierarchy
- Display: 96px/1.1, tight tracking, bold
- Heading: 48px/1.2, medium weight
- Body: 18px/1.6, regular weight
- Small: 14px/1.5, regular weight

## Color Strategy
- Base: True black (#000) and off-white (#FAFAFA)
- Accent: Electric blue (#0066FF) for CTAs only
- Avoid: Mid-tones, gradients

## Motion & Scroll
- Parallax on hero images (0.4x scroll speed)
- Fade-in on scroll (threshold: 20% viewport)
- Smooth scroll enabled (CSS scroll-behavior)
- Hover states: scale(1.02) + shadow increase

## Section Composition
- Hero: Full viewport height, centered text, video background
- Features: 3-column grid, icon + headline + description
- Testimonials: Horizontal scroll cards, 400px width each
- Footer: Minimal, single column, links only

## Anti-Patterns
- Avoid: Overuse of animation (max 2 simultaneous)
- Avoid: Too many font weights (stick to 2-3)
- Avoid: Centered body text (left-align for readability)
```

---

## Integration with Builder

Once design analysis is complete:

1. Builder reads `design-analysis.md`
2. Builder translates descriptions into `design-tokens.json`
3. Builder implements motion rules in CSS/JS
4. Builder follows composition patterns when building sections

**Builder does NOT invent design intent.**  
**Builder executes what was analyzed.**

---

## FAQ

**Q: Do I need to do this for every project?**  
A: Optional but STRONGLY recommended for any design-forward site.

**Q: Can I skip this for simple sites?**  
A: Yes. If visual quality doesn't matter, skip this phase.

**Q: Can I use AI-generated inspiration?**  
A: No. Use real, high-quality sites from Awwwards, Dribbble, etc.

**Q: What if I want illustration?**  
A: Find Awwwards sites with illustration styles you like. Gemini will extract rules.

**Q: Can I run this in Cursor?**  
A: No. Use Gemini in a separate browser conversation. Cursor is for execution, not analysis.

**Q: What if Gemini's output is too vague?**  
A: Re-prompt with "Be more specific — include exact measurements, timing values, and concrete examples."

---

## Version History

- **v1.0** — 2026-01-17 — Initial canonical prompt
