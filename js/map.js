import { COLORS, formatAmount, isMobile } from "./utils.js";
import { createPopup, createTooltip } from "./popup.js";

export function createLeafletMap() {
  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true,
    preferCanvas: true
  }).setView([-18.6657, 35.5296], 5.4);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  return { map, markerLayer };
}

export function renderMarkers({ map, markerLayer, locations, markers, onMobileOpen }) {
  markerLayer.clearLayers();
  markers.clear();

  const maxAmount = Math.max(...locations.map(location => location.totalAmount), 1);

  locations.forEach(location => {
    const color = COLORS[location.dominantModality] || COLORS.Default;
    const size = markerSize(location.totalAmount, maxAmount, location.projects.length);

    const marker = L.marker([location.lat, location.lng], {
      icon: L.divIcon({
        className: "project-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<div class="marker-bubble" style="--size:${size}px;--marker-color:${color}">${location.projects.length}</div>`
      })
    });

    marker.bindTooltip(createTooltip(location), {
      className: "custom-tooltip",
      direction: "top",
      offset: [0, -size / 2],
      opacity: 1
    });

    marker.bindPopup(createPopup(location), {
      maxWidth: 500,
      closeButton: true
    });

    marker.on("click", () => {
      if (isMobile()) {
        marker.closePopup();
        onMobileOpen(location);
      }
    });

    markerLayer.addLayer(marker);
    markers.set(location.id, marker);
  });

  fitToLocations(map, locations);
}

export function focusLocation({ map, location, marker, openMobileSheet }) {
  if (!location || !marker) return;

  map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
  setTimeout(() => {
    if (isMobile()) openMobileSheet(location);
    else marker.openPopup();
  }, 450);
}

function markerSize(amount, maxAmount, projectCount) {
  const amountFactor = maxAmount ? amount / maxAmount : 0;
  return Math.round(42 + amountFactor * 34 + Math.min(projectCount, 10) * 1.4);
}

function fitToLocations(map, locations) {
  if (!locations.length) return;
  const bounds = L.latLngBounds(locations.map(location => [location.lat, location.lng]));
  map.fitBounds(bounds, { padding: [62, 62], maxZoom: 6.7 });
  setTimeout(() => map.invalidateSize(), 250);
}
