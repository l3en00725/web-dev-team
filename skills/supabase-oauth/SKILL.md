---
name: supabase-oauth
description: Complete step-by-step guide for setting up Google OAuth authentication with Supabase. Use when implementing user authentication or admin portals.
owner: Builder Agent (implements), User (configures Google Cloud)
trigger: When authentication is required (admin dashboard, user portals, protected routes)
llm: Cursor Auto (Builder)
framework: Astro + Supabase
---

# Supabase OAuth Setup Skill

## Purpose

Complete step-by-step instructions for setting up Google OAuth authentication with Supabase. This guide ensures consistent, error-free OAuth configuration every time.

---

## Trigger

When authentication is required:
- Admin dashboard access
- User portals
- Protected routes
- Member-only content

---

## Prerequisites

- [ ] Google Cloud Platform account
- [ ] Supabase project created
- [ ] Production domain known (e.g., `thebluekids.com`)
- [ ] Local development environment set up

---

## Part 1: Google Cloud Console Setup

### Step 1.1: Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Either:
   - **Select an existing project**, OR
   - **Click "New Project"** → Enter project name → Click "Create"

### Step 1.2: Configure OAuth Consent Screen

1. In Google Cloud Console, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name:** Your site name (e.g., "The Blue Kids")
   - **User support email:** Your email address
   - **Developer contact information:** Your email address
5. Click **Save and Continue**
6. **Scopes:** Click **Add or Remove Scopes**
   - Select: `.../auth/userinfo.email` and `.../auth/userinfo.profile`
   - Click **Update** → **Save and Continue**
7. **Test users:** (Optional for development)
   - Add test user emails if your app is in testing mode
   - Click **Save and Continue**
8. **Summary:** Review and click **Back to Dashboard**

### Step 1.3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application** as the application type
4. **Name:** Enter a descriptive name (e.g., "Supabase OAuth Client")
5. **Authorized JavaScript origins:** Add these URLs (one per line):
   ```
   https://[YOUR_PROJECT_REF].supabase.co
   http://localhost:4321
   http://localhost:4322
   http://localhost:4323
   http://localhost:4324
   https://thebluekids.com
   https://www.thebluekids.com
   ```
   **Note:** Replace `[YOUR_PROJECT_REF]` with your actual Supabase project reference (found in your Supabase project URL).

6. **Authorized redirect URIs:** Add these URLs (one per line):
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   http://localhost:4321/auth/callback
   http://localhost:4322/auth/callback
   http://localhost:4323/auth/callback
   http://localhost:4324/auth/callback
   https://thebluekids.com/auth/callback
   https://www.thebluekids.com/auth/callback
   ```
   **Important:** The Supabase callback URL format is: `https://[PROJECT_REF].supabase.co/auth/v1/callback`

7. Click **Create**
8. **Copy the Client ID and Client Secret** — you'll need these for Supabase configuration
   - Client ID: `xxxxxxxxxxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxx`

---

## Part 2: Supabase Dashboard Configuration

### Step 2.1: Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to expand
5. Toggle **Enable Google provider** to ON
6. Enter your credentials:
   - **Client ID (for OAuth):** Paste the Client ID from Google Cloud Console
   - **Client Secret (for OAuth):** Paste the Client Secret from Google Cloud Console
7. Click **Save**

### Step 2.2: Configure URL Settings

1. Still in Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. **Site URL:** Set to your production domain:
   ```
   https://thebluekids.com
   ```
   Or for local development:
   ```
   http://localhost:4321
   ```

3. **Redirect URLs:** Add all these URLs (one per line):
   ```
   http://localhost:4321/auth/callback
   http://localhost:4322/auth/callback
   http://localhost:4323/auth/callback
   http://localhost:4324/auth/callback
   https://thebluekids.com/auth/callback
   https://www.thebluekids.com/auth/callback
   ```
   **Note:** Add multiple localhost ports to handle different dev server instances.

4. Click **Save**

### Step 2.3: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for environment variables):
   - **Project URL:** `https://[PROJECT_REF].supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

---

## Part 3: Environment Variables

### Step 3.1: Local Environment (.env.local)

Create or update `.env.local` in your project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
SITE_URL=https://thebluekids.com
PUBLIC_SITE_URL=https://thebluekids.com
```

**Important:** 
- Replace `[YOUR_PROJECT_REF]` with your actual Supabase project reference
- Never commit `.env.local` to git (it should be in `.gitignore`)

### Step 3.2: Production Environment (Vercel/Deployment)

1. Go to your deployment platform (e.g., Vercel)
2. Navigate to **Project Settings** → **Environment Variables**
3. Add the same variables as above:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (optional, for admin operations)
   - `SITE_URL`
   - `PUBLIC_SITE_URL`
4. Set scope to **Production**, **Preview**, and **Development** as needed
5. Save

---

## Part 4: Testing

### Step 4.1: Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```
   Note the port number (usually `4321`)

2. Navigate to your sign-in page:
   ```
   http://localhost:4321/sign-in
   ```

3. Click **"Sign in with Google"**

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you should be redirected back to:
   ```
   http://localhost:4321/auth/callback
   ```
   Then automatically to your portal/dashboard

