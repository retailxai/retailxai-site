// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.data = {
            articles: [],
            drafts: [],
            trends: null,
            earnings: [],
            costs: null,
            status: null
        };
        this.charts = {};
        this.sortState = {};
        this.init();
    }

    async init() {
        await this.loadAllData();
        this.setupNavigation();
        this.setupTables();
        this.setupCharts();
        this.updateSummaryCards();
        this.setupFilters();
    }

    async loadAllData() {
        const endpoints = [
            { key: 'articles', url: '../data/articles.json' },
            { key: 'drafts', url: '../data/drafts.json' },
            { key: 'trends', url: '../data/trends.json' },
            { key: 'earnings', url: '../data/earnings.json' },
            { key: 'costs', url: '../data/costs.json' },
            { key: 'status', url: '../data/status.json' }
        ];

        const promises = endpoints.map(async ({ key, url }) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load ${key}`);
                const data = await response.json();
                this.data[key] = data;
            } catch (error) {
                console.error(`Error loading ${key}:`, error);
                // Set empty defaults
                if (key === 'articles' || key === 'drafts' || key === 'earnings') {
                    this.data[key] = [];
                } else {
                    this.data[key] = null;
                }
            }
        });

        await Promise.all(promises);
    }

    setupNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.renderDashboardArticles();
                this.updateSummaryCards();
                break;
            case 'articles':
                this.renderArticles();
                break;
            case 'drafts':
                this.renderDrafts();
                break;
            case 'trends':
                this.renderTrendsDetail();
                break;
            case 'earnings':
                this.renderEarnings();
                break;
            case 'costs':
                this.renderCostsDetail();
                break;
            case 'system-health':
                this.renderSystemHealth();
                break;
        }
    }

    updateSummaryCards() {
        // Total Articles
        const totalArticles = this.data.articles?.length || 0;
        document.getElementById('totalArticles').textContent = totalArticles.toLocaleString();

        // Total Cost (30 days)
        const totalCost = this.data.costs?.total_30_days || 0;
        document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;

        // Last Pipeline Run
        const lastRun = this.data.status?.last_pipeline_run;
        if (lastRun?.timestamp) {
            const date = new Date(lastRun.timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            let timeAgo = '';
            if (diffMins < 60) {
                timeAgo = `${diffMins} min ago`;
            } else if (diffHours < 24) {
                timeAgo = `${diffHours} hr ago`;
            } else {
                timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            }
            document.getElementById('lastPipelineRun').textContent = timeAgo;
        } else {
            document.getElementById('lastPipelineRun').textContent = 'Never';
        }

        // Failures This Week
        const failures = this.data.status?.failures_this_week || 0;
        document.getElementById('failuresThisWeek').textContent = failures.toString();
    }

    setupTables() {
        // Setup sorting for all tables
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                const table = header.closest('table');
                const sortKey = header.getAttribute('data-sort');
                this.sortTable(table, sortKey);
            });
        });
    }

    sortTable(table, sortKey) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr:not(.loading)'));
        const header = table.querySelector(`[data-sort="${sortKey}"]`);
        
        // Determine sort direction
        const currentDir = this.sortState[sortKey] || 'asc';
        const newDir = currentDir === 'asc' ? 'desc' : 'asc';
        this.sortState[sortKey] = newDir;

        // Update header indicators
        table.querySelectorAll('[data-sort]').forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });
        header.classList.add(`sorted-${newDir}`);

        // Sort rows
        rows.sort((a, b) => {
            const aVal = this.getCellValue(a, sortKey);
            const bVal = this.getCellValue(b, sortKey);
            
            let comparison = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            } else {
                comparison = String(aVal).localeCompare(String(bVal));
            }
            
            return newDir === 'asc' ? comparison : -comparison;
        });

        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

    getCellValue(row, sortKey) {
        const headers = Array.from(row.closest('table').querySelectorAll('th'));
        const index = headers.findIndex(h => h.getAttribute('data-sort') === sortKey);
        if (index === -1) return '';
        
        const cell = row.querySelectorAll('td')[index];
        if (!cell) return '';
        
        const text = cell.textContent.trim();
        
        // Try to parse as number
        const num = parseFloat(text.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) return num;
        
        // Try to parse as date
        const date = new Date(text);
        if (!isNaN(date.getTime())) return date.getTime();
        
        return text;
    }

    getArticleLink(article) {
        if (article.id) {
            return `draft.html?id=${article.id}`;
        }
        // Create slug from title if no ID
        const slug = article.title
            ? article.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            : `article-${Date.now()}`;
        return `draft.html?id=${encodeURIComponent(slug)}`;
    }

    renderDashboardArticles() {
        const tbody = document.getElementById('dashboardArticlesBody');
        if (!tbody) return;

        const articles = (this.data.articles || []).slice(0, 5);
        
        if (articles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">No articles found</td></tr>';
            return;
        }

        tbody.innerHTML = articles.map(article => {
            const date = article.ingest_timestamp 
                ? new Date(article.ingest_timestamp).toLocaleDateString()
                : '-';
            const cost = article.cost_usd ? `$${article.cost_usd.toFixed(2)}` : '-';
            const statusClass = `status-${article.status.toLowerCase().replace(' ', '-')}`;
            const articleLink = this.getArticleLink(article);
            
            return `
                <tr>
                    <td><a href="${articleLink}" style="color: var(--dashboard-primary); text-decoration: none;">${this.escapeHtml(article.title)}</a></td>
                    <td><span class="status-badge ${statusClass}">${article.status}</span></td>
                    <td>${date}</td>
                    <td>${cost}</td>
                </tr>
            `;
        }).join('');
    }

    renderArticles() {
        const tbody = document.getElementById('articlesBody');
        if (!tbody) return;

        const articles = this.data.articles || [];
        
        if (articles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No articles found</td></tr>';
            return;
        }

        tbody.innerHTML = articles.map(article => {
            const date = article.ingest_timestamp 
                ? new Date(article.ingest_timestamp).toLocaleDateString()
                : '-';
            const cost = article.cost_usd ? `$${article.cost_usd.toFixed(2)}` : '-';
            const statusClass = `status-${article.status.toLowerCase().replace(' ', '-')}`;
            const articleLink = this.getArticleLink(article);
            
            return `
                <tr>
                    <td>${article.id || '-'}</td>
                    <td><a href="${articleLink}" style="color: var(--dashboard-primary); text-decoration: none;">${this.escapeHtml(article.title)}</a></td>
                    <td>${article.source_type}</td>
                    <td><span class="status-badge ${statusClass}">${article.status}</span></td>
                    <td>${date}</td>
                    <td>${article.word_count || 0}</td>
                    <td>${cost}</td>
                    <td>${article.model_used || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    renderDrafts() {
        const tbody = document.getElementById('draftsBody');
        if (!tbody) return;

        const drafts = this.data.drafts || [];
        
        if (drafts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No drafts found</td></tr>';
            return;
        }

        tbody.innerHTML = drafts.map(draft => {
            const created = draft.created_at 
                ? new Date(draft.created_at).toLocaleDateString()
                : '-';
            const updated = draft.updated_at 
                ? new Date(draft.updated_at).toLocaleDateString()
                : '-';
            
            return `
                <tr>
                    <td>${draft.id}</td>
                    <td>${this.escapeHtml(draft.title)}</td>
                    <td><span class="status-badge status-${draft.status}">${draft.status}</span></td>
                    <td>${created}</td>
                    <td>${updated}</td>
                    <td>${draft.word_count || 0}</td>
                </tr>
            `;
        }).join('');
    }

    renderEarnings() {
        const tbody = document.getElementById('earningsBody');
        if (!tbody) return;

        const earnings = this.data.earnings || [];
        
        if (earnings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No earnings data found</td></tr>';
            return;
        }

        tbody.innerHTML = earnings.map(earning => {
            const revenue = earning.revenue 
                ? `$${(earning.revenue.value / 1e9).toFixed(2)}B`
                : '-';
            const eps = earning.eps 
                ? `$${earning.eps.value.toFixed(2)}`
                : '-';
            const callDate = earning.call_date 
                ? new Date(earning.call_date).toLocaleDateString()
                : '-';
            const sentimentClass = `status-${earning.sentiment || 'neutral'}`;
            
            return `
                <tr>
                    <td>${this.escapeHtml(earning.company)}</td>
                    <td>${earning.symbol || '-'}</td>
                    <td>${earning.quarter}</td>
                    <td>${earning.year}</td>
                    <td>${callDate}</td>
                    <td>${revenue}</td>
                    <td>${eps}</td>
                    <td><span class="status-badge ${sentimentClass}">${earning.sentiment || 'neutral'}</span></td>
                </tr>
            `;
        }).join('');
    }

    setupCharts() {
        // Trends chart on dashboard
        this.createTrendsChart();
        this.createCostsChart();
    }

    createTrendsChart() {
        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;

        const trends = this.data.trends;
        if (!trends || !trends.data_points || trends.data_points.length === 0) {
            canvas.parentElement.innerHTML = '<p class="loading">No trends data available</p>';
            return;
        }

        const ctx = canvas.getContext('2d');
        const labels = trends.data_points.map(d => new Date(d.date).toLocaleDateString());
        const values = trends.data_points.map(d => d.value);

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: trends.data_points[0]?.label || 'Trend',
                    data: values,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createCostsChart() {
        const canvas = document.getElementById('costsChart');
        if (!canvas) return;

        const costs = this.data.costs;
        if (!costs || !costs.periods || costs.periods.length === 0) {
            canvas.parentElement.innerHTML = '<p class="loading">No costs data available</p>';
            return;
        }

        const ctx = canvas.getContext('2d');
        const labels = costs.periods.map(p => new Date(p.date).toLocaleDateString());
        const values = costs.periods.map(p => p.total_cost);

        this.charts.costs = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cost (USD)',
                    data: values,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    renderTrendsDetail() {
        const canvas = document.getElementById('trendsDetailChart');
        if (!canvas) return;

        const trends = this.data.trends;
        if (!trends) {
            canvas.parentElement.innerHTML = '<p class="loading">No trends data available</p>';
            return;
        }

        if (trends.data_points && trends.data_points.length > 0) {
            const ctx = canvas.getContext('2d');
            const labels = trends.data_points.map(d => new Date(d.date).toLocaleDateString());
            const values = trends.data_points.map(d => d.value);

            if (this.charts.trendsDetail) {
                this.charts.trendsDetail.destroy();
            }

            this.charts.trendsDetail = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: trends.data_points[0]?.label || 'Trend',
                        data: values,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Update trend info
        if (trends.trend_direction) {
            document.getElementById('trendDirection').textContent = trends.trend_direction.toUpperCase();
        }
        if (trends.last_updated) {
            const date = new Date(trends.last_updated);
            document.getElementById('trendsLastUpdated').textContent = date.toLocaleString();
        }
    }

    renderCostsDetail() {
        const canvas = document.getElementById('costsDetailChart');
        if (!canvas) return;

        const costs = this.data.costs;
        if (!costs) {
            canvas.parentElement.innerHTML = '<p class="loading">No costs data available</p>';
            return;
        }

        if (costs.periods && costs.periods.length > 0) {
            const ctx = canvas.getContext('2d');
            const labels = costs.periods.map(p => new Date(p.date).toLocaleDateString());
            const values = costs.periods.map(p => p.total_cost);

            if (this.charts.costsDetail) {
                this.charts.costsDetail.destroy();
            }

            this.charts.costsDetail = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Cost (USD)',
                        data: values,
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Update costs summary
        if (costs.total_30_days !== undefined) {
            document.getElementById('costsTotal30Days').textContent = `$${costs.total_30_days.toFixed(2)}`;
        }
        if (costs.last_updated) {
            const date = new Date(costs.last_updated);
            document.getElementById('costsLastUpdated').textContent = date.toLocaleString();
        }
    }

    renderSystemHealth() {
        const container = document.getElementById('systemHealthDetail');
        if (!container) return;

        const status = this.data.status;
        if (!status || !status.system_health) {
            container.innerHTML = '<p class="loading">No system health data available</p>';
            return;
        }

        const health = status.system_health;
        const healthClass = health.status || 'healthy';
        
        let componentsHtml = '';
        if (health.components) {
            componentsHtml = Object.entries(health.components).map(([name, status]) => {
                return `
                    <div class="health-component">
                        <span>${name.toUpperCase()}</span>
                        <span class="status-badge status-${status}">${status}</span>
                    </div>
                `;
            }).join('');
        }

        container.innerHTML = `
            <div class="health-status ${healthClass}">
                <div class="health-status-icon">${this.getHealthIcon(healthClass)}</div>
                <div class="health-status-text">
                    <h3>System Status: ${health.status.toUpperCase()}</h3>
                    <p>Uptime: ${health.uptime_percent || 0}%</p>
                </div>
            </div>
            <div class="health-components">
                ${componentsHtml}
            </div>
            <div style="margin-top: 1rem;">
                <p><strong>Last Pipeline Run:</strong> ${status.last_pipeline_run?.timestamp 
                    ? new Date(status.last_pipeline_run.timestamp).toLocaleString() 
                    : 'Never'}</p>
                <p><strong>Failures This Week:</strong> ${status.failures_this_week || 0}</p>
            </div>
        `;
    }

    getHealthIcon(status) {
        switch (status) {
            case 'healthy': return '✅';
            case 'degraded': return '⚠️';
            case 'down': return '❌';
            default: return '❓';
        }
    }

    setupFilters() {
        // Articles filter
        const articlesSearch = document.getElementById('articlesSearch');
        const articlesStatusFilter = document.getElementById('articlesStatusFilter');
        
        if (articlesSearch) {
            articlesSearch.addEventListener('input', () => this.filterArticles());
        }
        if (articlesStatusFilter) {
            articlesStatusFilter.addEventListener('change', () => this.filterArticles());
        }

        // Drafts filter
        const draftsSearch = document.getElementById('draftsSearch');
        const draftsStatusFilter = document.getElementById('draftsStatusFilter');
        
        if (draftsSearch) {
            draftsSearch.addEventListener('input', () => this.filterDrafts());
        }
        if (draftsStatusFilter) {
            draftsStatusFilter.addEventListener('change', () => this.filterDrafts());
        }

        // Earnings filter
        const earningsSearch = document.getElementById('earningsSearch');
        if (earningsSearch) {
            earningsSearch.addEventListener('input', () => this.filterEarnings());
        }
    }

    filterArticles() {
        const search = document.getElementById('articlesSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('articlesStatusFilter')?.value || '';
        const tbody = document.getElementById('articlesBody');
        
        if (!tbody) return;

        const articles = this.data.articles || [];
        const filtered = articles.filter(article => {
            const matchesSearch = !search || 
                article.title.toLowerCase().includes(search) ||
                article.source.toLowerCase().includes(search);
            const matchesStatus = !statusFilter || article.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No articles match filters</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(article => {
            const date = article.ingest_timestamp 
                ? new Date(article.ingest_timestamp).toLocaleDateString()
                : '-';
            const cost = article.cost_usd ? `$${article.cost_usd.toFixed(2)}` : '-';
            const statusClass = `status-${article.status.toLowerCase().replace(' ', '-')}`;
            const articleLink = this.getArticleLink(article);
            
            return `
                <tr>
                    <td>${article.id || '-'}</td>
                    <td><a href="${articleLink}" style="color: var(--dashboard-primary); text-decoration: none;">${this.escapeHtml(article.title)}</a></td>
                    <td>${article.source_type}</td>
                    <td><span class="status-badge ${statusClass}">${article.status}</span></td>
                    <td>${date}</td>
                    <td>${article.word_count || 0}</td>
                    <td>${cost}</td>
                    <td>${article.model_used || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    filterDrafts() {
        const search = document.getElementById('draftsSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('draftsStatusFilter')?.value || '';
        const tbody = document.getElementById('draftsBody');
        
        if (!tbody) return;

        const drafts = this.data.drafts || [];
        const filtered = drafts.filter(draft => {
            const matchesSearch = !search || 
                draft.title.toLowerCase().includes(search) ||
                (draft.preview && draft.preview.toLowerCase().includes(search));
            const matchesStatus = !statusFilter || draft.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No drafts match filters</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(draft => {
            const created = draft.created_at 
                ? new Date(draft.created_at).toLocaleDateString()
                : '-';
            const updated = draft.updated_at 
                ? new Date(draft.updated_at).toLocaleDateString()
                : '-';
            
            return `
                <tr>
                    <td>${draft.id}</td>
                    <td>${this.escapeHtml(draft.title)}</td>
                    <td><span class="status-badge status-${draft.status}">${draft.status}</span></td>
                    <td>${created}</td>
                    <td>${updated}</td>
                    <td>${draft.word_count || 0}</td>
                </tr>
            `;
        }).join('');
    }

    filterEarnings() {
        const search = document.getElementById('earningsSearch')?.value.toLowerCase() || '';
        const tbody = document.getElementById('earningsBody');
        
        if (!tbody) return;

        const earnings = this.data.earnings || [];
        const filtered = earnings.filter(earning => {
            return !search || 
                earning.company.toLowerCase().includes(search) ||
                (earning.symbol && earning.symbol.toLowerCase().includes(search));
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No earnings match filters</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(earning => {
            const revenue = earning.revenue 
                ? `$${(earning.revenue.value / 1e9).toFixed(2)}B`
                : '-';
            const eps = earning.eps 
                ? `$${earning.eps.value.toFixed(2)}`
                : '-';
            const callDate = earning.call_date 
                ? new Date(earning.call_date).toLocaleDateString()
                : '-';
            const sentimentClass = `status-${earning.sentiment || 'neutral'}`;
            
            return `
                <tr>
                    <td>${this.escapeHtml(earning.company)}</td>
                    <td>${earning.symbol || '-'}</td>
                    <td>${earning.quarter}</td>
                    <td>${earning.year}</td>
                    <td>${callDate}</td>
                    <td>${revenue}</td>
                    <td>${eps}</td>
                    <td><span class="status-badge ${sentimentClass}">${earning.sentiment || 'neutral'}</span></td>
                </tr>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new Dashboard();
    });
} else {
    window.dashboard = new Dashboard();
}

