# Phase 9: Post-Deploy Monitoring Plan

**Status:** Reference  
**Date:** 2025-01-18  

**Note:** This document provides monitoring recommendations. For current system state, see **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)**.

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

---

## Monitoring Checklist

### Daily Automated Scans

1. ✅ **GitHub Actions Status**
   - Monitor workflow run success rates
   - Alert on consecutive failures
   - Track execution times

2. ✅ **GitHub Pages Deployment**
   - Verify latest deployment succeeded
   - Check deployment URL accessibility
   - Validate deployment timestamp

3. ✅ **Data Freshness**
   - Check JSON file timestamps
   - Alert if data > 1 hour old
   - Validate JSON structure

4. ✅ **Svelte Viewer Build Integrity**
   - Verify viewer.js exists and is recent
   - Check viewer.css exists
   - Validate build artifacts

5. ✅ **Staticrypt Encryption Integrity**
   - Verify dashboard/index.html.enc exists
   - Check file is recent (< 1 hour old)
   - Validate file size (not empty)

### Weekly Automated Scans

6. ✅ **Branch Divergence**
   - Compare local/remote main branches
   - Alert on divergence > 1 commit
   - Track merge frequency

7. ✅ **Secret Health**
   - Verify all required secrets exist
   - Check secret usage in workflows
   - Alert on missing secrets

8. ✅ **Cron Drift Detection**
   - Verify scheduled workflows run on time
   - Track schedule accuracy
   - Alert on missed runs

9. ✅ **Build Artifact Hash Consistency**
   - Compare viewer build hashes
   - Detect unexpected changes
   - Alert on hash mismatches

10. ✅ **Regression Detection**
    - Monitor workflow execution patterns
    - Detect unexpected behavior changes
    - Track performance metrics

---

## Recommended Monitoring Implementation

### Option 1: GitHub Actions Status Page
- Use GitHub's built-in Actions status
- Set up email/Slack notifications
- Monitor via GitHub API

### Option 2: Custom Monitoring Script
```bash
#!/bin/bash
# check_workflow_health.sh

# Check last workflow run
LAST_RUN=$(gh run list --workflow=update_data.yml --limit 1 --json conclusion --jq '.[0].conclusion')
if [ "$LAST_RUN" != "success" ]; then
  echo "ALERT: Last workflow run failed"
fi

# Check data freshness
DATA_AGE=$(find data/*.json -mmin +60 | wc -l)
if [ "$DATA_AGE" -gt 0 ]; then
  echo "ALERT: Data files older than 1 hour"
fi

# Check encrypted dashboard
if [ ! -f "dashboard/index.html.enc" ]; then
  echo "ALERT: Encrypted dashboard missing"
fi
```

### Option 3: External Monitoring Service
- Use services like UptimeRobot, Pingdom
- Monitor GitHub Pages URL
- Alert on downtime

---

## Regression Prevention Guidelines

1. **Never remove error handling**
2. **Never remove branch specifications**
3. **Never remove concurrency controls**
4. **Always test workflow changes in feature branch**
5. **Always verify workflow_run chains**
6. **Always validate secrets before use**
7. **Always pin action SHAs**
8. **Always use explicit branch operations**

---

## Silent Failure Detection

### Current Protections

1. ✅ **Explicit exit codes** - Failures are detected
2. ✅ **Error messages** - Failures are logged
3. ✅ **Workflow status** - GitHub shows success/failure
4. ✅ **Concurrency controls** - Prevents race conditions

### Additional Recommendations

1. **Add workflow status checks** to monitoring
2. **Add data validation** after generation
3. **Add deployment verification** after Pages deploy
4. **Add alerting** for consecutive failures

---

## Enterprise Reliability Improvements

### Short-term (1-2 weeks)
1. Add JSON schema validation
2. Add deployment verification step
3. Add workflow status monitoring
4. Add data freshness alerts

### Medium-term (1-2 months)
1. Add retry logic for API calls
2. Add quota monitoring
3. Add comprehensive logging
4. Add performance metrics

### Long-term (3-6 months)
1. Add automated testing
2. Add canary deployments
3. Add rollback mechanisms
4. Add comprehensive observability

---

**Phase 9 Status:** ✅ COMPLETE

