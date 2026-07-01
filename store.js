/* ==========================================================
   STORE.JS
   Estado central de la aplicación
   Mapa interactivo de proyectos
   Cooperación Española en Mozambique
   ========================================================== */

import { normalizeText } from "./utils.js";

const state = {
  rows: [],
  projects: [],
  locations: [],
  metadata: {},

  filters: {
    search: "",
    modality: "all",
    sector: "all",
    ods: "all",
    status: "all"
  },

  selectedLocation: null,
  selectedProject: null,

  listeners: new Set()
};

/* =========================
   SUSCRIPCIÓN
========================= */

export function subscribe(callback) {
  if (typeof callback !== "function") return () => {};

  state.listeners.add(callback);

  return () => {
    state.listeners.delete(callback);
  };
}

function notify() {
  const snapshot = getState();

  state.listeners.forEach(callback => {
    callback(snapshot);
  });
}

/* =========================
   ESTADO BASE
========================= */

export function getState() {
  return {
    rows: state.rows,
    projects: state.projects,
    locations: state.locations,
    metadata: state.metadata,
    filters: { ...state.filters },
    selectedLocation: state.selectedLocation,
    selectedProject: state.selectedProject,
    filteredProjects: getFilteredProjects(),
    filteredLocations: getFilteredLocations()
  };
}

export function setData(data = {}) {
  state.rows = data.rows || [];
  state.projects = data.projects || [];
  state.locations = data.locations || [];
  state.metadata = data.metadata || {};

  notify();
}

export function resetData() {
  state.rows = [];
  state.projects = [];
  state.locations = [];
  state.metadata = {};
  state.selectedLocation = null;
  state.selectedProject = null;

  notify();
}

/* =========================
   FILTROS
========================= */

export function setFilter(name, value) {
  if (!(name in state.filters)) return;

  state.filters[name] = value || "all";

  notify();
}

export function setFilters(filters = {}) {
  Object.entries(filters).forEach(([name, value]) => {
    if (name in state.filters) {
      state.filters[name] = value || "all";
    }
  });

  notify();
}

export function getFilters() {
  return { ...state.filters };
}

export function resetFilters() {
  state.filters = {
    search: "",
    modality: "all",
    sector: "all",
    ods: "all",
    status: "all"
  };

  notify();
}

export function hasActiveFilters() {
  return Object.entries(state.filters).some(([key, value]) => {
    if (key === "search") return Boolean(value);
    return value !== "all";
  });
}

/* =========================
   SELECCIÓN
========================= */

export function setSelectedLocation(location) {
  state.selectedLocation = location || null;
  notify();
}

export function setSelectedProject(project) {
  state.selectedProject = project || null;
  notify();
}

export function clearSelection() {
  state.selectedLocation = null;
  state.selectedProject = null;
  notify();
}

/* =========================
   CONSULTAS
========================= */

export function getAllProjects() {
  return [...state.projects];
}

export function getAllLocations() {
  return [...state.locations];
}

export function getProjectById(id) {
  return state.projects.find(project => String(project.id) === String(id)) || null;
}

export function getLocationByName(name) {
  const target = normalizeText(name);

  return (
    state.locations.find(location => normalizeText(location.name) === target) ||
    null
  );
}

/* =========================
   FILTRADO
========================= */

export function getFilteredProjects() {
  const filters = state.filters;

  return state.projects.filter(project => {
    if (filters.search) {
      const query = normalizeText(filters.search);

      const searchText =
        project.searchText ||
        normalizeText([
          project.partners,
          project.title,
          project.province,
          project.district,
          project.locality,
          project.sector,
          project.subsector,
          project.modality,
          project.status,
          Array.isArray(project.ods) ? project.ods.join(" ") : project.ods
        ].join(" "));

      if (!searchText.includes(query)) return false;
    }

    if (
      filters.modality !== "all" &&
      normalizeText(project.modality) !== normalizeText(filters.modality)
    ) {
      return false;
    }

    if (
      filters.sector !== "all" &&
      normalizeText(project.sector) !== normalizeText(filters.sector)
    ) {
      return false;
    }

    if (filters.ods !== "all") {
      const odsValue = Number(filters.ods);
      const projectODS = Array.isArray(project.ods) ? project.ods : [];

      if (!projectODS.includes(odsValue)) return false;
    }

    if (
      filters.status !== "all" &&
      normalizeText(project.status) !== normalizeText(filters.status)
    ) {
      return false;
    }

    return true;
  });
}

