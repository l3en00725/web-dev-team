# Required NPM Dependencies

## Core Dependencies (Required)

### Authentication
```json
"@clerk/astro": "^2.11.0"
```

### Database
```json
"@supabase/supabase-js": "^2.39.0"
```

### React (Required for components)
```json
"react": "19.2.3",
"react-dom": "19.2.3",
"@types/react": "19.2.9",
"@types/react-dom": "19.2.3"
```

### Astro & Framework
```json
"astro": "^5.0.0",
"@astrojs/react": "4.4.2",
"@astrojs/tailwind": "^5.1.0",
"@astrojs/vercel": "^8.0.0",  // or @astrojs/node for other platforms
"tailwindcss": "^3.4.1"
```

---

## UI Components (Required for admin pages)

### Radix UI Primitives
```json
"@radix-ui/react-dialog": "1.1.15",
"@radix-ui/react-dropdown-menu": "2.1.16",
"@radix-ui/react-popover": "1.1.15",
"@radix-ui/react-scroll-area": "1.2.10",
"@radix-ui/react-separator": "1.1.8",
"@radix-ui/react-slot": "1.2.4",
"@radix-ui/react-tabs": "1.1.13"
```

### UI Utilities
```json
"class-variance-authority": "0.7.1",
"clsx": "2.1.1",
"tailwind-merge": "3.4.0",
"tailwindcss-animate": "1.0.7",
"lucide-react": "0.562.0"  // Icons
```

---

## Optional Dependencies (Based on features you want)

### Email Campaigns
If using `/admin/email` features:
```json
"resend": "^3.2.0"
```

### AI Content Generation  
If using social media AI features:
```json
"openai": "6.16.0",
"@anthropic-ai/sdk": "0.71.2"
```

### Analytics Charts
If using `/admin/social/analytics`:
```json
"recharts": "3.6.0"
```

### Date Handling
If using calendar/scheduling features:
```json
"date-fns": "4.1.0",
"react-day-picker": "9.13.0"
```

### Webhook Verification
For Clerk webhooks:
```json
"svix": "^1.24.0"
```

---

## Complete package.json Example

```json
{
  "name": "your-project",
  "dependencies": {
    "@anthropic-ai/sdk": "0.71.2",
    "@astrojs/react": "4.4.2",
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/vercel": "^8.0.0",
    "@clerk/astro": "^2.11.0",
    "@radix-ui/react-dialog": "1.1.15",
    "@radix-ui/react-dropdown-menu": "2.1.16",
    "@radix-ui/react-popover": "1.1.15",
    "@radix-ui/react-scroll-area": "1.2.10",
    "@radix-ui/react-separator": "1.1.8",
    "@radix-ui/react-slot": "1.2.4",
    "@radix-ui/react-tabs": "1.1.13",
    "@supabase/supabase-js": "^2.39.0",
    "@types/react": "19.2.9",
    "@types/react-dom": "19.2.3",
    "astro": "^5.0.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "date-fns": "4.1.0",
    "lucide-react": "0.562.0",
    "openai": "6.16.0",
    "react": "19.2.3",
    "react-day-picker": "9.13.0",
    "react-dom": "19.2.3",
    "recharts": "3.6.0",
    "resend": "^3.2.0",
    "svix": "^1.24.0",
    "tailwind-merge": "3.4.0",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.0"
  }
}
```

---

## Installation Commands

### Minimal Install (Authentication + Database only)
```bash
npm install @clerk/astro@^2.11.0 @supabase/supabase-js@^2.39.0 react@19.2.3 react-dom@19.2.3
npm install @radix-ui/react-dialog@1.1.15 @radix-ui/react-tabs@1.1.13 lucide-react@0.562.0
```

### Full Install (All features)
```bash
npm install @clerk/astro @supabase/supabase-js react react-dom
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-dropdown-menu @radix-ui/react-scroll-area
npm install resend openai @anthropic-ai/sdk recharts date-fns lucide-react svix
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
```

---

## Notes

1. **React 19**: The template uses React 19. If your project uses React 18, you may need to adjust.

2. **Astro 5**: Requires Astro 5.x. Update with `npm install astro@latest` if needed.

3. **Optional Features**: You can skip AI, email, and analytics packages if you don't use those features.

4. **TypeScript**: The template uses TypeScript. Ensure your project has TypeScript support.

5. **Node Version**: Requires Node.js 20.x or higher.
