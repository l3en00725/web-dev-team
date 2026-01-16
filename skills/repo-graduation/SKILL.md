---
name: repo-graduation
description: Ensures every production site moves from the Hub repo to its own dedicated repository. Use immediately after Site Kickoff Skill completes. Blocks build if graduation is skipped.
owner: Builder Agent
trigger: After Site Kickoff Skill completes
llm: Cursor Auto
---

# Repo Graduation Skill

## Purpose

Enforce separation between Hub (system) and production site repos. The Hub is a template — every production site must live in its own repository.

---

## Why This Matters

- **Clean Hub:** Keeps the Hub reusable for future projects
- **Version Control:** Each site has independent git history
- **Deployment:** Vercel projects link to individual repos
- **Maintenance:** Updates to Hub don't affect production sites
- **Scalability:** Unlimited sites without repo pollution

---

## Trigger

Immediately after Site Kickoff Skill completes successfully.

---

## Prerequisites

- [ ] Site Kickoff Skill completed
- [ ] `project-profile.json` exists
- [ ] New repo name decided
- [ ] GitHub CLI (`gh`) installed
- [ ] GitHub authenticated

---

## Workflow

### Step 1: Confirm New Repo Name

Prompt user for:
- Repository name (e.g., `client-name-website`)
- Repository visibility (public/private)
- Organization (if applicable)

**Naming Convention:**
```
[client-name]-[site-type]
```

Examples:
- `acme-plumbing-website`
- `startup-saas-marketing`
- `jones-law-local-seo`

### Step 2: Create GitHub Repository

Using GitHub CLI:

```bash
gh repo create [repo-name] --private --description "Website for [client]"
```

Or if in organization:

```bash
gh repo create [org]/[repo-name] --private --description "Website for [client]"
```

### Step 3: Confirm Repository Created

- [ ] Repository URL is valid
- [ ] Repository is accessible
- [ ] Correct visibility settings

### Step 4: Initialize Fresh Git History

```bash
# Remove Hub's git history
rm -rf .git

# Initialize fresh repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit from web-dev-team Hub"
```

### Step 5: Push to New Repository

```bash
# Add new remote
git remote add origin [new-repo-url]

# Push to main
git push -u origin main
```

### Step 6: Verify Vercel Project Setup

- [ ] Create new Vercel project
- [ ] Link to new repository
- [ ] Configure build settings
- [ ] Set up environment variables

### Step 7: Confirm Hub Detachment

Verify:
- [ ] No reference to Hub repo remains
- [ ] New repo is the only origin
- [ ] Vercel points to new repo

---

## Required Outputs

| Output | Description |
|--------|-------------|
| New repo URL | Confirmed and accessible |
| Vercel project | Linked to new repo |
| Hub detached | No Hub references remain |
| Git history | Fresh, starting from initial commit |

---

## Failure Conditions

| Condition | Result |
|-----------|--------|
| Graduation skipped | **STOP** — Cannot proceed with build |
| Repo creation failed | **STOP** — Resolve before continuing |
| Vercel not linked | **STOP** — Must link before build |
| Hub still attached | **STOP** — Must fully detach |

---

## Verification Checklist

Before proceeding to next skill:

- [ ] `git remote -v` shows only new repo
- [ ] GitHub shows new repo with initial commit
- [ ] Vercel project exists and is linked
- [ ] Can push changes to new repo
- [ ] Hub repo unchanged

---

## Commands Reference

### Create Private Repo
```bash
gh repo create my-site --private
```

### Create Repo in Organization
```bash
gh repo create my-org/my-site --private
```

### Check Current Remotes
```bash
git remote -v
```

### Remove Old Remote
```bash
git remote remove origin
```

### Add New Remote
```bash
git remote add origin https://github.com/username/repo.git
```

---

## Troubleshooting

### GitHub CLI Not Authenticated
```bash
gh auth login
```

### Push Rejected
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Vercel Not Linking
1. Go to Vercel dashboard
2. Import project
3. Select new GitHub repo
4. Configure build settings

---

## Success Criteria

Repo Graduation is complete when:

- [ ] New repository exists on GitHub
- [ ] Fresh git history initialized
- [ ] Code pushed to new repo
- [ ] Vercel project created and linked
- [ ] Hub repo fully detached
- [ ] User confirms graduation complete

---

## Next Steps

After Repo Graduation completes:

1. **Env Variable Setup Skill** — Configure environment variables
2. **Architect Agent** — Continue with strategy work
