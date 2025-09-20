// Map component
import eventBus from './store.js';
import dataManager from './data.js';

class Map {
    constructor() {
        this.map = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('Map module loaded');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for data loaded event to initialize map
        eventBus.on('dataLoaded', () => {
            if (!this.isInitialized) {
                this.initializeMap();
            } else {
                this.updateMapData();
            }
        });

        // Listen for tab changes to resize map
        eventBus.on('tabChanged', (data) => {
            if (data.tabName === 'hospital' && this.map) {
                setTimeout(() => {
                    this.map.resize();
                }, 100);
            }
        });

        // Listen for hospital selection changes
        eventBus.on('hospitalSelectionChanged', (data) => {
            console.log('Map received hospitalSelectionChanged event:', data);
            this.updateMapFilters();
        });

        // Listen for visible hospitals changes
        eventBus.on('visibleHospitalsChanged', (data) => {
            console.log('Map received visibleHospitalsChanged event:', data);
            this.updateMapFilters();
        });

        // Test event system
        console.log('Map event listeners registered');

        // Listen for search result changes to fit map bounds
        eventBus.on('searchResultsChanged', (data) => {
            this.fitBoundsToFilteredHospitals(data.filteredHospitals);
        });
    }

    initializeMap() {
        try {
            // Set Mapbox access token (replace with your actual token)
            mapboxgl.accessToken = 'pk.eyJ1IjoibGlsb3RoaW5rIiwiYSI6ImNtZnIxb3phbTA0bm0ydHF0enc1eTVtMHcifQ.DtiA8z0IanWkwACSXgrxiA';

            // Initialize the map
            this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/light-v11', // Using light-v11 style which provides a clean, grayscale base map that's perfect for data visualization. This style emphasizes your data points while keeping the background subtle and professional.
                center: [0, 0], // Initial center coordinates at [longitude, latitude] (0,0). This will be automatically updated to center on the hospital data points once they are loaded into the map. The fitBoundsToHospitals() method called in the map's 'load' event handler will adjust the center and zoom to show all hospitals.
                zoom: 4 // Initial zoom level
            });

            // Add navigation controls
            this.map.addControl(new mapboxgl.NavigationControl(),'bottom-right');

            // Wait for map to load before adding data
            this.map.on('load', () => {
                this.addHospitalData();
                this.fitBoundsToHospitals();
                this.addMapClickHandlers();
                this.isInitialized = true;
                console.log('Map initialized successfully');
            });

            // Handle map errors
            this.map.on('error', (e) => {
                console.error('Map error:', e);
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            this.showMapError('Failed to initialize map. Please check your internet connection.');
        }
    }

    addHospitalData() {
        if (!this.map || !dataManager.getHospitals().length) {
            console.log('Map or hospital data not ready');
            return;
        }

        try {
            const geoJsonData = dataManager.getHospitalsGeoJSON();

            // Add source
            this.map.addSource('hospitals', {
                type: 'geojson',
                data: geoJsonData
            });

            // Add circle layer for unselected hospitals
            this.map.addLayer({
                id: 'hospitals-circles',
                type: 'circle',
                source: 'hospitals',
                paint: {
                    'circle-color': '#6A3D9A',
                    'circle-radius': 10,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.8
                }
            });

            // Add circle layer for selected hospitals (on top of unselected layer)
            this.map.addLayer({
                id: 'hospitals-selected',
                type: 'circle',
                source: 'hospitals',
                paint: {
                    'circle-color': '#e74c3c', // Bright red
                    'circle-radius': 15, // Much larger than unselected
                    'circle-stroke-width': 4,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 1.0 // Fully opaque
                },
                filter: ['==', 'hospital_id', '']
            });

            console.log(`Added ${geoJsonData.features.length} hospital points to map`);

        } catch (error) {
            console.error('Error adding hospital data to map:', error);
        }
    }

    updateMapData() {
        if (!this.map || !this.isInitialized) return;

        try {
            const geoJsonData = dataManager.getHospitalsGeoJSON();

            // Update the source data
            this.map.getSource('hospitals').setData(geoJsonData);
            this.fitBoundsToHospitals();

            console.log(`Updated map with ${geoJsonData.features.length} hospital points`);

        } catch (error) {
            console.error('Error updating map data:', error);
        }
    }

