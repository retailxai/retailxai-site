<script>
  import { onMount } from 'svelte';
  import Prism from 'prismjs';
  import DOMPurify from 'dompurify';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-python';
  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-bash';
  import 'prismjs/themes/prism-tomorrow.css';
  import './PrismStyles.css';
  
  export let content = null;
  export let html = null;
  export let pdfPath = null;
  export let viewMode = 'text';
  
  let contentRef;
  let highlightedHtml = '';
  let sanitizedHtml = '';
  
  onMount(() => {
    if (html && viewMode === 'text') {
      highlightCode();
    }
  });
  
  $: if (html && viewMode === 'text') {
    highlightCode();
  }
  
  function sanitizeHtml(htmlString) {
    if (!htmlString) return '';
    return DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
      ALLOW_DATA_ATTR: false
    });
  }
  
  function highlightCode() {
    if (!html) return;
    
    // Sanitize HTML first
    const sanitized = sanitizeHtml(html);
    
    // Create a temporary div to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = sanitized;
    
    // Find all code blocks
    const codeBlocks = temp.querySelectorAll('pre code, code');
    
    codeBlocks.forEach((block) => {
      // Determine language from class or parent pre tag
      const pre = block.parentElement;
      let language = 'plaintext';
      
      if (block.className) {
        const match = block.className.match(/language-(\w+)/);
        if (match) language = match[1];
      } else if (pre && pre.className) {
        const match = pre.className.match(/language-(\w+)/);
        if (match) language = match[1];
      }
      
      // Highlight the code
      try {
        Prism.highlightElement(block);
      } catch (e) {
        console.warn('Could not highlight code:', e.message || 'Unknown error');
      }
    });
    
    highlightedHtml = sanitizeHtml(temp.innerHTML);
    sanitizedHtml = sanitized;
  }
</script>

<div class="content-viewer">
  {#if viewMode === 'pdf' && pdfPath}
    <div class="pdf-container">
      <iframe 
        src="../../{pdfPath}#toolbar=1&navpanes=1&scrollbar=1"
        class="pdf-iframe"
        title="PDF Preview"
        sandbox="allow-same-origin allow-top-navigation-by-user-activation allow-downloads"
        loading="lazy"
      >
        <p>Your browser does not support PDFs. 
          <a href="../../{pdfPath}" target="_blank" rel="noopener noreferrer">Download the PDF</a>.
        </p>
      </iframe>
    </div>
  {:else if html || content}
    <div class="text-content" bind:this={contentRef}>
      {#if highlightedHtml}
        {@html highlightedHtml}
      {:else if sanitizedHtml}
        {@html sanitizedHtml}
      {:else if html}
        {@html sanitizeHtml(html)}
      {:else}
        <pre>{content}</pre>
      {/if}
    </div>
  {:else}
    <div class="no-content">
      <p>No content available for this article.</p>
    </div>
  {/if}
</div>

<style>
  .content-viewer {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background-color: var(--viewer-bg);
  }
  
  .pdf-container {
    width: 100%;
    height: calc(100vh - 80px);
    border: 1px solid var(--viewer-border);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--viewer-card-bg);
  }
  
  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .text-content {
    max-width: 900px;
    margin: 0 auto;
    background-color: var(--viewer-card-bg);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--viewer-shadow);
  }
  
  .text-content :global(h1),
  .text-content :global(h2),
  .text-content :global(h3),
  .text-content :global(h4),
  .text-content :global(h5),
  .text-content :global(h6) {
    color: var(--viewer-text);
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  .text-content :global(h1) {
    font-size: 2.5rem;
    border-bottom: 2px solid var(--viewer-border);
    padding-bottom: 0.5rem;
  }
  
  .text-content :global(h2) {
    font-size: 2rem;
  }
  
  .text-content :global(h3) {
    font-size: 1.5rem;
  }
  
  .text-content :global(p) {
    color: var(--viewer-text);
    line-height: 1.8;
    margin-bottom: 1rem;
  }
  
  .text-content :global(ul),
  .text-content :global(ol) {
    margin-left: 2rem;
    margin-bottom: 1rem;
    color: var(--viewer-text);
  }
  
  .text-content :global(li) {
    margin-bottom: 0.5rem;
  }
  
  .text-content :global(blockquote) {
    border-left: 4px solid var(--viewer-primary);
    padding-left: 1.5rem;
    margin-left: 0;
    margin-bottom: 1rem;
    color: var(--viewer-text-secondary);
    font-style: italic;
  }
  
  .text-content :global(a) {
    color: var(--viewer-primary);
    text-decoration: none;
  }
  
  .text-content :global(a:hover) {
    text-decoration: underline;
  }
  
  .text-content :global(code) {
    background-color: var(--viewer-bg);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    color: var(--viewer-text);
  }
  
  .text-content :global(pre) {
    background-color: var(--viewer-bg);
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 1rem;
    border: 1px solid var(--viewer-border);
  }
  
  .text-content :global(pre code) {
    background: none;
    padding: 0;
    border-radius: 0;
  }
  
  .text-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  
  .text-content :global(th),
  .text-content :global(td) {
    border: 1px solid var(--viewer-border);
    padding: 0.5rem;
    text-align: left;
  }
  
  .text-content :global(th) {
    background-color: var(--viewer-bg);
    font-weight: 600;
  }
  
  .no-content {
    text-align: center;
    padding: 3rem;
    color: var(--viewer-text-secondary);
  }
  
  /* Prism.js styles are handled by PrismStyles.css */
</style>
