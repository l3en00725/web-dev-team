# Admin Dashboard Setup Checklist

Follow this checklist to integrate the admin dashboard into your Astro project.

## ✅ Pre-Integration Checklist

- [ ] Astro project with SSR mode (`output: 'server'`)
- [ ] Clerk account created
- [ ] Supabase project created
- [ ] Node.js 20.x installed

---

## 📦 Step 1: Copy Files (5 minutes)

### Copy Admin Files
```bash
# From the template folder, copy to your project:

# Admin pages
cp -r src/pages/admin YOUR_PROJECT/src/pages/

# Admin API endpoints  
cp -r src/pages/api/admin YOUR_PROJECT/src/pages/api/

# Admin components
cp -r src/components/admin YOUR_PROJECT/src/components/

# Utilities
cp src/utils/clerk.ts YOUR_PROJECT/src/utils/
```

### Merge Middleware
```bash
# Copy the middleware example
cp src/middleware.ts.example YOUR_PROJECT/src/middleware.ts

# If you already have middleware, manually merge the admin routes section
```

**Verification**: Check that `YOUR_PROJECT/src/pages/admin/` exists with 20+ files.

---

## 📚 Step 2: Install Dependencies (3 minutes)

### Core Dependencies
```bash
cd YOUR_PROJECT

# Authentication & Database
npm install @clerk/astro@^2.11.0
npm install @supabase/supabase-js@^2.39.0

# React (required for components)
npm install react@19.2.3 react-dom@19.2.3
npm install @types/react@19.2.9 @types/react-dom@19.2.3
```

### UI Components
```bash
npm install @radix-ui/react-dialog@1.1.15
npm install @radix-ui/react-tabs@1.1.13
npm install @radix-ui/react-popover@1.1.15
npm install @radix-ui/react-dropdown-menu@2.1.16
npm install @radix-ui/react-scroll-area@1.2.10
npm install lucide-react@0.562.0
```

### Optional (for advanced features)
```bash
# Email campaigns
npm install resend@^3.2.0

# AI content generation
npm install openai@6.16.0
npm install @anthropic-ai/sdk@0.71.2

# Analytics charts
npm install recharts@3.6.0

# Date handling
npm install date-fns@4.1.0
```

**Verification**: Run `npm list @clerk/astro` - should show version 2.11.0+

---

## 🔐 Step 3: Configure Clerk (10 minutes)

### 3.1 Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Create new application
3. Enable **Email** and **Google OAuth** sign-in methods
4. Copy your **Publishable Key** and **Secret Key**

### 3.2 Add Clerk to Astro Config
Edit `astro.config.mjs`:

```javascript
import clerk from '@clerk/astro';

export default defineConfig({
  integrations: [
    clerk({
      afterSignInUrl: '/auth/redirect',
      afterSignUpUrl: '/auth/redirect',
    }),
  ],
  output: 'server', // REQUIRED
  adapter: vercel(), // or your preferred adapter
});
```

### 3.3 Set Environment Variables
Add to `.env`:
```bash
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3.4 Create Auth Redirect Page
Create `src/pages/auth/redirect.astro`:

```astro
---
const PERMANENT_SUPER_ADMIN = 'YOUR_EMAIL@example.com';

const { userId } = Astro.locals.auth();
if (!userId) {
  return Astro.redirect('/sign-in');
}

const user = await Astro.locals.currentUser();
const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
const isPermanentSuperAdmin = email === PERMANENT_SUPER_ADMIN;
const role = user?.publicMetadata?.role as string;

// Route based on role
if (isPermanentSuperAdmin || role === 'admin') {
  return Astro.redirect('/admin');
} else {
  return Astro.redirect('/'); // Or your donor portal
}
---
```

### 3.5 Set Up Clerk Webhook
1. In Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/clerk-webhook`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing Secret** to `.env` as `CLERK_WEBHOOK_SECRET`

**Verification**: Visit `/admin` - should redirect to sign-in if not authenticated.

---

## 🗄️ Step 4: Set Up Supabase (15 minutes)

### 4.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy **Project URL** and **Anon Key**

### 4.2 Add to Environment Variables
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 Run Database Schema
1. Open Supabase SQL Editor
2. Copy contents from `schema.sql`
3. Run the SQL script
4. Verify tables created:
   - `admin_users`
   - `people`
   - `programs`
   - `form_submissions`
   - `social_connections`
   - `social_posts`
   - `email_campaigns`
   - `site_settings`
   - `notification_settings`

### 4.4 Enable Row Level Security (RLS)
The schema includes RLS policies. Verify they're enabled:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Verification**: Run `SELECT * FROM admin_users;` - should return empty table (no errors).

---

## 👤 Step 5: Configure Your Super Admin (5 minutes)

