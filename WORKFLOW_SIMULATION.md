# Workflow Simulation & Analysis

**Status:** Reference  
**Date:** 2025-01-18  

**Note:** This document provides detailed workflow execution scenarios. For current workflow state and configuration, see **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)**.

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## WORKFLOW SIMULATION: Update Data

### What Should Happen Step-by-Step

1. **Trigger:** Schedule (every 15 minutes) OR workflow_dispatch OR push to `scripts/**` or `schemas/**`
2. **Concurrency Check:** 
   - ✅ If another Update Data run is in progress, it will be cancelled
   - ✅ Only one Update Data workflow runs at a time
3. **Checkout:**
   - ✅ Checks out `main` branch explicitly (NEW FIX)
   - ✅ Checks out Precipice-2 repository
4. **Setup:**
   - ✅ Python 3.11
   - ✅ Node.js 20
5. **Build:**
   - ✅ Builds Svelte viewer
   - ✅ Generates data files
6. **Commit:**
   - ✅ Commits changes to `main` branch (NEW FIX)
   - ✅ Pushes to `origin main` explicitly (NEW FIX)

### Where Previously It Failed

**Before Fixes:**
- ❌ Workflow checked out whatever branch triggered it (could be feature branch)
- ❌ `git push` without branch specification pushed to wrong branch
- ❌ Multiple overlapping runs could conflict
- ❌ Commits went to feature branch instead of `main`
- ❌ Workflow chain broke because Protect Dashboard expected commits on `main`

**Failure Points:**
1. **Branch Mismatch:** If triggered from feature branch, commits went there
2. **Wrong Branch Push:** `git push` pushed to current branch, not `main`
3. **Concurrency Conflicts:** Multiple runs could modify same files simultaneously
4. **Broken Chain:** Protect Dashboard workflow_run couldn't find commits on `main`

### Why New Changes Should Avoid That Failure

**✅ Fix #1: Explicit Branch Checkout (`ref: main`)**
- Workflow always checks out `main` branch, regardless of trigger branch
- Ensures consistent behavior
- Prevents feature branch contamination

**✅ Fix #2: Concurrency Controls**
- Only one Update Data run at a time
- Prevents race conditions
- Cancels overlapping runs automatically
- Prevents data file conflicts

**✅ Fix #3: Explicit Branch Push (`git push origin main`)**
- Always pushes to `main` branch
- No ambiguity about target branch
- Ensures commits reach correct branch
- Enables workflow chain to work correctly

---

## WORKFLOW SIMULATION: Protect Dashboard

### What Should Happen Step-by-Step

1. **Trigger:** 
   - Push to dashboard/assets files OR
   - workflow_dispatch OR
   - workflow_run after Update Data completes
2. **Checkout:**
   - ✅ Checks out `main` branch explicitly (NEW FIX)
3. **Setup:**
   - ✅ Node.js 20
   - ✅ Installs Staticrypt globally
4. **Encrypt:**
   - ✅ Encrypts `dashboard/index.html` → `dashboard/index.html.enc`
   - ✅ Uses template if available
5. **Commit:**
   - ✅ Commits encrypted file to `main` branch (NEW FIX)
   - ✅ Pushes to `origin main` explicitly (NEW FIX)

### Where Previously It Failed

**Before Fixes:**
- ❌ Workflow checked out whatever branch triggered it
- ❌ `git push` without branch specification pushed to wrong branch
- ❌ If Update Data ran on feature branch, Protect Dashboard wouldn't trigger
- ❌ Encrypted dashboard went to wrong branch
- ❌ GitHub Pages couldn't find encrypted dashboard on `main`

**Failure Points:**
1. **Branch Mismatch:** Encrypted dashboard went to feature branch
2. **Wrong Branch Push:** `git push` pushed to current branch
3. **Broken Chain:** If Update Data ran on wrong branch, Protect Dashboard wouldn't trigger
4. **Missing Files:** GitHub Pages expected files on `main` but they were elsewhere

### Why New Changes Should Avoid That Failure

**✅ Fix #1: Explicit Branch Checkout (`ref: main`)**
- Always checks out `main` branch
- Ensures encrypted dashboard is on correct branch
- Works correctly even if triggered from feature branch

