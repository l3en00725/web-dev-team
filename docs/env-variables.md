# Environment Variables Reference

This document lists all environment variables required by the Web Dev Hub system.

---

## Required Variables

### Core Infrastructure

```bash
# Supabase (required for forms, backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Analytics (required before deploy)
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### AI / LLM APIs

```bash
# Anthropic (for Claude-based agents)
ANTHROPIC_API_KEY=sk-ant-your-key

# OpenAI (for DALL-E 3 image generation)
OPENAI_API_KEY=sk-your-openai-key

# Google (for Gemini — design analysis, alternative image gen)
GEMINI_API_KEY=your-gemini-key
```

### SEO Tools

```bash
# Keywords API (for keyword validation)
KEYWORDS_API_KEY=your-keywords-api-key
```

---

## When to Add Each Variable

| Variable | When Required | Phase |
|----------|---------------|-------|
| `SUPABASE_URL` | Before forms work | Phase 1 (Kickoff) |
| `SUPABASE_ANON_KEY` | Before forms work | Phase 1 (Kickoff) |
| `ANTHROPIC_API_KEY` | Before Claude agents | Phase 1 (Kickoff) |
| `OPENAI_API_KEY` | Before image generation | Phase 4 (Imagery) |
| `GEMINI_API_KEY` | Before design analysis | Phase 3A (Design) |
| `KEYWORDS_API_KEY` | Before SEO validation | Phase 2 (Architect) |
| `GA_MEASUREMENT_ID` | Before deploy | Phase 7 (QA) |

---

## OpenAI API Key (Image Generation)

**Purpose:** Generate images via DALL-E 3 API

**Get your key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

**Add to `.env`:**
```bash
OPENAI_API_KEY=sk-your-key-here
```

**Cost awareness:**
- DALL-E 3 HD: ~$0.08 per image (1024x1024)
- DALL-E 3 HD: ~$0.12 per image (1792x1024 or 1024x1792)
- Budget ~$5-10 per site for typical imagery needs

**Orchestrator will verify this exists before Phase 4 (Imagery).**

---

## Verifying Environment Variables

The Orchestrator should verify required variables before each phase:

### Phase 4 (Imagery) Pre-Check

```bash
# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY not found in .env"
  echo "Add: OPENAI_API_KEY=sk-your-key-here"
  exit 1
fi
```

Or in the Orchestrator prompt:

```
Before proceeding to Phase 4 (Imagery):

Verify OPENAI_API_KEY exists in .env

If missing:
🚫 STOP — Cannot generate images without API key

Instructions:
1. Get API key from https://platform.openai.com/api-keys
2. Add to .env: OPENAI_API_KEY=sk-your-key-here
3. Confirm when complete

Do not proceed until verified.
```

---

## Security Reminders

1. **Never commit `.env` to git** — ensure it's in `.gitignore`
2. **Never expose keys in client-side code** — all API calls server-side
3. **Use environment variables in Vercel** — don't hardcode in deployed code
4. **Rotate keys if exposed** — immediately regenerate if leaked

---

## .env.example Template

Create `.env.example` with placeholder values (safe to commit):

```bash
# ===========================================
# Web Dev Hub - Environment Variables
# ===========================================
# Copy this file to .env and fill in real values
# NEVER commit .env to git

# --- Core Infrastructure ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# --- Analytics ---
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# --- AI / LLM APIs ---
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here

# --- SEO Tools ---
KEYWORDS_API_KEY=your-keywords-api-key-here

# --- Optional: Background Removal ---
# Only needed if using remove.bg API instead of local processing
REMOVE_BG_API_KEY=your-remove-bg-key-here
```

---

## Version History

- **v1.1** — 2026-01-18 — Added OPENAI_API_KEY for DALL-E 3 image generation
- **v1.0** — 2026-01-17 — Initial environment variables documentation
