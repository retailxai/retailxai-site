import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  build: {
    // Output directory: assets/viewer/ (relative to repo root)
    // From dashboard/viewer/, this resolves to ../../assets/viewer
    outDir: path.resolve(__dirname, '../../assets/viewer'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.js'),
      output: {
        // Main entry file: assets/viewer/viewer.js
        entryFileNames: 'viewer.js',
        // Code-split chunks: assets/viewer/viewer-[hash].js
        chunkFileNames: 'viewer-[hash].js',
        assetFileNames: (assetInfo) => {
          // CSS files go to assets/css/viewer.css
          // Path is relative to outDir (assets/viewer/), so we go up one level: ../css/viewer.css
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '../css/viewer.css';
          }
          // Other assets stay in assets/viewer/ directory
          return assetInfo.name || 'asset-[hash][extname]';
        }
      }
    },
    cssCodeSplit: false
  },
  base: './'
});
