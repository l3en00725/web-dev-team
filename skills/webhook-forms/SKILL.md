---
name: webhook-forms
description: Simple form handling via webhooks with lead storage in Supabase. Use when a site needs contact forms or lead capture. No bloated form builders.
owner: Builder Agent
trigger: When site requires forms
llm: Cursor Auto
---

# Webhook/Forms Skill

## Purpose

Webhook-first forms that store leads and expose endpoints for integrations. Simple, fast, and fully controlled — no third-party form builders.

---

## Trigger

When Site Kickoff identifies that the site requires:
- Contact forms
- Lead capture
- Quote requests
- Booking forms
- Newsletter signups

---

## Philosophy

**Why webhooks over form builders:**
- Full control over data
- No third-party dependencies
- Faster load times
- Direct Supabase integration
- Easy CRM/automation connections
- No monthly fees

**Hard Limits:**
- No Typeform
- No Jotform
- No Google Forms embeds
- Simple fields only

---

## Workflow

### Step 1: Identify Form Requirements

Based on `project-profile.json`, determine:

| Form Type | Typical Fields |
|-----------|----------------|
| Contact | name, email, phone, message |
| Quote Request | name, email, phone, service, details |
| Booking | name, email, phone, date, time, service |
| Newsletter | email |

### Step 2: Create Supabase Table

```sql
-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_type TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  processed BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (from API route)
CREATE POLICY "Service role can insert leads"
  ON leads FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only authenticated admins can read
CREATE POLICY "Admins can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Step 3: Create Form Component

```astro
---
// src/components/ContactForm.astro
export interface Props {
  formType?: string;
}

const { formType = 'contact' } = Astro.props;
---

<form 
  id="contact-form" 
  class="contact-form"
  data-form-type={formType}
>
  <div class="form-group">
    <label for="name">Name</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      required 
      autocomplete="name"
    />
  </div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required 
      autocomplete="email"
    />
  </div>
  
  <div class="form-group">
    <label for="phone">Phone</label>
    <input 
      type="tel" 
      id="phone" 
      name="phone" 
      autocomplete="tel"
    />
  </div>
  
  <div class="form-group">
    <label for="message">Message</label>
    <textarea 
      id="message" 
      name="message" 
      rows="4"
    ></textarea>
  </div>
  
  <button type="submit">Send Message</button>
  
  <div class="form-status" aria-live="polite"></div>
</form>

<script>
  const form = document.getElementById('contact-form');
  const status = form.querySelector('.form-status');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.formType = form.dataset.formType;
    data.sourceUrl = window.location.href;
    
    // Capture UTM params
    const params = new URLSearchParams(window.location.search);
    data.utmSource = params.get('utm_source');
    data.utmMedium = params.get('utm_medium');
    data.utmCampaign = params.get('utm_campaign');
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        status.textContent = 'Thank you! We\'ll be in touch soon.';
        status.classList.add('success');
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      status.textContent = 'Something went wrong. Please try again.';
      status.classList.add('error');
    }
  });
</script>
```

### Step 4: Create API Endpoint

```typescript
// src/pages/api/submit-form.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert into Supabase
    const { error } = await supabase.from('leads').insert({
      form_type: data.formType || 'contact',
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      source_url: data.sourceUrl,
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign,
      metadata: {}
    });
    
    if (error) throw error;
    
    // Trigger webhooks (optional)
    await triggerWebhooks(data);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function triggerWebhooks(data: any) {
  const webhookUrls = import.meta.env.FORM_WEBHOOK_URLS?.split(',') || [];
  
  for (const url of webhookUrls) {
    try {
      await fetch(url.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Webhook failed: ${url}`, error);
    }
  }
}
```

### Step 5: Configure Webhook URLs

Add to `.env`:
```
FORM_WEBHOOK_URLS=https://hooks.zapier.com/xxx,https://crm.example.com/webhook
```

### Step 6: Expose Webhook URLs in Admin

In Admin Dashboard, display:
- Zapier webhook URL format
- CRM integration instructions
- Copy button for easy setup

---

## Supported Integrations

| Integration | Method |
|-------------|--------|
| Zapier | Webhook URL |
| Make (Integromat) | Webhook URL |
| HubSpot | API or Webhook |
| Salesforce | API or Webhook |
| Email notifications | SendGrid/Resend API |
| Slack | Incoming Webhook |

---

## Required Outputs

| Output | Description |
|--------|-------------|
| Form component(s) | Astro components for each form type |
| API endpoint | `/api/submit-form` route |
| Supabase table | `leads` table with proper schema |
| Webhook config | URLs stored in env vars |
| Admin visibility | Webhook URLs shown in dashboard |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Supabase not configured | **STOP** — Run Env Variable Setup |
| Form submission fails | Debug and fix before continuing |
| Webhook URLs not exposed | Must add to Admin Dashboard |

---

## Testing Checklist

- [ ] Form renders correctly
- [ ] Validation works (required fields)
- [ ] Submission creates Supabase record
- [ ] Success message displays
- [ ] Error handling works
- [ ] UTM parameters captured
- [ ] Webhooks trigger (if configured)

---

## Success Criteria

Webhook/Forms Skill is complete when:

- [ ] Form components created
- [ ] API endpoint working
- [ ] Supabase table exists
- [ ] Submissions stored correctly
- [ ] Webhook URLs configurable
- [ ] Admin can see webhook URLs
- [ ] All forms tested and working