    fitBoundsToHospitals() {
        if (!this.map || !dataManager.getHospitals().length) return;

        try {
            const bounds = new mapboxgl.LngLatBounds();
            const hospitals = dataManager.getHospitals();

            // Calculate bounds from all hospitals
            hospitals.forEach(hospital => {
                bounds.extend([hospital.longitude, hospital.latitude]);
            });

            // Fit map to bounds with some padding
            this.map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 10
            });

            console.log('Map bounds fitted to hospitals');

        } catch (error) {
            console.error('Error fitting bounds:', error);
        }
    }

    fitBoundsToFilteredHospitals(filteredHospitals) {
        if (!this.map) return;

        try {
            // If no filtered hospitals or empty array, fit to all hospitals
            if (!filteredHospitals || filteredHospitals.length === 0) {
                this.fitBoundsToHospitals();
                return;
            }

            const bounds = new mapboxgl.LngLatBounds();

            // Calculate bounds from filtered hospitals
            filteredHospitals.forEach(hospital => {
                bounds.extend([hospital.longitude, hospital.latitude]);
            });

            // Fit map to bounds with some padding
            this.map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 12 // Slightly higher zoom for search results
            });

            console.log(`Map bounds fitted to ${filteredHospitals.length} filtered hospitals`);

        } catch (error) {
            console.error('Error fitting bounds to filtered hospitals:', error);
        }
    }

    updateMapFilters() {
        if (!this.map || !this.isInitialized) {
            console.log('Map not ready for filter update. Map:', !!this.map, 'Initialized:', this.isInitialized);
            return;
        }

        try {
            // Check if map layers exist
            if (!this.map.getLayer('hospitals-circles') || !this.map.getLayer('hospitals-selected')) {
                console.log('Map layers not found. Available layers:', this.map.getStyle().layers.map(l => l.id));
                return;
            }

            // Get current state from store
            const visibleHospitals = eventBus.getVisibleHospitals();
            const selectedHospitals = eventBus.getSelectedHospitals();

            // Debug logging: print both arrays with their lengths
            console.log('updateMapFilters: visible=', visibleHospitals, 'selected=', selectedHospitals);
            console.log('updateMapFilters: visible.length=', visibleHospitals.length, 'selected.length=', selectedHospitals.length);

            // Normalize all IDs as trimmed strings for consistent comparison
            const normalizedVisibleHospitals = visibleHospitals.map(id => String(id).trim());
            const normalizedSelectedHospitals = selectedHospitals.map(id => String(id).trim());

            // Calculate filters:
            // Red layer = ALL selected hospitals (independent of visibility)
            // Purple layer = hospitals in visibleHospitals but not in selectedHospitals
            const selectedHospitalIds = normalizedSelectedHospitals; // Show all selected hospitals
            const unselectedHospitalIds = normalizedVisibleHospitals.filter(id => !normalizedSelectedHospitals.includes(id));

            console.log('Unselected hospitals:', unselectedHospitalIds);
            console.log('Selected hospitals:', selectedHospitalIds);

            // Update purple layer (unselected hospitals)
            if (unselectedHospitalIds.length > 0) {
                const unselectedFilter = ['in', 'hospital_id', ...unselectedHospitalIds];
                this.map.setFilter('hospitals-circles', unselectedFilter);
                console.log('Applied unselected filter:', unselectedFilter);
            } else {
                // Hide purple layer if no unselected hospitals
                this.map.setFilter('hospitals-circles', ['==', 'hospital_id', '']);
                console.log('Hiding purple layer - no unselected hospitals');
            }

            // Update red layer (selected hospitals)
            if (selectedHospitalIds.length > 0) {
                const selectedFilter = ['in', 'hospital_id', ...selectedHospitalIds];
                this.map.setFilter('hospitals-selected', selectedFilter);
                console.log('Applied selected filter:', selectedFilter);
            } else {
                // Hide red layer if no selected hospitals
                this.map.setFilter('hospitals-selected', ['==', 'hospital_id', '']);
                console.log('Hiding red layer - no selected hospitals');
            }

            console.log('Updated map filters successfully');
        } catch (error) {
            console.error('Error updating map filters:', error);
        }
    }


    // Test method to manually set selected hospitals (for debugging)
    testSelection() {
        if (!this.map || !this.isInitialized) return;

        console.log('Testing selection with visible hospitals...');

        // Get currently visible hospitals from store
        const visibleHospitals = eventBus.getVisibleHospitals();

        if (visibleHospitals.length >= 2) {
            const testIds = [visibleHospitals[0], visibleHospitals[1]];
            console.log('Test hospital IDs (from visible hospitals):', testIds);
            // Toggle selection for the first two visible hospitals
            testIds.forEach(id => eventBus.toggleHospitalSelection(id));
        } else {
            console.log('Not enough visible hospitals to test with');
        }
    }

    addMapClickHandlers() {
        if (!this.map) return;

        // Add click handler for hospital points
        this.map.on('click', 'hospitals-circles', (e) => {
            const hospitalId = e.features[0].properties.hospital_id;
            const hospital = dataManager.getHospitals().find(h => h.hospital_id === hospitalId);

            if (hospital) {
                // Get click coordinates for card positioning
                const point = e.point;
                eventBus.emit('openHospitalCard', {
                    hospital,
                    position: { x: point.x, y: point.y }
                });
            }
        });

        // Add click handler for selected hospital points
        this.map.on('click', 'hospitals-selected', (e) => {
            const hospitalId = e.features[0].properties.hospital_id;
            const hospital = dataManager.getHospitals().find(h => h.hospital_id === hospitalId);

            if (hospital) {
                // Get click coordinates for card positioning
                const point = e.point;
                eventBus.emit('openHospitalCard', {
                    hospital,
                    position: { x: point.x, y: point.y }
                });
            }
        });

        // Change cursor on hover
        this.map.on('mouseenter', 'hospitals-circles', () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'hospitals-circles', () => {
            this.map.getCanvas().style.cursor = '';
        });

        this.map.on('mouseenter', 'hospitals-selected', () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'hospitals-selected', () => {
            this.map.getCanvas().style.cursor = '';
        });
    }

    showMapError(message) {
        const mapContainer = document.querySelector('.map-content');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error">
                    <h4>⚠️ Map Error</h4>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-button">Retry</button>
                </div>
            `;
        }
    }
}

// Create global map instance
window.mapManager = new Map();

// Expose test method globally for debugging
window.testMapSelection = () => {
    if (window.mapManager) {
        window.mapManager.testSelection();
    } else {
        console.log('Map manager not available');
    }
};

// Test function to force show red layer
window.testRedLayer = () => {
    if (window.mapManager && window.mapManager.map) {
        const map = window.mapManager.map;
        // Force show all hospitals as selected (red) by selecting all visible hospitals
        const visibleHospitals = eventBus.getVisibleHospitals();
        visibleHospitals.forEach(id => eventBus.toggleHospitalSelection(id));
        console.log('Forced all visible hospitals to show as red');
    } else {
        console.log('Map not available');
    }
};

// Test function to verify the entire selection flow
window.testSelectionFlow = () => {
    console.log('=== Testing Selection Flow ===');

    // Test 1: Check if checkboxes exist
    const checkboxes = document.querySelectorAll('.hospital-checkbox');
    console.log('1. Found checkboxes:', checkboxes.length);

    // Test 2: Check if event bus is working
    console.log('2. Event bus available:', !!window.eventBus);

    // Test 3: Check if map manager is working
    console.log('3. Map manager available:', !!window.mapManager);

    // Test 4: Check if data manager is working
    console.log('4. Data manager available:', !!window.dataManager);

    // Test 5: Try to manually select a hospital
    if (window.eventBus && checkboxes.length > 0) {
        const firstCheckbox = checkboxes[0];
        const hospitalId = firstCheckbox.getAttribute('data-hospital-id');
        console.log('5. Testing with hospital ID:', hospitalId);
        window.eventBus.toggleHospitalSelection(hospitalId);
    }

    console.log('=== End Test ===');
};