6. **Verify:** Check that you're logged in and can access protected routes

### Step 4.2: Production Testing

1. Deploy your site to production
2. Navigate to `https://thebluekids.com/sign-in`
3. Test the Google OAuth flow
4. Verify redirect works correctly

---

## Part 5: Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Symptoms:** Google shows "redirect_uri_mismatch" error

**Solution:**
1. Check Google Cloud Console → Credentials → Your OAuth Client
2. Verify the **Authorized redirect URIs** includes:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - Your production callback URL
   - Your localhost callback URLs
3. Ensure URLs match exactly (no trailing slashes, correct protocol)
4. Wait 1-2 minutes for changes to propagate

### Issue: "localhost:3000" or Wrong Port Errors

**Symptoms:** Redirects to wrong localhost port

**Solution:**
1. Check what port your dev server is actually running on
2. Update Supabase Dashboard → Authentication → URL Configuration
3. Add the correct localhost redirect URL
4. Update Google Cloud Console redirect URIs if needed

### Issue: OAuth Provider Not Enabled

**Symptoms:** Google sign-in button doesn't work or shows error

**Solution:**
1. Verify in Supabase Dashboard → Authentication → Providers
2. Ensure Google provider is **enabled** (toggle is ON)
3. Verify Client ID and Client Secret are correctly entered
4. Check for typos in credentials

### Issue: Session Not Persisting

**Symptoms:** User gets redirected but isn't logged in

**Solution:**
1. Check browser console for errors
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
3. Check that cookies are being set (inspect browser DevTools → Application → Cookies)
4. Verify your callback handler (`/auth/callback`) is working correctly

### Issue: "Invalid client" Error

**Symptoms:** Google shows "Invalid client" error

**Solution:**
1. Verify Client ID and Client Secret in Supabase match Google Cloud Console
2. Check for extra spaces or characters when copying
3. Ensure OAuth consent screen is published (not just in testing mode) for production

### Issue: Email Domain Restrictions

**Symptoms:** Only certain email domains can sign in

**Solution:**
1. In Google Cloud Console → OAuth consent screen
2. Check if you have domain restrictions set
3. For production, publish the app (not just testing mode)
4. Add test users if app is in testing mode

---

## Quick Checklist

Before testing, verify:

- [ ] Google Cloud Console OAuth consent screen configured
- [ ] OAuth 2.0 credentials created with correct redirect URIs
- [ ] Supabase Google provider enabled with Client ID and Secret
- [ ] Supabase redirect URLs configured (localhost + production)
- [ ] Environment variables set locally (`.env.local`)
- [ ] Environment variables set in production (Vercel/etc.)
- [ ] All URLs match exactly (no typos, correct protocols)

---

## Reference: Important URLs

**Google Cloud Console:**
- OAuth Consent Screen: `https://console.cloud.google.com/apis/credentials/consent`
- Credentials: `https://console.cloud.google.com/apis/credentials`

**Supabase Dashboard:**
- Providers: `https://supabase.com/dashboard/project/[PROJECT]/auth/providers`
- URL Configuration: `https://supabase.com/dashboard/project/[PROJECT]/auth/url-configuration`
- API Settings: `https://supabase.com/dashboard/project/[PROJECT]/settings/api`

**Your Application:**
- Sign-in: `/sign-in`
- Sign-up: `/sign-up`
- Callback: `/auth/callback`

---

## Notes

- **Development vs Production:** Use different OAuth clients for dev/prod if needed, or use the same one with all redirect URIs added
- **Security:** Never commit `.env.local` or expose service_role keys in client-side code
- **Testing Mode:** Google OAuth apps in testing mode only work for added test users
- **Propagation:** Changes to OAuth settings can take 1-2 minutes to propagate

---

## Need Help?

If you encounter issues not covered here:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check browser console for client-side errors
3. Check server logs for backend errors
4. Verify all URLs match exactly between Google Cloud, Supabase, and your code

---

## Implementation Example (Astro + Supabase)

### Sign-In Page

```astro
---
// src/pages/sign-in.astro
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${import.meta.env.PUBLIC_SITE_URL}/auth/callback`
    }
  })
}
---

<button onclick={handleGoogleSignIn}>
  Sign in with Google
</button>
```

### Callback Handler

```astro
---
// src/pages/auth/callback.astro
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

const code = Astro.url.searchParams.get('code')

if (code) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Auth error:', error)
    return Astro.redirect('/sign-in?error=auth_failed')
  }
  
  // Redirect to dashboard/portal
  return Astro.redirect('/dashboard')
}

return Astro.redirect('/sign-in')
---
```

---

## Success Criteria

Supabase OAuth Setup is complete when:

- [ ] Google OAuth credentials created and configured
- [ ] Supabase Google provider enabled
- [ ] All redirect URLs configured (Google Cloud + Supabase)
- [ ] Environment variables set (local + production)
- [ ] Sign-in page functional
- [ ] Callback handler working
- [ ] User can successfully sign in with Google
- [ ] Session persists across page reloads
- [ ] Protected routes accessible after authentication
