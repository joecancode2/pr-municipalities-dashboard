// DOM Elements
const mapViewBtn = document.getElementById('map-view-btn');
const compareViewBtn = document.getElementById('compare-view-btn');
const mapView = document.getElementById('map-view');
const compareView = document.getElementById('compare-view');
const indicatorsList = document.getElementById('indicators-list');
const municipalitySearch = document.getElementById('municipality-search');
const municipalityList = document.getElementById('municipality-list');
const selectedMunicipalities = document.getElementById('selected-municipalities');
const selectedCount = document.getElementById('selected-count');

// State management
let currentView = 'map';
let selectedIndicator = null;
let selectedMunicipalitiesList = [];

// Initialize the application
async function initializeApp() {
    try {
        console.log('Starting data fetch...');
        
        // Load data with better error handling
        const [municipalitiesResponse, indicatorsResponse] = await Promise.all([
            fetch('data/municipalities.json'),
            fetch('data/indicators.json')
        ]);

        if (!municipalitiesResponse.ok) {
            throw new Error(`HTTP error! status: ${municipalitiesResponse.status}`);
        }
        if (!indicatorsResponse.ok) {
            throw new Error(`HTTP error! status: ${indicatorsResponse.status}`);
        }

        const municipalitiesData = await municipalitiesResponse.json();
        const indicatorsData = await indicatorsResponse.json();
        
        console.log('Municipalities data loaded:', municipalitiesData);
        console.log('Indicators data loaded:', indicatorsData);
        
        // Store data in window object for global access
        window.municipalitiesData = municipalitiesData.municipalities;
        window.indicatorsData = indicatorsData.indicators;
        
        console.log('Data loaded successfully. Initializing components...');
        
        // Initialize components
        initializeMap();
        filterIndicatorsByCategory('economy'); // Show economy indicators by default
        populateMunicipalities();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        displayError(error);
    }
}

// Initialize map
function initializeMap() {
    // Initialize Leaflet map centered on Puerto Rico
    const map = L.map('map-container').setView([18.2208, -66.5901], 9);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Filter indicators by category
function filterIndicatorsByCategory(category) {
    if (!window.indicatorsData) {
        console.error('No indicators data available');
        return;
    }
    
    // Filter indicators by category
    const filteredIndicators = window.indicatorsData.filter(indicator => 
        indicator.category === category
    );
    
    // Generate HTML for filtered indicators
    const indicatorsHTML = filteredIndicators
        .map(indicator => `
            <div class="indicator-item" data-id="${indicator.id}" data-category="${indicator.category}">
                ${indicator.name}
            </div>
        `).join('');
    
    // Update the indicators list
    indicatorsList.innerHTML = indicatorsHTML;
    
    // Update category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

// Populate municipalities list
function populateMunicipalities() {
    if (!window.municipalitiesData) {
        console.error('No municipalities data available');
        return;
    }
    
    const municipalitiesHTML = window.municipalitiesData
        .map(municipality => `
            <div class="municipality-item${selectedMunicipalitiesList.some(m => m.id === municipality.id) ? ' selected' : ''}" 
                 data-id="${municipality.id}">
                ${municipality.name}
            </div>
        `).join('');
    
    municipalityList.innerHTML = municipalitiesHTML;
}

// Display error message
function displayError(error) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                <h3>Error loading data</h3>
                <p>There was a problem loading the necessary data. Please try refreshing the page.</p>
                <p>Technical details: ${error.message}</p>
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // View toggle
    mapViewBtn.addEventListener('click', () => switchView('map'));
    compareViewBtn.addEventListener('click', () => switchView('compare'));
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            filterIndicatorsByCategory(category);
        });
    });
    
    // Municipality search
    municipalitySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = municipalityList.querySelectorAll('.municipality-item');
        
        items.forEach(item => {
            const matches = item.textContent.toLowerCase().includes(searchTerm);
            item.style.display = matches ? 'block' : 'none';
        });
    });
    
    // Municipality selection
    municipalityList.addEventListener('click', (e) => {
        const municipality = e.target.closest('.municipality-item');
        if (!municipality) return;
        
        const id = municipality.dataset.id;
        const name = municipality.textContent.trim();
        
        if (!municipality.classList.contains('selected')) {
            addSelectedMunicipality(id, name);
        } else {
            removeSelectedMunicipality(id);
        }
    });
    
    // Indicator selection
    indicatorsList.addEventListener('click', (e) => {
        const indicator = e.target.closest('.indicator-item');
        if (!indicator) return;
        
        // Toggle active class
        document.querySelectorAll('.indicator-item').forEach(item => 
            item.classList.remove('active'));
        indicator.classList.add('active');
        
        // Update selected indicator
        selectedIndicator = indicator.dataset.id;
        updateVisualization();
    });
}

// Switch between map and compare views
function switchView(view) {
    currentView = view;
    
    // Update buttons
    mapViewBtn.classList.toggle('active', view === 'map');
    compareViewBtn.classList.toggle('active', view === 'compare');
    
    // Update view containers
    mapView.style.display = view === 'map' ? 'block' : 'none';
    compareView.style.display = view === 'compare' ? 'block' : 'none';
    
    updateVisualization();
}

// Add selected municipality
function addSelectedMunicipality(id, name) {
    if (selectedMunicipalitiesList.length >= 4) {
        alert('Máximo 4 municipios pueden ser seleccionados');
        return;
    }
    
    if (!selectedMunicipalitiesList.some(m => m.id === id)) {
        selectedMunicipalitiesList.push({ id, name });
        updateSelectedMunicipalities();
        updateVisualization();
        
        // Update municipality item visual state
        const item = document.querySelector(`.municipality-item[data-id="${id}"]`);
        if (item) {
            item.classList.add('selected');
        }
    }
}

// Remove selected municipality
function removeSelectedMunicipality(id) {
    selectedMunicipalitiesList = selectedMunicipalitiesList.filter(m => m.id !== id);
    updateSelectedMunicipalities();
    updateVisualization();
    
    // Update municipality item visual state
    const item = document.querySelector(`.municipality-item[data-id="${id}"]`);
    if (item) {
        item.classList.remove('selected');
    }
}

// Update selected municipalities display
function updateSelectedMunicipalities() {
    selectedCount.textContent = `${selectedMunicipalitiesList.length}/4`;
    
    const municipalitiesHTML = selectedMunicipalitiesList
        .map(municipality => `
            <div class="municipality-pill">
                ${municipality.name}
                <span class="remove-btn" onclick="removeSelectedMunicipality('${municipality.id}')">×</span>
            </div>
        `).join('');
    
    selectedMunicipalities.innerHTML = municipalitiesHTML;
}

// Update visualization based on current state
function updateVisualization() {
    if (currentView === 'map') {
        updateMapView();
    } else {
        updateCompareView();
    }
}

// Update map visualization
function updateMapView() {
    // Implementation will depend on your specific visualization needs
    console.log('Updating map view...');
}

// Update compare visualization
function updateCompareView() {
    // Implementation will depend on your specific visualization needs
    console.log('Updating compare view...');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 