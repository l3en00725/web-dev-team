---
name: clerk-authentication
description: Standardized setup pattern for Clerk authentication in Astro SSR applications with role-based access control. Use when implementing user authentication, admin dashboards, or protected portals.
owner: Builder Agent (implements), User (configures Clerk Dashboard)
trigger: When authentication is required (admin dashboard, user portals, protected routes)
llm: Cursor Auto (Builder)
framework: Astro SSR + Clerk
---

# Clerk Authentication Skill

## Purpose

Standardized setup pattern for Clerk authentication in Astro SSR applications with role-based access control. Ensures consistent, secure authentication implementation every time.

---

## Trigger

When authentication is required:
- Admin dashboard access
- User portals
- Protected routes
- Member-only content
- Role-based access control

---

## Prerequisites

- [ ] Clerk account created
- [ ] Astro project configured for SSR
- [ ] Vercel adapter (or appropriate adapter) configured
- [ ] Supabase project exists (for database mirroring via webhook)

---

## Quick Checklist

- [ ] Install dependencies
- [ ] Add environment variables
- [ ] Configure `astro.config.mjs`
- [ ] Create middleware
- [ ] Create auth pages (sign-in, sign-up, sign-out, redirect)
- [ ] Set up webhook handler
- [ ] Configure Clerk Dashboard (API keys, webhooks)
- [ ] Add CSP headers
- [ ] Create database tables
- [ ] Set permanent super admin

---

## 1. Dependencies

```bash
npm install @clerk/astro @clerk/backend svix
```

---

## 2. Environment Variables

Add to `.env.local` and Vercel:

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

**Note:** `PUBLIC_CLERK_PUBLISHABLE_KEY` is public-safe and can be used in client-side code. `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` must remain server-side only.

---

## 3. Astro Config

**`astro.config.mjs`:**

```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import clerk from '@clerk/astro';

export default defineConfig({
  output: 'server',
  adapter: vercel(), // or your adapter
  integrations: [
    clerk({
      afterSignInUrl: '/auth/redirect',
      afterSignUpUrl: '/auth/redirect',
    }),
  ],
});
```

---

## 4. Middleware Pattern

**`src/middleware.ts`:**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const PERMANENT_SUPER_ADMIN = 'admin@yourdomain.com';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPortalRoute = createRouteMatcher(['/portal(.*)']);
const isPublicRoute = createRouteMatcher(['/', '/about', '/sign-in(.*)', '/sign-up(.*)', '/api/clerk-webhook']);

export const onRequest = clerkMiddleware(async (auth, context) => {
  const { userId } = auth();
  const pathname = new URL(context.request.url).pathname;

  if (pathname.startsWith('/_') || pathname.includes('.')) return;
  if (isPublicRoute(context.request)) return;

  if (isAdminRoute(context.request)) {
    if (!userId) return auth().redirectToSignIn({ returnBackUrl: context.request.url });
    
    const user = await context.locals.currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const role = user?.publicMetadata?.role as string | undefined;
    
    const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
    const isAdmin = role === 'admin' || isPermanentSuperAdmin;
    
    if (!isAdmin) {
      return Response.redirect(new URL('/unauthorized', context.request.url));
    }
    return;
  }

  if (isPortalRoute(context.request)) {
    if (!userId) return auth().redirectToSignIn({ returnBackUrl: context.request.url });
    return;
  }

  return;
});
```

---

## 5. Auth Pages Pattern

### Sign In (`src/pages/sign-in/index.astro`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { SignIn } from '@clerk/astro/components';

const PERMANENT_SUPER_ADMIN = 'admin@yourdomain.com';

const { userId } = Astro.locals.auth();
if (userId) {
  const user = await Astro.locals.currentUser();
  const role = user?.publicMetadata?.role;
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin = role === 'admin' || email === PERMANENT_SUPER_ADMIN;
  return Astro.redirect(isAdmin ? '/admin' : '/portal', 302);
}
---

<BaseLayout title="Sign In">
  <SignIn 
    routing="path" 
    path="/sign-in"
    signUpUrl="/sign-up"
    fallbackRedirectUrl="/auth/redirect"
  />
</BaseLayout>
```

### Sign Up (`src/pages/sign-up/index.astro`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { SignUp } from '@clerk/astro/components';

const { userId } = Astro.locals.auth();
if (userId) {
  return Astro.redirect('/auth/redirect', 302);
}
---

