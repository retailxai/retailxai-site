# Glossary

**Status:** Reference  
**Purpose:** Centralized terminology reference for retailxai-site documentation

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## Terms

### Action Pinning
The practice of pinning GitHub Actions to specific commit SHAs instead of version tags (e.g., `@v4`). Ensures supply chain security and reproducible builds. See [GITHUB_ACTIONS_PINNED.md](GITHUB_ACTIONS_PINNED.md).

### Article Draft
A markdown or text file containing article content, typically stored in the `drafts/` directory. Drafts are copied from Precipice-2 and made available for viewing in the Svelte viewer.

### Canonical Doc
A documentation file that serves as the single source of truth for a specific topic. Canonical docs are authoritative and should be updated when the system changes. Examples: `SYSTEM_STATUS.md`, `DOCUMENTATION_INDEX.md`.

### Concurrency
GitHub Actions workflow execution control mechanism. The Update Data workflow uses `concurrency: group: update-data, cancel-in-progress: true` to ensure only one instance runs at a time, preventing conflicts from overlapping runs.

### Content Security Policy (CSP)
Browser security mechanism implemented via meta tags in HTML files. Restricts which resources can be loaded and executed, helping prevent XSS attacks. See [SYSTEM_STATUS.md](SYSTEM_STATUS.md) → Security Posture.

### Dashboard
The password-protected administrative interface at `dashboard/index.html`. Displays articles, drafts, trends, earnings, costs, and system health metrics. Encrypted using Staticrypt before deployment.

### DOMPurify
HTML sanitization library used to prevent XSS attacks. All dynamic HTML content is sanitized through DOMPurify before rendering. See [SECURITY_FIXES_APPLIED.md](SECURITY_FIXES_APPLIED.md).

### GitHub Pages Workflow
The GitHub Actions workflow (`.github/workflows/github_pages.yml`) that deploys the static site to GitHub Pages. Triggered by pushes to `main` or after other workflows complete.

### Historical Doc
A documentation file preserved for historical context but not reflecting current system state. Historical docs are clearly marked and reference canonical sources for current information.

### Ingest
The process of importing content (videos, podcasts, earnings calls) into the Precipice-2 pipeline for processing. This term is primarily used in Precipice-2, not retailxai-site.

### Precipice-2
The private repository (`retailxai/Precipice-2`) containing the pipeline engine that processes videos and generates articles. retailxai-site pulls data and drafts from Precipice-2.

### Protect Dashboard Workflow
The GitHub Actions workflow (`.github/workflows/protect_dashboard.yml`) that encrypts `dashboard/index.html` using Staticrypt. Creates `dashboard/index.html.enc` for password-protected access.

### Reference Doc
A documentation file that provides detailed information but defers to canonical sources for current state. Reference docs supplement canonical docs with deeper analysis or historical context.

### retailxai-site
This GitHub Pages repository (public). Contains the static site, dashboard, viewer, documentation, and GitHub Actions workflows. Deployed to GitHub Pages.

### RetailXAI
The overall project/product name encompassing both Precipice-2 (pipeline engine) and retailxai-site (public site).

### Staticrypt
Tool used to password-protect static HTML files. Encrypts `dashboard/index.html` to create `dashboard/index.html.enc`. Password stored in GitHub Secrets.

### System Status
The current operational state of retailxai-site, including workflow health, security posture, and system scores. Documented in `SYSTEM_STATUS.md` (canonical).

### Update Data Workflow
The GitHub Actions workflow (`.github/workflows/update_data.yml`) that runs every 15 minutes. Generates data files, builds the Svelte viewer, and copies drafts/PDFs from Precipice-2. Commits changes to `main` branch.

### Viewer
The Svelte-based draft viewer application located in `dashboard/viewer/`. Displays article drafts with syntax highlighting, PDF preview, and collapsible metadata sidebar. Built output placed in `assets/viewer/`.

### Workflow Chain
The sequence of GitHub Actions workflows: Update Data → Protect Dashboard → GitHub Pages. Each workflow triggers the next via `workflow_run` dependencies. All workflows commit to `main` branch.

### Workflow Run
A GitHub Actions trigger type (`workflow_run`) that allows one workflow to trigger after another completes. Used to chain Update Data → Protect Dashboard → GitHub Pages.

### XSS (Cross-Site Scripting)
Security vulnerability where malicious scripts are injected into web pages. Prevented in retailxai-site through DOMPurify sanitization and Content Security Policy.

---

## Phase Terminology

### Phase 1-10
Historical diagnostic and improvement phases documented in phase reports (PHASE1_DIAGNOSTIC.md through PHASE10_FINAL_REPORT.md). These phases resulted in workflow hardening, security improvements, and system achieving 10.0/10 rating. See [docs/history/PHASE_DIAGNOSTICS.md](docs/history/PHASE_DIAGNOSTICS.md).

### Phase Two
Historical phase that established the GitHub Pages site and repository structure. See [docs/history/PHASE_TWO.md](docs/history/PHASE_TWO.md).

### Phase Three
Historical phase that implemented branding, analytics integration, and launch preparation. See [docs/history/PHASE_THREE.md](docs/history/PHASE_THREE.md).

---

## Adding New Terms

When adding new terms to this glossary:

1. **Alphabetical order** - Place terms in alphabetical order within their category
2. **Concise definition** - Keep definitions short and implementation-aware
3. **Cross-references** - Link to relevant canonical docs where appropriate
4. **Context** - Include enough context for a new engineer to understand the term
5. **Consistency** - Use the same terminology across all documentation

**Format:**
```markdown
### Term Name
Brief definition. Additional context if needed. See [relevant-doc.md](relevant-doc.md) for details.
```

---

**Last Updated:** 2025-01-18