### Update Super Admin Email
Replace `'ben@bluehomesgroup.com'` with your email in:

1. **`src/middleware.ts`**
   ```typescript
   const PERMANENT_SUPER_ADMIN = 'YOUR_EMAIL@example.com';
   ```

2. **`src/utils/clerk.ts`**
   ```typescript
   const PERMANENT_SUPER_ADMIN = 'YOUR_EMAIL@example.com';
   ```

3. **`src/pages/api/admin/add-user.ts`**
   ```typescript
   const PERMANENT_SUPER_ADMIN = 'YOUR_EMAIL@example.com';
   ```

4. **`src/pages/api/clerk-webhook.ts`**
   ```typescript
   const PERMANENT_SUPER_ADMIN = 'YOUR_EMAIL@example.com';
   ```

### Create Your Admin Account
1. Sign up at `/sign-up` with your super admin email
2. The webhook will automatically create your admin record
3. You'll be redirected to `/admin`

**Verification**: Sign in and check `/admin/users` - you should see yourself listed as Super Admin.

---

## 🎨 Step 6: Customize Branding (10 minutes)

### Update Logo
Replace logo in `src/components/admin/AdminLayout.astro`:
```astro
<img src="/your-logo.svg" alt="Your Company" />
```

### Update Colors
Edit `tailwind.config.mjs`:
```javascript
colors: {
  brand: {
    primary: '#YOUR_PRIMARY_COLOR',
    secondary: '#YOUR_SECONDARY_COLOR',
    accent: '#YOUR_ACCENT_COLOR',
    // ... etc
  }
}
```

### Customize Navigation
Edit `src/components/admin/AdminSidebar.astro`:
```typescript
const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Your Custom Section', href: '/admin/custom', icon: '🎯' },
  // ... add/remove as needed
];
```

**Verification**: Visit `/admin` - should show your logo and colors.

---

## 🧪 Step 7: Test Everything (15 minutes)

### Authentication Tests
- [ ] Sign in works
- [ ] Sign out works
- [ ] Admin redirect works (goes to `/admin`)
- [ ] Non-admin redirect works (goes to `/` or portal)
- [ ] Unauthorized users blocked from `/admin`

### Admin Features Tests
- [ ] Dashboard loads
- [ ] User management works (invite new user)
- [ ] People management works (add person)
- [ ] Event creation works
- [ ] Email compose page loads (if using Resend)
- [ ] Social composer loads (if using social features)
- [ ] Settings page works

### Mobile Tests
- [ ] Dashboard responsive on phone
- [ ] Sidebar menu works on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Forms work on mobile
- [ ] Touch targets are 44x44px minimum

**Verification**: All tests pass with no errors in console.

---

## 🚀 Step 8: Deploy (5 minutes)

### Vercel Deployment
```bash
npm install @astrojs/vercel
```

Update `astro.config.mjs`:
```javascript
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  adapter: vercel(),
  // ... rest of config
});
```

### Add Environment Variables to Vercel
1. Go to Vercel project settings
2. Add all variables from `.env`
3. Redeploy

### Update Clerk URLs
1. In Clerk Dashboard → Paths
2. Update all URLs to your production domain
3. Update webhook URL to production

**Verification**: Visit production `/admin` - everything works!

---

## 🎯 Optional Features

### Enable Email Campaigns
```bash
npm install resend
```
Add `RESEND_API_KEY` to `.env`

### Enable AI Content Generation
```bash
npm install openai @anthropic-ai/sdk
```
Add API keys to `.env`

### Enable Social Media Posting
Add `UPLOAD_POST_API_KEY` to `.env`

---

## ✅ Success Checklist

You're done when:

- [ ] Admin dashboard loads at `/admin`
- [ ] You can sign in with your super admin email
- [ ] You see the full dashboard with all menu items
- [ ] You can invite other admin users
- [ ] All pages load without errors
- [ ] Mobile version works properly
- [ ] Production deployment successful

---

## 🆘 Troubleshooting

### "Unauthorized" after sign-in
- Check `PERMANENT_SUPER_ADMIN` email matches your sign-in email exactly
- Verify webhook is processing `user.created` events
- Check `admin_users` table has your record

### "Module not found" errors
- Run `npm install` again
- Check all dependencies are in `package.json`
- Restart dev server

### Database connection errors
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is not paused
- Verify RLS policies allow your queries

### Clerk errors
- Check all Clerk environment variables are set
- Verify webhook is configured correctly
- Check Clerk application is not in development mode lock

---

## 📚 Next Steps

1. Invite your team members via `/admin/users`
2. Customize the dashboard features for your needs
3. Remove unused features (social, email, etc.)
4. Set up monitoring and analytics
5. Configure backup and recovery procedures

**Estimated Total Setup Time: 60-90 minutes**