<BaseLayout title="Sign Up">
  <SignUp 
    routing="path" 
    path="/sign-up"
    signInUrl="/sign-in"
    fallbackRedirectUrl="/auth/redirect"
  />
</BaseLayout>
```

### Auth Redirect (`src/pages/auth/redirect.astro`)

```astro
---
const PERMANENT_SUPER_ADMIN = 'admin@yourdomain.com';

const { userId } = Astro.locals.auth();
if (!userId) return Astro.redirect('/sign-in', 302);

const user = await Astro.locals.currentUser();
const role = user?.publicMetadata?.role as string | undefined;
const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
const isAdmin = role === 'admin' || isPermanentSuperAdmin;

return Astro.redirect(isAdmin ? '/admin' : '/portal', 302);
---
```

### Sign Out (`src/pages/sign-out.astro`)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SignOutPage from '../components/SignOutPage';

const { userId } = Astro.locals.auth();
if (!userId) return Astro.redirect('/sign-in', 302);
---

<BaseLayout title="Signing Out...">
  <SignOutPage client:load />
</BaseLayout>
```

**`src/components/SignOutPage.tsx`:**

```tsx
import { useEffect, useState } from 'react';

declare global { interface Window { Clerk?: any; }}

export default function SignOutPage() {
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;

    const trySignOut = async () => {
      attempts++;
      if (!window.Clerk || !window.Clerk.loaded) {
        if (attempts < maxAttempts) {
          setStatus(`Waiting for Clerk... (${attempts})`);
          setTimeout(trySignOut, 200);
          return;
        }
        setStatus('Error: Authentication service not available');
        return;
      }

      setStatus('Signing out...');
      try {
        await window.Clerk.signOut();
        window.location.href = '/sign-in';
      } catch (err) {
        setStatus(`Error: ${err}`);
      }
    };

    setTimeout(trySignOut, 300);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p>{status}</p>
      </div>
    </div>
  );
}
```

---

## 6. Webhook Handler Pattern

**`src/pages/api/clerk-webhook.ts`:**

```typescript
import type { APIRoute } from 'astro';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';

const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_SERVICE_ROLE_KEY);
const clerkClient = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY });
const PERMANENT_SUPER_ADMIN = 'admin@yourdomain.com';

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) return new Response('Missing webhook secret', { status: 500 });

  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(webhookSecret);

  let evt: any;
  try {
    evt = wh.verify(body, { 'svix-id': svix_id, 'svix-timestamp': svix_timestamp, 'svix-signature': svix_signature });
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'user.updated':
      await handleUserUpdated(evt.data);
      break;
    case 'user.deleted':
      await handleUserDeleted(evt.data);
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

async function handleUserCreated(user: any) {
  const clerkUserId = user.id;
  const email = user.email_addresses?.[0]?.email_address?.toLowerCase() || '';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || email;
  
  let role = user.public_metadata?.role;
  let adminRole = user.public_metadata?.adminRole;

  // If no metadata, check for invitation and apply it
  if (!role && !adminRole) {
    const invitations = await clerkClient.invitations.getInvitationList();
    const invitation = invitations.data.find(inv => inv.emailAddress.toLowerCase() === email);

    if (invitation?.publicMetadata) {
      const meta = invitation.publicMetadata as any;
      role = meta.role;
      adminRole = meta.adminRole;

      await clerkClient.users.updateUser(clerkUserId, {
        publicMetadata: { role, adminRole, name: meta.name },
      });
    }
  }

  const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
  const isAdmin = role === 'admin' || isPermanentSuperAdmin;

  if (isAdmin) {
    const effectiveRole = isPermanentSuperAdmin ? 'super_admin' : (adminRole || 'content_manager');
    
    await supabase.from('admin_users').upsert({
      clerk_user_id: clerkUserId,
      email,
      name,
      role: effectiveRole,
      active: true,
    }, { onConflict: 'email' });
  }

  // Create people/donor records as needed...
}

async function handleUserUpdated(user: any) {
  // Update database records when user metadata changes
  const clerkUserId = user.id;
  const email = user.email_addresses?.[0]?.email_address?.toLowerCase() || '';
  const role = user.public_metadata?.role;
  const adminRole = user.public_metadata?.adminRole;
  
  const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
  const isAdmin = role === 'admin' || isPermanentSuperAdmin;

  if (isAdmin) {
    const effectiveRole = isPermanentSuperAdmin ? 'super_admin' : (adminRole || 'content_manager');
    
    await supabase.from('admin_users').upsert({
      clerk_user_id: clerkUserId,
      email,
      role: effectiveRole,
      active: true,
    }, { onConflict: 'email' });
  }
}

async function handleUserDeleted(user: any) {
  const clerkUserId = user.id;
  await supabase.from('admin_users').delete().eq('clerk_user_id', clerkUserId);
}
```

