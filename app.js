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
let municipalitiesData = [];
let indicatorsData = [];

// Initialize the application
async function initializeApp() {
    try {
        console.log('Starting data fetch...');
        
        // Load data with better error handling
        const municipalitiesResponse = await fetch('data/municipalities.json');
        if (!municipalitiesResponse.ok) {
            throw new Error(`HTTP error! status: ${municipalitiesResponse.status}`);
        }
        const municipalities = await municipalitiesResponse.json();
        console.log('Municipalities data loaded:', municipalities);

        const indicatorsResponse = await fetch('data/indicators.json');
        if (!indicatorsResponse.ok) {
            throw new Error(`HTTP error! status: ${indicatorsResponse.status}`);
        }
        const indicators = await indicatorsResponse.json();
        console.log('Indicators data loaded:', indicators);
        
        // Update state
        municipalitiesData = municipalities.municipalities || [];
        indicatorsData = indicators.indicators || [];
        
        console.log('Data loaded successfully. Initializing components...');
        
        // Initialize components
        initializeMap();
        populateIndicators();
        populateMunicipalities();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        // Display error message to user
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

// Populate indicators list
function populateIndicators() {
    if (!indicatorsData.length) return;
    
    const indicatorsHTML = indicatorsData
        .map(indicator => `
            <div class="indicator-item" data-id="${indicator.id}">
                ${indicator.name}
            </div>
        `).join('');
    
    indicatorsList.innerHTML = indicatorsHTML;
}

// Populate municipalities list
function populateMunicipalities() {
    if (!municipalitiesData.length) return;
    
    const municipalitiesHTML = municipalitiesData
        .map(municipality => `
            <div class="municipality-item" data-id="${municipality.id}">
                ${municipality.name}
            </div>
        `).join('');
    
    municipalityList.innerHTML = municipalitiesHTML;
}

// Setup event listeners
function setupEventListeners() {
    // View toggle
    mapViewBtn.addEventListener('click', () => switchView('map'));
    compareViewBtn.addEventListener('click', () => switchView('compare'));
    
    // Indicators selection
    indicatorsList.addEventListener('click', (e) => {
        const indicator = e.target.closest('.indicator-item');
        if (!indicator) return;
        
        // Remove active class from all indicators
        document.querySelectorAll('.indicator-item').forEach(item => 
            item.classList.remove('active'));
        
        // Add active class to selected indicator
        indicator.classList.add('active');
        selectedIndicator = indicator.dataset.id;
        updateVisualization();
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
        
        if (selectedMunicipalitiesList.length < 4 && 
            !selectedMunicipalitiesList.some(m => m.id === id)) {
            addSelectedMunicipality(id, name);
        }
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
    selectedMunicipalitiesList.push({ id, name });
    updateSelectedMunicipalities();
    updateVisualization();
}

// Remove selected municipality
function removeSelectedMunicipality(id) {
    selectedMunicipalitiesList = selectedMunicipalitiesList.filter(m => m.id !== id);
    updateSelectedMunicipalities();
    updateVisualization();
}

// Update selected municipalities display
function updateSelectedMunicipalities() {
    selectedCount.textContent = selectedMunicipalitiesList.length;
    
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