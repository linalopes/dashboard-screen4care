// Sidebar component
import eventBus from './store.js';
import dataManager from './data.js';

class Sidebar {
    constructor() {
        this.searchTimeout = null;
        this.filteredHospitals = [];
        this.init();
    }

    init() {
        console.log('Sidebar module loaded');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for data loaded event to populate search
        eventBus.on('dataLoaded', () => {
            this.populateHospitalList();
            // Initialize visible hospitals with all hospitals
            const allHospitals = dataManager.getHospitals();
            const allIds = allHospitals.map(h => String(h.hospital_id).trim());
            eventBus.setVisibleHospitals(allIds);
        });

        // Listen for data load error
        eventBus.on('dataLoadError', (error) => {
            this.showDataLoadError(error.message);
        });

        // Listen for tab changes to show/hide search
        eventBus.on('tabChanged', (data) => {
            if (data.tabName === 'hospital') {
                this.showSearchInterface();
            }
        });

        // Listen for hospital selection changes
        eventBus.on('hospitalSelectionChanged', (data) => {
            console.log('Sidebar received hospitalSelectionChanged event:', data);
            this.updateCompareButton(data.count);
            this.updateHospitalListCheckboxes();
        });
    }

    populateHospitalList() {
        const hospitals = dataManager.getHospitals();
        this.filteredHospitals = [...hospitals];
        this.updateSidebarContent();
    }

    updateSidebarContent() {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) return;

        sidebarContent.innerHTML = `
            <div class="hospital-count">
                <h4>Hospitals Available</h4>
                <p class="count-number">${dataManager.getHospitalCount()}</p>
            </div>

            <div class="search-section">
                <input
                    type="text"
                    id="hospital-search"
                    placeholder="Type hospital name or city..."
                    class="search-input"
                >
                <div class="compare-section">
                    <button id="compare-button" class="compare-button" disabled>
                        Compare (0 selected)
                    </button>
                </div>
                <div class="hospital-list" id="hospital-list">
                    ${this.renderHospitalList()}
                </div>
            </div>
        `;

        // Add event listener to search input
        const searchInput = document.getElementById('hospital-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Add event listener to compare button
        const compareButton = document.getElementById('compare-button');
        if (compareButton) {
            compareButton.addEventListener('click', () => {
                this.handleCompare();
            });
        }

        // Bind interaction handlers for the initial hospital list render
        this.addCheckboxEventListeners();
        this.addHospitalItemClickHandlers();
    }

