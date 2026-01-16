# Constraints

## Project: [PROJECT_NAME]
## Last Updated: [DATE]

---

## Technical Constraints

### Framework & Platform
- **Framework:** Astro
- **Deployment:** Vercel
- **Database:** Supabase
- **CMS:** [File-based / Astro Content Collections / Supabase]

### Performance Requirements
| Metric | Target |
|--------|--------|
| PageSpeed Mobile | ≥ 95 |
| PageSpeed Desktop | ≥ 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| FID | < 100ms |

### Image Constraints
| Type | Max Size |
|------|----------|
| Hero | 200kb |
| Content | 100kb |
| Thumbnail | 30kb |

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

---

## SEO Constraints

### Metadata Requirements
- [ ] Every page must have unique meta title
- [ ] Every page must have unique meta description (< 160 chars)
- [ ] Every page must have exactly one H1
- [ ] Heading hierarchy must be correct (H1 → H2 → H3)
- [ ] Every image must have alt text

### Schema Requirements
- [ ] All pages must have BreadcrumbList schema
- [ ] Blog posts must have Article schema
- [ ] Service pages must have Service schema
- [ ] Location pages must have LocalBusiness schema
- [ ] FAQ sections must have FAQPage schema

### URL Constraints
- [ ] No URL changes after Architect defines structure
- [ ] All URLs must be lowercase
- [ ] Use hyphens, not underscores
- [ ] No trailing query parameters for content pages

---

## Content Constraints

### Structure
- [ ] AI-friendly content pattern: question → answer → depth
- [ ] Short paragraphs (2-3 sentences)
- [ ] Clear heading hierarchy
- [ ] FAQ sections where appropriate

### E-E-A-T Requirements
- [ ] All content must have author attribution
- [ ] Authors must have bio and credentials
- [ ] Sources must be cited where applicable

---

## Business Constraints

### Budget
- LLM costs must be tracked and controlled
- Use appropriate LLM per agent (cost-conscious)

### Timeline
- [Define project timeline]

### Scope
- No features outside defined scope
- No pages outside site-structure.json
- No design changes without Design Agent

---

## Hard Limits (Non-Negotiable)

1. **No Sanity CMS** — Use file-based or Supabase
2. **No deploy without Admin approval** — Final gate required
3. **No deploy below 95 PageSpeed** — Performance is mandatory
4. **No deploy without Analytics** — GA4 + Search Console required
5. **No public admin routes** — Auth required
6. **No secrets in client code** — Server-side only

---

## Exceptions & Overrides

Document any approved exceptions here:

| Exception | Reason | Approved By | Date |
|-----------|--------|-------------|------|
| | | | |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [DATE] | Initial constraints | Architect Agent |
