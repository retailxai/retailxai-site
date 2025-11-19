// Theme Toggle JavaScript
class ThemeToggle {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference or default to dark mode
        const savedTheme = localStorage.getItem('theme') || 'dark';
        // Set theme immediately to prevent flash
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.setTheme(savedTheme);

        // Setup toggle button
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Update icon based on current theme
        this.updateIcon();
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateIcon() {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        }
    }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeToggle = new ThemeToggle();
    });
} else {
    window.themeToggle = new ThemeToggle();
}

