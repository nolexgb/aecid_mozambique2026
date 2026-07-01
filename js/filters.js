import { uniqueSorted } from "./utils.js";

const MODALITY_ORDER = ["Bilateral", "Convocatoria ONGD", "Convenio", "Innovación", "Default"];

function getOdsNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 999;
}

export function populateFilters({ els, projects }) {
  const modalidades = uniqueSorted(projects.map(project => project.normalizedModality))
    .sort((a, b) => {
      const ai = MODALITY_ORDER.indexOf(a);
      const bi = MODALITY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

  const sectors = uniqueSorted(projects.map(project => project.sector));
  const odsValues = uniqueSorted(projects.map(project => project.ods))
    .sort((a, b) => getOdsNumber(a) - getOdsNumber(b));
  const estados = uniqueSorted(projects.map(project => project.estado));

  modalidades.forEach(value => els.modalidad.appendChild(new Option(value === "Default" ? "Otras modalidades" : value, value)));
  sectors.forEach(value => els.sector.appendChild(new Option(value, value)));
  odsValues.forEach(value => els.ods.appendChild(new Option(value, value)));
  estados.forEach(value => els.estado.appendChild(new Option(value, value)));
}

export function attachFilterEvents({ els, state, applyFilters }) {
  els.modalidad.addEventListener("change", event => {
    state.filters.modalidad = event.target.value;
    applyFilters();
  });

  els.sector.addEventListener("change", event => {
    state.filters.sector = event.target.value;
    applyFilters();
  });

  els.ods.addEventListener("change", event => {
    state.filters.ods = event.target.value;
    applyFilters();
  });

  els.estado.addEventListener("change", event => {
    state.filters.estado = event.target.value;
    applyFilters();
  });
}
