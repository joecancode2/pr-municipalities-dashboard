// Global state
let selectedMunicipalities = [];
let currentView = 'map';
let currentCategory = 'economy';
let indicators = [];
let municipalitiesData = {};

// Initialize the dashboard
async function initDashboard() {
    try {
        // Load municipalities data
        const response = await fetch('data/municipalities.json');
        municipalitiesData = await response.json();
        
        // Initialize map
        initializeMap();
        
        // Initialize indicators
        updateIndicatorsList();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Update the view
        updateView();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Initialize map
function initializeMap() {
    const map = L.map('map-container').setView([18.2208, -66.5901], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Update indicators list based on current category
function updateIndicatorsList() {
    const indicatorsList = document.getElementById('indicators-list');
    indicatorsList.innerHTML = '';
    
    // Get indicators for current category
    const categoryIndicators = municipalitiesData.indicators?.[currentCategory] || [];
    
    categoryIndicators.forEach(indicator => {
        const div = document.createElement('div');
        div.className = 'indicator-item';
        div.textContent = indicator.name;
        div.onclick = () => selectIndicator(indicator);
        indicatorsList.appendChild(div);
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // View toggle buttons
    document.getElementById('map-view-btn').addEventListener('click', () => switchView('map'));
    document.getElementById('compare-view-btn').addEventListener('click', () => switchView('compare'));
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.category-btn.active').classList.remove('active');
            button.classList.add('active');
            currentCategory = button.dataset.category;
            updateIndicatorsList();
            updateView();
        });
    });
    
    // Municipality search
    const searchInput = document.getElementById('municipality-search');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const municipalityList = document.getElementById('municipality-list');
        municipalityList.innerHTML = '';
        
        Object.keys(municipalitiesData.municipalities || {})
            .filter(name => name.toLowerCase().includes(searchTerm))
            .forEach(name => {
                const div = document.createElement('div');
                div.className = 'municipality-item';
                div.textContent = name;
                div.onclick = () => selectMunicipality(name);
                municipalityList.appendChild(div);
            });
    });
}

// Switch between map and compare views
function switchView(view) {
    currentView = view;
    document.querySelector('.view-btn.active').classList.remove('active');
    document.getElementById(`${view}-view-btn`).classList.add('active');
    
    document.getElementById('map-view').style.display = view === 'map' ? 'block' : 'none';
    document.getElementById('compare-view').style.display = view === 'compare' ? 'block' : 'none';
    
    updateView();
}

// Select a municipality
function selectMunicipality(name) {
    if (selectedMunicipalities.includes(name)) return;
    if (selectedMunicipalities.length >= 4) {
        alert('Maximum 4 municipalities can be selected');
        return;
    }
    
    selectedMunicipalities.push(name);
    updateSelectedMunicipalities();
    updateView();
}

// Remove a municipality from selection
function removeMunicipality(name) {
    selectedMunicipalities = selectedMunicipalities.filter(m => m !== name);
    updateSelectedMunicipalities();
    updateView();
}

// Update the selected municipalities display
function updateSelectedMunicipalities() {
    const container = document.getElementById('selected-municipalities');
    container.innerHTML = '';
    document.getElementById('selected-count').textContent = selectedMunicipalities.length;
    
    selectedMunicipalities.forEach(name => {
        const pill = document.createElement('div');
        pill.className = 'municipality-pill';
        pill.innerHTML = `
            ${name}
            <span class="remove-btn" onclick="removeMunicipality('${name}')">&times;</span>
        `;
        container.appendChild(pill);
    });
}

// Update the current view (map or compare)
function updateView() {
    if (currentView === 'map') {
        updateMapView();
    } else {
        updateCompareView();
    }
}

// Update the map view
function updateMapView() {
    // Implementation for updating map visualization
    // This would include updating colors, legends, etc.
}

// Update the compare view
function updateCompareView() {
    const container = document.getElementById('chart-container');
    if (selectedMunicipalities.length === 0) {
        container.innerHTML = '<p>Select municipalities to compare</p>';
        return;
    }
    
    // Implementation for updating comparison visualization
    // This would include creating charts, tables, etc.
}

// Select an indicator
function selectIndicator(indicator) {
    document.querySelectorAll('.indicator-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    updateView();
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard); 