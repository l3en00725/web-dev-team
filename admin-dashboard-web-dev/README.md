# Admin Dashboard Template

A complete, production-ready admin dashboard built with Astro, Clerk Auth, and Supabase.

## 📦 What's Included

- ✅ **58 Total Files**
  - 20 Admin Pages (dashboard, content, donors, email, events, forms, people, settings, social, users)
  - 28 API Endpoints (full CRUD + social media management)
  - 10 React/Astro Components (layouts, navigation, social composer)
  
- ✅ **Features**
  - 🔐 Role-based access control (Super Admin, Admin, Content Manager)
  - 👥 User management with Clerk invitations
  - 📧 Email campaign management (Resend integration)
  - 📱 Social media scheduler (LinkedIn, Facebook, Instagram, X)
  - 📊 Analytics dashboard with charts
  - 👨‍👩‍👧‍👦 People/contact management (donors, volunteers, parents)
  - 📝 Content management (blog posts, events)
  - 📋 Form submission tracking
  - ⚙️ Site-wide settings management
  - 📱 Fully mobile-responsive (optimized for all screen sizes)

## 🚀 Quick Start

### 1. Copy Files to Your Project

```bash
# Copy admin pages
cp -r admin-dashboard-template/src/pages/admin your-project/src/pages/
cp -r admin-dashboard-template/src/pages/api/admin your-project/src/pages/api/

# Copy components
cp -r admin-dashboard-template/src/components/admin your-project/src/components/

# Copy utilities
cp admin-dashboard-template/src/utils/clerk.ts your-project/src/utils/

# Copy middleware (merge with your existing middleware)
cp admin-dashboard-template/src/middleware.ts.example your-project/src/
```

### 2. Install Dependencies

```bash
npm install @clerk/astro @supabase/supabase-js resend openai @anthropic-ai/sdk recharts lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-dropdown-menu
```

See `docs/DEPENDENCIES.md` for complete list with versions.

### 3. Set Environment Variables

```bash
cp .env.example .env
```

Fill in all required variables (see `.env.example` for details).

### 4. Set Up Database

Run the SQL schema from `schema.sql` in your Supabase project.

### 5. Configure Your Super Admin

Update the `PERMANENT_SUPER_ADMIN` constant in these files:
- `src/middleware.ts`
- `src/utils/clerk.ts`
- `src/pages/api/admin/add-user.ts`

Change from `'ben@bluehomesgroup.com'` to your email.

### 6. Deploy

The dashboard works on Vercel, Netlify, or any platform supporting Astro SSR.

## 📚 Documentation

- [Setup Checklist](./docs/SETUP-CHECKLIST.md) - Step-by-step integration guide
- [Dependencies](./docs/DEPENDENCIES.md) - Complete npm package list
- [Database Schema](./docs/DATABASE-SCHEMA.md) - Supabase table structures
- [Customization Guide](./docs/CUSTOMIZATION.md) - How to customize for your brand
- [API Reference](./docs/API-REFERENCE.md) - All API endpoints documented

## 🎨 Customization

### Branding
- Logo: Update in `src/components/admin/AdminLayout.astro`
- Colors: Edit `tailwind.config.mjs` brand colors
- Navigation: Modify `src/components/admin/AdminSidebar.astro`

### Features
Remove unwanted features by deleting their folders:
- Don't need social media? Delete `src/pages/admin/social/`
- Don't need email campaigns? Delete `src/pages/admin/email/`

## 🔐 Security

This dashboard implements:
- ✅ Clerk authentication with secure session handling
- ✅ Row-level security (RLS) in Supabase
- ✅ Role-based access control (RBAC)
- ✅ API route protection via middleware
- ✅ CSRF protection
- ✅ Safe environment variable handling

**Important**: Always use `SUPABASE_SERVICE_ROLE_KEY` in API routes, never expose it client-side.

## 📱 Mobile Support

The entire dashboard is optimized for mobile:
- Responsive tables with progressive column hiding
- Touch-friendly buttons (44x44px minimum)
- Collapsible sidebar navigation
- Mobile-optimized forms and modals

## 🤝 Support

For issues or questions:
1. Check the docs folder for detailed guides
2. Review the setup checklist
3. Verify all environment variables are set

## 📄 License

This template is extracted from The Blue Kids nonprofit site and provided as-is for reuse in other projects.

## 🙏 Credits

Built with:
- [Astro](https://astro.build) - Web framework
- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Recharts](https://recharts.org/) - Analytics charts
