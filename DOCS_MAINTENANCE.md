# Documentation Maintenance Guide

**Status:** Operational Guide  
**Purpose:** Guidelines for keeping documentation current and consistent

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## Canonical Files

These files are the single source of truth for their topics. Update them when the system changes.

| Topic | Canonical File | When to Update |
|-------|---------------|----------------|
| **System Status** | `SYSTEM_STATUS.md` | Workflow changes, security updates, system health changes |
| **Workflows** | `SYSTEM_STATUS.md` | Workflow triggers, steps, or behavior changes |
| **Security Posture** | `SYSTEM_STATUS.md` | Security measures added/removed, hardening changes |
| **Architecture** | `README.md` | High-level system description changes |
| **Action SHAs** | `GITHUB_ACTIONS_PINNED.md` | When updating workflow action SHAs |

---

## Update Checklist

When making changes that affect documentation:

### Workflow Changes

- [ ] Update `SYSTEM_STATUS.md` → Workflow Chain section
- [ ] Update `SYSTEM_STATUS.md` → Workflow Configuration Details section
- [ ] If action SHAs change, update `GITHUB_ACTIONS_PINNED.md`
- [ ] Verify `DOCUMENTATION_INDEX.md` links are still accurate

### Security Changes

- [ ] Update `SYSTEM_STATUS.md` → Security Posture section
- [ ] Add entry to `SECURITY_FIXES_APPLIED.md` if documenting a fix
- [ ] Update `SYSTEM_STATUS.md` → Security Rating if applicable

### System Health Changes

- [ ] Update `SYSTEM_STATUS.md` → System Health Scores section
- [ ] Update `SYSTEM_STATUS.md` → Known Limitations section if needed

### Architecture Changes

- [ ] Update `README.md` → Features/Architecture sections
- [ ] Update `docs/architecture.html` if HTML docs exist

---

## Documentation Standards

### Terminology

Use consistent terminology across all docs:

- **retailxai-site**: This GitHub Pages repository (public)
- **Precipice-2**: Private repository containing the pipeline engine
- **RetailXAI**: The overall project/product name
- **Update Data workflow**: The scheduled data generation workflow
- **Protect Dashboard workflow**: The dashboard encryption workflow
- **GitHub Pages workflow**: The deployment workflow

### Scoring

- Use 0-10 scale consistently
- Document what each score means
- Update scores when system changes
- Keep historical scores in historical docs, not current status docs

### File Headers

Historical documents should include:

```markdown
**⚠️ HISTORICAL DOCUMENT**
**Date:** YYYY-MM-DD
**Status:** Historical reference - [context]

**Note:** This document is preserved for historical context. For current system state, see **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)**.
```

### Cross-References

When referencing other docs:

- Use relative paths: `[SYSTEM_STATUS.md](SYSTEM_STATUS.md)`
- For docs in subdirectories: `[docs/history/PHASE_TWO.md](docs/history/PHASE_TWO.md)`
- Always link to canonical sources when available

---

## Preventing Documentation Drift

### Regular Review

- Review `SYSTEM_STATUS.md` monthly or after major changes
- Verify workflow descriptions match actual workflow files
- Check that security measures documented match implementation
- Ensure scores reflect current state
- **Canonical consistency check:** When updating SYSTEM_STATUS.md, verify SYSTEM_ARCHITECTURE.md and DOCUMENTATION_INDEX.md remain aligned (workflow names, triggers, branch handling, action SHAs)

### After Major Changes

1. Update canonical files immediately
2. Update `DOCUMENTATION_INDEX.md` if structure changes
3. Mark outdated historical docs with historical banners
4. Update cross-references

### Before Releases

1. Verify all canonical files are current
2. Check that README.md matches current features
3. Ensure security posture is accurately documented
4. Update any version numbers or dates

---

## File Organization

### Root Level

- `README.md` - Public project overview
- `SYSTEM_STATUS.md` - Canonical system status ⭐
- `DOCUMENTATION_INDEX.md` - Documentation navigation hub
- `DOCS_MAINTENANCE.md` - This file
- `AUDIT_REPORT.md` - Deep technical audit (reference)
- `SECURITY_FIXES_APPLIED.md` - Security fix history
- `GITHUB_ACTIONS_PINNED.md` - Action SHA reference ledger

### Historical Docs

- `docs/history/` - Phase summaries and historical references
- `FINAL_AUDIT_SUMMARY.md` - Historical audit summary
- `FINAL_GIT_SYNC_PLAN.md` - Historical Git sync plan
- `FIX_PLAN.md` - Historical fix plan
- `FIXES_APPLIED_SUMMARY.md` - Historical fixes summary

### Component Docs

- `docs/mockups.md` - UI mockups
- `dashboard/viewer/README.md` - Viewer component docs
- `pdfs/README.md` - PDFs folder docs
- `drafts/README.md` - Drafts folder docs

---

## Common Issues to Avoid

### ❌ Don't

- Create duplicate canonical sources for the same topic
- Leave outdated "TODO" or "placeholder" language in current docs
- Mix historical context with current state without clear separation
- Use inconsistent terminology or scoring systems
- Reference files that have been moved without updating links

### ✅ Do

- Update canonical files when system changes
- Mark historical docs clearly
- Use consistent terminology
- Cross-reference canonical sources
- Keep `DOCUMENTATION_INDEX.md` current

---

## Quick Reference

**Current system state:** `SYSTEM_STATUS.md`  
**Documentation navigation:** `DOCUMENTATION_INDEX.md`  
**Workflow details:** `SYSTEM_STATUS.md` → Workflow Chain section  
**Security details:** `SYSTEM_STATUS.md` → Security Posture section  
**Action SHAs:** `GITHUB_ACTIONS_PINNED.md`  
**Deep audit:** `AUDIT_REPORT.md`  
**Project overview:** `README.md`

---

**Last Updated:** 2025-01-18

