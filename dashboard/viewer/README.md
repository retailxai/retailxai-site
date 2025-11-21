# RetailXAI Draft Viewer

**Status:** Component Documentation  
**Purpose:** Svelte viewer component documentation

Svelte-based draft viewer application for the RetailXAI dashboard.

← See [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md) for navigation and canonical sources.

---

## When to Use This

This viewer component displays article drafts with:
- Markdown rendering with syntax highlighting
- PDF preview support
- Collapsible metadata sidebar
- Dark mode compatibility

The viewer is built automatically by the Update Data workflow and deployed as part of the static site.

---

## Building

```bash
cd dashboard/viewer
npm install
npm run build
```

The build output will be placed in `assets/viewer/` and `assets/css/viewer.css`.

**Note:** The build runs automatically in the Update Data workflow. Manual builds are only needed for local development.

## Development

```bash
npm run dev
```

Starts a development server for local testing.

---

## Structure

- `src/App.svelte` - Main application component
- `src/components/DraftViewer.svelte` - Main viewer component with sidebar and content
- `src/components/MetadataSidebar.svelte` - Collapsible metadata sidebar
- `src/components/ContentViewer.svelte` - Content display with syntax highlighting and PDF support

---

## Features

- Collapsible metadata sidebar
- Syntax highlighting for code blocks (Prism.js)
- PDF preview support
- Dark mode compatible
- Markdown rendering with marked.js
- XSS protection via DOMPurify sanitization

---

## Common Issues and Troubleshooting

### Node Version Issues

**Symptoms:** Build fails with version errors

**Solution:**
- Check Node.js version: `node --version` (should be 20+)
- Use `nvm` or similar to switch versions if needed
- Update `.github/workflows/update_data.yml` if version requirements change

### Build Output Paths

**Symptoms:** Build output not in expected location

**Solution:**
- Verify build output goes to `assets/viewer/` (not `dist/` or `build/`)
- Check `vite.config.js` or build configuration
- Ensure paths match what the site expects

### Integration with Main Site

**Symptoms:** Viewer not loading on deployed site

**Solution:**
- Verify build output is committed to repository
- Check Update Data workflow completed successfully
- Verify `assets/viewer/` files exist in deployed site
- Check browser console for loading errors

### Missing Dependencies

**Symptoms:** Build fails with "module not found" errors

**Solution:**
- Run `npm install` to install dependencies
- Check `package.json` for all required packages
- Verify `package-lock.json` is up to date (if present)

---

## Related Documentation

- **[SYSTEM_ARCHITECTURE.md](../../SYSTEM_ARCHITECTURE.md)** - System architecture overview
- **[SYSTEM_STATUS.md](../../SYSTEM_STATUS.md)** - Current system state and workflows
- **[SECURITY_FIXES_APPLIED.md](../../SECURITY_FIXES_APPLIED.md)** - Security implementation details

