import { debounce, escapeHtml, slug } from "./utils.js";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function splitPartners(value) {
  const full = String(value || "").trim();
  if (!full) return [];

  const parts = full
    .split(/\s*(?:\/|;|,|\+|&|\by\b|\band\b)\s*/i)
    .map(item => item.trim())
    .filter(item => item.length > 1);

  return [...new Set([full, ...parts])];
}

function buildEntityIndex(projects) {
  const index = new Map();

  projects.forEach(project => {
    splitPartners(project.partners).forEach(entity => {
      const key = normalizeText(entity);
      if (!key) return;

      if (!index.has(key)) {
        index.set(key, {
          label: entity,
          normalized: key,
          count: 0,
          amount: 0,
          locations: new Set()
        });
      }

      const item = index.get(key);
      item.count += 1;
      item.amount += Number(project.amountNumber || 0);
      if (project.location) item.locations.add(project.location);
    });
  });

  return [...index.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "es", { sensitivity: "base" })
  );
}

export function matchesSearch(project, location, query) {
  if (!query) return true;

  const needle = normalizeText(query);

  // Búsqueda principal por entidad/socio colaborador.
  // La provincia/localización queda para el mapa y los filtros, no para el buscador principal.
  const entities = splitPartners(project.partners).map(normalizeText);
  const fullPartners = normalizeText(project.partners);

  return fullPartners.includes(needle) || entities.some(entity => entity.includes(needle));
}

export function attachSearchEvent({ els, state, projects, applyFilters }) {
  const suggestions = buildEntityIndex(projects);
  let activeIndex = -1;

  function ensureSuggestionsBox() {
    let box = document.getElementById("searchSuggestions");

    if (!box) {
      box = document.createElement("div");
      box.id = "searchSuggestions";
      box.className = "search-suggestions";
      box.setAttribute("role", "listbox");
      box.setAttribute("aria-label", "Sugerencias de entidades");
      els.search.insertAdjacentElement("afterend", box);
    }

    return box;
  }

  const suggestionsBox = ensureSuggestionsBox();

  function hideSuggestions() {
    suggestionsBox.classList.remove("open");
    suggestionsBox.innerHTML = "";
    activeIndex = -1;
  }

  function selectSuggestion(value) {
    els.search.value = value;
    state.filters.query = value;
    hideSuggestions();
    applyFilters();
  }

  function renderSuggestions(query) {
    const needle = normalizeText(query);

    if (!needle) {
      hideSuggestions();
      return;
    }

    const matches = suggestions
      .filter(item => item.normalized.includes(needle))
      .sort((a, b) => {
        const aStarts = a.normalized.startsWith(needle) ? 0 : 1;
        const bStarts = b.normalized.startsWith(needle) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return b.count - a.count;
      })
      .slice(0, 8);

    if (!matches.length) {
      suggestionsBox.innerHTML = `
        <div class="suggestion-empty">
          No se encontraron entidades con ese nombre.
        </div>
      `;
      suggestionsBox.classList.add("open");
      return;
    }

    suggestionsBox.innerHTML = matches.map((item, index) => `
      <button class="suggestion-item" type="button" role="option" data-value="${escapeHtml(item.label)}" data-index="${index}">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${item.count} ${item.count === 1 ? "proyecto" : "proyectos"} · ${item.locations.size} ${item.locations.size === 1 ? "territorio" : "territorios"}</span>
      </button>
    `).join("");

    suggestionsBox.classList.add("open");
    activeIndex = -1;

    suggestionsBox.querySelectorAll(".suggestion-item").forEach(button => {
      button.addEventListener("mousedown", event => {
        event.preventDefault();
        selectSuggestion(button.dataset.value);
      });
    });
  }

  function updateActiveSuggestion(items) {
    items.forEach((item, index) => {
      item.classList.toggle("active", index === activeIndex);
    });
  }

  els.search.addEventListener("input", debounce(event => {
    const value = event.target.value.trim();
    state.filters.query = value;
    renderSuggestions(value);
    applyFilters();
  }, 120));

  els.search.addEventListener("focus", () => {
    renderSuggestions(els.search.value.trim());
  });

  els.search.addEventListener("keydown", event => {
    const items = [...suggestionsBox.querySelectorAll(".suggestion-item")];

    if (!items.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
      updateActiveSuggestion(items);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
      updateActiveSuggestion(items);
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(items[activeIndex].dataset.value);
    }

    if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  document.addEventListener("click", event => {
    if (!els.search.contains(event.target) && !suggestionsBox.contains(event.target)) {
      hideSuggestions();
    }
  });
}

export function renderResults({ els, projects, focusLocation }) {
  els.resultsCount.textContent = projects.length;

  if (!projects.length) {
    els.resultsList.innerHTML = `<div class="result-item"><strong>No hay resultados</strong><span>Pruebe con otra entidad, modalidad, sector, ODS o estado.</span></div>`;
    return;
  }

  els.resultsList.innerHTML = projects.slice(0, 40).map(project => `
    <button class="result-item" data-location="${slug(project.location)}">
      <strong>${escapeHtml(project.partners || "Entidad sin especificar")}</strong>
      <span>${escapeHtml(project.location)} · ${escapeHtml(project.sector || "Sin sector")} · ${escapeHtml(project.estado || "Sin estado")}</span>
    </button>
  `).join("");

  els.resultsList.querySelectorAll(".result-item").forEach(button => {
    button.addEventListener("click", () => focusLocation(button.dataset.location));
  });
}
