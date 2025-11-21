# Quick Start Guide

**Status:** Onboarding  
**Purpose:** First 10 minutes guide for new engineers

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## Audience

This guide is for:
- New engineers joining the project
- Engineers setting up the repository locally
- Anyone needing to understand the system quickly

---

## Prerequisites

- Git installed
- Node.js 20+ (for Svelte viewer development)
- Python 3.11+ (for data generation scripts)
- GitHub account with access to `retailxai/retailxai-site` repository

---

## First 10 Minutes

### 1. Clone the Repository

```bash
git clone https://github.com/retailxai/retailxai-site.git
cd retailxai-site
```

### 2. Understand the Structure

Key directories:
- `.github/workflows/` - GitHub Actions workflows
- `dashboard/` - Dashboard and Svelte viewer source
- `data/` - Generated JSON data files
- `docs/` - Documentation
- `scripts/` - Python data generation scripts

### 3. Read First

Start with these files in order:
1. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Navigation hub
2. **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)** - Current system state
3. **[GLOSSARY.md](GLOSSARY.md)** - Terminology reference

### 4. Understand the Workflow Chain

The system runs three automated workflows:
1. **Update Data** - Runs every 15 minutes, generates data files
2. **Protect Dashboard** - Encrypts dashboard after data updates
3. **GitHub Pages** - Deploys site after encryption

See [SYSTEM_STATUS.md](SYSTEM_STATUS.md) → Workflow Chain for details.

### 5. First Simple Test

Build the Svelte viewer locally:

```bash
cd dashboard/viewer
npm install
npm run build
```

Expected output: Files in `assets/viewer/` and `assets/css/viewer.css`

**Verify Setup:**
- [ ] Build completes without errors
- [ ] Output files exist in `assets/viewer/` directory
- [ ] `assets/css/viewer.css` is generated
- [ ] No missing dependency warnings

---

## Common Tasks

### View Workflow Status

Check GitHub Actions workflow runs:
- Go to: `https://github.com/retailxai/retailxai-site/actions`
- Look for: Update Data, Protect Dashboard, GitHub Pages workflows

### Update Workflows

1. Edit workflow files in `.github/workflows/`
2. Test locally if possible (GitHub Actions only runs on push)
3. Update [SYSTEM_STATUS.md](SYSTEM_STATUS.md) if workflow behavior changes
4. Update [GITHUB_ACTIONS_PINNED.md](GITHUB_ACTIONS_PINNED.md) if action SHAs change

### Add New Features

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes
3. Update relevant documentation
4. Test locally
5. Create PR with clear description

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Troubleshooting

### Issue: Viewer Build Fails

**Symptoms:** `npm run build` errors in `dashboard/viewer/`

**Solutions:**
- Check Node.js version: `node --version` (should be 20+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors in Svelte components
- See [dashboard/viewer/README.md](dashboard/viewer/README.md) for details

### Issue: Workflow Not Triggering

**Symptoms:** GitHub Actions workflow doesn't run

**Solutions:**
- Check workflow file syntax (YAML validation)
- Verify triggers are correct (schedule, push paths, workflow_run)
- Check branch name (some workflows only trigger on `main`)
- Verify GitHub Actions is enabled in repository settings

### Issue: Data Files Not Updating

**Symptoms:** `data/*.json` files are stale

**Solutions:**
- Check Update Data workflow status in GitHub Actions
- Verify secrets are configured (FINNHUB_API_KEY, ALPHAVANTAGE_API_KEY, etc.)
- Check workflow logs for errors
- Manually trigger workflow: Actions → Update Data → Run workflow

### Issue: Dashboard Not Accessible

**Symptoms:** Can't access password-protected dashboard

**Solutions:**
- Verify `dashboard/index.html.enc` exists
- Check Protect Dashboard workflow completed successfully
- Verify DASHBOARD_PASSWORD secret is set
- Check GitHub Pages deployment status

---

## Next Steps

After completing this quick start:

1. **Read Architecture:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
2. **Understand Security:** [SYSTEM_STATUS.md](SYSTEM_STATUS.md) → Security Posture
3. **Review Workflows:** [WORKFLOW_SIMULATION.md](WORKFLOW_SIMULATION.md)
4. **Contribute:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Getting Help

- **Documentation:** Start with [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- **Terminology:** See [GLOSSARY.md](GLOSSARY.md)
- **System State:** See [SYSTEM_STATUS.md](SYSTEM_STATUS.md)
- **Workflow Details:** See [WORKFLOW_SIMULATION.md](WORKFLOW_SIMULATION.md)

---

**Last Updated:** 2025-01-18

