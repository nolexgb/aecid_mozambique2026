/* ==========================================================
   APP.JS
   Punto de entrada principal
   ========================================================== */

import { initIntro } from "./intro.js";
import { loadProjects, setupAutoRefresh } from "./sheets.js";
import { initMap, renderMap } from "./map.js";
import { initFilters } from "./filters.js";
import { initSearch } from "./search.js";
import { initUI, setLoading, setAppError, refreshUI } from "./ui.js";
import { initMobile } from "./mobile.js";
import { setData, getFilteredLocations, getFilteredProjects } from "./store.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    initIntro();
    setLoading(true, "Cargando datos...");

    const data = await loadProjects();

    setData(data);

    initMap();
    initFilters();
    initSearch();
    initMobile();

    renderMap(getFilteredLocations());
    initUI(getFilteredProjects());

    setLoading(false);

    startAutoRefresh(updatedData => {
      setData(updatedData);
      renderMap(getFilteredLocations());
      refreshUI(getFilteredProjects());
    });

    window.addEventListener("introFinished", () => {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 300);
    });

  } catch (error) {
    console.error("Error iniciando la aplicación:", error);
    setAppError("No se pudieron cargar los datos del mapa.");
  }
});
