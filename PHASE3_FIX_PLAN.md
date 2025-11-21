# PHASE 3 — FIX PLAN

**Date:** 2025-01-18  
**Status:** Ready for Review

---

## Fix Plan Summary

**Total Issues Identified:** 10  
**Critical Fixes:** 3  
**Medium Priority Fixes:** 3  
**Low Priority Fixes:** 4  

---

## Execution Order & Fixes

### FIX 1: Remove Duplicate GitHub Pages Workflow 🔴 CRITICAL
**File:** `.github/workflows/pages.yml`  
**Action:** DELETE FILE  
**Reason:** Duplicate of `github_pages.yml`, causes conflicting deployments  
**Risk Level:** LOW (removing duplicate)  
**Confidence:** 95%  
**Expected Outcome:** Single deployment per trigger, no conflicts  
**Lines Affected:** Entire file (33 lines)

---

### FIX 2: Add Concurrency Control to Protect Dashboard 🟡 MEDIUM
**File:** `.github/workflows/protect_dashboard.yml`  
**Action:** ADD concurrency group  
**Location:** After `permissions:` section (line 25)  
**Risk Level:** LOW  
**Confidence:** 90%  
**Expected Outcome:** Prevents race conditions on encryption/commit  
**Change:**
```yaml
permissions:
  contents: write

concurrency:
  group: protect-dashboard
  cancel-in-progress: true

jobs:
```

---

### FIX 3: Add Concurrency Control to GitHub Pages 🟡 MEDIUM
**File:** `.github/workflows/github_pages.yml`  
**Action:** ADD concurrency group  
**Location:** After `permissions:` section (line 16)  
**Risk Level:** LOW  
**Confidence:** 90%  
**Expected Outcome:** Prevents deployment conflicts  
**Change:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: github-pages-deploy
  cancel-in-progress: true

jobs:
```

---

### FIX 4: Fix GitHub Pages Trigger Logic 🟡 MEDIUM
**File:** `.github/workflows/github_pages.yml`  
**Action:** MODIFY workflow_run trigger  
**Location:** Lines 7-10  
**Reason:** Currently triggers on BOTH "Update Data" AND "Protect Dashboard", causing double deployments  
**Risk Level:** MEDIUM (changes deployment behavior)  
**Confidence:** 85%  
**Expected Outcome:** Single deployment after Protect Dashboard completes  
**Current:**
```yaml
workflow_run:
  workflows: ["Update Data", "Protect Dashboard"]
  types:
    - completed
```
**Change To:**
```yaml
workflow_run:
  workflows: ["Protect Dashboard"]
  types:
    - completed
```
**Rationale:** Protect Dashboard already triggers after Update Data, so we only need to deploy after Protect Dashboard completes.

---

### FIX 5: Add Error Handling for npm ci 🟢 LOW
**File:** `.github/workflows/update_data.yml`  
**Action:** ADD error handling  
**Location:** Lines 84-89  
**Risk Level:** LOW  
**Confidence:** 80%  
**Expected Outcome:** Better error messages if npm ci fails  
**Current:**
```yaml
- name: Build Svelte viewer
  run: |
    cd dashboard/viewer
    npm ci
    npm run build
  continue-on-error: false
```
**Change To:**
```yaml
- name: Build Svelte viewer
  run: |
    cd dashboard/viewer
    if [ ! -f "package-lock.json" ]; then
      echo "Error: package-lock.json not found"
      exit 1
    fi
    npm ci || { echo "Error: npm ci failed"; exit 1; }
    npm run build || { echo "Error: npm build failed"; exit 1; }
  continue-on-error: false
```

---

### FIX 6: Add Error Handling for Staticrypt Install 🟢 LOW
**File:** `.github/workflows/protect_dashboard.yml`  
**Action:** ADD error handling  
**Location:** Lines 41-43  
**Risk Level:** LOW  
**Confidence:** 80%  
**Expected Outcome:** Better error messages if install fails  
**Current:**
```yaml
- name: Install Staticrypt
  run: |
    npm install -g staticrypt
```
**Change To:**
```yaml
- name: Install Staticrypt
  run: |
    npm install -g staticrypt || { echo "Error: Staticrypt installation failed"; exit 1; }
    staticrypt --version || { echo "Error: Staticrypt not found after install"; exit 1; }