---

## 7. Clerk Dashboard Setup

1. **Create Application** → Get API keys
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create new application or select existing
   - Copy **Publishable Key** → `PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy **Secret Key** → `CLERK_SECRET_KEY`

2. **Webhooks** → Add endpoint: `https://yourdomain.com/api/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret → `CLERK_WEBHOOK_SECRET`
   - **Important:** Always verify webhook signatures for security

3. **Domains** (Optional) → Set up custom domain for better email deliverability

4. **Email Templates** (Optional) → Customize sign-in/sign-up emails

---

## 8. CSP Headers (Vercel)

**`vercel.json`:**

```json
{
  "headers": [
    {
      "source": "/(sign-in|sign-up|sign-out|auth|portal|admin)(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.yourdomain.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://clerk.yourdomain.com; img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com; frame-src https://clerk.yourdomain.com https://*.clerk.accounts.dev; connect-src 'self' https://clerk.yourdomain.com https://*.clerk.accounts.dev;"
        }
      ]
    }
  ]
}
```

**Note:** Adjust CSP based on your Clerk domain configuration.

---

## 9. Database Schema

**Create `admin_users` table in Supabase:**

```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'content_manager', -- super_admin, admin, content_manager
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_clerk_id ON admin_users(clerk_user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
```

**Why Supabase?**
- Clerk is source of truth for identity
- Supabase mirrors user data via webhook for queries/joins
- Enables efficient database queries without API calls

---

## 10. Role System Pattern

**Roles:**
- `super_admin` - Full access, can create other super admins
- `admin` - Manage content, events, users (except super admins)
- `content_manager` - Create/edit content only

**Metadata Structure:**
```json
{
  "role": "admin",
  "adminRole": "super_admin"
}
```

**Permanent Super Admin:**
- Hardcode one email as permanent super admin
- Always has access regardless of metadata
- Cannot be deleted/deactivated
- Set `PERMANENT_SUPER_ADMIN` constant in code

---

## 11. Admin Invitation Pattern

**`src/pages/api/admin/add-user.ts`:**

```typescript
import type { APIRoute } from 'astro';
import { clerkClient } from '@clerk/astro/server';

const PERMANENT_SUPER_ADMIN = 'admin@yourdomain.com';

export const POST: APIRoute = async (context) => {
  const { userId } = context.locals.auth();
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const requestingUser = await context.locals.currentUser();
  const requestingEmail = requestingUser?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const requestingRole = requestingUser?.publicMetadata?.role;
  const requestingAdminRole = requestingUser?.publicMetadata?.adminRole;

  const isPermanentSuperAdmin = requestingEmail === PERMANENT_SUPER_ADMIN;
  const isSuperAdmin = isPermanentSuperAdmin || requestingAdminRole === 'super_admin';
  const isAdmin = isSuperAdmin || requestingRole === 'admin';

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Only admins can invite users' }), { status: 403 });
  }

  const { email, name, role } = await context.request.json();

  // Only super admins can create other super admins
  if (role === 'super_admin' && !isSuperAdmin) {
    return new Response(JSON.stringify({ error: 'Only super admins can create super admins' }), { status: 403 });
  }

  const clerk = await clerkClient(context);
  const invitation = await clerk.invitations.createInvitation({
    emailAddress: email.toLowerCase(),
    redirectUrl: `${import.meta.env.SITE_URL}/admin`,
    publicMetadata: {
      role: 'admin',
      adminRole: role, // 'super_admin', 'admin', or 'content_manager'
      name: name.trim(),
      invitedBy: requestingEmail,
      invitedAt: new Date().toISOString(),
    },
  });

  return new Response(JSON.stringify({ success: true, invitationId: invitation.id }), { status: 200 });
};
```

---

## 12. Key Patterns

