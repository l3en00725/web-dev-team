---
name: social-publishing
description: Connects site to social platforms for content distribution. LinkedIn and Medium for v1. Use after Admin Dashboard is configured.
owner: Admin/QA Agent
trigger: After Admin Dashboard Skill, optional per site
llm: Claude
---

# Social Publishing Skill

## Purpose

Enable content distribution from admin backend to social platforms. Helps drive traffic and improve Bing rankings through social signals.

---

## Trigger

After Admin Dashboard Skill completes. Optional per site.

---

## Supported Platforms (v1)

| Platform | Status |
|----------|--------|
| LinkedIn | Supported |
| Medium | Supported |
| Twitter/X | Future (not v1) |

---

## Required Environment Variables

```
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
MEDIUM_ACCESS_TOKEN=
```

---

## Platform Requirements

### LinkedIn

| Field | Requirement |
|-------|-------------|
| Headline | < 150 characters |
| Body text | Supports markdown-like formatting |
| Image | Optional, recommended |
| Link | URL to original content |

### Medium

| Field | Requirement |
|-------|-------------|
| Title | Required |
| Body | Markdown supported |
| Tags | Up to 5 tags |
| Canonical URL | **Required** — points to original |

---

## Workflow

### Step 1: User Authenticates Social Accounts

**LinkedIn OAuth Flow:**

```typescript
// src/lib/linkedin-auth.ts
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

export function getLinkedInAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
    scope: 'r_liteprofile w_member_social'
  });
  
  return `${LINKEDIN_AUTH_URL}?${params}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: import.meta.env.LINKEDIN_CLIENT_ID,
      client_secret: import.meta.env.LINKEDIN_CLIENT_SECRET
    })
  });
  
  return response.json();
}
```

**Medium Integration:**

```typescript
// src/lib/medium-auth.ts
// Medium uses self-issued integration tokens
// No OAuth flow needed - user provides token from Medium settings

export function validateMediumToken(token: string): boolean {
  return token.length > 0 && token.startsWith('1');
}
```

### Step 2: Content Created via Admin Dashboard

Content from Admin Dashboard content editor:

```typescript
interface SocialPost {
  title: string;
  body: string;
  excerpt: string;
  canonicalUrl: string;
  image?: string;
  tags?: string[];
  platforms: ('linkedin' | 'medium')[];
}
```

### Step 3: User Selects Platforms to Publish

Admin UI provides:
- Platform checkboxes
- Preview for each platform
- Publish / Schedule options

### Step 4: Format Content Per Platform

**LinkedIn Formatter:**

```typescript
// src/lib/linkedin-publisher.ts
export function formatForLinkedIn(post: SocialPost): {
  headline: string;
  body: string;
  link: string;
  image?: string;
} {
  // Truncate headline to 150 chars
  const headline = post.title.length > 147 
    ? post.title.slice(0, 147) + '...'
    : post.title;
  
  // Format body with excerpt and call to action
  const body = `${post.excerpt}\n\nRead more: ${post.canonicalUrl}`;
  
  return {
    headline,
    body,
    link: post.canonicalUrl,
    image: post.image
  };
}

export async function publishToLinkedIn(
  accessToken: string,
  userId: string,
  content: ReturnType<typeof formatForLinkedIn>
) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.body
          },
          shareMediaCategory: content.image ? 'IMAGE' : 'ARTICLE',
          media: [{
            status: 'READY',
            originalUrl: content.link,
            title: {
              text: content.headline
            }
          }]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });
  
  return response.json();
}
```

**Medium Formatter:**

```typescript
// src/lib/medium-publisher.ts
export function formatForMedium(post: SocialPost): {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl: string;
} {
  return {
    title: post.title,
    content: post.body,
    tags: (post.tags || []).slice(0, 5),
    canonicalUrl: post.canonicalUrl
  };
}

export async function publishToMedium(
  accessToken: string,
  userId: string,
  content: ReturnType<typeof formatForMedium>
) {
  const response = await fetch(
    `https://api.medium.com/v1/users/${userId}/posts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: content.title,
        contentFormat: 'markdown',
        content: content.content,
        tags: content.tags,
        canonicalUrl: content.canonicalUrl,
        publishStatus: 'public'
      })
    }
  );
  
  return response.json();
}
```

### Step 5: Publish or Schedule

```typescript
// src/lib/social-publisher.ts
export async function publishToSocial(
  post: SocialPost,
  connections: {
    linkedin?: { accessToken: string; userId: string };
    medium?: { accessToken: string; userId: string };
  }
) {
  const results: Record<string, { success: boolean; error?: string; url?: string }> = {};
  
  if (post.platforms.includes('linkedin') && connections.linkedin) {
    try {
      const formatted = formatForLinkedIn(post);
      const result = await publishToLinkedIn(
        connections.linkedin.accessToken,
        connections.linkedin.userId,
        formatted
      );
      results.linkedin = { success: true, url: result.id };
    } catch (error) {
      results.linkedin = { success: false, error: error.message };
    }
  }
  
  if (post.platforms.includes('medium') && connections.medium) {
    try {
      const formatted = formatForMedium(post);
      const result = await publishToMedium(
        connections.medium.accessToken,
        connections.medium.userId,
        formatted
      );
      results.medium = { success: true, url: result.data.url };
    } catch (error) {
      results.medium = { success: false, error: error.message };
    }
  }
  
  return results;
}
```

### Step 6: Log Published Content

**Supabase Table:**

```sql
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES posts(id),
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  platform_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'published',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Bing Visibility Note

Bing uses social engagement (likes, shares, comments) as a ranking factor. Consistent social promotion via this skill helps Bing visibility:

- Regular posting schedule
- Engagement monitoring
- Cross-platform presence

---

## Hard Limits

- **No auto-publishing** without user confirmation
- **No publishing without canonical URL** set
- **No platforms beyond v1 scope** (LinkedIn, Medium only)

---

## Required Outputs

| Output | Description |
|--------|-------------|
| Social connections | Configured in admin |
| Publish interface | Working in admin dashboard |
| Published content log | Stored in Supabase |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Missing credentials | Disable that platform |
| API error | Log and notify user |
| Missing canonical URL | **STOP** — Cannot publish |

---

## Admin UI Components

### Connection Status

```typescript
interface SocialConnection {
  platform: 'linkedin' | 'medium';
  connected: boolean;
  username?: string;
  connectedAt?: string;
  expiresAt?: string;
}
```

### Publish Modal

- Platform selection checkboxes
- Preview for each platform
- Canonical URL confirmation
- Publish / Schedule buttons

---

## Success Criteria

Social Publishing Skill is complete when:

- [ ] LinkedIn OAuth flow working
- [ ] Medium token integration working
- [ ] Content formatting per platform
- [ ] Publish interface in admin
- [ ] Canonical URLs enforced
- [ ] Published content logged
- [ ] Error handling implemented
