# RetailXAI Draft Viewer

Svelte-based draft viewer application for the RetailXAI dashboard.

## Building

```bash
cd dashboard/viewer
npm install
npm run build
```

The build output will be placed in `assets/viewer/` and `assets/css/viewer.css`.

## Development

```bash
npm run dev
```

## Structure

- `src/App.svelte` - Main application component
- `src/components/DraftViewer.svelte` - Main viewer component with sidebar and content
- `src/components/MetadataSidebar.svelte` - Collapsible metadata sidebar
- `src/components/ContentViewer.svelte` - Content display with syntax highlighting and PDF support

## Features

- Collapsible metadata sidebar
- Syntax highlighting for code blocks (Prism.js)
- PDF preview support
- Dark mode compatible
- Markdown rendering with marked.js

