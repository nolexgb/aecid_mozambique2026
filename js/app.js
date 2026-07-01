import CONFIG from './config.js';
import { initMap } from './map.js';
import { loadProjects } from './sheets.js';
import { normalizeProjects } from './parser.js';
import { initFilters } from './filters.js';
import { initSearch } from './search.js';
import { initIntro } from './intro.js';
import { initUI } from './ui.js';
import { initMobile } from './mobile.js';

document.addEventListener('DOMContentLoaded', async ()=>{
  initIntro();
  const raw=await loadProjects(CONFIG);
  const projects=normalizeProjects(raw);
  const map=initMap(CONFIG,projects);
  initFilters(projects,map);
  initSearch(projects,map);
  initUI(projects);
  initMobile();
});