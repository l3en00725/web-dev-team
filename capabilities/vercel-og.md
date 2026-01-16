# Vercel OG Image Playbook

## Overview

@vercel/og enables dynamic Open Graph image generation at the edge, creating social preview images on-the-fly.

---

## Package Details

| Property | Value |
|----------|-------|
| Package | `@vercel/og` |
| Runtime | Vercel Edge Functions |
| Output | PNG or JPEG |
| Max Size | 8MB |

---

## Installation

```bash
npm install @vercel/og
```

---

## Basic Implementation

### Simple OG Image Endpoint

```typescript
// src/pages/api/og.ts (Astro)
// or pages/api/og.tsx (Next.js)

import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Default Title';
  
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
        },
        children: {
          type: 'div',
          props: {
            style: {
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
            },
            children: title
          }
        }
      }
    },
    {
      width: 1200,
      height: 630,
    }
  );
};
```

---

## Advanced Implementation

### Full-Featured OG Image

```typescript
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

// Load custom font
const interBold = fetch(
  new URL('/fonts/Inter-Bold.ttf', import.meta.url)
).then(res => res.arrayBuffer());

export const GET: APIRoute = async ({ request }) => {
  const fontData = await interBold;
  
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Default Title';
  const subtitle = url.searchParams.get('subtitle') || '';
  const type = url.searchParams.get('type') || 'page';
  const theme = url.searchParams.get('theme') || 'dark';
  
  const themes = {
    dark: {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      text: '#f8fafc',
      subtext: '#94a3b8',
      accent: '#3b82f6'
    },
    light: {
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      text: '#0f172a',
      subtext: '#64748b',
      accent: '#2563eb'
    },
    brand: {
      bg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      text: '#ffffff',
      subtext: '#bfdbfe',
      accent: '#fbbf24'
    }
  };
  
  const colors = themes[theme as keyof typeof themes] || themes.dark;
  
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          backgroundImage: colors.bg,
        },
        children: [
          // Logo area
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: 'https://yoursite.com/logo.png',
                    width: 150,
                    height: 40,
                  }
                }
              ]
            }
          },
          // Content area
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                // Title
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 64,
                      fontWeight: 700,
                      color: colors.text,
                      lineHeight: 1.2,
                      maxWidth: '90%',
                    },
                    children: title
                  }
                },
                // Subtitle
                subtitle && {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 28,
                      color: colors.subtext,
                      marginTop: 20,
                      maxWidth: '80%',
                    },
                    children: subtitle
                  }
                }
              ].filter(Boolean)
            }
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 24,
                      color: colors.subtext,
                    },
                    children: 'yoursite.com'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 20,
                      color: colors.accent,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    },
                    children: type
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
        }
      ]
    }
  );
};
```

---

## Template Variants

### Blog Post Template

```typescript
const blogTemplate = (title: string, author: string, date: string) => ({
  type: 'div',
  props: {
    style: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px',
      backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    },
    children: [
      // Category badge
      {
        type: 'div',
        props: {
          style: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: 18,
            color: 'white',
            marginBottom: 30,
            width: 'fit-content',
          },
          children: 'Blog'
        }
      },
      // Title
      {
        type: 'div',
        props: {
          style: {
            fontSize: 56,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.2,
            flex: 1,
          },
          children: title
        }
      },
      // Author and date
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: 22, color: '#bfdbfe' },
                children: `By ${author}`
              }
            },
            {
              type: 'div',
              props: {
                style: { fontSize: 22, color: '#93c5fd' },
                children: date
              }
            }
          ]
        }
      }
    ]
  }
});
```

### Location Page Template

```typescript
const locationTemplate = (city: string, state: string, service: string) => ({
  type: 'div',
  props: {
    style: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px',
      backgroundImage: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    },
    children: [
      // Service badge
      {
        type: 'div',
        props: {
          style: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: 18,
            color: 'white',
            marginBottom: 30,
            width: 'fit-content',
          },
          children: service
        }
      },
      // Location
      {
        type: 'div',
        props: {
          style: {
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.1,
          },
          children: `${city}, ${state}`
        }
      },
      // Tagline
      {
        type: 'div',
        props: {
          style: {
            fontSize: 28,
            color: '#a7f3d0',
            marginTop: 20,
          },
          children: `Professional ${service} Services`
        }
      }
    ]
  }
});
```

---

## Usage in Components

### Astro SEO Component

```astro
---
const { title, description, type = 'page' } = Astro.props;

const ogImageUrl = new URL('/api/og', Astro.site);
ogImageUrl.searchParams.set('title', title);
ogImageUrl.searchParams.set('subtitle', description.slice(0, 100));
ogImageUrl.searchParams.set('type', type);
---

<meta property="og:image" content={ogImageUrl.toString()} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:image" content={ogImageUrl.toString()} />
<meta name="twitter:card" content="summary_large_image" />
```

---

## Styling Reference

### Supported CSS Properties

Most CSS properties work, but note:
- Use `flexbox` for layout (no grid)
- Colors as hex or rgba
- No external stylesheets
- Inline styles only

### Supported Elements

- `div`
- `span`
- `img`
- `svg`

---

## Best Practices

1. **Keep it simple** — Complex layouts may fail
2. **Test thoroughly** — Preview with social debuggers
3. **Cache when possible** — Add cache headers
4. **Handle errors** — Return fallback image on failure
5. **Optimize fonts** — Only load weights you need
