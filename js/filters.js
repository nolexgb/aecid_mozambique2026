import { uniqueSorted } from "./utils.js";

export function populateFilters({ els, projects }) {
  const sectors = uniqueSorted(projects.map(project => project.sector));
  const estados = uniqueSorted(projects.map(project => project.estado));

  sectors.forEach(value => els.sector.appendChild(new Option(value, value)));
  estados.forEach(value => els.estado.appendChild(new Option(value, value)));
}

export function attachFilterEvents({ els, state, applyFilters }) {
  els.sector.addEventListener("change", event => {
    state.filters.sector = event.target.value;
    applyFilters();
  });

  els.estado.addEventListener("change", event => {
    state.filters.estado = event.target.value;
    applyFilters();
  });
}
