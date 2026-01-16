# Social Publishing APIs Playbook

## Overview

Integration guides for LinkedIn and Medium APIs for content distribution.

---

## LinkedIn API

### API Details

| Property | Value |
|----------|-------|
| Base URL | `https://api.linkedin.com/v2/` |
| Auth | OAuth 2.0 |
| Rate Limit | Varies by endpoint |
| Cost | Free |

### Environment Variables

```
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

### Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create new app
3. Request "Share on LinkedIn" product
4. Add OAuth 2.0 redirect URLs
5. Copy Client ID and Secret

### OAuth Flow

```typescript
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

// Step 1: Generate auth URL
export function getLinkedInAuthUrl(
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
    scope: 'r_liteprofile w_member_social'
  });
  
  return `${LINKEDIN_AUTH_URL}?${params}`;
}

// Step 2: Exchange code for token
export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  expires_in: number;
}> {
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

// Step 3: Get user profile
export async function getLinkedInProfile(
  accessToken: string
): Promise<{
  id: string;
  firstName: string;
  lastName: string;
}> {
  const response = await fetch(
    'https://api.linkedin.com/v2/me',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const data = await response.json();
  
  return {
    id: data.id,
    firstName: data.localizedFirstName,
    lastName: data.localizedLastName
  };
}
```

### Publish Post

```typescript
interface LinkedInPost {
  text: string;
  url?: string;
  title?: string;
}

export async function publishToLinkedIn(
  accessToken: string,
  userId: string,
  post: LinkedInPost
): Promise<{ id: string }> {
  const body: any = {
    author: `urn:li:person:${userId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: post.text
        },
        shareMediaCategory: post.url ? 'ARTICLE' : 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };
  
  if (post.url) {
    body.specificContent['com.linkedin.ugc.ShareContent'].media = [{
      status: 'READY',
      originalUrl: post.url,
      title: {
        text: post.title || ''
      }
    }];
  }
  
  const response = await fetch(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(body)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}
```

---

## Medium API

### API Details

| Property | Value |
|----------|-------|
| Base URL | `https://api.medium.com/v1/` |
| Auth | Integration Token |
| Rate Limit | Not documented |
| Cost | Free |

### Environment Variable

```
MEDIUM_ACCESS_TOKEN=your_integration_token
```

### Setup

1. Go to [Medium Settings](https://medium.com/me/settings)
2. Scroll to "Integration tokens"
3. Generate new token
4. Copy and store securely

### Get User Info

```typescript
interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export async function getMediumUser(
  accessToken: string
): Promise<MediumUser> {
  const response = await fetch(
    'https://api.medium.com/v1/me',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.data;
}
```

### Publish Post

```typescript
interface MediumPost {
  title: string;
  content: string;
  contentFormat: 'html' | 'markdown';
  tags?: string[];
  canonicalUrl?: string;
  publishStatus?: 'public' | 'draft' | 'unlisted';
}

interface MediumPostResponse {
  id: string;
  title: string;
  authorId: string;
  url: string;
  canonicalUrl: string;
  publishStatus: string;
  publishedAt: number;
  license: string;
  licenseUrl: string;
}

export async function publishToMedium(
  accessToken: string,
  userId: string,
  post: MediumPost
): Promise<MediumPostResponse> {
  const response = await fetch(
    `https://api.medium.com/v1/users/${userId}/posts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: post.title,
        contentFormat: post.contentFormat,
        content: post.content,
        tags: post.tags?.slice(0, 5) || [],
        canonicalUrl: post.canonicalUrl,
        publishStatus: post.publishStatus || 'public'
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Medium API error: ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  return data.data;
}
```

---

## Unified Publisher

```typescript
interface SocialPost {
  title: string;
  content: string;
  excerpt: string;
  canonicalUrl: string;
  tags?: string[];
  platforms: ('linkedin' | 'medium')[];
}

interface PublishResult {
  platform: string;
  success: boolean;
  url?: string;
  error?: string;
}

export async function publishToSocial(
  post: SocialPost,
  credentials: {
    linkedin?: {
      accessToken: string;
      userId: string;
    };
    medium?: {
      accessToken: string;
      userId: string;
    };
  }
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  
  // LinkedIn
  if (post.platforms.includes('linkedin') && credentials.linkedin) {
    try {
      const result = await publishToLinkedIn(
        credentials.linkedin.accessToken,
        credentials.linkedin.userId,
        {
          text: `${post.excerpt}\n\nRead more: ${post.canonicalUrl}`,
          url: post.canonicalUrl,
          title: post.title
        }
      );
      
      results.push({
        platform: 'linkedin',
        success: true,
        url: `https://www.linkedin.com/feed/update/${result.id}`
      });
    } catch (error) {
      results.push({
        platform: 'linkedin',
        success: false,
        error: error.message
      });
    }
  }
  
  // Medium
  if (post.platforms.includes('medium') && credentials.medium) {
    try {
      const result = await publishToMedium(
        credentials.medium.accessToken,
        credentials.medium.userId,
        {
          title: post.title,
          content: post.content,
          contentFormat: 'markdown',
          tags: post.tags,
          canonicalUrl: post.canonicalUrl,
          publishStatus: 'public'
        }
      );
      
      results.push({
        platform: 'medium',
        success: true,
        url: result.url
      });
    } catch (error) {
      results.push({
        platform: 'medium',
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}
```

---

## Best Practices

### LinkedIn
1. **Keep posts concise** — LinkedIn favors shorter posts
2. **Include link preview** — Always add URL for article shares
3. **Use hashtags sparingly** — 3-5 relevant hashtags max
4. **Refresh tokens** — LinkedIn tokens expire, implement refresh

### Medium
1. **Always set canonical** — Prevents duplicate content issues
2. **Use markdown** — More reliable than HTML
3. **Limit tags** — Max 5 tags per post
4. **Quality content** — Medium may curate or distribute

### General
1. **Don't auto-publish** — Always require user confirmation
2. **Log everything** — Track published posts
3. **Handle errors gracefully** — One failure shouldn't stop others
4. **Respect rate limits** — Add delays between requests
