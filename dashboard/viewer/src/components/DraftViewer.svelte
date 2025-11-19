<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import MetadataSidebar from './MetadataSidebar.svelte';
  import ContentViewer from './ContentViewer.svelte';
  
  export let articleId;
  
  let article = null;
  let draftContent = null;
  let pdfPath = null;
  let viewMode = 'text'; // 'text' or 'pdf'
  let sidebarOpen = true;
  let loading = true;
  let error = null;
  
  // Validate article ID from URL
  function validateArticleId(id) {
    if (!id || typeof id !== 'string') return null;
    // Allow alphanumeric, hyphens, underscores, max 100 chars
    const sanitized = id.trim().substring(0, 100);
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      return null;
    }
    return sanitized;
  }
  
  onMount(async () => {
    // Validate article ID
    const validatedId = validateArticleId(articleId);
    if (!validatedId) {
      error = 'Invalid article ID';
      loading = false;
      return;
    }
    articleId = validatedId;
    await loadArticle();
  });
  
  async function loadArticle() {
    try {
      loading = true;
      error = null;
      
      // Load articles.json with error handling
      let articlesResponse;
      try {
        articlesResponse = await fetch('../../data/articles.json');
        if (!articlesResponse.ok) {
          throw new Error(`HTTP ${articlesResponse.status}: Failed to load articles`);
        }
      } catch (fetchError) {
        throw new Error('Network error loading articles');
      }
      
      let articles;
      try {
        articles = await articlesResponse.json();
      } catch (parseError) {
        throw new Error('Invalid JSON response');
      }
      
      if (!Array.isArray(articles)) {
        throw new Error('Invalid articles data format');
      }
      
      // Find article by ID
      article = articles.find(a => 
        a.id == articleId || 
        a.id === articleId ||
        (a.slug && a.slug === articleId) ||
        String(a.id) === String(articleId)
      );
      
      if (!article) {
        error = 'Article not found';
        loading = false;
        return;
      }
      
      // Load draft content if available
      if (article.draft_path) {
        try {
          // Validate draft_path to prevent path traversal
          const draftPath = article.draft_path.replace(/\.\./g, '').replace(/^\//, '');
          const draftResponse = await fetch(`../../${draftPath}`);
          if (draftResponse.ok) {
            draftContent = await draftResponse.text();
          }
        } catch (e) {
          console.warn('Could not load draft:', e.message || 'Unknown error');
        }
      }
      
      // Check for PDF with path validation
      if (article.pdf_path) {
        // Sanitize PDF path
        const sanitizedPath = article.pdf_path.replace(/\.\./g, '').replace(/^\//, '');
        if (/^pdfs\/[a-zA-Z0-9_-]+\.pdf$/.test(sanitizedPath)) {
          pdfPath = sanitizedPath;
        }
      } else {
        // Try to find PDF by slug or ID (with validation)
        const slug = (article.slug || articleId || '').replace(/[^a-zA-Z0-9_-]/g, '');
        if (slug) {
          const possiblePdfPaths = [
            `pdfs/${slug}.pdf`,
            `pdfs/${String(article.id || '').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`
          ];
          
          for (const path of possiblePdfPaths) {
            try {
              const testResponse = await fetch(`../../${path}`, { method: 'HEAD' });
              if (testResponse.ok) {
                pdfPath = path;
                break;
              }
            } catch (e) {
              // Continue checking other paths
            }
          }
        }
      }
      
      loading = false;
    } catch (err) {
      // Log minimal error context (no stack traces or sensitive data)
      error = err.message || 'Failed to load article';
      loading = false;
      console.error('Error loading article:', error);
    }
  }
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  
  function setViewMode(mode) {
    viewMode = mode;
  }
  
  function renderMarkdown(content) {
    if (!content) return '';
    
    try {
      // Configure marked
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
      const html = marked.parse(content);
      
      // Return HTML string - will be sanitized by ContentViewer
      return html;
    } catch (err) {
      console.error('Error rendering markdown:', err.message || 'Unknown error');
      return '<p>Error rendering content</p>';
    }
  }
</script>

{#if loading}
  <div class="loading">Loading article...</div>
{:else if error}
  <div class="error">{error}</div>
{:else if article}
  <div class="draft-viewer" class:sidebar-collapsed={!sidebarOpen}>
    <MetadataSidebar 
      article={article} 
      open={sidebarOpen}
    />
    
    <div class="content-area">
      <div class="view-controls">
        <button 
          class="sidebar-toggle"
          on:click={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        
        {#if pdfPath}
          <div class="view-mode-toggle">
            <button 
              class:active={viewMode === 'text'}
              on:click={() => setViewMode('text')}
            >
              Text
            </button>
            <button 
              class:active={viewMode === 'pdf'}
              on:click={() => setViewMode('pdf')}
            >
              PDF
            </button>
          </div>
        {/if}
      </div>
      
      <ContentViewer 
        content={draftContent}
        html={renderMarkdown(draftContent)}
        pdfPath={pdfPath}
        viewMode={viewMode}
      />
    </div>
  </div>
{/if}

<style>
  .draft-viewer {
    display: flex;
    min-height: 100vh;
    transition: all 0.3s ease;
  }
  
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
    min-width: 0;
  }
  
  .sidebar-collapsed .content-area {
    margin-left: 0;
    width: 100%;
  }
  
  .view-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--viewer-card-bg);
    border-bottom: 1px solid var(--viewer-border);
  }
  
  .sidebar-toggle {
    background: none;
    border: 1px solid var(--viewer-border);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    color: var(--viewer-text);
    font-size: 1.25rem;
    transition: all 0.2s;
  }
  
  .sidebar-toggle:hover {
    background-color: var(--viewer-bg);
  }
  
  .view-mode-toggle {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
  
  .view-mode-toggle button {
    background: none;
    border: 1px solid var(--viewer-border);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    color: var(--viewer-text);
    transition: all 0.2s;
  }
  
  .view-mode-toggle button:hover {
    background-color: var(--viewer-bg);
  }
  
  .view-mode-toggle button.active {
    background-color: var(--viewer-primary);
    color: white;
    border-color: var(--viewer-primary);
  }
  
  .loading, .error {
    padding: 3rem;
    text-align: center;
  }
  
  .error {
    color: var(--dashboard-error, #ef4444);
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--dashboard-error, #ef4444);
    border-radius: 8px;
    margin: 2rem;
  }
</style>

