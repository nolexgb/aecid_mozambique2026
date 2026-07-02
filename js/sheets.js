/* ==========================================================
   SHEETS.JS
   Carga de datos desde Google Sheets CSV
   + cache local
   + fallback local
   ========================================================== */

import CONFIG from "../data/config.js";
import FALLBACK from "../data/fallback.js";

import {
  getText,
  logError
} from "./utils.js";

const CACHE_KEY = "aecid_mozambique_projects_csv";
const CACHE_DATE_KEY = "aecid_mozambique_projects_csv_date";

/* =========================
   URL DE DATOS
========================= */

function getDataUrl(config = CONFIG) {
  return (
    config?.DATA?.googleSheet ||
    config?.DATA?.url ||
    config?.dataUrl ||
    ""
  );
}

/* =========================
   CACHE
========================= */

export function saveCache(csvText = "") {
  if (!csvText) return;

  try {
    localStorage.setItem(CACHE_KEY, csvText);
    localStorage.setItem(CACHE_DATE_KEY, new Date().toISOString());
  } catch (error) {
    logError("No se pudo guardar la cache local.", error);
  }
}

export function getCache() {
  try {
    const csvText = localStorage.getItem(CACHE_KEY);
    const date = localStorage.getItem(CACHE_DATE_KEY);

    if (!csvText) return null;

    return {
      source: "cache",
      csvText,
      date
    };
  } catch (error) {
    logError("No se pudo leer la cache local.", error);
    return null;
  }
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_DATE_KEY);
  } catch (error) {
    logError("No se pudo limpiar la cache local.", error);
  }
}

/* =========================
   GOOGLE SHEETS
========================= */

export async function fetchGoogleSheet(config = CONFIG) {
  const url = getDataUrl(config);

  if (!url) {
    throw new Error("No se ha definido la URL de Google Sheets.");
  }

  const csvText = await getText(url);

  if (!csvText || csvText.trim().length < 10) {
    throw new Error("Google Sheets devolvió una respuesta vacía.");
  }

  saveCache(csvText);

  return {
    source: "google",
    csvText,
    date: new Date().toISOString()
  };
}

/* =========================
   FALLBACK CSV
========================= */

function escapeCSV(value = "") {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function fallbackToCSV(fallback = FALLBACK) {
  const headers = [
    "Ambito",
    "Provincia",
    "Distrito",
    "Localidad",
    "Latitud",
    "Longitud",
    "Proyecto",
    "Año",
    "Socios",
    "Sector",
    "Subsector",
    "Importe_EUR",
    "Modalidad",
    "Estado",
    "ODS",
    "Beneficiarios",
    "Visible_mapa"
  ];

  const rows = [];

  fallback.forEach(location => {
    const projects = location.projects || [];

    projects.forEach(project => {
      rows.push([
        location.name || project.province || "",
        project.province || location.name || "",
        project.district || "",
        project.locality || "",
        location.lat || project.lat || "",
        location.lng || project.lng || "",
        project.title || "",
        project.year || "",
        project.partners || "",
        project.sector || "",
        project.subsector || "",
        project.amount || "",
        project.modality || "",
        project.status || "",
        Array.isArray(project.ods) ? project.ods.join(",") : project.ods || "",
        project.beneficiaries || "",
        "Sí"
      ]);
    });
  });

  return [
    headers.join(","),
    ...rows.map(row => row.map(escapeCSV).join(","))
  ].join("\n");
}

export function getFallbackCSV() {
  return {
    source: "fallback",
    csvText: fallbackToCSV(),
    date: new Date().toISOString()
  };
}

/* =========================
   CARGA PRINCIPAL
========================= */

export async function loadProjects(config = CONFIG) {
  try {
    return await fetchGoogleSheet(config);
  } catch (error) {
    logError("No se pudo cargar Google Sheets. Intentando cache local.", error);

    const cached = getCache();

    if (cached?.csvText) {
      return cached;
    }

    logError("No hay cache disponible. Usando fallback local.", error);

    return getFallbackCSV();
  }
}

/* =========================
   AUTO REFRESH
========================= */

export function setupAutoRefresh(callback, config = CONFIG) {
  const enabled = Boolean(config?.DATA?.refresh);
  const interval = Number(config?.DATA?.refreshInterval || 300000);

  if (!enabled || typeof callback !== "function") return null;

  return setInterval(async () => {
    try {
      const result = await fetchGoogleSheet(config);
      callback(result);
    } catch (error) {
      logError("Auto-refresh falló.", error);
    }
  }, interval);
}

/* =========================
   ÚLTIMA ACTUALIZACIÓN
========================= */

export function formatSourceLabel(source = "") {
  switch (source) {
    case "google":
      return "Google Sheets";
    case "cache":
      return "caché local";
    case "fallback":
      return "datos locales";
    default:
      return "fuente de datos";
  }
}

export function updateLastUpdated(result = {}) {
  const pill = document.querySelector(".update-pill");

  if (!pill) return;

  const date = result.date ? new Date(result.date) : new Date();

  const formatted = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);

  const source = formatSourceLabel(result.source);

  pill.innerHTML = `
    <span></span>
    Actualizado: ${formatted} · ${source}
  `;
}

export default {
  loadProjects,
  fetchGoogleSheet,
  getCache,
  saveCache,
  clearCache,
  fallbackToCSV,
  getFallbackCSV,
  setupAutoRefresh,
  updateLastUpdated
};
