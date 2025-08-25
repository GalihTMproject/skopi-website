// Global variables untuk GeoJSON layers
let geojsonLayers = {};
let loadedGeoJSON = {};

// Custom Icons
const customIcons = {
    bendung: L.divIcon({
        html: '<div style="background: #2980b9; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-water"></i></div>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
    }),
    bangunanBagi: L.divIcon({
        html: '<div style="background: #27ae60; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-building"></i></div>',
        iconSize: [25, 25],
        className: 'custom-div-icon'
    }),
    bangunanSadap: L.divIcon({
        html: '<div style="background: #f39c12; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-cog"></i></div>',
        iconSize: [20, 20],
        className: 'custom-div-icon'
    })
};

// Function untuk load GeoJSON files
async function loadGeoJSON() {
    const files = [
        { name: 'bendung', url: 'data/bendung.geojson' },
        { name: 'saluran', url: 'data/saluran.geojson' },
        { name: 'sawah', url: 'data/sawah.geojson' },
        { name: 'bangunan', url: 'data/bangunan.geojson' }
    ];

    for (const file of files) {
        try {
            const response = await fetch(file.url);
            if (response.ok) {
                loadedGeoJSON[file.name] = await response.json();
                console.log(`✅ Loaded ${file.name}.geojson`);
            }
        } catch (error) {
            console.warn(`⚠️ Error loading ${file.name}.geojson:`, error);
        }
    }
}

// Function untuk add GeoJSON ke map
function addGeoJSONToMap() {
    // Add Bendung layer
    if (loadedGeoJSON.bendung) {
        geojsonLayers.bendung = L.geoJSON(loadedGeoJSON.bendung, {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {icon: customIcons.bendung});
            },
            onEachFeature: function(feature, layer) {
                const props = feature.properties;
                const popupContent = `
                    <div class="custom-popup">
                        <h4><i class="fas fa-water"></i> ${props.name}</h4>
                        <p><strong>Kondisi:</strong> ${props.kondisi}</p>
                        <p><strong>Debit:</strong> ${props.debit}</p>
                        <p><strong>Lebar:</strong> ${props.lebar}</p>
                        <p><strong>Kapasitas:</strong> ${props.kapasitas}</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(mainMap);
    }

    // Add Saluran layer
    if (loadedGeoJSON.saluran) {
        geojsonLayers.saluran = L.geoJSON(loadedGeoJSON.saluran, {
            style: function(feature) {
                const type = feature.properties.type;
                switch(type) {
                    case 'primer': return {color: '#
