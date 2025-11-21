# PHASE 2 — SIMULATE AND TRACE THE WORKFLOW CHAIN

**Date:** 2025-01-18  
**Status:** Simulation Complete

---

## Workflow Chain Overview

```
Update Data (scheduled/manual)
  ↓ (on completion)
Protect Dashboard (triggered)
  ↓ (on completion)
GitHub Pages Deploy (triggered)
```

---

## Simulation 1: Update Data Workflow

### Step 1: Checkout repository
**Action:** `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`
**Config:** `ref: main`
**Status:** ✅ **PASS** - Standard checkout, explicit branch

### Step 2: Checkout Precipice-2 repository
**Action:** `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`
**Config:** 
- `repository: retailxai/Precipice-2`
- `token: ${{ secrets.PRECIPICE_TOKEN }}`
- `ref: main`
- `path: precipice-2`
**Status:** ✅ **PASS** - All configs correct, path consistent

**Potential Issues:**
- ⚠️ Secret `PRECIPICE_TOKEN` must exist and have access to `retailxai/Precipice-2`
- ⚠️ Repository `retailxai/Precipice-2` must exist and have `main` branch

### Step 3: Set up Python
**Action:** `actions/setup-python@82c7e631bb3cdc910f68e0081d67478d79c6982d`
**Config:** `python-version: '3.11'`
**Status:** ✅ **PASS** - Standard setup

### Step 4: Install dependencies
**Command:** `pip install -r requirements.txt`
**Status:** ✅ **PASS** - File exists, standard pip install

### Step 5: Copy draft files from Precipice-2
**Commands:** Multiple `cp` commands with `precipice-2/` paths
**Status:** ✅ **PASS** - All paths use `precipice-2/` consistently

**Potential Issues:**
- ⚠️ Uses `|| true` - failures are silently ignored
- ⚠️ No validation that files were actually copied
- ⚠️ Assumes Precipice-2 has files in expected locations

### Step 6: Set up Node.js
**Action:** `actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8`
**Config:** `node-version: '20'`
**Status:** ✅ **PASS** - Standard setup

### Step 7: Build Svelte viewer
**Commands:**
```bash
cd dashboard/viewer
npm ci
npm run build
```
**Status:** ⚠️ **CONDITIONAL PASS**
- ✅ Directory exists
- ⚠️ Requires `package-lock.json` for `npm ci`
- ⚠️ Requires `package.json` with build script
- ⚠️ No error handling if build fails

**Potential Issues:**
- `npm ci` will fail if `package-lock.json` is missing or out of sync
- Build output must go to expected location (`assets/viewer/`)

### Step 8: Generate data files
**Command:** `python scripts/generate_data.py`
**Secrets Required:**
- `FINNHUB_API_KEY`
- `ALPHAVANTAGE_API_KEY`
- `PRECIPICE_API_URL`
- `PRECIPICE_API_KEY`
**Status:** ✅ **PASS** - Script exists, secrets referenced correctly

**Potential Issues:**
- ⚠️ Script must handle missing/invalid secrets gracefully
- ⚠️ Script must create `data/*.json` files

### Step 9: Commit changes
**Commands:**
```bash
git add data/*.json
git add drafts/*.md drafts/*.txt
git add pdfs/*.pdf
git add assets/viewer/*.js assets/css/viewer.css
git commit -m "Update data files, drafts, PDFs, and viewer [skip ci]"
git push origin main
```
**Status:** ✅ **PASS** - Explicit branch, error handling present

**Potential Issues:**
- ⚠️ `git add` patterns may not match if files don't exist (handled with `|| true`)
- ⚠️ Commit may fail if no changes staged (handled with check)

---

## Simulation 2: Protect Dashboard Workflow

### Trigger Analysis
**Triggers:**
- Push to specific paths ✅
- `workflow_dispatch` ✅
- `workflow_run` after "Update Data" ✅

**Status:** ✅ **PASS** - Triggers configured correctly

### Step 1: Checkout repository
**Action:** `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`
**Config:** `ref: main`
**Status:** ✅ **PASS**

### Step 2: Set up Node.js
**Action:** `actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8`
**Config:** `node-version: '20'`
**Status:** ✅ **PASS**

### Step 3: Install Staticrypt
**Command:** `npm install -g staticrypt`
**Status:** ⚠️ **CONDITIONAL PASS**
- ⚠️ Global install may require permissions
- ⚠️ No error handling if install fails

**Potential Issues:**
- May fail silently if npm registry is unavailable
- Should verify installation before use

### Step 4: Encrypt dashboard
**Command:** `staticrypt dashboard/index.html dashboard/index.html.enc --password "$DASHBOARD_PASSWORD"`
**Status:** ✅ **PASS** - File existence check, secret validation present

**Potential Issues:**
- ⚠️ Requires `dashboard/index.html` to exist (checked)
- ⚠️ Requires `DASHBOARD_PASSWORD` secret (checked)
- ⚠️ Template file check is optional (good)

