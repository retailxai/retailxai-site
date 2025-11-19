// Stock Ticker JavaScript
class StockTicker {
    constructor() {
        this.data = [];
        this.animationSpeed = 50; // pixels per second
        this.init();
    }

    async init() {
        await this.loadTickerData();
        this.renderTicker();
        this.setupResizeHandler();
    }

    async loadTickerData() {
        try {
            // Try relative path first (for dashboard), then absolute (for index.html)
            let response = await fetch('../data/ticker.json');
            if (!response.ok) {
                response = await fetch('data/ticker.json');
            }
            if (!response.ok) throw new Error('Failed to load ticker data');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading ticker data:', error);
            this.data = [];
        }
    }

    renderTicker() {
        const container = document.getElementById('ticker-container');
        if (!container) return;

        if (this.data.length === 0) {
            container.innerHTML = '<div class="ticker-wrapper"><div class="ticker-item">No ticker data available</div></div>';
            return;
        }

        // Duplicate data for seamless scrolling
        const duplicatedData = [...this.data, ...this.data];
        
        const wrapper = document.createElement('div');
        wrapper.className = 'ticker-wrapper';
        
        duplicatedData.forEach(item => {
            const tickerItem = this.createTickerItem(item);
            wrapper.appendChild(tickerItem);
        });

        container.innerHTML = '';
        container.appendChild(wrapper);

        // Calculate animation duration based on content width
        this.setupAnimation(wrapper);
    }

    createTickerItem(item) {
        const div = document.createElement('div');
        div.className = 'ticker-item';

        const symbol = document.createElement('span');
        symbol.className = 'ticker-symbol';
        symbol.textContent = item.symbol || 'N/A';

        const price = document.createElement('span');
        price.className = 'ticker-price';
        price.textContent = item.price ? `$${item.price.toFixed(2)}` : '-';

        const change = document.createElement('span');
        change.className = 'ticker-change';
        
        const changeValue = item.change || 0;
        const changePercent = item.change_percent || 0;
        
        let changeClass = 'neutral';
        if (changeValue > 0) {
            changeClass = 'positive';
        } else if (changeValue < 0) {
            changeClass = 'negative';
        }
        
        change.classList.add(changeClass);
        change.textContent = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;

        const sentiment = document.createElement('span');
        sentiment.className = 'ticker-sentiment';
        const sentimentValue = item.sentiment || 'neutral';
        sentiment.classList.add(sentimentValue);

        div.appendChild(symbol);
        div.appendChild(price);
        div.appendChild(change);
        div.appendChild(sentiment);

        return div;
    }

    setupAnimation(wrapper) {
        // Calculate total width
        const items = wrapper.querySelectorAll('.ticker-item');
        let totalWidth = 0;
        items.forEach(item => {
            totalWidth += item.offsetWidth;
        });

        // Set animation duration based on width and speed
        const duration = totalWidth / this.animationSpeed;
        wrapper.style.animationDuration = `${duration}s`;
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.renderTicker();
            }, 250);
        });
    }

    updateData(newData) {
        this.data = newData;
        this.renderTicker();
    }
}

// Initialize ticker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.stockTicker = new StockTicker();
    });
} else {
    window.stockTicker = new StockTicker();
}

