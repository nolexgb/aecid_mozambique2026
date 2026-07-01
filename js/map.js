/* ==========================================================
   MAP.JS
========================================================== */

import CONFIG from "../data/config.js";
import { createMarkers, clearMarkers } from "./markers.js";

let map = null;

export function initMap() {
  map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView(CONFIG.MAP.center, CONFIG.MAP.zoom);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);

  return map;
}

export function getMap() {
  return map;
}

export function renderMap(locations = []) {
  if (!map) return;

  clearMarkers();

  createMarkers(map, locations);

  if (locations.length > 0) {
    const bounds = L.latLngBounds(
      locations.map(location => [location.lat, location.lng])
    );

    map.fitBounds(bounds, {
      padding: [70, 70],
      maxZoom: 7
    });
  }

  setTimeout(() => map.invalidateSize(), 200);
}

export function flyToLocation(location) {
  if (!map || !location) return;

  map.flyTo([location.lat, location.lng], 7, {
    animate: true,
    duration: 0.9
  });
}

export default {
  initMap,
  getMap,
  renderMap,
  flyToLocation
};
