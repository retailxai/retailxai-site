# Git Commands for Repository Setup

## Quick Reference: Repository Creation Commands

### 1. Clean Current Repository (Precipice-2)

```bash
cd /Users/jbriss/github-retailxai/Precipice-2
git ls-files | grep -E "(\.env|\.log|\.db|\.sqlite|\.mp3)"
git rm --cached pipeline_run.log pipeline_output.log 2>/dev/null || true
git commit -m "Remove sensitive files from tracking"
```

### 2. Create Private Repository (precipice-2)

```bash
cd /Users/jbriss/github-retailxai/Precipice-2
git checkout main
git rm docs/dashboard.html docs/dashboard.js docs/tech-stack.html
git rm -r scripts/github_pages_templates/
git commit -m "Remove public-facing files (moved to retailxai-site)"
git remote add origin https://github.com/retailxai/precipice-2.git
git push -u origin main
```

### 3. Create Public Repository (retailxai-site)

```bash
cd /Users/jbriss/github-retailxai/retailxai-site
git init
git branch -M main
git add .
git commit -m "Initial public repository setup - GitHub Pages site"
git remote add origin https://github.com/retailxai/retailxai-site.git
git push -u origin main
```

### 4. Set Repository Visibility

```bash
# Make retailxai-site public
gh repo edit retailxai/retailxai-site --visibility public

# Verify precipice-2 is private
gh repo view retailxai/precipice-2 --json visibility
```

### 5. Enable GitHub Pages

```bash
# Via web: https://github.com/retailxai/retailxai-site/settings/pages
# Select "GitHub Actions" as source
# Or verify:
gh api repos/retailxai/retailxai-site/pages --jq '.source.branch'
```

### 6. Verify Deployment

```bash
gh api repos/retailxai/retailxai-site/pages/builds --jq '.[0].status'
# Site: https://retailxai.github.io/retailxai-site/
```