```

---

### FIX 7: Add Copy Operation Validation 🟢 LOW
**File:** `.github/workflows/update_data.yml`  
**Action:** ADD validation after copy  
**Location:** After line 77  
**Risk Level:** LOW  
**Confidence:** 70%  
**Expected Outcome:** Warn if no files were copied  
**Add After Line 77:**
```yaml
          echo "Copied draft and PDF files"
          # Validate that at least some files were copied
          if [ ! "$(ls -A drafts 2>/dev/null)" ] && [ ! "$(ls -A pdfs 2>/dev/null)" ]; then
            echo "Warning: No files were copied from Precipice-2"
          fi
```

---

### FIX 8: Add Step Names to pages.yml 🟢 LOW
**File:** `.github/workflows/pages.yml`  
**Action:** DELETE FILE (covered by FIX 1)  
**Status:** N/A - File will be deleted

---

### FIX 9: Add Fetch Depth (Optional) 🟢 LOW
**Files:** All workflows  
**Action:** SKIP  
**Reason:** Low priority, current usage doesn't require full history  
**Status:** DEFERRED

---

### FIX 10: Add Explicit Working Directory (Optional) 🟢 LOW
**File:** `.github/workflows/update_data.yml`  
**Action:** SKIP  
**Reason:** Current implementation works, low risk  
**Status:** DEFERRED

---

## Fix Priority Matrix

| Fix # | Priority | Risk | Confidence | Impact |
|-------|----------|------|------------|--------|
| 1 | 🔴 CRITICAL | LOW | 95% | HIGH |
| 2 | 🟡 MEDIUM | LOW | 90% | MEDIUM |
| 3 | 🟡 MEDIUM | LOW | 90% | MEDIUM |
| 4 | 🟡 MEDIUM | MEDIUM | 85% | HIGH |
| 5 | 🟢 LOW | LOW | 80% | LOW |
| 6 | 🟢 LOW | LOW | 80% | LOW |
| 7 | 🟢 LOW | LOW | 70% | LOW |

---

## Recommended Execution Plan

### Phase A: Critical Fixes (Must Do)
1. ✅ FIX 1: Delete duplicate `pages.yml`
2. ✅ FIX 4: Fix GitHub Pages trigger logic

### Phase B: Hardening (Should Do)
3. ✅ FIX 2: Add concurrency to Protect Dashboard
4. ✅ FIX 3: Add concurrency to GitHub Pages

### Phase C: Error Handling (Nice to Have)
5. ✅ FIX 5: Add npm ci error handling
6. ✅ FIX 6: Add Staticrypt error handling
7. ✅ FIX 7: Add copy validation

---

## Files to Modify

1. **DELETE:** `.github/workflows/pages.yml`
2. **MODIFY:** `.github/workflows/protect_dashboard.yml` (add concurrency)
3. **MODIFY:** `.github/workflows/github_pages.yml` (add concurrency, fix trigger)
4. **MODIFY:** `.github/workflows/update_data.yml` (add error handling)

---

## Expected Outcomes After Fixes

### Before:
- ❌ Duplicate deployments
- ❌ Race conditions possible
- ❌ Double triggers per cycle
- ⚠️ Silent failures possible

### After:
- ✅ Single deployment per cycle
- ✅ No race conditions
- ✅ Clean trigger chain
- ✅ Better error visibility

---

## Risk Assessment

**Overall Risk:** LOW  
**Breaking Changes:** NONE  
**Backward Compatibility:** MAINTAINED  
**Rollback Plan:** Git revert if issues occur

---

## Confirmation Required

**Ready to proceed with:**
- ✅ FIX 1: Delete `pages.yml`
- ✅ FIX 2: Add concurrency to Protect Dashboard
- ✅ FIX 3: Add concurrency to GitHub Pages
- ✅ FIX 4: Fix GitHub Pages trigger
- ✅ FIX 5: Add npm ci error handling
- ✅ FIX 6: Add Staticrypt error handling
- ✅ FIX 7: Add copy validation

**Awaiting user confirmation to proceed to PHASE 4 — Apply Fixes**
