# Documentation Index

**Status:** Canonical  
**Last Updated:** 2025-01-18  
**Purpose:** Central navigation hub for all repository documentation

This file is the canonical navigation hub. All documentation links back to this index.

---

## Quick Navigation

### 🎯 Start Here
- **[README.md](README.md)** - Project overview and public documentation
- **[QUICK_START.md](QUICK_START.md)** - First 10 minutes guide for new engineers
- **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)** - Current system state, workflows, and security posture
- **[GLOSSARY.md](GLOSSARY.md)** - Terminology reference

### 📚 Core Documentation

#### System Architecture & Status
- **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)** ⭐ **Canonical** - Current workflow state, security posture, system health
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - Architecture overview and component relationships
- **[AUDIT_REPORT.md](AUDIT_REPORT.md)** - Deep technical audit with detailed recommendations

#### Security & Hardening
- **[SECURITY_FIXES_APPLIED.md](SECURITY_FIXES_APPLIED.md)** - Security fixes implemented and rationale
- **[GITHUB_ACTIONS_PINNED.md](GITHUB_ACTIONS_PINNED.md)** - Reference ledger of pinned action SHAs
- **[PRECIPICE_TOKEN_SETUP_GUIDE.md](PRECIPICE_TOKEN_SETUP_GUIDE.md)** ⭐ **Operational** - Complete guide for setting up PRECIPICE_TOKEN secret and permissions

#### Workflows & CI/CD
- **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)** ⭐ **Canonical** - Workflow chain description and current state
- **[WORKFLOW_SIMULATION.md](WORKFLOW_SIMULATION.md)** - Detailed workflow execution scenarios
- **[WORKFLOW_CHAIN_SIMULATION.md](WORKFLOW_CHAIN_SIMULATION.md)** - End-to-end chain simulation

#### Developer Onboarding
- **[QUICK_START.md](QUICK_START.md)** ⭐ **Onboarding** - First 10 minutes guide
- **[README.md](README.md)** - Public project overview
- **[docs/getting_started.html](docs/getting_started.html)** - Installation and setup guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and development standards

#### Project History
- **[docs/history/PHASE_TWO.md](docs/history/PHASE_TWO.md)** - Phase 2 deliverables (historical)
- **[docs/history/PHASE_THREE.md](docs/history/PHASE_THREE.md)** - Phase 3 summary (historical)
- **[docs/history/PHASE_DIAGNOSTICS.md](docs/history/PHASE_DIAGNOSTICS.md)** - Phase 1-10 diagnostic reports (historical reference)

**Note:** Phase diagnostic files (PHASE1_DIAGNOSTIC.md, PHASE2_WORKFLOW_SIMULATIONS.md, etc.) remain in root for reference but are consolidated in `docs/history/PHASE_DIAGNOSTICS.md`.

#### UI & Components
- **[docs/mockups.md](docs/mockups.md)** - UI mockups and design specifications
- **[dashboard/viewer/README.md](dashboard/viewer/README.md)** - Svelte viewer documentation
- **[pdfs/README.md](pdfs/README.md)** - PDF files storage
- **[drafts/README.md](drafts/README.md)** - Article draft files storage

#### Launch & Public
- **[announcement_post.md](announcement_post.md)** - Launch announcement narrative

---

## Documentation Categories

### ⭐ Canonical Sources of Truth

These files are the authoritative references. Other files may provide additional context or historical background.

| Topic | Canonical File | Purpose |
|-------|---------------|---------|
| **System Status** | `SYSTEM_STATUS.md` | Current workflow state, security posture, system health |
| **Workflows** | `SYSTEM_STATUS.md` | Workflow chain description and behavior |
| **Security Posture** | `SYSTEM_STATUS.md` | Current security guarantees and hardening |
| **Architecture** | `SYSTEM_ARCHITECTURE.md` | System architecture and component relationships |
| **Terminology** | `GLOSSARY.md` | Centralized terminology reference |
| **Project History** | `docs/history/` | Historical phase summaries |

### 📖 Reference Documentation

These files provide detailed information but defer to canonical sources for current state.

- **SYSTEM_ARCHITECTURE.md** - Architecture overview and component relationships
- **AUDIT_REPORT.md** - Deep technical audit (see SYSTEM_STATUS.md for current state)
- **SECURITY_FIXES_APPLIED.md** - Security fix narrative (see SYSTEM_STATUS.md for current posture)
- **GITHUB_ACTIONS_PINNED.md** - Action SHA reference ledger
- **WORKFLOW_SIMULATION.md** - Workflow execution scenarios
- **WORKFLOW_CHAIN_SIMULATION.md** - Chain simulation details
- **GLOSSARY.md** - Terminology reference
- **PHASE9_MONITORING_PLAN.md** - Monitoring recommendations

### 📜 Historical Documentation

These files document past work and decisions. They are preserved for context but may not reflect current state.

- **docs/history/PHASE_TWO.md** - Phase 2 deliverables (2025-01)
- **docs/history/PHASE_THREE.md** - Phase 3 summary (2025-01)
- **docs/history/PHASE_DIAGNOSTICS.md** - Phase 1-10 diagnostic reports
- **FINAL_GIT_SYNC_PLAN.md** - Historical Git sync plan (completed)
- **FIX_PLAN.md** - Historical fix plan (completed)
- **FIXES_APPLIED_SUMMARY.md** - Historical fixes summary (completed)

---

## Documentation Maintenance

See **[DOCS_MAINTENANCE.md](DOCS_MAINTENANCE.md)** for guidelines on keeping documentation current.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for contribution guidelines and development standards.

---

## Key Terminology

For complete terminology definitions, see **[GLOSSARY.md](GLOSSARY.md)**.

Quick reference:
- **retailxai-site**: This GitHub Pages repository (public)
- **Precipice-2**: Private repository containing the pipeline engine
- **RetailXAI**: The overall project/product name
- **Update Data workflow**: Scheduled workflow that generates data files
- **Protect Dashboard workflow**: Workflow that encrypts the dashboard
- **GitHub Pages workflow**: Deployment workflow for the static site

---

## Finding What You Need

### "I want to understand the current system state"
→ Read **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)**

### "I want to understand how workflows work"
→ Read **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)** → Workflows section  
→ For detailed scenarios: **[WORKFLOW_SIMULATION.md](WORKFLOW_SIMULATION.md)**

### "I want to understand security posture"
→ Read **[SYSTEM_STATUS.md](SYSTEM_STATUS.md)** → Security section  
→ For fix history: **[SECURITY_FIXES_APPLIED.md](SECURITY_FIXES_APPLIED.md)**

### "I want to understand project history"
→ Read **[docs/history/](docs/history/)** files

### "I'm a new engineer"
→ Read **[QUICK_START.md](QUICK_START.md)** → First 10 minutes guide

### "I want to contribute or set up locally"
→ Read **[QUICK_START.md](QUICK_START.md)** and **[CONTRIBUTING.md](CONTRIBUTING.md)**

### "I want to understand system architecture"
→ Read **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)**

### "I want to understand the UI/design"
→ Read **[docs/mockups.md](docs/mockups.md)**

### "I need term definitions"
→ Read **[GLOSSARY.md](GLOSSARY.md)**

---

**Note:** This index is maintained alongside code changes. When workflows or system state changes, update SYSTEM_STATUS.md and this index accordingly.

