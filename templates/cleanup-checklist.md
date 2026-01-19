# Phase Cleanup Checklist

Use this checklist after each phase to keep the repository clean.

---

## Phase 4 (Imagery) Cleanup

**After images are optimized and manifest is complete:**

### Archive
- [ ] `image-prompts.json` → `/docs/imagery/image-prompts-YYYYMMDD.json`

### Delete
- [ ] `/assets/images/generated/` — Raw DALL-E output (no longer needed)
- [ ] `/assets/images/processed/` — Intermediate processed images (no longer needed)

### Keep
- [ ] `image-requirements.json` — May be needed for reference
- [ ] `image-manifest.json` — Final image inventory
- [ ] `/assets/images/optimized/` — Final optimized images

**Commands:**
```bash
# Archive prompts
mkdir -p docs/imagery
mv image-prompts.json docs/imagery/image-prompts-$(date +%Y%m%d).json

# Delete temporary image directories
rm -rf assets/images/generated/
rm -rf assets/images/processed/
```

---

## Phase 5 (Build) Cleanup

**After build passes and all pages render:**

### Delete
- [ ] `*-test.astro` files in `src/components/`
- [ ] `*-demo.astro` files in `src/components/`
- [ ] `*-test.astro` files in `src/pages/`
- [ ] Unused import statements (flag for manual cleanup)

### Keep
- [ ] All production components and pages
- [ ] All layout files
- [ ] All configuration files

**Commands:**
```bash
# Delete test/demo files
find src/components -name "*-test.astro" -delete
find src/components -name "*-demo.astro" -delete
find src/pages -name "*-test.astro" -delete

# Note: Unused imports should be cleaned manually or with ESLint
```

---

## Phase 7 (Content) Cleanup

**After all content is written:**

### Keep
- [ ] All content files (markdown, JSON, etc.)
- [ ] Content schemas
- [ ] Content templates

**Note:** Content files are permanent. No cleanup needed unless there are draft/temp files.

---

## Phase 9 (QA) Cleanup

**After QA complete and approval received:**

### Archive
- [ ] `pagespeed-report.json` → `/docs/qa/pagespeed-report-YYYYMMDD.json`
- [ ] `link-check-report.json` → `/docs/qa/link-check-report-YYYYMMDD.json`
- [ ] `seo-checklist.md` → `/docs/qa/seo-checklist-YYYYMMDD.md`
- [ ] `og-checklist.md` → `/docs/qa/og-checklist-YYYYMMDD.md`

### Delete
- [ ] Temporary QA notes (if any)
- [ ] Draft checklists (if any)

### Keep
- [ ] Final QA approval documentation
- [ ] Deployment approval record

**Commands:**
```bash
# Archive QA reports
mkdir -p docs/qa
mv pagespeed-report.json docs/qa/pagespeed-report-$(date +%Y%m%d).json
mv link-check-report.json docs/qa/link-check-report-$(date +%Y%m%d).json
mv seo-checklist.md docs/qa/seo-checklist-$(date +%Y%m%d).md
mv og-checklist.md docs/qa/og-checklist-$(date +%Y%m%d).md
```

---

## Files to Always Keep

These files should NEVER be deleted:

- `project-profile.json` — Project identity
- `design-tokens.json` — Design system
- `site-structure.json` — Page hierarchy
- `content-schema.md` — Content structure
- `seo-requirements.md` — SEO rules
- `constraints.md` — Technical constraints
- `strategy.md` — Site strategy
- `.project-repo.json` — Repo verification
- `image-requirements.json` — Image specs (reference)
- `image-manifest.json` — Final image inventory
- `design-analysis.md` — Design intelligence (if Phase 3A done)

---

## Cleanup Best Practices

1. **Always archive before deleting** — Move important intermediate files to `/docs/[phase-name]/`
2. **Use date suffixes** — Add `-YYYYMMDD` to archived files for version tracking
3. **Confirm before deleting** — List exactly what will be deleted and ask for confirmation
4. **Keep reference files** — Don't delete files that might be needed for future reference
5. **Document cleanup** — Note what was cleaned up in phase completion notes

---

## Version History

- **v1.0** — 2026-01-18 — Initial cleanup checklist template