    renderHospitalList() {
        if (this.filteredHospitals.length === 0) {
            return '<div class="no-results">No hospitals found</div>';
        }

        return this.filteredHospitals.map(hospital => {
            const isSelected = eventBus.isHospitalSelected(hospital.hospital_id);
            return `
                <div class="hospital-item" data-hospital-id="${hospital.hospital_id}">
                    <label class="hospital-checkbox-label">
                        <input
                            type="checkbox"
                            class="hospital-checkbox"
                            data-hospital-id="${hospital.hospital_id}"
                            ${isSelected ? 'checked' : ''}
                        >
                        <div class="hospital-info">
                            <div class="hospital-name">${hospital.hospital_name}</div>
                            <div class="hospital-location">${hospital.city}, ${hospital.country}</div>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    handleSearch(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce search by 200ms
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 200);
    }

    performSearch(query) {
        const hospitals = dataManager.getHospitals();
        const searchTerm = query.toLowerCase().trim();

        if (searchTerm === '') {
            // Show all hospitals
            this.filteredHospitals = [...hospitals];
        } else {
            // Filter hospitals based on search term
            this.filteredHospitals = hospitals.filter(hospital => {
                const name = hospital.hospital_name.toLowerCase();
                const city = hospital.city.toLowerCase();
                const country = hospital.country.toLowerCase();

                return name.includes(searchTerm) ||
                       city.includes(searchTerm) ||
                       country.includes(searchTerm);
            });
        }

        // Update visible hospitals in store first
        const filteredIds = this.filteredHospitals.map(h => String(h.hospital_id).trim());
        eventBus.setVisibleHospitals(filteredIds);

        // Update the hospital list display
        this.updateHospitalListDisplay();

        // Emit search results for map bounds fitting
        eventBus.emit('searchResultsChanged', {
            filteredHospitals: this.filteredHospitals
        });
    }

    updateHospitalListDisplay() {
        const hospitalList = document.getElementById('hospital-list');
        if (hospitalList) {
            hospitalList.innerHTML = this.renderHospitalList();
        }

        // Immediately reattach event listeners after re-rendering
        this.addCheckboxEventListeners();
        this.addHospitalItemClickHandlers();
    }


    showSearchInterface() {
        // This method can be used to show/hide search interface based on tab
        console.log('Showing search interface for Hospital tab');
    }

    // Method to manually reattach event listeners (for debugging)
    reattachEventListeners() {
        console.log('Reattaching event listeners...');
        this.addCheckboxEventListeners();
        this.addHospitalItemClickHandlers();
        console.log('Event listeners reattached');
    }

    addCheckboxEventListeners() {
        const checkboxes = document.querySelectorAll('.hospital-checkbox');
        console.log('Found checkboxes:', checkboxes.length);

        // Remove existing event listeners first to avoid duplicates
        checkboxes.forEach(checkbox => {
            checkbox.removeEventListener('change', this.handleCheckboxChange);
        });

        // Add new event listeners
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
        });

        console.log(`Bound event listeners to ${checkboxes.length} checkboxes`);
    }

    handleCheckboxChange(e) {
        const hospitalId = e.target.getAttribute('data-hospital-id');
        console.log('Checkbox changed for hospital ID:', hospitalId, 'checked:', e.target.checked);
        eventBus.toggleHospitalSelection(hospitalId);
    }

    addHospitalItemClickHandlers() {
        // Add click handlers to hospital items (excluding checkbox clicks)
        const hospitalItems = document.querySelectorAll('.hospital-item');
        hospitalItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't open card if clicking on checkbox
                if (e.target.classList.contains('hospital-checkbox')) {
                    return;
                }

                const hospitalId = item.getAttribute('data-hospital-id');
                const hospital = dataManager.getHospitals().find(h => h.hospital_id === hospitalId);

                if (hospital) {
                    // Position card near the clicked item
                    const rect = item.getBoundingClientRect();
                    eventBus.emit('openHospitalCard', {
                        hospital,
                        position: { x: rect.right + 10, y: rect.top }
                    });
                }
            });
        });
    }

    updateHospitalListCheckboxes() {
        const checkboxes = document.querySelectorAll('.hospital-checkbox');
        checkboxes.forEach(checkbox => {
            const hospitalId = checkbox.getAttribute('data-hospital-id');
            checkbox.checked = eventBus.isHospitalSelected(hospitalId);
        });
    }

    updateCompareButton(selectedCount) {
        const compareButton = document.getElementById('compare-button');
        if (compareButton) {
            compareButton.disabled = selectedCount < 2;
            compareButton.textContent = `Compare (${selectedCount} selected)`;
        }
    }

    handleCompare() {
        const selectedHospitals = eventBus.getSelectedHospitals();
        console.log('Compare clicked with hospitals:', selectedHospitals);
        // TODO: Implement compare functionality
    }

    showDataLoadError(message) {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (sidebarContent) {
            sidebarContent.innerHTML = `
                <div class="error-message">
                    <h4>⚠️ Data Load Error</h4>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-button">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize sidebar when module loads
window.sidebar = new Sidebar();

// Expose reattach method globally for debugging
window.reattachSidebarEvents = () => {
    if (window.sidebar) {
        window.sidebar.reattachEventListeners();
    } else {
        console.log('Sidebar not available');
    }
};
