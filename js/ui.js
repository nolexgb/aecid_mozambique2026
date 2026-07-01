/* ==========================================================
   UI.JS
   KPIs, estado visual, tarjetas y componentes generales
   Mapa interactivo de proyectos
   Cooperación Española en Mozambique
   ========================================================== */

import {
  animateNumber,
  formatMillions,
  getTerritoryText,
  getYears,
  qs,
  setText,
  sumBy,
  yearRange
} from "./utils.js";

/* =========================
   KPIs PRINCIPALES
========================= */

export function updateKPIs(projects = []) {
  const totalProjects = projects.length;
  const totalAmount = sumBy(projects, "amount");
  const years = getYears(projects);
  const territoryText = getTerritoryText(projects);

  const kpiProjects = qs("#kpiProjects");
  const kpiAmount = qs("#kpiAmount");
  const kpiTerritory = qs("#kpiTerritory");
  const kpiYears = qs("#kpiYears");

  if (kpiProjects) {
    animateNumber(kpiProjects, totalProjects, {
      duration: 650,
      formatter: value => Math.round(value)
    });
  }

  if (kpiAmount) {
    kpiAmount.textContent = formatMillions(totalAmount);
  }

  if (kpiTerritory) {
    kpiTerritory.textContent = territoryText;
  }

  if (kpiYears) {
    kpiYears.textContent = yearRange(years);
  }
}

/* =========================
   TARJETA DE RESULTADO ACTIVO
========================= */

export function showActiveResult(title = "", description = "") {
  const card = qs("#activeResultCard");
  const titleElement = qs("#activeResultTitle");
  const descriptionElement = qs("#activeResultDescription");

  if (!card) return;

  if (!title && !description) {
    clearActiveResult();
    return;
  }

  if (titleElement) titleElement.textContent = title;
  if (descriptionElement) descriptionElement.textContent = description;

  card.classList.add("active");
}

export function clearActiveResult() {
  const card = qs("#activeResultCard");

  if (card) {
    card.classList.remove("active");
  }

  setText("#activeResultTitle", "");
  setText("#activeResultDescription", "");
}

/* =========================
   LOADING
========================= */

export function setLoading(isLoading = false, message = "Cargando datos...") {
  const overlay = qs("#loadingOverlay");
  const text = qs("#loadingOverlay p");

  if (text) {
    text.textContent = message;
  }

  if (overlay) {
    overlay.classList.toggle("hidden", !isLoading);
  }
}

/* =========================
   EMPTY STATE
========================= */

export function showEmptyState(message = "No hay proyectos para los filtros seleccionados.") {
  let empty = qs("#mapEmptyState");

  if (!empty) {
    empty = document.createElement("div");
    empty.id = "mapEmptyState";
    empty.className = "map-empty-state";
    empty.innerHTML = `
      <strong>Sin resultados</strong>
      <p></p>
    `;

    qs(".map-wrap")?.appendChild(empty);
  }

  const paragraph = empty.querySelector("p");
  if (paragraph) paragraph.textContent = message;

  empty.classList.add("active");
}

export function hideEmptyState() {
  qs("#mapEmptyState")?.classList.remove("active");
}

/* =========================
   CONTADORES DE FILTRO
========================= */

export function updateFilterSummary(projects = []) {
  const total = projects.length;
  const amount = sumBy(projects, "amount");

  if (total === 0) {
    showActiveResult(
      "Sin resultados",
      "No hay proyectos que coincidan con la búsqueda o filtros aplicados."
    );
    return;
  }

  showActiveResult(
    `${total} ${total === 1 ? "proyecto encontrado" : "proyectos encontrados"}`,
    `${formatMillions(amount)} de financiación AECID en la selección actual.`
  );
}

/* =========================
   ESTADO GLOBAL DE INTERFAZ
========================= */

export function setAppReady() {
  document.body.classList.add("app-ready");
}

export function setAppError(message = "No se pudieron cargar los datos.") {
  setLoading(false);

  showActiveResult("Error de carga", message);

  showEmptyState(message);

  document.body.classList.add("app-error");
}

/* =========================
   ACTUALIZACIÓN GENERAL
========================= */

export function refreshUI(projects = []) {
  updateKPIs(projects);

  if (projects.length === 0) {
    showEmptyState();
  } else {
    hideEmptyState();
  }
}

/* =========================
   INICIALIZACIÓN
========================= */

export function initUI(projects = []) {
  setAppReady();
  updateKPIs(projects);
  hideEmptyState();
}

export default {
  updateKPIs,
  showActiveResult,
  clearActiveResult,
  setLoading,
  showEmptyState,
  hideEmptyState,
  updateFilterSummary,
  setAppReady,
  setAppError,
  refreshUI,
  initUI
};