export function getFilteredLocations() {
  const filteredProjects = getFilteredProjects();
  const grouped = new Map();

  filteredProjects.forEach(project => {
    const key = project.province || "Sin localización";

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: key,
        lat: project.lat,
        lng: project.lng,
        projects: []
      });
    }

    grouped.get(key).projects.push(project);
  });

  return Array.from(grouped.values());
}

/* =========================
   OPCIONES PARA FILTROS
========================= */

export function getFilterOptions() {
  const projects = state.projects;

  const modalities = [...new Set(projects.map(p => p.modality).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));

  const sectors = [...new Set(projects.map(p => p.sector).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));

  const statuses = [...new Set(projects.map(p => p.status).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));

  const ods = [
    ...new Set(
      projects.flatMap(project => {
        return Array.isArray(project.ods) ? project.ods : [];
      })
    )
  ].sort((a, b) => a - b);

  return {
    modalities,
    sectors,
    statuses,
    ods
  };
}

/* =========================
   AUTOCOMPLETADO
========================= */

export function getSearchSuggestions(query = "", limit = 8) {
  const q = normalizeText(query);

  if (!q || q.length < 2) return [];

  const partnersMap = new Map();

  state.projects.forEach(project => {
    const partner = project.partners || "";

    if (!partner) return;

    const normalizedPartner = normalizeText(partner);

    if (!normalizedPartner.includes(q)) return;

    if (!partnersMap.has(partner)) {
      partnersMap.set(partner, {
        type: "partner",
        label: partner,
        projects: [],
        amount: 0,
        provinces: new Set()
      });
    }

    const item = partnersMap.get(partner);

    item.projects.push(project);
    item.amount += Number(project.amount) || 0;

    if (project.province) {
      item.provinces.add(project.province);
    }
  });

  return Array.from(partnersMap.values())
    .map(item => ({
      ...item,
      count: item.projects.length,
      provinces: Array.from(item.provinces)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/* =========================
   MÉTRICAS
========================= */

export function getMetrics(projects = getFilteredProjects()) {
  const totalProjects = projects.length;

  const totalAmount = projects.reduce((sum, project) => {
    return sum + (Number(project.amount) || 0);
  }, 0);

  const years = [
    ...new Set(
      projects
        .map(project => Number(project.year))
        .filter(Boolean)
    )
  ].sort((a, b) => a - b);

  const provinces = [
    ...new Set(
      projects
        .map(project => project.province)
        .filter(Boolean)
    )
  ];

  const hasNational = provinces.some(province =>
    normalizeText(province).includes("nacional")
  );

  const provinceCount = provinces.filter(
    province => !normalizeText(province).includes("nacional")
  ).length;

  return {
    totalProjects,
    totalAmount,
    years,
    provinces,
    provinceCount,
    hasNational
  };
}

/* =========================
   EXPORT DEFAULT
========================= */

export default {
  subscribe,
  getState,
  setData,
  resetData,
  setFilter,
  setFilters,
  getFilters,
  resetFilters,
  hasActiveFilters,
  setSelectedLocation,
  setSelectedProject,
  clearSelection,
  getAllProjects,
  getAllLocations,
  getProjectById,
  getLocationByName,
  getFilteredProjects,
  getFilteredLocations,
  getFilterOptions,
  getSearchSuggestions,
  getMetrics
};