### Step 5: Commit encrypted dashboard
**Commands:**
```bash
git add dashboard/index.html.enc
git commit -m "Update encrypted dashboard [skip ci]"
git push origin main
```
**Status:** ✅ **PASS** - File check, staged check, explicit branch

**Potential Issues:**
- ⚠️ No concurrency control - multiple runs could conflict

---

## Simulation 3: GitHub Pages Deploy (github_pages.yml)

### Trigger Analysis
**Triggers:**
- Push to `main` ✅
- `workflow_dispatch` ✅
- `workflow_run` after "Update Data" OR "Protect Dashboard" ✅

**Status:** ⚠️ **POTENTIAL ISSUE**
- Will trigger twice per cycle (once after Update Data, once after Protect Dashboard)
- May cause redundant deployments

### Step 1: Checkout repository
**Action:** `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`
**Config:** `ref: main`
**Status:** ✅ **PASS**

### Step 2: Configure Pages
**Action:** `actions/configure-pages@1f0c5cde4bc74cd7e1254d0cb4de8d49e9068c7d`
**Status:** ✅ **PASS** - Standard Pages setup

### Step 3: Upload artifact
**Action:** `actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa`
**Config:** `path: .`
**Status:** ✅ **PASS** - Uploads entire repo

### Step 4: Deploy to GitHub Pages
**Action:** `actions/deploy-pages@f33f41b675f0ab2dc5a6863c9a170fe83af3571e`
**Status:** ✅ **PASS** - Standard deployment

**Potential Issues:**
- ⚠️ No concurrency control - multiple deployments could conflict
- ⚠️ Duplicate workflow (`pages.yml`) will also deploy

---

## Simulation 4: GitHub Pages Deploy (pages.yml)

### Trigger Analysis
**Triggers:**
- Push to `main` ✅
- `workflow_dispatch` ✅
- **NO** `workflow_run` triggers

**Status:** ⚠️ **DUPLICATE WORKFLOW**
- Same name as `github_pages.yml`
- Will deploy independently
- Causes duplicate deployments

### Steps
**Status:** ✅ **PASS** - Same steps as `github_pages.yml` but without step names

**Potential Issues:**
- ⚠️ Duplicate deployment
- ⚠️ Missing step names (harder to debug)

---

## Critical Path Analysis

### Update Data → Protect Dashboard → GitHub Pages

**Flow:**
1. Update Data completes ✅
2. Protect Dashboard triggers ✅
3. Protect Dashboard completes ✅
4. GitHub Pages triggers (from Protect Dashboard) ✅
5. GitHub Pages ALSO triggers (from Update Data) ⚠️ **DUPLICATE**

**Issue:** `github_pages.yml` triggers on BOTH workflows, causing 2 deployments per cycle

---

## Secret Requirements

### Required Secrets:
1. ✅ `PRECIPICE_TOKEN` - For Precipice-2 checkout
2. ✅ `FINNHUB_API_KEY` - For data generation
3. ✅ `ALPHAVANTAGE_API_KEY` - For data generation
4. ✅ `PRECIPICE_API_URL` - For data generation
5. ✅ `PRECIPICE_API_KEY` - For data generation
6. ✅ `DASHBOARD_PASSWORD` - For dashboard encryption

**Status:** All secrets are properly referenced in workflows

---

## File Path Verification

### Required Files:
- ✅ `requirements.txt` - Exists
- ✅ `scripts/generate_data.py` - Exists
- ✅ `dashboard/viewer/` - Exists
- ✅ `dashboard/index.html` - Exists
- ✅ `resources/staticrypt-template.html` - Exists (optional)

**Status:** All required files exist

---

## Real Failure Points Identified

### 🔴 HIGH PRIORITY
1. **Duplicate GitHub Pages workflows** - Will cause conflicts
2. **Missing concurrency controls** - Race conditions possible
3. **Double deployment triggers** - Redundant deployments

### 🟡 MEDIUM PRIORITY
4. **npm ci failure handling** - May fail silently
5. **Staticrypt global install** - May fail without error
6. **Copy operation validation** - Failures silently ignored

### 🟢 LOW PRIORITY
7. **Missing step names** - Cosmetic, reduces observability
8. **No fetch-depth** - Low risk with current usage

---

## Simulation Results Summary

| Workflow | Steps | Pass | Conditional | Fail | Issues |
|----------|-------|------|-------------|------|--------|
| Update Data | 9 | 8 | 1 | 0 | Minor |
| Protect Dashboard | 5 | 4 | 1 | 0 | Minor |
| GitHub Pages (github_pages.yml) | 4 | 4 | 0 | 0 | Trigger logic |
| GitHub Pages (pages.yml) | 4 | 4 | 0 | 0 | Duplicate |

**Overall:** Workflows are functional but have optimization opportunities

---

## Next Steps

Proceeding to PHASE 3 — Fix Plan Generation
