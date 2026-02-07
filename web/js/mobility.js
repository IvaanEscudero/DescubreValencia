class TransportMap {
    constructor(mapId, coords, geo, zoom = 14) {
        this.map = L.map(mapId).setView(coords, zoom);
        this.markersLayer = L.layerGroup().addTo(this.map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        if (geo) {
            const myIcon = L.divIcon({
                className: 'custom-icon',
                html: '📍',
            });

            L.marker(coords, { icon: myIcon })
                .addTo(this.map)
                .bindPopup('Tu ubicación actual')
                .openPopup();
        }
        this.data = {}; // Store loaded data
    }

    async loadTransportData(url, attributes, icon, sourceName) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.data[sourceName] = data; // Save data
        } catch (error) {
            console.error(`Error loading data from URL: ${url}`, error);
        }
    }

    renderMarkers(data, attributes, icon, sourceName) {
        if (this.data[sourceName]) {
            this.markersLayer.clearLayers();
        }

        data.forEach(item => {
            const coords = item.geo_point_2d;
            if (coords) {
                let popupContent = `<b>${icon} ${item[attributes.name] || "No name"}</b><br>`;

                attributes.extra.forEach(attr => {
                    if (item[attr]) {
                        popupContent += `<b>${attr}:</b> ${item[attr]}<br>`;
                    }
                });

                if (attributes.arrivals) {
                    popupContent +=
                        `<a href="${item[attributes.arrivals]}" target="_blank">Próximas llegadas</a>`;
                }

                L.marker([coords.lat, coords.lon])
                    .addTo(this.markersLayer)
                    .bindPopup(popupContent);
            }
        });
    }

    toggleTransportVisibility(sourceName) {
        let alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = '';
        this.markersLayer.clearLayers();
        if (this.data[sourceName] && this.data[sourceName].length > 0) {
            this.renderMarkers(this.data[sourceName], transportSources[sourceName].attributes, transportSources[sourceName].icon, sourceName);
        } else {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning mt-3';
            alertDiv.role = 'alert';
            alertDiv.innerText = `No se han obtenido datos de la API de ${sourceName}`;
            alertContainer.appendChild(alertDiv);
        }
    }
}

let transportMap;
const defaultCoords = [39.4699, -0.3763];

async function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            transportMap = new TransportMap('map', [lat, lon], true);

            // Load transport data after initializing map
            await loadTransportData();
            transportMap.toggleTransportVisibility('buses');  // Show buses on the map

        }, async function (error) {
            transportMap = new TransportMap('map', defaultCoords, false);

            // Load transport data after initializing map
            await loadTransportData();
            transportMap.toggleTransportVisibility('buses');  // Show buses on the map
        });
    } else {
        transportMap = new TransportMap('map', defaultCoords, false);

        // Load transport data after initializing map
        await loadTransportData();
        transportMap.toggleTransportVisibility('buses');  // Show buses on the map
    }
}

async function loadTransportData() {
    // We wait until all the transport data is loaded before showing the markers
    await Promise.all(Object.keys(transportSources).map(async (sourceName) => {
        const source = transportSources[sourceName];
        await transportMap.loadTransportData(source.url, source.attributes, source.icon, sourceName);
    }));
}

// Define transport data sources
const transportSources = {
    buses: {
        url: "https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/emt/exports/json?lang=es&timezone=Europe%2FBerlin",
        attributes: { name: "denominacion", extra: ["lineas"], arrivals: "proximas_llegadas" },
        icon: "🚌"
    },
    fgv: {
        url: "https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/fgv-estacions-estaciones/exports/json?lang=es&timezone=Europe%2FBerlin",
        attributes: { name: "nombre", extra: ["linea"], arrivals: "proximas_llegadas" },
        icon: "🚋 "
    },
    bikes: {
        url: "https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/valenbisi-disponibilitat-valenbisi-dsiponibilidad/exports/json?lang=es&timezone=Europe%2FBerlin",
        attributes: { name: "address", extra: ["available", "total"] },
        icon: "🚲"
    }
};

// Initialize the map when the page loads
initMap();

// Button event listeners
document.getElementById('busButton').addEventListener('click', function () {
    transportMap.toggleTransportVisibility('buses');
    setSelectedTransport('busButton');
});

document.getElementById('fgvButton').addEventListener('click', function () {
    transportMap.toggleTransportVisibility('fgv');
    setSelectedTransport('fgvButton');
});

document.getElementById('bikeButton').addEventListener('click', function () {
    transportMap.toggleTransportVisibility('bikes');
    setSelectedTransport('bikeButton');
});

// Update selected button style
function setSelectedTransport(selectedId) {
    document.querySelectorAll('.btn').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById(selectedId).classList.add('selected');
}
