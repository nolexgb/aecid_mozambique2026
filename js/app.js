/* Mapa interactivo de proyectos | Cooperación Española en Mozambique */

import {
  SHEET_URL,
  csvToObjects,
  debounce,
  dominant,
  formatAmount,
  isMobile,
  isVisible,
  normalizeModality,
  parseAmount,
  slug,
  sum,
  toNumber
} from "./utils.js";
import { createLeafletMap, focusLocation as focusLocationOnMap, renderMarkers } from "./map.js";
import { createPopup } from "./popup.js";
import { populateFilters, attachFilterEvents } from "./filters.js";
import { attachSearchEvent, matchesSearch, renderResults } from "./search.js";

document.addEventListener("DOMContentLoaded", async () => {
  const state = {
    allLocations: [],
    filteredLocations: [],
    markers: new Map(),
    filters: {
      query: "",
      sector: "all",
      estado: "all"
    }
  };

  const els = {
    search: document.getElementById("searchInput"),
    sector: document.getElementById("sectorFilter"),
    estado: document.getElementById("estadoFilter"),
    kpiProjects: document.getElementById("kpiProjects"),
    kpiAmount: document.getElementById("kpiAmount"),
    kpiTerritory: document.getElementById("kpiTerritory"),
    kpiYears: document.getElementById("kpiYears"),
    resultsCount: document.getElementById("resultsCount"),
    resultsList: document.getElementById("resultsList"),
    loading: document.getElementById("loadingOverlay"),
    mobileSheet: document.getElementById("mobileSheet"),
    mobileSheetContent: document.getElementById("mobileSheetContent"),
    closeSheet: document.getElementById("closeSheet")
  };

  const { map, markerLayer } = createLeafletMap();

  function groupRowsByLocation(rows) {
    const grouped = {};

    rows.forEach(row => {
      if (!isVisible(row)) return;

      const name = row.ambito || row.provincia || row.localidad || "Sin localización";
      const lat = toNumber(row.latitud || row.lat);
      const lng = toNumber(row.longitud || row.lng || row.long);
      if (!name || lat === null || lng === null) return;

      if (!grouped[name]) {
        grouped[name] = { id: slug(name), name, lat, lng, projects: [] };
      }

      grouped[name].projects.push({
        id: row.id || "",
        title: row.proyecto || "Proyecto sin título",
        year: row.ano || row.año || "",
        partners: row.socios || "",
        sector: row.sector || "",
        subsector: row.subsector || "",
        amount: row.importe_eur || "",
        amountNumber: parseAmount(row.importe_eur || ""),
        modality: row.modalidad || "",
        normalizedModality: normalizeModality(row.modalidad || ""),
        estado: row.estado || "",
        ods: row.ods || "",
        beneficiarios: row.beneficiarios || "",
        provincia: row.provincia || "",
        distrito: row.distrito || "",
        localidad: row.localidad || ""
      });
    });

    return Object.values(grouped).map(location => enrichLocation(location));
  }

  function enrichLocation(location) {
    return {
      ...location,
      totalAmount: sum(location.projects.map(project => project.amountNumber)),
      dominantModality: dominant(location.projects.map(project => project.normalizedModality)),
      dominantSector: dominant(location.projects.map(project => project.sector).filter(Boolean))
    };
  }

  function getAllProjects(locations = state.filteredLocations) {
    return locations.flatMap(location =>
      location.projects.map(project => ({ ...project, location: location.name, lat: location.lat, lng: location.lng }))
    );
  }

  function applyFilters() {
    const { query, sector, estado } = state.filters;

    state.filteredLocations = state.allLocations
      .map(location => {
        const projects = location.projects.filter(project => {
          const sectorOk = sector === "all" || project.sector === sector;
          const estadoOk = estado === "all" || project.estado === estado;
          const searchOk = matchesSearch(project, location, query);
          return sectorOk && estadoOk && searchOk;
        });

        return enrichLocation({ ...location, projects });
      })
      .filter(location => location.projects.length > 0);

    renderAll();
  }

  function updateKpis() {
    const projects = getAllProjects();
    const years = projects.map(project => Number(project.year)).filter(Boolean);
    const totalAmount = sum(projects.map(project => project.amountNumber));

    els.kpiProjects.textContent = projects.length;
    els.kpiAmount.textContent = formatAmount(totalAmount);
    els.kpiTerritory.textContent = getTerritoryText(projects);
    els.kpiYears.textContent = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
  }

  function getTerritoryText(projects) {
    const provinces = new Set();
    let hasNational = false;

    projects.forEach(project => {
      const province = String(project.provincia || "").trim();
      if (!province) return;
      if (province.toLowerCase() === "nacional") {
        hasNational = true;
        return;
      }
      if (province.toLowerCase().includes("norte") || province.toLowerCase().includes("sur")) return;
      province.split("/").map(part => part.trim()).filter(Boolean).forEach(part => provinces.add(part));
    });

    if (provinces.size && hasNational) return `${provinces.size} provincias + nacional`;
    if (provinces.size) return `${provinces.size} provincias`;
    return hasNational ? "Ámbito nacional" : "—";
  }

  function openMobileSheet(location) {
    els.mobileSheetContent.innerHTML = createPopup(location);
    els.mobileSheet.classList.add("open");
  }

  function closeMobileSheet() {
    els.mobileSheet.classList.remove("open");
  }

  function focusLocation(locationId) {
    const location = state.filteredLocations.find(item => item.id === locationId);
    const marker = state.markers.get(locationId);
    focusLocationOnMap({ map, location, marker, openMobileSheet });
  }

  function renderAll() {
    updateKpis();
    renderMarkers({
      map,
      markerLayer,
      locations: state.filteredLocations,
      markers: state.markers,
      onMobileOpen: openMobileSheet
    });
    renderResults({ els, projects: getAllProjects(), focusLocation });
  }

  function setupEvents() {
    attachSearchEvent({ els, state, applyFilters });
    attachFilterEvents({ els, state, applyFilters });
    els.closeSheet.addEventListener("click", closeMobileSheet);

    window.addEventListener("resize", debounce(() => {
      map.invalidateSize();
      if (!isMobile()) closeMobileSheet();
    }, 150));
  }

  async function loadData() {
    try {
      const response = await fetch(SHEET_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      const csvText = await response.text();
      const rows = csvToObjects(csvText);
      state.allLocations = groupRowsByLocation(rows);
      state.filteredLocations = [...state.allLocations];
    } catch (error) {
      console.error("Error cargando datos desde Google Sheets:", error);
      state.allLocations = [];
      state.filteredLocations = [];
      els.resultsList.innerHTML = `<div class="result-item"><strong>No se pudieron cargar los datos</strong><span>Revise la publicación del Google Sheet.</span></div>`;
    } finally {
      els.loading.classList.add("hidden");
    }
  }

  await loadData();
  populateFilters({ els, projects: getAllProjects(state.allLocations) });
  setupEvents();
  renderAll();
  setTimeout(() => map.invalidateSize(), 500);
});
