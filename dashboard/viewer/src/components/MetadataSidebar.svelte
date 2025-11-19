<script>
  export let article;
  export let open = true;
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
  
  function formatCurrency(value) {
    if (!value && value !== 0) return 'N/A';
    return `$${Number(value).toFixed(2)}`;
  }
  
  function formatNumber(value) {
    if (!value && value !== 0) return 'N/A';
    return Number(value).toLocaleString();
  }
</script>

<div class="sidebar" class:collapsed={!open}>
  <div class="sidebar-content">
    <div class="sidebar-header">
      <h2>Metadata</h2>
    </div>
    
    <div class="metadata-section">
      <div class="meta-item">
        <span class="meta-label">Title</span>
        <span class="meta-value">{article.title || 'Untitled'}</span>
      </div>
      
      {#if article.company}
        <div class="meta-item">
          <span class="meta-label">Company</span>
          <span class="meta-value">{article.company}</span>
        </div>
      {/if}
      
      {#if article.symbol}
        <div class="meta-item">
          <span class="meta-label">Symbol</span>
          <span class="meta-value">{article.symbol}</span>
        </div>
      {/if}
      
      {#if article.tickers && article.tickers.length > 0}
        <div class="meta-item">
          <span class="meta-label">Tickers</span>
          <span class="meta-value">{article.tickers.join(', ')}</span>
        </div>
      {/if}
      
      <div class="meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">{formatDate(article.ingest_timestamp || article.date)}</span>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-value status-{article.status?.toLowerCase() || 'unknown'}">
          {article.status || 'Unknown'}
        </span>
      </div>
      
      {#if article.word_count !== undefined}
        <div class="meta-item">
          <span class="meta-label">Word Count</span>
          <span class="meta-value">{formatNumber(article.word_count)}</span>
        </div>
      {/if}
      
      {#if article.cost_usd !== undefined}
        <div class="meta-item">
          <span class="meta-label">Cost</span>
          <span class="meta-value">{formatCurrency(article.cost_usd)}</span>
        </div>
      {/if}
      
      {#if article.model_used}
        <div class="meta-item">
          <span class="meta-label">Model</span>
          <span class="meta-value">{article.model_used}</span>
        </div>
      {/if}
      
      {#if article.source_type}
        <div class="meta-item">
          <span class="meta-label">Source Type</span>
          <span class="meta-value">{article.source_type}</span>
        </div>
      {/if}
      
      {#if article.source}
        <div class="meta-item">
          <span class="meta-label">Source</span>
          <a href={article.source} target="_blank" rel="noopener" class="meta-link">
            {article.source.length > 40 ? article.source.substring(0, 40) + '...' : article.source}
          </a>
        </div>
      {/if}
    </div>
    
    {#if article.revenue || article.eps || article.margins || article.short_interest}
      <div class="metadata-section">
        <h3>Financial Metrics</h3>
        
        {#if article.revenue}
          <div class="meta-item">
            <span class="meta-label">Revenue</span>
            <span class="meta-value">
              {#if article.revenue.value}
                ${(article.revenue.value / 1e9).toFixed(2)}B
                {#if article.revenue.change_percent}
                  <span class="change {article.revenue.change_percent >= 0 ? 'positive' : 'negative'}">
                    ({article.revenue.change_percent >= 0 ? '+' : ''}{article.revenue.change_percent.toFixed(2)}%)
                  </span>
                {/if}
              {:else}
                {article.revenue}
              {/if}
            </span>
          </div>
        {/if}
        
        {#if article.eps}
          <div class="meta-item">
            <span class="meta-label">EPS</span>
            <span class="meta-value">
              {#if article.eps.value}
                ${article.eps.value.toFixed(2)}
                {#if article.eps.change_percent}
                  <span class="change {article.eps.change_percent >= 0 ? 'positive' : 'negative'}">
                    ({article.eps.change_percent >= 0 ? '+' : ''}{article.eps.change_percent.toFixed(2)}%)
                  </span>
                {/if}
              {:else}
                {article.eps}
              {/if}
            </span>
          </div>
        {/if}
        
        {#if article.margins}
          <div class="meta-item">
            <span class="meta-label">Margins</span>
            <span class="meta-value">{article.margins}%</span>
          </div>
        {/if}
        
        {#if article.short_interest}
          <div class="meta-item">
            <span class="meta-label">Short Interest</span>
            <span class="meta-value">
              {article.short_interest.value || article.short_interest}
              {#if article.short_interest.change}
                <span class="change {article.short_interest.change >= 0 ? 'positive' : 'negative'}">
                  ({article.short_interest.change >= 0 ? '+' : ''}{article.short_interest.change})
                </span>
              {/if}
            </span>
          </div>
        {/if}
      </div>
    {/if}
    
    {#if article.pipeline_info}
      <div class="metadata-section">
        <h3>Pipeline Info</h3>
        {#each Object.entries(article.pipeline_info) as [key, value]}
          <div class="meta-item">
            <span class="meta-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span class="meta-value">{value}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .sidebar {
    width: 320px;
    min-width: 320px;
    background-color: var(--viewer-card-bg);
    border-right: 1px solid var(--viewer-border);
    transition: transform 0.3s ease, width 0.3s ease;
    overflow-y: auto;
    height: 100vh;
    position: sticky;
    top: 0;
    flex-shrink: 0;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 0;
    min-width: 0;
    border-right: none;
  }
  
  .sidebar-content {
    padding: 1.5rem;
  }
  
  .sidebar-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--viewer-border);
  }
  
  .sidebar-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--viewer-text);
  }
  
  .metadata-section {
    margin-bottom: 2rem;
  }
  
  .metadata-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--viewer-text);
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--viewer-text-secondary);
  }
  
  .meta-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--viewer-border);
  }
  
  .meta-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .meta-label {
    font-size: 0.875rem;
    color: var(--viewer-text-secondary);
    font-weight: 500;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .meta-value {
    font-size: 1rem;
    color: var(--viewer-text);
    font-weight: 600;
    word-break: break-word;
  }
  
  .meta-link {
    color: var(--viewer-primary);
    text-decoration: none;
    word-break: break-all;
  }
  
  .meta-link:hover {
    text-decoration: underline;
  }
  
  .status-complete {
    color: var(--dashboard-success, #10b981);
  }
  
  .status-pending {
    color: var(--dashboard-warning, #f59e0b);
  }
  
  .status-failed {
    color: var(--dashboard-error, #ef4444);
  }
  
  .change {
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }
  
  .change.positive {
    color: var(--dashboard-success, #10b981);
  }
  
  .change.negative {
    color: var(--dashboard-error, #ef4444);
  }
</style>

