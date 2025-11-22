import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'move-css-to-assets',
      closeBundle() {
        // Move CSS from assets/viewer/ to assets/css/
        const viewerDir = path.resolve(__dirname, '../../assets/viewer');
        const cssDir = path.resolve(__dirname, '../../assets/css');
        
        // Ensure CSS directory exists
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }
        
        // Find and move CSS files
        const files = fs.readdirSync(viewerDir);
        files.forEach(file => {
          if (file.endsWith('.css')) {
            const sourcePath = path.join(viewerDir, file);
            const destPath = path.join(cssDir, 'viewer.css');
            fs.copyFileSync(sourcePath, destPath);
            fs.unlinkSync(sourcePath);
            console.log(`Moved ${file} to assets/css/viewer.css`);
          }
        });
      }
    }
  ],
  build: {
    outDir: path.resolve(__dirname, '../../assets/viewer'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'viewer.js',
        chunkFileNames: 'viewer-[hash].js',
        assetFileNames: 'viewer-[hash][extname]'
      }
    },
    cssCodeSplit: false
  },
  base: './'
});
