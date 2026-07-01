import { debounce, escapeHtml, slug } from "./utils.js";

export function matchesSearch(project, location, query) {
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

export function attachSearchEvent({ els, state, applyFilters }) {
  els.search.addEventListener("input", debounce(event => {
    state.filters.query = event.target.value.trim();
    applyFilters();
  }, 200));
}

export function renderResults({ els, projects, focusLocation }) {
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