### Checking Admin Access
```typescript
const user = await context.locals.currentUser();
const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
const role = user?.publicMetadata?.role;
const adminRole = user?.publicMetadata?.adminRole;

const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
const isSuperAdmin = isPermanentSuperAdmin || adminRole === 'super_admin';
const isAdmin = isSuperAdmin || role === 'admin' || adminRole === 'admin';
```

### Getting Current User
```typescript
const { userId } = Astro.locals.auth();
const user = await Astro.locals.currentUser();
const email = user?.primaryEmailAddress?.emailAddress;
```

### Role-Based Redirects
```typescript
const isAdmin = role === 'admin' || email === PERMANENT_SUPER_ADMIN;
return Astro.redirect(isAdmin ? '/admin' : '/portal', 302);
```

---

## 13. Common Issues & Fixes

**Issue:** "Access Denied" for admin users
- **Fix:** Check Clerk Dashboard → User → Public metadata has `role: "admin"`

**Issue:** Invitation metadata not applied
- **Fix:** Webhook must look up invitation and call `clerkClient.users.updateUser()`

**Issue:** Sign-out not working
- **Fix:** Use React component with `window.Clerk.signOut()` and `is:inline` script tag

**Issue:** CSP blocking Clerk
- **Fix:** Add Clerk domains to CSP in `vercel.json`

**Issue:** Webhook not receiving events
- **Fix:** Verify webhook URL is correct, check webhook secret matches, ensure events are enabled in Clerk Dashboard

**Issue:** User created but not in database
- **Fix:** Check webhook handler is processing `user.created` event, verify Supabase connection

---

## 14. Testing Checklist

- [ ] Sign-in redirects to correct portal
- [ ] Admin routes require admin role
- [ ] Portal routes require any authenticated user
- [ ] Sign-out works correctly
- [ ] Invitations create users with correct roles
- [ ] Webhook creates database records
- [ ] Permanent super admin always has access
- [ ] CSP headers allow Clerk scripts
- [ ] Environment variables set (local + production)

---

## 15. Security Notes

- **Clerk is source of truth** for identity - Supabase mirrors via webhook
- **Roles in `publicMetadata`** - not JWT claims
- **Email allowlist** only for permanent super admin - all others use roles
- **Webhook must apply invitation metadata** - Clerk doesn't auto-copy it
- **Always verify webhook signatures** - security critical
- **Never expose `CLERK_SECRET_KEY`** in client-side code
- **Use `PUBLIC_CLERK_PUBLISHABLE_KEY`** for client-side components

---

## Success Criteria

Clerk Authentication is complete when:

- [ ] Dependencies installed (`@clerk/astro`, `@clerk/backend`, `svix`)
- [ ] Environment variables set (local + production)
- [ ] Astro config updated with Clerk integration
- [ ] Middleware created and protecting routes
- [ ] Auth pages functional (sign-in, sign-up, sign-out, redirect)
- [ ] Webhook handler created and verified
- [ ] Clerk Dashboard configured (API keys, webhooks)
- [ ] CSP headers added to `vercel.json`
- [ ] Database tables created (`admin_users`)
- [ ] Permanent super admin set
- [ ] Role-based access control working
- [ ] Testing checklist completed

---

## Reference: Important URLs

**Clerk Dashboard:**
- Dashboard: `https://dashboard.clerk.com/`
- API Keys: `https://dashboard.clerk.com/[app]/api-keys`
- Webhooks: `https://dashboard.clerk.com/[app]/webhooks`
- Users: `https://dashboard.clerk.com/[app]/users`

**Your Application:**
- Sign-in: `/sign-in`
- Sign-up: `/sign-up`
- Sign-out: `/sign-out`
- Callback: `/auth/redirect`
- Admin: `/admin`
- Portal: `/portal`
- Webhook: `/api/clerk-webhook`

---

## Notes

- **Development vs Production:** Use same Clerk app with all redirect URLs added, or separate apps per environment
- **Security:** Never commit `.env.local` or expose secret keys in client-side code
- **Testing Mode:** Clerk apps work immediately - no special testing mode needed
- **Propagation:** Changes to Clerk settings are immediate (no delay)

---

## Need Help?

If you encounter issues not covered here:
1. Check Clerk Dashboard → Webhooks → Recent deliveries for errors
2. Check browser console for client-side errors
3. Check server logs for backend errors
4. Verify all environment variables match Clerk Dashboard
5. Verify webhook signature verification is working