**✅ Fix #3: Explicit Branch Push (`git push origin main`)**
- Always pushes to `main` branch
- Ensures encrypted dashboard reaches correct branch
- Enables GitHub Pages to find the file

---

## WORKFLOW SIMULATION: GitHub Pages Deployment

### What Should Happen Step-by-Step

1. **Trigger:**
   - Push to `main` branch OR
   - workflow_dispatch OR
   - workflow_run after Update Data OR Protect Dashboard completes
2. **Checkout:**
   - ✅ Checks out repository (defaults to trigger branch, but should be `main`)
3. **Configure:**
   - ✅ Configures GitHub Pages
4. **Upload:**
   - ✅ Uploads entire site as artifact
5. **Deploy:**
   - ✅ Deploys to GitHub Pages environment

### Where Previously It Failed

**Before Fixes:**
- ❌ Only triggered on `main` branch (this is correct, but...)
- ❌ If Update Data/Protect Dashboard ran on feature branch, GitHub Pages wouldn't trigger
- ❌ Missing files if previous workflows ran on wrong branch
- ❌ Deployed outdated content if commits went to wrong branch

**Failure Points:**
1. **Missing Trigger:** If Update Data ran on feature branch, workflow_run wouldn't trigger
2. **Missing Files:** Encrypted dashboard and data files not on `main`
3. **Outdated Content:** Deployed old content because new commits went to wrong branch

### Why New Changes Should Avoid That Failure

**✅ Indirect Fix: Update Data & Protect Dashboard Now Push to `main`**
- Update Data always pushes to `main`
- Protect Dashboard always pushes to `main`
- GitHub Pages workflow_run triggers correctly
- All files are on `main` branch where GitHub Pages expects them

**✅ Workflow Chain Now Works:**
- Update Data → commits to `main` → triggers Protect Dashboard
- Protect Dashboard → commits to `main` → triggers GitHub Pages
- GitHub Pages → deploys from `main` → finds all files

---

## EXPECTED WORKFLOW CHAIN FLOW

### Scenario 1: Scheduled Update Data Run

1. **Update Data** (scheduled, every 15 min)
   - ✅ Checks out `main` branch
   - ✅ Generates data files
   - ✅ Commits to `main`
   - ✅ Pushes to `origin main`
   - ✅ Completes successfully

2. **Protect Dashboard** (triggered by workflow_run)
   - ✅ Checks out `main` branch
   - ✅ Finds updated data files on `main`
   - ✅ Encrypts dashboard
   - ✅ Commits to `main`
   - ✅ Pushes to `origin main`
   - ✅ Completes successfully

3. **GitHub Pages** (triggered by workflow_run)
   - ✅ Checks out `main` branch
   - ✅ Finds encrypted dashboard on `main`
   - ✅ Finds all data files on `main`
   - ✅ Deploys successfully

### Scenario 2: Manual Trigger from Feature Branch

1. **User triggers Update Data** from feature branch
   - ✅ Workflow checks out `main` branch (not feature branch)
   - ✅ Generates data files
   - ✅ Commits to `main` (not feature branch)
   - ✅ Pushes to `origin main`
   - ✅ Completes successfully

2. **Protect Dashboard** (triggered by workflow_run)
   - ✅ Checks out `main` branch
   - ✅ Finds commits on `main`
   - ✅ Encrypts dashboard
   - ✅ Commits to `main`
   - ✅ Completes successfully

3. **GitHub Pages** (triggered by workflow_run)
   - ✅ Deploys from `main`
   - ✅ Finds all files
   - ✅ Completes successfully

---

## KEY IMPROVEMENTS

### Before Fixes
- ❌ Workflows could push to wrong branch
- ❌ Multiple runs could conflict
- ❌ Workflow chain could break
- ❌ Files could be on wrong branch

### After Fixes
- ✅ Workflows always push to `main`
- ✅ Only one Update Data run at a time
- ✅ Workflow chain works correctly
- ✅ All files on correct branch

---

**Simulation Complete**  
**All workflows should now work correctly**

