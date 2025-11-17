// Load and display ingest status
async function loadIngestStatus() {
    try {
        const response = await fetch('data/ingest_status.json');
        if (!response.ok) {
            throw new Error('Failed to load ingest status');
        }
        const data = await response.json();
        displayIngestStatus(data);
    } catch (error) {
        console.error('Error loading ingest status:', error);
        document.getElementById('ingest-status-container').innerHTML = 
            '<p class="loading">Unable to load ingest status.</p>';
    }
}

function displayIngestStatus(data) {
    const container = document.getElementById('ingest-status-container');
    if (!data || !data.ingests || data.ingests.length === 0) {
        container.innerHTML = '<p class="loading">No ingest status available.</p>';
        return;
    }

    const html = data.ingests.map(ingest => `
        <div class="status-card" data-analytics="ingest-status-view">
            <h4>${ingest.title || ingest.source}</h4>
            <p class="article-meta">${ingest.source_type || 'Unknown'}</p>
            <span class="status-badge ${ingest.status.toLowerCase().replace(' ', '-')}">
                ${ingest.status}
            </span>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Load and display articles
async function loadArticles() {
    try {
        const response = await fetch('data/articles.json');
        if (!response.ok) {
            throw new Error('Failed to load articles');
        }
        const data = await response.json();
        displayArticles(data);
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('articles-container').innerHTML = 
            '<p class="loading">Unable to load articles.</p>';
    }
}

function displayArticles(data) {
    const container = document.getElementById('articles-container');
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="loading">No articles available.</p>';
        return;
    }

    // Show only recent articles (limit to 6)
    const recentArticles = data.slice(0, 6);

    const html = recentArticles.map(article => {
        const date = article.ingest_timestamp ? 
            new Date(article.ingest_timestamp).toLocaleDateString() : 
            'Unknown date';
        
        return `
            <div class="article-card">
                <h3>
                    <a href="${article.output || '#'}" target="_blank" data-analytics="article-click">
                        ${article.title || 'Untitled Article'}
                    </a>
                </h3>
                <p class="article-meta">
                    ${article.source_type || 'Unknown'} • ${date}
                </p>
                ${article.word_count ? `<p class="article-meta">${article.word_count} words</p>` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Analytics tracking for dynamic content
function trackEvent(eventName) {
    if (typeof plausible !== 'undefined') {
        plausible(eventName);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadIngestStatus();
    loadArticles();
    
    // Track page view
    trackEvent('pageview');
});

