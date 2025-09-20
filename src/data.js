// Data management module
import eventBus from './store.js';

class DataManager {
    constructor() {
        this.hospitals = [];
        this.csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTz82qTCHnDh5y24xlPUttAseWsw1NE3D-fPd0hhl06MuOxDtWHJq9E3HUHZJFIbYO6224C2X0LbRnD/pub?gid=0&single=true&output=csv';
        this.init();
    }

    init() {
        console.log('Data module loaded');
        this.loadHospitalData();
    }

    async loadHospitalData() {
        try {
            console.log('Loading hospital data...');
            const response = await fetch(this.csvUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            this.hospitals = this.parseCSV(csvText);

            console.log(`Successfully loaded ${this.hospitals.length} hospitals`);

            // Emit data loaded event
            eventBus.emit('dataLoaded', {
                hospitals: this.hospitals,
                count: this.hospitals.length
            });

        } catch (error) {
            console.error('Error loading hospital data:', error);
            eventBus.emit('dataLoadError', {
                error: error.message,
                message: 'Failed to load hospital data. Please check your internet connection and try again.'
            });
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');

        return lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const hospital = {};

            headers.forEach((header, index) => {
                const value = values[index] || '';
                const cleanHeader = header.trim();

                switch (cleanHeader) {
                    case 'hospital_id':
                    case 'hospital_name':
                    case 'country':
                    case 'country_code':
                    case 'city':
                        hospital[cleanHeader] = value.trim();
                        break;
                    case 'latitude':
                    case 'longitude':
                    case 'total_patients':
                    case 'total_patient_records':
                        hospital[cleanHeader] = parseFloat(value) || 0;
                        break;
                    default:
                        hospital[cleanHeader] = value.trim();
                }
            });

            return hospital;
        });
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    getHospitals() {
        return this.hospitals;
    }

    getHospitalCount() {
        return this.hospitals.length;
    }

    getHospitalsGeoJSON() {
        return {
            type: "FeatureCollection",
            features: this.hospitals.map(hospital => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [hospital.longitude, hospital.latitude]
                },
                properties: {
                    hospital_id: hospital.hospital_id,
                    hospital_name: hospital.hospital_name,
                    country: hospital.country,
                    country_code: hospital.country_code,
                    city: hospital.city,
                    latitude: hospital.latitude,
                    longitude: hospital.longitude,
                    total_patients: hospital.total_patients,
                    total_patient_records: hospital.total_patient_records
                }
            }))
        };
    }
}

// Initialize data manager when module loads
const dataManager = new DataManager();

// Export for use in other modules
export default dataManager;
