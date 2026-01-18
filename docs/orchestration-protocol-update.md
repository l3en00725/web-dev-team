# Update Summary — Orchestration Protocol v1.0

**Date:** 2026-01-17  
**Status:** Complete

---

## What Changed

### 1. ✅ README Updated (Top of File)

Added new top section: **Web Dev Hub — Orchestrated Build Protocol**

**Key additions:**
- Explains human-in-the-loop orchestration model
- Clarifies that nothing auto-runs across LLMs
- Provides exact orchestrator startup prompt
- Defines the division of labor: "Gemini interprets taste, Cursor executes taste, Orchestrator keeps everyone honest"
- Added "How to Start" section with canonical prompt
- Updated agent table to include Orchestrator
- Updated folder structure to show /design/ and /docs/
- Updated workflow to reference Phase 3A

### 2. ✅ Phase 3A — Design Inspiration Review Formalized

**Location:** `/workflows/new-site-workflow.md`

**What it does:**
- Documents optional-but-recommended design analysis phase
- Applies to ANY site where visual quality matters (not just illustrated sites)
- May produce: illustration rules, motion rules, layout philosophy, or minimalist guidance
- Explicitly requires Gemini OUTSIDE Cursor
- Produces descriptive design intelligence, NOT code

**Process:**
1. User visits Awwwards
2. User captures screenshots/video
3. User opens Gemini separately
4. User pastes design inspiration prompt
5. Gemini analyzes and returns design rules
6. User reviews and saves as `design-analysis.md`

### 3. ✅ Canonical Gemini Prompt Created

**Location:** `/design/design-inspiration-prompt.md`

**Contains:**
- The exact prompt to paste into Gemini
- When to use this phase (any design-forward site)
- How to use it (step-by-step process)
- What it produces (descriptive analysis, not code)
- Example output structure
- Integration guidance for Builder
- FAQ section

**The prompt:**
```
You are a design analyst.

I will upload screenshots or a screen recording from a high-quality website (e.g. Awwwards).

Your task:
- Analyze visual design, layout, and motion
- Extract reusable design principles
- Do NOT write code
- Do NOT simplify

Output:
1. Overall design style
2. Layout & spacing philosophy
3. Typography hierarchy
4. Color usage strategy
5. Motion & scroll behavior
6. Section composition patterns
7. Anti-patterns (what to avoid)

Be specific and opinionated.
Assume this output will become design rules.
```

### 4. ✅ Orchestrator.md Updated

**Location:** `/agents/orchestrator.md`

**Changes:**
- Explicitly defined as a **prompt router**, not an executor
- Added clear list of what orchestrator does NOT do
- Added Phase 3A to workflow phases table
- Expanded gate enforcement section with example
- Added example phase transition showing exact format
- Updated hard rules to emphasize waiting for user confirmation
- Clarified that orchestrator never auto-runs other agents

**Key addition:** Example of how orchestrator provides prompts:
- Checks gates
- Tells user which LLM to switch to
- Provides exact prompt in code block
- Waits for confirmation

### 5. ✅ LLM Role Clarification Document

**Location:** `/docs/llm-roles.md`

**Sections:**
- **Gemini** — Design interpretation only (OUTSIDE Cursor)
- **Cursor Auto** — Execution only (follows written rules)
- **Claude** — Strategy, content, orchestration
- **The Division of Labor** — Canonical 3-part rule
- **Anti-Patterns to Avoid** — What NOT to do
- **When Illustration is Needed** — How illustration emerges from analysis
- **Workflow Integration** — How LLMs work together across phases
- **Quick Reference Table** — LLM, use case, location, output type

**Critical clarifications:**
- Gemini never touches repo files
- Gemini never writes implementation code
- Cursor never invents design direction
- No LLM auto-triggers another LLM
- Illustration is discovered, not assumed

### 6. ✅ Illustration Kept Optional

**Verified in:**
- `/skills/design-system/SKILL.md` — Already style-agnostic
- `/skills/imagery-workflow/SKILL.md` — Treats illustration as one use case
- `/design/design-inspiration-prompt.md` — No illustration assumption
- `/workflows/new-site-workflow.md` — Phase 3A produces ANY design intelligence

**Result:** No hardcoded "illustration phase" exists. Illustration emerges from analysis if needed.

---

## Files Created

1. `/design/design-inspiration-prompt.md` — Canonical Gemini prompt
2. `/docs/llm-roles.md` — LLM role clarification

---

## Files Modified

1. `README.md` — Added orchestration protocol section at top
2. `/agents/orchestrator.md` — Formalized prompt router role + Phase 3A
3. `/workflows/new-site-workflow.md` — Added Phase 3A documentation

---

## Files NOT Changed (Verified Compatible)

1. `/skills/design-system/SKILL.md` — Already style-agnostic
2. `/skills/imagery-workflow/SKILL.md` — Already treats illustration as optional
3. `/workflows/rebuild-site-workflow.md` — References same phases
4. All other agent files — No changes needed
5. All other skill files — No changes needed

---

## Backward Compatibility

✅ **All existing workflows still work**

- Existing phases remain intact
- No files renamed
- No agents removed
- Phase 3A is OPTIONAL (can be skipped)
- Teams can continue using old workflow
- New teams get better guidance

---

## What Users Should Know

### For New Teams

1. Start with the orchestrator prompt from README
2. Follow phase-by-phase guidance
3. Use Phase 3A for any design-forward site
4. Paste exact prompts provided by orchestrator
5. Confirm completion before advancing

### For Existing Teams

1. Nothing breaks
2. Phase 3A is optional but recommended
3. Can continue current workflow
4. Gemini analysis adds quality if desired

---

## Key Principles Enforced

1. **Human-in-the-loop** — No auto-execution
2. **Prompt routing** — Orchestrator provides exact prompts
3. **LLM specialization** — Each LLM has clear role
4. **Taste before execution** — Design analysis before build
5. **Style-agnostic** — No assumption of illustration
6. **Optional enhancement** — Phase 3A improves quality but isn't required

---

## The Canonical Rule (Added Throughout)

> **Gemini interprets taste.**  
> **Cursor executes taste.**  
> **The orchestrator keeps everyone honest.**

**Appears in:**
- README (twice)
- `/docs/llm-roles.md`
- `/design/design-inspiration-prompt.md` (implied)

---

## Testing Checklist

✅ README renders correctly  
✅ Orchestrator startup prompt is copy-pasteable  
✅ Design inspiration prompt is complete  
✅ Phase 3A documented in workflow  
✅ LLM roles document is comprehensive  
✅ No broken internal links  
✅ No illustration hardcoding  
✅ Existing workflows compatible  
✅ Folder structure updated

---

## Next Steps (Optional Future Enhancements)

**Not included in this update (per requirements):**
- No automation added
- No new agents created
- No additional complexity

**Possible future additions:**
- Example `design-analysis.md` files
- Video tutorial for Phase 3A
- Gemini prompt variations for different site types
- Builder prompt templates

---

## Version

**Orchestration Protocol:** v1.0  
**Date:** 2026-01-17  
**Status:** Production-ready

---

## Summary

This update transforms the Web Dev Hub from an implicit orchestration model to an **explicit, teachable, human-in-the-loop system**.

**No complexity added.**  
**No existing functionality broken.**  
**Structure added, not invented.**

The repo now guides great taste without requiring tribal knowledge.
