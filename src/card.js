// Hospital card component
import eventBus from './store.js';
import dataManager from './data.js';

class HospitalCard {
    constructor() {
        this.isVisible = false;
        this.currentHospital = null;
        this.cardElement = null;
        this.init();
    }

    init() {
        console.log('Hospital card module loaded');
        this.createCardElement();
        this.setupEventListeners();
    }

    createCardElement() {
        // Create card element
        this.cardElement = document.createElement('div');
        this.cardElement.id = 'hospital-card';
        this.cardElement.className = 'hospital-card';
        this.cardElement.style.display = 'none';

        // Add to body
        document.body.appendChild(this.cardElement);
    }

    setupEventListeners() {
        // Listen for hospital selection changes to update card
        eventBus.on('hospitalSelectionChanged', () => {
            if (this.isVisible && this.currentHospital) {
                this.updateCardContent();
            }
        });

        // Listen for card open events
        eventBus.on('openHospitalCard', (data) => {
            this.openCard(data.hospital, data.position);
        });

        // Listen for card close events
        eventBus.on('closeHospitalCard', () => {
            this.closeCard();
        });
    }

    openCard(hospital, position = null) {
        this.currentHospital = hospital;
        this.isVisible = true;
        this.updateCardContent();
        this.showCard();

        // Position card if position is provided
        if (position) {
            this.setPosition(position.x, position.y);
        }
    }

    closeCard() {
        this.isVisible = false;
        this.currentHospital = null;
        this.hideCard();
    }

    updateCardContent() {
        if (!this.currentHospital) return;

        const isSelected = eventBus.isHospitalSelected(this.currentHospital.hospital_id);

        this.cardElement.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${this.currentHospital.hospital_name}</h3>
                <button class="card-close" id="card-close">×</button>
            </div>
            <div class="card-content">
                <div class="card-detail">
                    <span class="card-label">Location:</span>
                    <span class="card-value">${this.currentHospital.city}, ${this.currentHospital.country}</span>
                </div>
                <div class="card-detail">
                    <span class="card-label">Total Patients:</span>
                    <span class="card-value">${this.currentHospital.total_patients.toLocaleString()}</span>
                </div>
                <div class="card-detail">
                    <span class="card-label">Patient Records:</span>
                    <span class="card-value">${this.currentHospital.total_patient_records.toLocaleString()}</span>
                </div>
                <div class="card-actions">
                    <button class="card-select-button" id="card-select-button">
                        ${isSelected ? 'Unselect' : 'Select'}
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.addCardEventListeners();
    }

    addCardEventListeners() {
        // Close button
        const closeButton = document.getElementById('card-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeCard();
            });
        }

        // Select/Unselect button
        const selectButton = document.getElementById('card-select-button');
        if (selectButton) {
            selectButton.addEventListener('click', () => {
                eventBus.toggleHospitalSelection(this.currentHospital.hospital_id);
            });
        }
    }

    showCard() {
        this.cardElement.style.display = 'block';
        // Add a small delay to ensure smooth animation
        setTimeout(() => {
            this.cardElement.classList.add('card-visible');
        }, 10);
    }

    hideCard() {
        this.cardElement.classList.remove('card-visible');
        setTimeout(() => {
            this.cardElement.style.display = 'none';
        }, 200);
    }

    setPosition(x, y) {
        // Position card near the click point
        const cardRect = this.cardElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x + 10;
        let top = y - 10;

        // Adjust if card would go off screen
        if (left + cardRect.width > viewportWidth) {
            left = x - cardRect.width - 10;
        }

        if (top + cardRect.height > viewportHeight) {
            top = viewportHeight - cardRect.height - 10;
        }

        if (top < 10) {
            top = 10;
        }

        this.cardElement.style.left = `${left}px`;
        this.cardElement.style.top = `${top}px`;
    }
}

// Initialize card when module loads
new HospitalCard();
