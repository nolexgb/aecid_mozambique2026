/* ==========================================================
   UTILS.JS
   Funciones auxiliares globales
   Mapa interactivo de proyectos
   Cooperación Española en Mozambique
   ========================================================== */

/* =========================
   TEXTO
========================= */

export function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value = "") {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function capitalize(value = "") {
  const text = String(value).trim().toLowerCase();

  if (!text) return "";

  return text.replace(/\b\p{L}/gu, letter => letter.toUpperCase());
}

export function truncate(value = "", length = 90) {
  const text = String(value).trim();

  if (text.length <= length) return text;

  return `${text.slice(0, length).trim()}…`;
}

/* =========================
   NÚMEROS
========================= */

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(
    String(value)
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
      .trim()
  );

  return Number.isFinite(number) ? number : null;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sum(values = []) {
  return values.reduce((acc, value) => acc + (Number(value) || 0), 0);
}

export function average(values = []) {
  const clean = values.map(Number).filter(Number.isFinite);

  if (!clean.length) return 0;

  return sum(clean) / clean.length;
}

/* =========================
   DINERO
========================= */

export function parseAmount(value) {
  if (!value) return 0;

  let text = String(value)
    .replace(/€/g, "")
    .replace(/\s/g, "")
    .trim();

  if (text.includes(",") && text.includes(".")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(",")) {
    text = text.replace(",", ".");
  }

  const amount = Number(text);

  return Number.isFinite(amount) ? amount : 0;
}

export function formatCurrency(value = 0) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

export function formatMillions(value = 0) {
  const amount = Number(value) || 0;

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace(".", ",")} M€`;
  }

  return formatCurrency(amount);
}

export function formatCompact(value = 0) {
  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value) || 0);
}

/* =========================
   FECHAS
========================= */

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function yearRange(years = []) {
  const clean = years.map(Number).filter(Boolean).sort((a, b) => a - b);

  if (!clean.length) return "—";

  const min = clean[0];
  const max = clean[clean.length - 1];

  return min === max ? String(min) : `${min}–${max}`;
}

/* =========================
   ARRAYS
========================= */

export function unique(array = []) {
  return [...new Set(array.filter(value => value !== null && value !== undefined && value !== ""))];
}

export function sortAlphabetically(array = []) {
  return [...array].sort((a, b) => String(a).localeCompare(String(b), "es"));
}

export function groupBy(array = [], key) {
  return array.reduce((groups, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    const groupKey = value || "Sin clasificar";

    if (!groups[groupKey]) groups[groupKey] = [];

    groups[groupKey].push(item);

    return groups;
  }, {});
}

export function countBy(array = [], key) {
  return Object.entries(groupBy(array, key))
    .map(([name, items]) => ({
      name,
      count: items.length
    }))
    .sort((a, b) => b.count - a.count);
}

export function sumBy(array = [], key) {
  return array.reduce((total, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    return total + (Number(value) || 0);
  }, 0);
}

export function topItems(array = [], limit = 5) {
  return [...array].slice(0, limit);
}

/* =========================
   OBJETOS
========================= */

export function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function getValue(object, keys = [], fallback = "") {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null && object?.[key] !== "") {
      return object[key];
    }
  }

  return fallback;
}

/* =========================
   COORDENADAS
========================= */

export function validCoordinates(lat, lng) {
  return (
    lat !== null &&
    lng !== null &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng))
  );
}

export function toLatLng(lat, lng) {
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);

  if (!validCoordinates(latitude, longitude)) return null;

  return [latitude, longitude];
}

/* =========================
   MODALIDADES
========================= */

export function normalizeModality(value = "") {
  const text = normalizeText(value);

  if (text.includes("bilateral")) return "Bilateral";
  if (text.includes("ongd")) return "Convocatoria ONGD";
  if (text.includes("convenio")) return "Convenio";
  if (text.includes("innovacion")) return "Innovación";

  return value || "Otros";
}

export function modalityColor(modality = "") {
  switch (normalizeModality(modality)) {
    case "Bilateral":
      return "#003B79";
    case "Convocatoria ONGD":
      return "#F97316";
    case "Convenio":
      return "#16A34A";
    case "Innovación":
      return "#8E24AA";
    default:
      return "#6B7280";
  }
}

export function modalityClass(modality = "") {
  switch (normalizeModality(modality)) {
    case "Bilateral":
      return "bilateral";
    case "Convocatoria ONGD":
      return "ong";
    case "Convenio":
      return "convenio";
    case "Innovación":
      return "innovacion";
    default:
      return "default";
  }
}

/* =========================
   ESTADOS
========================= */

export function normalizeStatus(value = "") {
  const text = normalizeText(value);

  if (text.includes("ejecucion") || text.includes("activo")) return "En ejecución";
  if (text.includes("finalizado") || text.includes("cerrado")) return "Finalizado";
  if (text.includes("formulacion")) return "En formulación";
  if (text.includes("suspendido")) return "Suspendido";

  return value || "Sin estado";
}

export function statusColor(status = "") {
  switch (normalizeStatus(status)) {
    case "En ejecución":
      return "#16A34A";
    case "Finalizado":
      return "#6B7280";
    case "En formulación":
      return "#F59E0B";
    case "Suspendido":
      return "#DC2626";
    default:
      return "#9CA3AF";
  }
}

/* =========================
   ODS
========================= */

export function parseODS(value) {
  if (!value) return [];

  return String(value)
    .split(/[,;/|]+/)
    .map(item => item.trim())
    .map(item => {
      const match = item.match(/\d+/);
      return match ? Number(match[0]) : null;
    })
    .filter(number => number >= 1 && number <= 17);
}

export function odsLabel(number) {
  const labels = {
    1: "Fin de la pobreza",
    2: "Hambre cero",
    3: "Salud y bienestar",
    4: "Educación de calidad",
    5: "Igualdad de género",
    6: "Agua limpia y saneamiento",
    7: "Energía asequible y no contaminante",
    8: "Trabajo decente y crecimiento económico",
    9: "Industria, innovación e infraestructura",
    10: "Reducción de las desigualdades",
    11: "Ciudades y comunidades sostenibles",
    12: "Producción y consumo responsables",
    13: "Acción por el clima",
    14: "Vida submarina",
    15: "Vida de ecosistemas terrestres",
    16: "Paz, justicia e instituciones sólidas",
    17: "Alianzas para lograr los objetivos"
  };

  return labels[number] || `ODS ${number}`;
}

export function odsImage(number) {
  return `assets/ods/ods${number}.svg`;
}

/* =========================
   MARCADORES
========================= */

export function markerSize(amount = 0, projectsCount = 1) {
  const base = 36;
  const amountBonus = Math.min(Math.sqrt(Number(amount) || 0) / 35, 22);
  const countBonus = Math.min(projectsCount * 2, 14);

  return Math.round(base + amountBonus + countBonus);
}

export function markerHTML({ count = 1, modality = "Otros", amount = 0 } = {}) {
  const size = markerSize(amount, count);
  const markerClass = modalityClass(modality);

  return `
    <div class="project-marker marker-${markerClass}" style="--size:${size}px">
      ${count}
    </div>
  `;
}

/* =========================
   CSV
========================= */

export function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
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

  return rows.filter(r => r.some(cell => String(cell).trim() !== ""));
}

export function normalizeHeader(header = "") {
  return normalizeText(header)
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}

/* =========================
   DOM
========================= */

export function qs(selector, context = document) {
  return context.querySelector(selector);
}

export function qsa(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

export function setText(selectorOrElement, value) {
  const element =
    typeof selectorOrElement === "string"
      ? qs(selectorOrElement)
      : selectorOrElement;

  if (element) element.textContent = value;
}

export function setHTML(selectorOrElement, value) {
  const element =
    typeof selectorOrElement === "string"
      ? qs(selectorOrElement)
      : selectorOrElement;

  if (element) element.innerHTML = value;
}

export function show(element) {
  if (element) element.classList.remove("hidden");
}

export function hide(element) {
  if (element) element.classList.add("hidden");
}

export function toggleActive(element, active = true) {
  if (element) element.classList.toggle("active", active);
}

/* =========================
   LOADING
========================= */

export function showLoading() {
  qs("#loadingOverlay")?.classList.remove("hidden");
}

export function hideLoading() {
  qs("#loadingOverlay")?.classList.add("hidden");
}

/* =========================
   FETCH
========================= */

export async function getText(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options
  });

  if (!response.ok) {
    throw new Error(`Error cargando ${url}: ${response.status}`);
  }

  return response.text();
}

export async function getJSON(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options
  });

  if (!response.ok) {
    throw new Error(`Error cargando ${url}: ${response.status}`);
  }

  return response.json();
}

/* =========================
   ANIMACIONES
========================= */

export function animateNumber(element, value, options = {}) {
  if (!element) return;

  const duration = options.duration || 800;
  const formatter = options.formatter || (number => Math.round(number));
  const start = performance.now();
  const endValue = Number(value) || 0;

  function step(now) {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    element.textContent = formatter(endValue * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export function debounce(fn, delay = 250) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 250) {
  let waiting = false;

  return (...args) => {
    if (waiting) return;

    fn(...args);
    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, limit);
  };
}

/* =========================
   BÚSQUEDA
========================= */

export function buildSearchText(project = {}) {
  return normalizeText([
    project.partners,
    project.partner,
    project.entity,
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
}

export function fuzzyIncludes(source = "", query = "") {
  return normalizeText(source).includes(normalizeText(query));
}

/* =========================
   KPIs
========================= */

export function getYears(projects = []) {
  return unique(
    projects
      .map(project => Number(project.year))
      .filter(Boolean)
  ).sort((a, b) => a - b);
}

export function getTerritoryText(projects = []) {
  const provinces = unique(
    projects
      .map(project => project.province)
      .filter(Boolean)
      .filter(province => !normalizeText(province).includes("nacional"))
  );

  const hasNational = projects.some(project =>
    normalizeText(project.province).includes("nacional")
  );

  if (hasNational && provinces.length) {
    return `${provinces.length} provincias + nacional`;
  }

  if (provinces.length) {
    return `${provinces.length} provincias`;
  }

  return "—";
}

/* =========================
   POPUPS / CHARTS
========================= */

export function prepareBarData(items = [], key = "count", limit = 6) {
  const max = Math.max(...items.map(item => Number(item[key]) || 0), 1);

  return topItems(items, limit).map(item => ({
    ...item,
    percentage: `${Math.round(((Number(item[key]) || 0) / max) * 100)}%`
  }));
}

export function makeBadge(label, className = "") {
  return `<span class="badge ${className}">${escapeHTML(label)}</span>`;
}

export function makeODSBadges(ods = []) {
  return ods
    .map(number => makeBadge(`ODS ${number}`, "ods"))
    .join("");
}

/* =========================
   RESPONSIVE
========================= */

export function isMobile(breakpoint = 760) {
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
}

/* =========================
   ERRORES
========================= */

export function logError(message, error) {
  console.error(`[AECID MAP] ${message}`, error);
}

/* =========================
   EXPORT DEFAULT
========================= */

export default {
  normalizeText,
  slugify,
  escapeHTML,
  capitalize,
  truncate,
  toNumber,
  clamp,
  sum,
  average,
  parseAmount,
  formatCurrency,
  formatMillions,
  formatCompact,
  formatDate,
  yearRange,
  unique,
  sortAlphabetically,
  groupBy,
  countBy,
  sumBy,
  topItems,
  isObject,
  getValue,
  validCoordinates,
  toLatLng,
  normalizeModality,
  modalityColor,
  modalityClass,
  normalizeStatus,
  statusColor,
  parseODS,
  odsLabel,
  odsImage,
  markerSize,
  markerHTML,
  parseCSV,
  normalizeHeader,
  qs,
  qsa,
  setText,
  setHTML,
  show,
  hide,
  toggleActive,
  showLoading,
  hideLoading,
  getText,
  getJSON,
  animateNumber,
  debounce,
  throttle,
  buildSearchText,
  fuzzyIncludes,
  getYears,
  getTerritoryText,
  prepareBarData,
  makeBadge,
  makeODSBadges,
  isMobile,
  logError
};
