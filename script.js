const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([-18.6657, 35.5296], 5.4);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);

const COLORS = {
  Bilateral: "#2563eb",
  "Convocatoria ONGD": "#f97316",
  Convenio: "#16a34a",
  Innovación: "#8e24aa",
  Default: "#6b7280"
};

let activeFilter = "all";
let markerLayer = L.layerGroup().addTo(map);

function normalizeModality(modality) {
  if (!modality) return "Default";
  if (modality.includes("Bilateral")) return "Bilateral";
  if (modality.includes("ONGD")) return "Convocatoria ONGD";
  if (modality.includes("Convenio")) return "Convenio";
  if (modality.includes("Innovación")) return "Innovación";
  return "Default";
}

function parseAmount(value) {
  if (!value) return 0;
  return Number(
    value
      .replace("€", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}

function getAllProjects() {
  return projectData.flatMap(location =>
    location.projects.map(project => ({
      ...project,
      location: location.name,
      lat: location.lat,
      lng: location.lng,
      normalizedModality: normalizeModality(project.modality)
    }))
  );
}

function getFilteredProjects(projects) {
  if (activeFilter === "all") return projects;
  return projects.filter(project => project.normalizedModality === activeFilter);
}

function getFilteredLocations() {
  return projectData
    .map(location => {
      const projects = location.projects
        .map(project => ({
          ...project,
          normalizedModality: normalizeModality(project.modality)
        }))
        .filter(project =>
          activeFilter === "all" || project.normalizedModality === activeFilter
        );

      return {
        ...location,
        projects
      };
    })
    .filter(location => location.projects.length > 0);
}

function updateKpis() {
  const projects = getFilteredProjects(getAllProjects());
  const totalProjects = projects.length;
  const territories = new Set(projects.map(p => p.location)).size;
  const years = projects.map(p => Number(p.year)).filter(Boolean);
  const totalAmount = projects.reduce((sum, p) => sum + parseAmount(p.amount), 0);

  const kpis = document.querySelectorAll(".kpi-value");

  if (kpis[0]) kpis[0].textContent = totalProjects;
  if (kpis[1]) kpis[1].textContent = territories;
  if (kpis[2]) kpis[2].textContent = `€ ${(totalAmount / 1000000).toFixed(1).replace(".", ",")} M`;

  if (kpis[3] && years.length) {
    kpis[3].textContent = `${Math.min(...years)}–${Math.max(...years)}`;
  }
}

function updateCounts() {
  const projects = getAllProjects();

  const counts = {
    Bilateral: projects.filter(p => p.normalizedModality === "Bilateral").length,
    "Convocatoria ONGD": projects.filter(p => p.normalizedModality === "Convocatoria ONGD").length,
    Convenio: projects.filter(p => p.normalizedModality === "Convenio").length,
    Innovación: projects.filter(p => p.normalizedModality === "Innovación").length
  };

  document.querySelectorAll(".filter").forEach(button => {
    const filter = button.dataset.filter;

    if (filter === "all") {
      button.querySelector(".badge-count").textContent = counts.Bilateral;
    }

    if (counts[filter] !== undefined) {
      button.querySelector(".badge-count").textContent = counts[filter];
    }
  });
}

function getDominantModality(projects) {
  const count = {};

  projects.forEach(project => {
    count[project.normalizedModality] = (count[project.normalizedModality] || 0) + 1;
  });

  return Object.keys(count).sort((a, b) => count[b] - count[a])[0] || "Default";
}

function createPopupContent(location) {
  const projectsHtml = location.projects.map((project, index) => {
    const modality = project.normalizedModality;
    const color = COLORS[modality] || COLORS.Default;

    return `
      <details class="project">
        <summary>
          <span class="project-number">${index + 1}</span>
          ${project.title}
        </summary>

        <div class="project-body">
          <p><strong>Año:</strong> ${project.year}</p>
          <p><strong>Socio / entidad:</strong> ${project.partners}</p>
          <p><strong>Importe:</strong> ${project.amount}</p>

          <span class="modality-badge" style="background:${color}">
            ${project.modality}
          </span>
        </div>
      </details>
    `;
  }).join("");

  return `
    <div class="popup-card">
      <div class="popup-header">
        <p class="popup-kicker">AECID Mozambique</p>
        <h2>${location.name}</h2>
        <p>${location.projects.length} ${location.projects.length === 1 ? "proyecto activo" : "proyectos activos"}</p>
      </div>

      ${projectsHtml}
    </div>
  `;
}

function renderMap() {
  markerLayer.clearLayers();

  const locations = getFilteredLocations();

  locations.forEach(location => {
    const dominantModality = getDominantModality(location.projects);
    const color = COLORS[dominantModality] || COLORS.Default;

    const marker = L.circleMarker([location.lat, location.lng], {
      radius: 12 + location.projects.length * 1.8,
      fillColor: color,
      color: "#ffffff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9
    });

    marker.bindPopup(createPopupContent(location), {
      maxWidth: 440,
      closeButton: true
    });

    marker.bindTooltip(
      `<strong>${location.name}</strong><br>${location.projects.length} proyectos`,
      {
        direction: "top",
        offset: [0, -10],
        opacity: 0.95
      }
    );

    markerLayer.addLayer(marker);
  });

  if (locations.length > 0) {
    const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 6.5
    });
  }
}

function setupFilters() {
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");
      activeFilter = button.dataset.filter;

      renderMap();
      updateKpis();
    });
  });
}

updateCounts();
updateKpis();
setupFilters();
renderMap();
