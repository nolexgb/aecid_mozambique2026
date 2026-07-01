/* ==========================================================
   POPUP.JS
========================================================== */

import {
  countBy,
  escapeHTML,
  formatMillions,
  makeODSBadges,
  modalityClass,
  prepareBarData,
  sumBy,
  unique,
  yearRange
} from "./utils.js";

function renderStats(location) {
  const projects = location.projects || [];
  const amount = sumBy(projects, "amount");
  const sectors = unique(projects.map(p => p.sector).filter(Boolean));
  const partners = unique(projects.map(p => p.partners).filter(Boolean));

  return `
    <div class="popup-stats">
      <div class="popup-stat">
        <strong>${projects.length}</strong>
        <span>Proyectos</span>
      </div>

      <div class="popup-stat">
        <strong>${formatMillions(amount)}</strong>
        <span>Financiación</span>
      </div>

      <div class="popup-stat">
        <strong>${sectors.length}</strong>
        <span>Sectores</span>
      </div>

      <div class="popup-stat">
        <strong>${partners.length}</strong>
        <span>Socios</span>
      </div>
    </div>
  `;
}

function renderBarChart(title, items) {
  if (!items.length) return "";

  const rows = prepareBarData(items, "count", 6)
    .map(item => `
      <div class="bar-row">
        <span class="bar-label">${escapeHTML(item.name)}</span>
        <span class="bar-track">
          <span class="bar-fill" style="--value:${item.percentage}"></span>
        </span>
        <strong>${item.count}</strong>
      </div>
    `)
    .join("");

  return `
    <div class="chart-block">
      <h3>${title}</h3>
      ${rows}
    </div>
  `;
}

function renderCharts(projects) {
  const modalities = countBy(projects, "modality");
  const sectors = countBy(projects, "sector");

  return `
    <div class="chart-grid">
      ${renderBarChart("Modalidades", modalities)}
      ${renderBarChart("Sectores", sectors)}
    </div>
  `;
}

function renderProject(project, index) {
  const ods = Array.isArray(project.ods) ? project.ods : [];
  const modality = modalityClass(project.modality);

  return `
    <details class="project-item">
      <summary>
        <span class="project-number">${index + 1}</span>
        ${escapeHTML(project.title || "Proyecto sin título")}
      </summary>

      <div class="project-detail">
        <p><strong>Año:</strong> ${escapeHTML(project.year || "—")}</p>
        <p><strong>Socio / entidad:</strong> ${escapeHTML(project.partners || "—")}</p>
        <p><strong>Distrito:</strong> ${escapeHTML(project.district || "—")}</p>
        <p><strong>Localidad:</strong> ${escapeHTML(project.locality || "—")}</p>
        <p><strong>Sector:</strong> ${escapeHTML(project.sector || "—")}</p>
        <p><strong>Importe:</strong> ${formatMillions(project.amount || 0)}</p>

        <div class="badges">
          <span class="badge ${modality}">${escapeHTML(project.modality || "Sin modalidad")}</span>
          <span class="badge estado">${escapeHTML(project.status || "Sin estado")}</span>
          ${makeODSBadges(ods)}
        </div>
      </div>
    </details>
  `;
}

export function buildPopup(location) {
  const projects = location.projects || [];
  const amount = sumBy(projects, "amount");
  const years = unique(projects.map(p => Number(p.year)).filter(Boolean));

  const projectsHTML = projects
    .map((project, index) => renderProject(project, index))
    .join("");

  return `
    <article class="popup-card">
      <header class="popup-hero">
        <p class="popup-kicker">AECID Mozambique</p>
        <h2 class="popup-title">${escapeHTML(location.name)}</h2>
        <p class="popup-subtitle">
          ${projects.length} ${projects.length === 1 ? "proyecto" : "proyectos"} ·
          ${formatMillions(amount)} ·
          ${yearRange(years)}
        </p>

        ${renderStats(location)}
      </header>

      <div class="popup-body">
        ${renderCharts(projects)}

        <section class="project-list">
          ${projectsHTML}
        </section>
      </div>
    </article>
  `;
}

export default {
  buildPopup
};
