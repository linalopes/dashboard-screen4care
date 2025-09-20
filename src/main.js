// Main application entry point
import './store.js';
import './sidebar.js';
import './map.js';
import './data.js';
import './card.js';
import eventBus from './store.js';

class Dashboard {
    constructor() {
        this.currentTab = 'hospital';
        this.hospitalCount = 0;
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupEventListeners();
        this.setupDataListeners();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`#${tabName}`).classList.add('active');

        this.currentTab = tabName;

        // Emit tab change event through event bus
        eventBus.emit('tabChanged', { tabName });
    }

    setupEventListeners() {
        // Listen for tab changes to update components
        window.addEventListener('tabChanged', (e) => {
            console.log(`Switched to tab: ${e.detail.tabName}`);
        });
    }

    setupDataListeners() {
        // Listen for data loaded event
        eventBus.on('dataLoaded', (data) => {
            this.hospitalCount = data.count;
            this.updateHospitalCount();
            console.log(`Dashboard: ${data.count} hospitals loaded`);
        });

        // Listen for data load error
        eventBus.on('dataLoadError', (error) => {
            this.showDataLoadError(error.message);
            console.error('Dashboard: Data load error:', error);
        });
    }

    updateHospitalCount() {
        // Let the sidebar component handle its own content updates
        // The sidebar will receive the dataLoaded event and update itself
    }

    showDataLoadError(message) {
        // Emit error event for sidebar to handle
        eventBus.emit('dataLoadError', { message });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
