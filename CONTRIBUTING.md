# Contributing to retailxai-site

**Status:** Operational Guide  
**Purpose:** Contribution guidelines and development standards

← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## Scope

This repository (`retailxai-site`) contains:
- Static GitHub Pages site
- Dashboard interface
- Svelte viewer component
- Documentation
- GitHub Actions workflows

**Note:** The Precipice-2 pipeline engine is in a separate private repository.

---

## Proposing Changes

### Branch Naming

Use descriptive branch names:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Change Size

- **Prefer small, focused changes** - Easier to review and merge
- **One logical change per PR** - Don't mix features and fixes
- **Update documentation** - If behavior changes, update docs

### Before Submitting

1. **Test locally** - Run relevant build commands
2. **Check workflows** - Verify YAML syntax if modifying workflows
3. **Update docs** - Update [SYSTEM_STATUS.md](SYSTEM_STATUS.md) if system behavior changes
4. **Check links** - Verify documentation links still work

---

## Documentation Rules

### Status Markers

All documentation files must have a status marker:
- `**Status:** Canonical` - Single source of truth
- `**Status:** Reference` - Detailed information, defers to canonical
- `**Status:** Historical` - Preserved for context
- `**Status:** Operational Guide` - How-to guides
- `**Status:** Onboarding` - New engineer guides

### Back-Links

All documentation files should link back to [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md):
```markdown
← See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for navigation and canonical sources.
```

### Canonical vs Historical

- **Canonical docs** - Current truth, update when system changes
- **Historical docs** - Past state, mark clearly, reference canonical sources
- **Don't mix** - Keep current and historical clearly separated

### Documentation Updates

When making changes:
1. Update canonical docs first ([SYSTEM_STATUS.md](SYSTEM_STATUS.md))
2. Update reference docs if needed
3. Add historical notes if documenting past decisions
4. Update [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) if structure changes

See [DOCS_MAINTENANCE.md](DOCS_MAINTENANCE.md) for detailed maintenance guidelines.

---

## Style Guidelines

### Tone

- **Clear and direct** - Engineering-grade, not marketing
- **Concise** - Get to the point quickly
- **Consistent** - Use terminology from [GLOSSARY.md](GLOSSARY.md)
- **Calm** - Professional, not alarmist

### Code Examples

- Use proper syntax highlighting
- Include context (file paths, commands)
- Explain what the code does
- Show expected output when helpful

### Terminology

- Use terms consistently (see [GLOSSARY.md](GLOSSARY.md))
- Define new terms in glossary
- Avoid jargon without context
- Use full names on first mention, abbreviations after

---

## Workflow Changes

### Modifying Workflows

When modifying GitHub Actions workflows:

1. **Test syntax** - Validate YAML before committing
2. **Pin actions** - Use commit SHAs, not version tags
3. **Update SHAs** - Update [GITHUB_ACTIONS_PINNED.md](GITHUB_ACTIONS_PINNED.md) if action SHAs change
4. **Document changes** - Update [SYSTEM_STATUS.md](SYSTEM_STATUS.md) workflow descriptions
5. **Test triggers** - Verify workflow triggers work as expected

### Security Considerations

- **Never commit secrets** - Use GitHub Secrets
- **Pin action SHAs** - Prevent supply chain attacks
- **Validate inputs** - Check file existence, secret presence
- **Error handling** - Use explicit exit codes (`|| exit 1`)

---

## Testing

### Local Testing

**Svelte Viewer:**
```bash
cd dashboard/viewer
npm install
npm run build
```
**Expected:** Build output in `assets/viewer/` and `assets/css/viewer.css` without errors.

**Python Scripts:**
```bash
pip install -r requirements.txt
python scripts/generate_data.py
```
**Expected:** JSON files generated in `data/` directory. Note: Requires API keys (FINNHUB_API_KEY, ALPHAVANTAGE_API_KEY) and Precipice-2 access (PRECIPICE_API_URL, PRECIPICE_API_KEY) to run fully.

### Workflow Testing

- GitHub Actions workflows run on push
- Test YAML syntax before committing
- Use `workflow_dispatch` for manual testing
- Check workflow logs for errors

---

## PR Process

### Pre-PR Checklist

Before creating a PR, verify:

- [ ] Changes are small and focused (one logical change per PR)
- [ ] Code/build commands tested locally
- [ ] Documentation updated if behavior changed (see [Documentation Rules](#documentation-rules))
- [ ] Workflow YAML syntax validated (if workflows modified)
- [ ] Links in documentation verified (if docs modified)
- [ ] Branch name follows naming convention
- [ ] Commit messages are clear and descriptive

### PR Steps

1. **Create branch** - Use descriptive name
2. **Make changes** - Small, focused changes
3. **Update docs** - If behavior changes
4. **Test locally** - Verify changes work
5. **Create PR** - Clear description, link related issues
6. **Address feedback** - Respond to review comments
7. **Merge** - After approval

---

## Questions?

- **New to the project?** Start with [QUICK_START.md](QUICK_START.md)
- **Documentation navigation:** See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- **System State:** See [SYSTEM_STATUS.md](SYSTEM_STATUS.md)
- **Terminology:** See [GLOSSARY.md](GLOSSARY.md)
- **Architecture:** See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)

---

**Last Updated:** 2025-01-18

