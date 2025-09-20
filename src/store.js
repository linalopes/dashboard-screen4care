// Basic event bus for application state management
class EventBus {
    constructor() {
        this.events = {};
        this.selectedHospitals = new Set();
        this.visibleHospitals = [];
    }

    // Subscribe to an event
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // Unsubscribe from an event
    off(event, callback) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    // Emit an event
    emit(event, data) {
        if (!this.events[event]) return;

        this.events[event].forEach(callback => {
            callback(data);
        });
    }

    // Remove all listeners for an event
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }

    // Hospital selection methods
    toggleHospitalSelection(hospitalId) {
        console.log('toggleHospitalSelection called with hospitalId:', hospitalId);
        console.log('Current selected hospitals before toggle:', Array.from(this.selectedHospitals));

        if (!hospitalId) {
            console.error('No hospital ID provided to toggleHospitalSelection');
            return;
        }

        // Normalize hospital ID as trimmed string
        const normalizedId = String(hospitalId).trim();
        console.log('Normalized hospital ID:', normalizedId);

        if (this.selectedHospitals.has(normalizedId)) {
            this.selectedHospitals.delete(normalizedId);
            console.log('Removed hospital from selection');
        } else {
            this.selectedHospitals.add(normalizedId);
            console.log('Added hospital to selection');
        }

        const selectedArray = Array.from(this.selectedHospitals);
        console.log('Current selected hospitals after toggle:', selectedArray);

        this.emit('hospitalSelectionChanged', {
            selectedHospitals: selectedArray,
            count: this.selectedHospitals.size
        });

        console.log('Emitted hospitalSelectionChanged event with data:', {
            selectedHospitals: selectedArray,
            count: this.selectedHospitals.size
        });
    }

    clearHospitalSelection() {
        this.selectedHospitals.clear();
        this.emit('hospitalSelectionChanged', {
            selectedHospitals: [],
            count: 0
        });
    }

    getSelectedHospitals() {
        return Array.from(this.selectedHospitals);
    }

    isHospitalSelected(hospitalId) {
        const normalizedId = String(hospitalId).trim();
        return this.selectedHospitals.has(normalizedId);
    }

    // Visible hospitals methods
    setVisibleHospitals(hospitalIds) {
        // Normalize all hospital IDs as trimmed strings
        this.visibleHospitals = hospitalIds.map(id => String(id).trim());
        this.emit('visibleHospitalsChanged', {
            visibleHospitals: this.visibleHospitals,
            count: this.visibleHospitals.length
        });
    }

    getVisibleHospitals() {
        return [...this.visibleHospitals];
    }
}

// Create global event bus instance
window.eventBus = new EventBus();

// Export for module usage
export default window.eventBus;

// Expose test functions globally for debugging
window.testSelection = (hospitalId) => {
    if (hospitalId) {
        eventBus.toggleHospitalSelection(hospitalId);
    } else {
        // Test with first visible hospital if no ID provided
        const hospitals = window.dataManager ? window.dataManager.getHospitals() : [];
        if (hospitals.length > 0) {
            // Try to find a hospital that's currently visible (USA hospitals)
            const usaHospitals = hospitals.filter(h => h.country === 'USA');
            if (usaHospitals.length > 0) {
                eventBus.toggleHospitalSelection(usaHospitals[0].hospital_id);
            } else {
                eventBus.toggleHospitalSelection(hospitals[0].hospital_id);
            }
        } else {
            console.log('No hospitals available for testing');
        }
    }
};
