document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([39.4699, -0.3763], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var lugares = [
        { nombre: "La Más Bonita", lat: 39.4745, lng: -0.3347 },
        { nombre: "Dulce de Leche", lat: 39.4702, lng: -0.3761 },
        { nombre: "Ubik Café", lat: 39.4625, lng: -0.3779 },
        { nombre: "Café Negrito", lat: 39.4780, lng: -0.3752 },
        { nombre: "Café de Las Horas", lat: 39.4749, lng: -0.3756 },
        { nombre: "Mercado de Colón", lat: 39.4696, lng: -0.3739 },
        { nombre: "Café Lisboa", lat: 39.4774, lng: -0.3753 },
        { nombre: "Marina Beach Club", lat: 39.4622, lng: -0.3240 }
    ];
    
    lugares.forEach(function (lugar) {
        L.marker([lugar.lat, lugar.lng]).addTo(map)
            .bindPopup(`<b>${lugar.nombre}</b>`);
    });
});