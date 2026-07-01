/* Mapa interactivo de proyectos | Cooperación Española en Mozambique */

import { loadRawProjectsCsv } from "./data.js";

import {
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


function setupIntroScreen(map) {
  const intro = document.getElementById("introScreen");
  const enter = document.getElementById("enterMap");
  const skip = document.getElementById("skipIntro");
  const photo = document.querySelector(".intro-photo");
  const photoMask = document.querySelector(".intro-photo-mask");
  const lens = document.querySelector(".intro-lens");

  if (!intro) return;

  const candidates = [
    "assets/images/moz1",
    "assets/images/moz1.jpg",
    "assets/images/moz1.jpeg",
    "assets/images/moz1.png",
    "assets/images/moz1.webp"
  ];

  function applyImage(url) {
    [photo, photoMask, lens].forEach(element => {
      if (element) element.style.backgroundImage = `url('${url}')`;
    });
    intro.classList.add("intro-image-ready");
  }

  function tryImage(index = 0) {
    if (index >= candidates.length) {
      intro.classList.add("intro-image-ready");
      return;
    }

    const img = new Image();
    img.onload = () => applyImage(candidates[index]);
    img.onerror = () => tryImage(index + 1);
    img.src = candidates[index];
  }

  let canDismiss = false;
  const readyTimer = window.setTimeout(() => {
    intro.classList.add("intro-final-ready");
    canDismiss = true;
  }, 5200);

  function closeIntro(force = false) {
    if (!force && !canDismiss) return;
    window.clearTimeout(readyTimer);
    intro.classList.add("is-hidden");
    document.body.classList.add("intro-dismissed");
    setTimeout(() => map.invalidateSize(), 650);
  }

  tryImage();
  enter?.addEventListener("click", () => closeIntro(true));
  skip?.addEventListener("click", () => closeIntro(true));

  intro.addEventListener("wheel", () => closeIntro(false), { passive: true });
  intro.addEventListener("touchmove", () => closeIntro(false), { passive: true });
  window.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      closeIntro(true);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = {
    allLocations: [],
    filteredLocations: [],
    markers: new Map(),
    filters: {
      query: "",
      modalidad: "all",
      sector: "all",
      ods: "all",
      estado: "all"
    }
  };

  const els = {
    search: document.getElementById("searchInput"),
    modalidad: document.getElementById("modalidadFilter"),
    sector: document.getElementById("sectorFilter"),
    ods: document.getElementById("odsFilter"),
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
  setupIntroScreen(map);

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
    const { query, modalidad, sector, ods, estado } = state.filters;

    state.filteredLocations = state.allLocations
      .map(location => {
        const projects = location.projects.filter(project => {
          const modalidadOk = modalidad === "all" || project.normalizedModality === modalidad;
          const sectorOk = sector === "all" || project.sector === sector;
          const odsOk = ods === "all" || project.ods === ods;
          const estadoOk = estado === "all" || project.estado === estado;
          const searchOk = matchesSearch(project, location, query);
          return modalidadOk && sectorOk && odsOk && estadoOk && searchOk;
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
    attachSearchEvent({ els, state, projects: getAllProjects(state.allLocations), applyFilters });
    attachFilterEvents({ els, state, applyFilters });
    els.closeSheet.addEventListener("click", closeMobileSheet);

    window.addEventListener("resize", debounce(() => {
      map.invalidateSize();
      if (!isMobile()) closeMobileSheet();
    }, 150));
  }

  async function loadData() {
    try {
      const csvText = await loadRawProjectsCsv();
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
