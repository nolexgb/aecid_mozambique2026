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

  function isVisible(row) {
    const visible = String(row.visible_mapa || "").trim().toLowerCase();

    return visible === "sí" || visible === "si";
  }

  function groupRowsByLocation(rows) {
    const grouped = {};

    rows.forEach(row => {
      if (!isVisible(row)) return;

      const name = row.ambito || row.provincia || row.localidad || "Sin localización";
      const lat = toNumber(row.latitud);
      const lng = toNumber(row.longitud);

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
        id: row.id || "",
        title: row.proyecto || "Proyecto sin título",
        year: row.ano || "",
        partners: row.socios || "",
        sector: row.sector || "",
        subsector: row.subsector || "",
        amount: row.importe_eur || "",
        modality: row.modalidad || "",
        estado: row.estado || "",
        ods: row.ods || "",
        beneficiarios: row.beneficiarios || "",
        provincia: row.provincia || "",
        distrito: row.distrito || "",
        localidad: row.localidad || ""
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
    return data.flatMap(location =>
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

    return projects.filter(project =>
      project.normalizedModality === activeFilter
    );
  }

  function getFilteredLocations() {
    return data
      .map(location => {
        const projects = location.projects
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

  function getProvinceText(projects) {
    const provinces = new Set();
    let hasNational = false;

    projects.forEach(project => {
      const province = String(project.provincia || "").trim();

      if (!province) return;

      if (province.toLowerCase() === "nacional") {
        hasNational = true;
        return;
      }

      if (province.toLowerCase().includes("norte") || province.toLowerCase().includes("sur")) {
        return;
      }

      province.split("/").forEach(part => {
        const clean = part.trim();
        if (clean) provinces.add(clean);
      });
    });

    const count = provinces.size;

    if (hasNational && count > 0) {
      return `${count} provincias + ámbito nacional`;
    }

    if (count > 0) {
      return `${count} provincias`;
    }

    return "—";
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
      kpis[1].textContent = getProvinceText(projects);
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
            ${project.title}
          </summary>

          <div class="project-body">
            <p><strong>Año:</strong> ${project.year || "—"}</p>
            <p><strong>Socio / entidad:</strong> ${project.partners || "—"}</p>
            <p><strong>Sector:</strong> ${project.sector || "—"}</p>
            <p><strong>Subsector:</strong> ${project.subsector || "—"}</p>
            <p><strong>Importe:</strong> ${project.amount || "—"}</p>
            <p><strong>Estado:</strong> ${project.estado || "—"}</p>
            <p><strong>ODS:</strong> ${project.ods || "—"}</p>

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
