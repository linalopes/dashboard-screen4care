# Screen4Care Dashboard

An interactive dashboard for exploring hospital data compatibility in the context of the Screen4Care challenge. This tool helps clinicians identify compatible patient data fields across hospitals through an intuitive visual interface.

## Project Overview

The Screen4Care challenge focuses on designing interfaces that enable clinicians to explore and identify compatible patient data fields across different hospitals. This dashboard provides a user-friendly way to visualize hospital networks, search for specific institutions, and understand data availability patterns.

The dashboard is structured into three main sections:
- **Hospital Viewer** (functional): Interactive map with hospital data exploration, search, and selection capabilities
- **Patients Viewer** (planned): Patient-level data visualization and analysis
- **Group Compatible** (planned): Feature compatibility analysis across hospital groups

## Demo

🚀 **[View Live Demo](https://linalopes.github.io/dashboard-screen4care)**

## Dataset

The dashboard currently integrates with a synthetic hospitals dataset containing 50 fictional hospitals with fairy tale-inspired names:

### Hospital Data
- **Source**: [Google Sheets CSV](https://docs.google.com/spreadsheets/d/e/2PACX-1vTz82qTCHnDh5y24xlPUttAseWsw1NE3D-fPd0hhl06MuOxDtWHJq9E3HUHZJFIbYO6224C2X0LbRnD/pub?gid=0&single=true&output=csv)
- **Format**: CSV with hospital metadata including location, patient counts, and record counts
- **Fields**: `hospital_id`, `hospital_name`, `country`, `country_code`, `city`, `latitude`, `longitude`, `total_patients`, `total_patient_records`

### Additional Datasets (Roadmap)
- **Patients CSV**: ~10,000 synthetic patients with demographics and vitals
- **Records CSV**: ~40,000 synthetic records in long format with clinical features

## Features

### Hospital Viewer (Current Implementation)
- **Interactive Map**: Visualize hospitals worldwide using Mapbox GL JS
- **Search & Filter**: Real-time search by hospital name or city with 200ms debounce
- **Hospital Selection**: Click checkboxes or map markers to select hospitals
- **Visual Feedback**: Selected hospitals appear in red, unselected visible ones in purple
- **Persistent Selection**: Hospital selections persist across search operations
- **Hospital Details**: Click any hospital to view detailed information in a floating card
- **Compare Mode**: Select multiple hospitals for future comparison functionality

### Planned Features
- **Patients Viewer**: Patient-level data exploration and demographic analysis
- **Group Compatible**: Cross-hospital feature compatibility assessment
- **Advanced Filtering**: Multi-criteria hospital filtering
- **Data Export**: Export selected hospital data

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Mapping**: Mapbox GL JS
- **Styling**: CSS3 with custom design system
- **Architecture**: Modular component structure with event-driven communication
- **Deployment**: GitHub Pages (static hosting)

### Project Structure
```
screen4share/
├── index.html              # Main HTML file
├── styles.css              # Global styles and design system
├── src/
│   ├── main.js            # Application entry point
│   ├── data.js            # Data loading and CSV parsing
│   ├── map.js             # Mapbox integration and visualization
│   ├── sidebar.js         # Hospital list and search functionality
│   ├── store.js           # Event bus and state management
│   └── card.js            # Hospital detail card component
└── README.md
```

## Installation & Usage

### Prerequisites
- Modern web browser with ES6 module support
- Python 3.x (for local development server)
- Mapbox access token (for map functionality)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/linalopes/dashboard-screen4care.git
   cd dashboard-screen4care
   ```

2. **Set up Mapbox access token**
   - Get a free token from [Mapbox](https://www.mapbox.com/)
   - Open `src/map.js`
   - Replace `YOUR_MAPBOX_TOKEN` with your actual token:
     ```javascript
     mapboxgl.accessToken = 'your_actual_token_here';
     ```

3. **Start local development server**
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Python 2
   python -m SimpleHTTPServer 8000
   ```

4. **Access the dashboard**
   - Open your browser to `http://localhost:8000`
   - The dashboard will load hospital data automatically

### Deployment to GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Save settings

3. **Access your live dashboard**
   - Your dashboard will be available at `https://linalopes.github.io/dashboard-screen4care`

## Development Notes

### Key Design Decisions
- **Vanilla JavaScript**: Chosen for simplicity and to avoid framework overhead
- **Event-Driven Architecture**: Components communicate through a central event bus
- **Modular Structure**: Each component has a single responsibility
- **Responsive Design**: Works on desktop and tablet devices

### Mapbox Alternative
The current implementation uses Mapbox GL JS, but could be adapted to use [MapLibre GL JS](https://maplibre.org/) for an open-source alternative that doesn't require an access token.

### Browser Compatibility
- Modern browsers with ES6 module support
- Mapbox GL JS compatibility (Chrome 60+, Firefox 55+, Safari 11+)

## Roadmap

### Phase 1: Hospital Viewer (✅ Complete)
- [x] Interactive map with hospital visualization
- [x] Search and filtering functionality
- [x] Hospital selection and visual feedback
- [x] Hospital detail cards

### Phase 2: Patients Viewer (🔄 Planned)
- [ ] Patient-level data integration
- [ ] Demographic analysis tools
- [ ] Patient filtering and search
- [ ] Individual patient detail views

### Phase 3: Group Compatible (🔄 Planned)
- [ ] Cross-hospital compatibility analysis
- [ ] Feature mapping and comparison
- [ ] Compatibility scoring system
- [ ] Export and reporting tools

## Contributing

This project was developed for the Screen4Care challenge. Contributions are welcome for:
- Bug fixes and improvements
- Additional visualization features
- Performance optimizations
- Documentation enhancements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Screen4Care Challenge**: For providing the context and requirements
- **Mapbox**: For providing the mapping platform
- **Google Sheets**: For hosting the synthetic dataset
- **Open Source Community**: For the various tools and libraries used

---

*This dashboard is part of the Screen4Care challenge, focusing on UI/UX design and data exploration rather than machine learning implementation.*
