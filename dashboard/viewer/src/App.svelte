<script>
  import { onMount } from 'svelte';
  import DraftViewer from './components/DraftViewer.svelte';
  
  let articleId = null;
  let loading = true;
  let error = null;
  
  onMount(() => {
    // Get article ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    articleId = urlParams.get('id');
    
    if (!articleId) {
      error = 'No article ID provided';
      loading = false;
    } else {
      loading = false;
    }
  });
</script>

<div class="app-container">
  {#if loading}
    <div class="loading">Loading viewer...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <DraftViewer articleId={articleId} />
  {/if}
</div>

<style>
  .app-container {
    min-height: 100vh;
    width: 100%;
  }
  
  .loading, .error {
    padding: 3rem;
    text-align: center;
    color: var(--viewer-text-secondary);
  }
  
  .error {
    color: var(--dashboard-error, #ef4444);
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--dashboard-error, #ef4444);
    border-radius: 8px;
    margin: 2rem;
  }
</style>

