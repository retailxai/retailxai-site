import App from './App.svelte';
import './app.css';

// Initialize app when DOM is ready
function init() {
  const target = document.getElementById('viewer-app');
  if (!target) {
    console.error('Viewer app target not found');
    return;
  }
  
  const app = new App({
    target: target,
    props: {}
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

