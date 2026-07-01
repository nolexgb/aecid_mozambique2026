import { COLORS, countBy, escapeHtml, formatAmount, uniqueSorted } from "./utils.js";
import { createMiniBars } from "./charts.js";

export function createTooltip(location) {
  return `
    <div class="tooltip-card">
      <strong>${escapeHtml(location.name)}</strong>
      <span>${location.projects.length} ${location.projects.length === 1 ? "proyecto" : "proyectos"}</span>
      <span>${formatAmount(location.totalAmount)}</span>
      <span>${escapeHtml(location.dominantSector === "Default" ? "Sin sector predominante" : location.dominantSector)}</span>
    </div>
  `;
}

export function createPopup(location) {
  const sectorCounts = countBy(location.projects.map(project => project.sector).filter(Boolean));
  const modalityCounts = countBy(location.projects.map(project => project.normalizedModality).filter(Boolean));
  const odsCounts = countBy(location.projects.map(project => project.ods).filter(Boolean));
  const partnerCount = uniqueSorted(location.projects.map(project => project.partners)).length;
  const sectorCount = Object.keys(sectorCounts).length;

  return `
    <article class="premium-popup glass-popup">
      <header class="popup-hero">
        <div class="aecid-ribbon" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="kicker">AECID Mozambique</p>
        <h2>${escapeHtml(location.name)}</h2>
        <div class="popup-metrics">
          <div class="metric-box"><strong>${location.projects.length}</strong><small>Proyectos</small></div>
          <div class="metric-box"><strong>${formatAmount(location.totalAmount)}</strong><small>Financiación</small></div>
          <div class="metric-box"><strong>${sectorCount}</strong><small>Sectores</small></div>
          <div class="metric-box"><strong>${partnerCount}</strong><small>Socios</small></div>
        </div>
      </header>

      <div class="popup-body">
        ${createMiniBars("Sectores", sectorCounts)}
        ${createMiniBars("Modalidades", modalityCounts, true)}
        ${createMiniBars("ODS", odsCounts)}
        <h3 class="projects-title">Proyectos</h3>
        ${location.projects.map((project, index) => createProjectCard(project, index)).join("")}
      </div>
    </article>
  `;
}

export function createProjectCard(project, index) {
  const color = COLORS[project.normalizedModality] || COLORS.Default;
  const locationLine = [project.provincia, project.distrito, project.localidad].filter(Boolean).join(" · ");

  return `
    <details class="project-card" ${index === 0 ? "open" : ""}>
      <summary>
        <span class="project-index">${index + 1}</span>
        ${escapeHtml(project.title)}
      </summary>
      <div class="project-detail">
        <p><strong>Año:</strong> ${escapeHtml(project.year || "—")}</p>
        <p><strong>Socio / entidad:</strong> ${escapeHtml(project.partners || "—")}</p>
        <p><strong>Localización:</strong> ${escapeHtml(locationLine || "—")}</p>
        <p><strong>Sector:</strong> ${escapeHtml(project.sector || "—")}</p>
        <p><strong>Subsector:</strong> ${escapeHtml(project.subsector || "—")}</p>
        <p><strong>Importe:</strong> ${escapeHtml(project.amount || "—")}</p>
        <div class="badges">
          <span class="badge" style="background:${color}; color:${project.normalizedModality === "Convenio" ? "#111827" : "white"}">${escapeHtml(project.modality || "Sin modalidad")}</span>
          <span class="badge badge-light">${escapeHtml(project.estado || "Sin estado")}</span>
          <span class="badge badge-ods">${escapeHtml(project.ods || "ODS")}</span>
        </div>
      </div>
    </details>
  `;
}
