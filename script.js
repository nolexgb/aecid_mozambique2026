document.addEventListener("DOMContentLoaded", async () => {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?output=csv";

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

  let data = [];
  let activeFilter = "all";
  const markerLayer = L.layerGroup().addTo(map);

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && insideQuotes && nextChar === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(value.trim());
        value = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
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

    const headers = rows[0].map(header =>
      String(header)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
    );

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

    const number = Number(
      String(value)
        .replace(",", ".")
        .trim()
    );

    return Number.isFinite(number) ? number : null;
  }

  function normalizeModality(modality) {
    if (!modality) return "Default";

    const text = String(modality).trim();

    if (text.includes("Bilateral")) return "Bilateral";
    if (text.includes("ONGD")) return "Convocatoria ONGD";
    if (text.includes("Convenio")) return "Convenio";
    if (text.includes("Innovación")) return "Innovación";

    return "Default";
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

  function groupRowsByLocation(rows) {
    const grouped = {};

    rows.forEach(row => {
      const name = row.name || row.localizacion || row.localización || row.provincia;
      const lat = toNumber(row.lat || row.latitude || row.latitud);
      const lng = toNumber(row.lng || row.lon || row.long || row.longitude || row.longitud);

      if (!name || lat === null || lng === null) return;

      if (!grouped[name]) {
        grouped[name] = {
          name,
          lat,
          lng,
          projects: []
        };
      }

      grouped[name].projects.push({
        title: row.title || row.titulo || row.título || "Proyecto sin título",
        year: row.year || row.año || row.ano || "",
        partners: row.partners || row.socios || row.socio || row.entidad || "",
        amount: row.amount || row.importe || row.monto || "",
        modality: row.modality || row.modalidad || row.instrumento || ""
      });
    });

    return Object.values(grouped);
  }

  async function loadData() {
    try {
      const response = await fetch(SHEET_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("No se pudo cargar la hoja de cálculo.");
      }

      const csvText = await response.text();
      const rows = csvToObjects(csvText);

      data = groupRowsByLocation(rows);
    } catch (error) {
      console.error("Error cargando datos desde Google Sheets:", error);
      data = [];
    }
  }

  function getAllProjects() {
    if (!Array.isArray(data)) return [];

    return data.flatMap(location =>
      (location.projects || []).map(project => ({
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

    return projects.filter(project =>
      project.normalizedModality === activeFilter
    );
  }

  function getFilteredLocations() {
    if (!Array.isArray(data)) return [];

    return data
      .map(location => {
        const projects = (location.projects || [])
          .map(project => ({
            ...project,
            normalizedModality: normalizeModality(project.modality)
          }))
          .filter(project =>
            activeFilter === "all" ||
            project.normalizedModality === activeFilter
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

    const years = projects
      .map(project => Number(project.year))
      .filter(Boolean);

    const totalAmount = projects.reduce((sum, project) => {
      return sum + parseAmount(project.amount);
    }, 0);

    const kpis = document.querySelectorAll(".kpi-value");

    if (kpis[0]) {
      kpis[0].textContent = totalProjects;
    }

    if (kpis[1]) {
      kpis[1].textContent = "6 + ámbito nacional";
    }

    if (kpis[2]) {
      kpis[2].textContent =
        `€ ${(totalAmount / 1000000).toFixed(1).replace(".", ",")} M`;
    }

    if (kpis[3]) {
      kpis[3].textContent = years.length
        ? `${Math.min(...years)}–${Math.max(...years)}`
        : "—";
    }
  }

  function updateCounts() {
    const projects = getAllProjects();

    const counts = {
      all: projects.length,
      Bilateral: projects.filter(project =>
        project.normalizedModality === "Bilateral"
      ).length,
      "Convocatoria ONGD": projects.filter(project =>
        project.normalizedModality === "Convocatoria ONGD"
      ).length,
      Convenio: projects.filter(project =>
        project.normalizedModality === "Convenio"
      ).length,
      Innovación: projects.filter(project =>
        project.normalizedModality === "Innovación"
      ).length
    };

    document.querySelectorAll(".filter").forEach(button => {
      const filter = button.dataset.filter;
      const badge = button.querySelector(".badge-count");

      if (badge && counts[filter] !== undefined) {
        badge.textContent = counts[filter];
      }
    });
  }

  function getDominantModality(projects) {
    const count = {};

    projects.forEach(project => {
      count[project.normalizedModality] =
        (count[project.normalizedModality] || 0) + 1;
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
            ${project.title || "Proyecto sin título"}
          </summary>

          <div class="project-body">
            <p><strong>Año:</strong> ${project.year || "—"}</p>
            <p><strong>Socio / entidad:</strong> ${project.partners || "—"}</p>
            <p><strong>Importe:</strong> ${project.amount || "—"}</p>

            <span class="modality-badge" style="background:${color}">
              ${project.modality || "Sin modalidad"}
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
          <p>
            ${location.projects.length}
            ${location.projects.length === 1 ? "proyecto activo" : "proyectos activos"}
          </p>
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
        fillOpacity: 0.92
      });

      marker.bindPopup(createPopupContent(location), {
        maxWidth: 440,
        closeButton: true
      });

      marker.bindTooltip(
        `<strong>${location.name}</strong><br>${location.projects.length} ${
          location.projects.length === 1 ? "proyecto" : "proyectos"
        }`,
        {
          direction: "top",
          offset: [0, -10],
          opacity: 0.95
        }
      );

      markerLayer.addLayer(marker);
    });

    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(location => [location.lat, location.lng])
      );

      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 6.5
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
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
        updateCounts();
      });
    });
  }

  window.addEventListener("resize", () => {
    map.invalidateSize();
  });

  await loadData();

  updateCounts();
  updateKpis();
  setupFilters();
  renderMap();

  setTimeout(() => {
    map.invalidateSize();
    renderMap();
  }, 500);
});
