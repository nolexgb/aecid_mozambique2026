/* ==========================================================
   FILTERS.JS
========================================================== */

import {
  getFilterOptions,
  setFilter,
  resetFilters,
  subscribe,
  getFilteredLocations,
  getFilteredProjects
} from "./store.js";

import { renderMap } from "./map.js";
import { refreshUI, updateFilterSummary } from "./ui.js";
import { odsLabel } from "./utils.js";

function fillSelect(selectId, values = [], labelFn = value => value) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const firstOption = select.querySelector("option");
  select.innerHTML = "";

  if (firstOption) {
    select.appendChild(firstOption);
  }

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labelFn(value);
    select.appendChild(option);
  });
}

export function populateFilters() {
  const options = getFilterOptions();

  fillSelect("modalityFilter", options.modalities);
  fillSelect("sectorFilter", options.sectors);
  fillSelect("statusFilter", options.statuses);
  fillSelect("odsFilter", options.ods, value => `ODS ${value} · ${odsLabel(value)}`);
}

export function bindFilters() {
  const modality = document.getElementById("modalityFilter");
  const sector = document.getElementById("sectorFilter");
  const ods = document.getElementById("odsFilter");
  const status = document.getElementById("statusFilter");

  modality?.addEventListener("change", event => {
    setFilter("modality", event.target.value);
  });

  sector?.addEventListener("change", event => {
    setFilter("sector", event.target.value);
  });

  ods?.addEventListener("change", event => {
    setFilter("ods", event.target.value);
  });

  status?.addEventListener("change", event => {
    setFilter("status", event.target.value);
  });
}

export function resetFilterControls() {
  ["modalityFilter", "sectorFilter", "odsFilter", "statusFilter"].forEach(id => {
    const select = document.getElementById(id);
    if (select) select.value = "all";
  });

  resetFilters();
}

export function initFilters() {
  populateFilters();
  bindFilters();

  subscribe(() => {
    const filteredLocations = getFilteredLocations();
    const filteredProjects = getFilteredProjects();

    renderMap(filteredLocations);
    refreshUI(filteredProjects);
    updateFilterSummary(filteredProjects);
  });
}

export default {
  initFilters,
  populateFilters,
  bindFilters,
  resetFilterControls
};
