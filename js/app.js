/* Mapa interactivo de proyectos | Cooperación Española en Mozambique */

document.addEventListener("DOMContentLoaded", async () => {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?output=csv";

  const COLORS = {
    Bilateral: "#2563eb",
    "Convocatoria ONGD": "#f97316",
    Convenio: "#16a34a",
    Innovación: "#8e24aa",
    Default: "#6b7280"
  };

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

  function normalizeHeader(header) {
    return String(header || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && quoted && next === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(value.trim());
        value = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (value || row.length) {
          row.push(value.trim());
          rows.push(row);
          row = [];
          value = "";
        }
      } else {
        value += char;
      }
    }

    if (value || row.length) {
      row.push(value.trim());
      rows.push(row);
    }

    return rows;
  }

  function csvToObjects(csvText) {
    const rows = parseCSV(csvText).filter(row =>
      row.some(cell => String(cell).trim() !== "")
    );

    if (!rows.length) return [];

    const headers = rows[0].map(normalizeHeader);

    return rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index] ? row[index].trim() : "";
      });
      return item;
    });
  }

  function toNumber(value) {
    if (!value) return null;
    const number = Number(String(value).replace(",", ".").trim());
    return Number.isFinite(number) ? number : null;
  }

  function parseAmount(value) {
    if (!value) return 0;
    return Number(
      String(value)
        .replace("€", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;
  }

  function formatAmount(value) {
    if (!value) return "€ 0";
    if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1).replace(".", ",")} M`;
    return `€ ${Math.round(value).toLocaleString("es-ES")}`;
  }

  function normalizeModality(modality) {
    const text = String(modality || "").trim();
    if (text.includes("Bilateral")) return "Bilateral";
    if (text.includes("ONGD")) return "Convocatoria ONGD";
    if (text.includes("Convenio")) return "Convenio";
    if (text.includes("Innovación")) return "Innovación";
    return "Default";
  }

  function isVisible(row) {
    const visible = String(row.visible_mapa || "").trim().toLowerCase();
    return visible === "sí" || visible === "si" || visible === "yes" || visible === "true" || visible === "1";
  }

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

    return Object.values(grouped).map(location => ({
      ...location,
      totalAmount: sum(location.projects.map(project => project.amountNumber)),
      dominantModality: dominant(location.projects.map(project => project.normalizedModality)),
      dominantSector: dominant(location.projects.map(project => project.sector).filter(Boolean))
    }));
  }

  function sum(values) {
    return values.reduce((total, value) => total + (Number(value) || 0), 0);
  }

  function slug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function dominant(values) {
    const counts = countBy(values.filter(Boolean));
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "Default";
  }

  function countBy(values) {
    return values.reduce((acc, value) => {
      const key = value || "Sin dato";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function getAllProjects(locations = state.filteredLocations) {
    return locations.flatMap(location =>
      location.projects.map(project => ({ ...project, location: location.name, lat: location.lat, lng: location.lng }))
    );
  }

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  }

  function matchesSearch(project, location, query) {
    if (!query) return true;
    const haystack = [
      location.name,
      project.title,
      project.partners,
      project.sector,
      project.subsector,
      project.estado,
      project.ods,
      project.provincia,
      project.distrito,
      project.localidad,
      project.modality
    ].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const needle = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return haystack.includes(needle);
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

        return {
          ...location,
          projects,
          totalAmount: sum(projects.map(project => project.amountNumber)),
          dominantModality: dominant(projects.map(project => project.normalizedModality)),
          dominantSector: dominant(projects.map(project => project.sector).filter(Boolean))
        };
      })
      .filter(location => location.projects.length > 0);

    renderAll();
  }

  function populateFilters() {
    const projects = getAllProjects(state.allLocations);
    const sectors = uniqueSorted(projects.map(project => project.sector));
    const estados = uniqueSorted(projects.map(project => project.estado));

    sectors.forEach(value => els.sector.appendChild(new Option(value, value)));
    estados.forEach(value => els.estado.appendChild(new Option(value, value)));
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

  function renderMarkers() {
    markerLayer.clearLayers();
    state.markers.clear();

    const maxAmount = Math.max(...state.filteredLocations.map(location => location.totalAmount), 1);

    state.filteredLocations.forEach(location => {
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
          openMobileSheet(location);
        }
      });

      markerLayer.addLayer(marker);
      state.markers.set(location.id, marker);
    });

    fitToFilteredLocations();
  }

  function markerSize(amount, maxAmount, projectCount) {
    const amountFactor = maxAmount ? amount / maxAmount : 0;
    return Math.round(42 + amountFactor * 34 + Math.min(projectCount, 10) * 1.4);
  }

  function fitToFilteredLocations() {
    if (!state.filteredLocations.length) return;
    const bounds = L.latLngBounds(state.filteredLocations.map(location => [location.lat, location.lng]));
    map.fitBounds(bounds, { padding: [62, 62], maxZoom: 6.7 });
    setTimeout(() => map.invalidateSize(), 250);
  }

  function createTooltip(location) {
    return `
      <div class="tooltip-card">
        <strong>${escapeHtml(location.name)}</strong>
        <span>${location.projects.length} ${location.projects.length === 1 ? "proyecto" : "proyectos"}</span>
        <span>${formatAmount(location.totalAmount)}</span>
        <span>${escapeHtml(location.dominantSector === "Default" ? "Sin sector predominante" : location.dominantSector)}</span>
      </div>
    `;
  }

  function createPopup(location) {
    const sectorCounts = countBy(location.projects.map(project => project.sector).filter(Boolean));
    const modalityCounts = countBy(location.projects.map(project => project.normalizedModality).filter(Boolean));
    const partnerCount = uniqueSorted(location.projects.map(project => project.partners)).length;

    return `
      <article class="premium-popup">
        <header class="popup-hero">
          <p class="kicker">AECID Mozambique</p>
          <h2>${escapeHtml(location.name)}</h2>
          <div class="popup-metrics">
            <div class="metric-box"><strong>${location.projects.length}</strong><small>Proyectos</small></div>
            <div class="metric-box"><strong>${formatAmount(location.totalAmount)}</strong><small>Financiación</small></div>
            <div class="metric-box"><strong>${partnerCount}</strong><small>Socios</small></div>
          </div>
        </header>

        <div class="popup-body">
          ${createMiniBars("Sectores", sectorCounts)}
          ${createMiniBars("Modalidades", modalityCounts, true)}
          <h3 class="projects-title">Proyectos</h3>
          ${location.projects.map((project, index) => createProjectCard(project, index)).join("")}
        </div>
      </article>
    `;
  }

  function createMiniBars(title, counts, useModalityColor = false) {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!entries.length) return "";

    const max = Math.max(...entries.map(([, count]) => count), 1);
    const bars = entries.map(([name, count]) => {
      const width = Math.max(8, Math.round((count / max) * 100));
      const color = useModalityColor ? COLORS[name] || COLORS.Default : "#d0001b";
      return `
        <div class="mini-bar">
          <span>${escapeHtml(name)}</span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="--w:${width}%;--c:${color}"></div></div>
          <strong>${count}</strong>
        </div>
      `;
    }).join("");

    return `<section class="chart-block"><h3>${title}</h3>${bars}</section>`;
  }

  function createProjectCard(project, index) {
    const color = COLORS[project.normalizedModality] || COLORS.Default;
    const locationLine = [project.provincia, project.distrito, project.localidad].filter(Boolean).join(" · ");

    return `
      <details class="project-card" ${index === 0 ? "open" : ""}>
        <summary>${escapeHtml(project.title)}</summary>
        <div class="project-detail">
          <p><strong>Año:</strong> ${escapeHtml(project.year || "—")}</p>
          <p><strong>Socio / entidad:</strong> ${escapeHtml(project.partners || "—")}</p>
          <p><strong>Localización:</strong> ${escapeHtml(locationLine || "—")}</p>
          <p><strong>Sector:</strong> ${escapeHtml(project.sector || "—")}</p>
          <p><strong>Subsector:</strong> ${escapeHtml(project.subsector || "—")}</p>
          <p><strong>Importe:</strong> ${escapeHtml(project.amount || "—")}</p>
          <div class="badges">
            <span class="badge" style="background:${color}">${escapeHtml(project.modality || "Sin modalidad")}</span>
            <span class="badge badge-light">${escapeHtml(project.estado || "Sin estado")}</span>
            <span class="badge badge-light">${escapeHtml(project.ods || "ODS")}</span>
          </div>
        </div>
      </details>
    `;
  }

  function renderResults() {
    const projects = getAllProjects();
    els.resultsCount.textContent = projects.length;

    if (!projects.length) {
      els.resultsList.innerHTML = `<div class="result-item"><strong>No hay resultados</strong><span>Pruebe con otro sector, estado o búsqueda.</span></div>`;
      return;
    }

    els.resultsList.innerHTML = projects.slice(0, 40).map(project => `
      <button class="result-item" data-location="${slug(project.location)}">
        <strong>${escapeHtml(project.title)}</strong>
        <span>${escapeHtml(project.location)} · ${escapeHtml(project.sector || "Sin sector")} · ${escapeHtml(project.estado || "Sin estado")}</span>
      </button>
    `).join("");

    els.resultsList.querySelectorAll(".result-item").forEach(button => {
      button.addEventListener("click", () => focusLocation(button.dataset.location));
    });
  }

  function focusLocation(locationId) {
    const location = state.filteredLocations.find(item => item.id === locationId);
    const marker = state.markers.get(locationId);
    if (!location || !marker) return;

    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
    setTimeout(() => {
      if (isMobile()) openMobileSheet(location);
      else marker.openPopup();
    }, 450);
  }

  function openMobileSheet(location) {
    els.mobileSheetContent.innerHTML = createPopup(location);
    els.mobileSheet.classList.add("open");
  }

  function closeMobileSheet() {
    els.mobileSheet.classList.remove("open");
  }

  function isMobile() {
    return window.matchMedia("(max-width: 760px)").matches;
  }

  function renderAll() {
    updateKpis();
    renderMarkers();
    renderResults();
  }

  function setupEvents() {
    els.search.addEventListener("input", debounce(event => {
      state.filters.query = event.target.value.trim();
      applyFilters();
    }, 200));

    els.sector.addEventListener("change", event => {
      state.filters.sector = event.target.value;
      applyFilters();
    });

    els.estado.addEventListener("change", event => {
      state.filters.estado = event.target.value;
      applyFilters();
    });

    els.closeSheet.addEventListener("click", closeMobileSheet);

    window.addEventListener("resize", debounce(() => {
      map.invalidateSize();
      if (!isMobile()) closeMobileSheet();
    }, 150));
  }

  function debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
  populateFilters();
  setupEvents();
  renderAll();
  setTimeout(() => map.invalidateSize(), 500);
});
