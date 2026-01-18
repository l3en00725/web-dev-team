# LLM Role Clarification

This document clarifies which LLM is used for what, and why.

---

## Overview

The Web Dev Hub uses a **human-in-the-loop orchestration** model with **specialized LLMs for specific tasks**.

Each LLM has a defined role. **They do NOT overlap. They do NOT auto-run.**

The user manually invokes each LLM based on Orchestrator guidance.

---

## Gemini — Design Interpretation Only

**Used for:**
- Design inspiration analysis (Phase 3A)
- Extracting visual patterns from Awwwards/Dribbble
- Describing design systems in natural language
- Analyzing motion, layout, typography, color from screenshots/video

**NEVER used for:**
- Building layouts
- Writing code
- Modifying repo files
- Implementing components
- Running inside Cursor for execution tasks

**Why Gemini:**
- Excellent at visual analysis
- Strong at describing design intent
- Good at pattern recognition from images/video
- Native multimodal capabilities (image + text)

**Critical rule:**
Gemini is run **OUTSIDE Cursor** in a separate browser conversation.

Gemini output is **descriptive, not executable**.

---

## Cursor Auto (GPT-5 / GPT-4.1) — Execution Only

**Used for:**
- Repo restructuring
- Translating design rules into markdown contracts
- Implementing layouts and motion
- Building components with placeholders when assets don't exist
- Writing code based on written rules

**NEVER used for:**
- Inventing design intent
- "Averaging out" strong direction
- Making visual design decisions
- Ignoring written design rules

**Why Cursor Auto:**
- Fast code generation
- Excellent at following written rules
- Strong at repo-level changes
- Native integration with Cursor IDE

**Critical rule:**
Cursor must **follow written rules** from Gemini's analysis.

Cursor does NOT invent taste. It executes taste.

---

## Claude (Opus/Sonnet) — Strategy & Content

**Used for:**
- Orchestrator (tracking phases, routing prompts)
- Architect Agent (strategy, structure, constraints)
- Content Agent (SEO copy, metadata, page content)
- Admin/QA Agent (verification, deployment approval)

**NEVER used for:**
- Visual design interpretation
- Building layouts (unless specifically needed for admin/QA tasks)

**Why Claude:**
- Superior reasoning for strategy and planning
- Excellent at long-form content writing
- Strong at SEO optimization
- Good at enforcing quality gates

---

## The Division of Labor (Canonical)

> **Gemini interprets taste.**  
> **Cursor executes taste.**  
> **The orchestrator keeps everyone honest.**

### Gemini's Job
1. User shows Gemini a beautiful site
2. Gemini describes what makes it beautiful
3. User saves that description

### Cursor's Job
1. User pastes description into Cursor project
2. Cursor translates description into code
3. Cursor builds with placeholders when assets don't exist

### Orchestrator's Job
1. Track which phase we're in
2. Tell user which LLM to use next
3. Provide the exact prompt
4. Wait for confirmation
5. Enforce gates before advancing

---

## Anti-Patterns to Avoid

❌ **Using Gemini in Cursor to build**
- Gemini should NOT touch repo files
- Gemini should NOT write implementation code

❌ **Using Cursor for design interpretation**
- Cursor should NOT analyze screenshots
- Cursor should NOT invent visual direction

❌ **Auto-running LLMs**
- No LLM should trigger another LLM
- User must manually paste prompts

❌ **Skipping the design analysis step**
- Don't ask Cursor to "make it look good"
- Define "good" via Gemini analysis first

---

## When Illustration is Needed

If the design analysis identifies illustration as part of the visual style:

1. **Gemini analyzes** the illustration style from inspiration
2. **Gemini describes** the rules (line weight, color palette, composition, subject matter)
3. **User reviews** and saves as part of `design-analysis.md`
4. **Cursor implements** based on those rules (or coordinates with an illustration generation tool)

**Illustration is a possible outcome, not a default.**

The system doesn't assume illustration. It discovers if illustration is needed through analysis.

---

## Workflow Integration

### Phase 1-2: Orchestrator (Claude)
- Tracks kickoff and architecture phases
- Routes to Architect Agent (Claude)

### Phase 3: Design Tokens (Gemini in Cursor)
- Creates design-tokens.json
- Sets up base system

### Phase 3A: Design Inspiration Review (Gemini OUTSIDE Cursor)
- Analyzes screenshots/video
- Returns design intelligence
- User saves as design-analysis.md

### Phase 4-5: Build (Cursor Auto)
- Reads design-analysis.md
- Translates into implementation
- Builds components and layouts

### Phase 6-7: Content (Claude)
- Writes copy, metadata, SEO content

### Phase 8-9: QA (Claude)
- Verifies quality gates
- Approves deployment

---

## Quick Reference

| LLM | Use Case | Location | Output Type |
|-----|----------|----------|-------------|
| **Gemini** | Design analysis | Outside Cursor | Descriptive text |
| **Cursor Auto** | Implementation | Inside Cursor | Code |
| **Claude** | Strategy & routing | Inside/Outside Cursor | Strategy docs + routing |

---

## Why This Matters

**Without clear LLM roles:**
- Cursor invents design direction (bad)
- Gemini writes code that doesn't integrate (bad)
- No one knows who's responsible for what (bad)

**With clear LLM roles:**
- Design intent is explicit before build
- Implementation follows written rules
- Quality is predictable
- Nothing is left to "AI taste"

---

## Version History

- **v1.0** — 2026-01-17 — Initial LLM role clarification
