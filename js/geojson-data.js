<script>
// Global variables untuk GeoJSON layers
let geojsonLayers = {};
let loadedGeoJSON = {};

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
            } else {
                console.warn(`⚠️ Could not load ${file.name}.geojson`);
                // Fallback ke data dummy jika file tidak ada
                loadedGeoJSON[file.name] = createDummyGeoJSON(file.name);
            }
        } catch (error) {
            console.warn(`⚠️ Error loading ${file.name}.geojson:`, error);
            // Fallback ke data dummy
            loadedGeoJSON[file.name] = createDummyGeoJSON(file.name);
        }
    }
}

// Function untuk membuat dummy GeoJSON jika file tidak ada
function createDummyGeoJSON(type) {
    switch(type) {
        case 'bendung':
            return {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "name": "Bendung Utama Molek",
                        "type": "bendung",
                        "kondisi": "Baik",
                        "debit": "2.5 m³/s"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [112.6000, -8.1000]
                    }
                }]
            };
        case 'saluran':
            return {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "name": "Saluran Primer",
                        "type": "primer",
                        "kondisi": "Baik"
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [112.6000, -8.1000],
                            [112.6050, -8.0950],
                            [112.6100, -8.0900]
                        ]
                    }
                }]
            };
        case 'sawah':
            return {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "name": "Blok Sawah A1",
                        "luas": "125 Ha",
                        "status": "Masa Tanam"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [112.6100, -8.0900],
                            [112.6120, -8.0920],
                            [112.6110, -8.0940],
                            [112.6090, -8.0920],
                            [112.6100, -8.0900]
                        ]]
                    }
                }]
            };
        case 'bangunan':
            return {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "name": "Bangunan Bagi 1",
                        "type": "bangunan_bagi",
                        "kondisi": "Baik"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [112.6050, -8.0950]
                    }
                }]
            };
        default:
            return {"type": "FeatureCollection", "features": []};
    }
}

// Function untuk add GeoJSON ke map
function addGeoJSONToMap() {
    // Clear existing layers
    Object.values(geojsonLayers).forEach(layer => {
        if (mainMap.hasLayer(layer)) {
            mainMap.removeLayer(layer);
        }
    });

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
                        <p><strong>Lebar:</strong> ${props.lebar || 'N/A'}</p>
                        <p><strong>Kapasitas:</strong> ${props.kapasitas || 'N/A'}</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        });
    }

    // Add Saluran layer
    if (loadedGeoJSON.saluran) {
        geojsonLayers.saluran = L.geoJSON(loadedGeoJSON.saluran, {
            style: function(feature) {
                const type = feature.properties.type;
                switch(type) {
                    case 'primer': return {color: '#3498db', weight: 5, opacity: 0.8};
                    case 'sekunder': return {color: '#27ae60', weight: 4, opacity: 0.8};
                    case 'tersier': return {color: '#f39c12', weight: 3, opacity: 0.7};
                    default: return {color: '#95a5a6', weight: 2, opacity: 0.6};
                }
            },
            onEachFeature: function(feature, layer) {
                const props = feature.properties;
                const popupContent = `
                    <div class="custom-popup">
                        <h4><i class="fas fa-stream"></i> ${props.name}</h4>
                        <p><strong>Tipe:</strong> ${props.type}</p>
                        <p><strong>Panjang:</strong> ${props.panjang}</p>
                        <p><strong>Lebar:</strong> ${props.lebar}</p>
                        <p><strong>Kondisi:</strong> ${props.kondisi}</p>
                        <p><strong>Kapasitas:</strong> ${props.kapasitas}</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        });
    }

    // Add Sawah layer
    if (loadedGeoJSON.sawah) {
        geojsonLayers.sawah = L.geoJSON(loadedGeoJSON.sawah, {
            style: function(feature) {
                const status = feature.properties.status;
                switch(status) {
                    case 'Masa Tanam': 
                        return {color: '#27ae60', fillColor: '#2ecc71', fillOpacity: 0.4, weight: 2};
                    case 'Persiapan Lahan': 
                        return {color: '#f39c12', fillColor: '#f1c40f', fillOpacity: 0.4, weight: 2};
                    case 'Panen': 
                        return {color: '#e67e22', fillColor: '#e74c3c', fillOpacity: 0.4, weight: 2};
                    case 'Bera': 
                        return {color: '#95a5a6', fillColor: '#bdc3c7', fillOpacity: 0.3, weight: 2};
                    default: 
                        return {color: '#34495e', fillColor: '#7f8c8d', fillOpacity: 0.3, weight: 2};
                }
            },
            onEachFeature: function(feature, layer) {
                const props = feature.properties;
                const popupContent = `
                    <div class="custom-popup">
                        <h4><i class="fas fa-seedling"></i> ${props.name}</h4>
                        <p><strong>Luas:</strong> ${props.luas}</p>
                        <p><strong>Status:</strong> ${props.status}</p>
                        <p><strong>Jenis Padi:</strong> ${props.jenis_padi}</p>
                        <p><strong>Musim Tanam:</strong> ${props.musim_tanam}</p>
                        <p><strong>Produktivitas:</strong> ${props.produktivitas}</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        });
    }

    // Add Bangunan layer
    if (loadedGeoJSON.bangunan) {
        geojsonLayers.bangunan = L.geoJSON(loadedGeoJSON.bangunan, {
            pointToLayer: function(feature, latlng) {
                const type = feature.properties.type;
                let icon = customIcons.bangunanBagi;
