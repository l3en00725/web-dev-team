---
name: env-variable-setup
description: Ensures all required environment variables exist locally and in Vercel before build proceeds. Use after Repo Graduation Skill. Blocks build if vars are missing.
owner: Builder Agent
trigger: After Repo Graduation Skill
llm: Cursor Auto
---

# Env Variable Setup Skill

## Purpose

Prevent builds from failing due to missing environment variables. This skill ensures all required secrets and configuration values are in place before development begins.

---

## Trigger

After Repo Graduation Skill completes successfully.

---

## Prerequisites

- [ ] Repo Graduation Skill completed
- [ ] New repo is active origin
- [ ] Vercel project exists
- [ ] Supabase project exists (or will be created)

---

## Required Environment Variables

### Core (Always Required)

| Variable | Purpose | Source |
|----------|---------|--------|
| `SUPABASE_URL` | Database connection | Supabase dashboard |
| `SUPABASE_ANON_KEY` | Public API key | Supabase dashboard |
| `GA_MEASUREMENT_ID` | Google Analytics | GA4 dashboard |
| `ANTHROPIC_API_KEY` | Claude API access | Anthropic console |
| `KEYWORDS_API_KEY` | Keywords Everywhere | Keywords Everywhere |

### Conditional (Based on Features)

| Variable | When Required | Source |
|----------|---------------|--------|
| `PAGESPEED_API_KEY` | Performance testing | Google Cloud Console |
| `PEXELS_API_KEY` | Stock imagery | Pexels API |
| `UNSPLASH_API_KEY` | Stock imagery | Unsplash API |
| `LINKEDIN_CLIENT_ID` | Social publishing | LinkedIn Developer |
| `LINKEDIN_CLIENT_SECRET` | Social publishing | LinkedIn Developer |
| `MEDIUM_ACCESS_TOKEN` | Social publishing | Medium settings |
| `GOOGLE_SEARCH_CONSOLE_API_KEY` | Sitemap submission | Google Cloud Console |

---

## Workflow

### Step 1: Generate .env.example

Create `.env.example` in project root with all required keys:

```bash
# Core - Required for all projects
SUPABASE_URL=
SUPABASE_ANON_KEY=
GA_MEASUREMENT_ID=
ANTHROPIC_API_KEY=
KEYWORDS_API_KEY=

# Performance Testing
PAGESPEED_API_KEY=

# Stock Imagery (optional)
PEXELS_API_KEY=
UNSPLASH_API_KEY=

# Social Publishing (optional)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
MEDIUM_ACCESS_TOKEN=

# Google APIs
GOOGLE_SEARCH_CONSOLE_API_KEY=
```

### Step 2: Create .env.local

Prompt user to create `.env.local` with real values:

1. Copy `.env.example` to `.env.local`
2. Fill in actual values for each key
3. Verify `.env.local` is in `.gitignore`

### Step 3: Verify Supabase Connection

- [ ] Supabase project exists
- [ ] Project URL matches `SUPABASE_URL`
- [ ] Anon key matches `SUPABASE_ANON_KEY`
- [ ] Can connect to database

**Test Connection:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Test query
const { data, error } = await supabase.from('test').select('*').limit(1)
```

### Step 4: Configure Vercel Environment Variables

For each environment (Production, Preview, Development):

1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add each required variable
4. Set appropriate scope (Production, Preview, Development)

**Vercel CLI Alternative:**
```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
# ... repeat for each variable
```

### Step 5: Verify All Variables Present

Run verification check:

```javascript
const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'GA_MEASUREMENT_ID',
  'ANTHROPIC_API_KEY',
  'KEYWORDS_API_KEY'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required env vars:', missing);
  process.exit(1);
}
```

---

## Required Outputs

| Output | Description |
|--------|-------------|
| `.env.example` | Template with all keys (no values) |
| `.env.local` | Local file with real values |
| Vercel env vars | All vars configured in Vercel |
| Supabase connection | Verified working |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing required vars | **STOP** — Cannot proceed |
| Supabase connection fails | **STOP** — Fix before continuing |
| Vercel vars not set | **STOP** — Must configure |
| `.env.local` not in `.gitignore` | **STOP** — Security risk |

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to git
- [ ] Vercel vars have correct scope
- [ ] Supabase RLS policies in place
- [ ] API keys have appropriate permissions

---

## .gitignore Requirements

Ensure `.gitignore` includes:

```
# Environment variables
.env
.env.local
.env.*.local

# Vercel
.vercel
```

---

## Variable Sources

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Select project
3. Settings → API
4. Copy Project URL and anon key

### Google Analytics
1. Go to [analytics.google.com](https://analytics.google.com)
2. Admin → Data Streams
3. Select web stream
4. Copy Measurement ID (G-XXXXXXXX)

### Anthropic
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. API Keys
3. Create new key

### Keywords Everywhere
1. Go to [keywordseverywhere.com](https://keywordseverywhere.com)
2. Account → API
3. Copy API key

### Google Cloud (PageSpeed, Search Console)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Create API key
4. Enable required APIs

---

## Verification Checklist

Before proceeding to next skill:

- [ ] `.env.example` exists with all keys
- [ ] `.env.local` exists with real values
- [ ] `.env.local` is gitignored
- [ ] Supabase connection verified
- [ ] Vercel env vars configured
- [ ] No secrets in git history

---

## Success Criteria

Env Variable Setup is complete when:

- [ ] All required variables identified
- [ ] `.env.example` created
- [ ] `.env.local` populated
- [ ] Vercel configured
- [ ] Supabase connected
- [ ] Security verified

---

## Next Steps

After Env Variable Setup completes:

1. **Architect Agent** — Begin strategy and structure work
2. **Builder Agent** — Can start implementation
