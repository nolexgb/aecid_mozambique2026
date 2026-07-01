<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Mapa interactivo de proyectos | Cooperación Española en Mozambique</title>

  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="css/style.css" />
</head>

<body>
  <header class="site-header">
    <div class="logos">
      <img src="assets/Logo_MAUEC_banderas.png" alt="MAUEC" />
      <img src="assets/AECID.png" alt="AECID" />
      <img src="assets/Logo_Cooperacion_Espanola.png" alt="Cooperación Española" />
    </div>

    <div class="title-block">
      <p class="eyebrow">Cooperación Española en Mozambique</p>
      <h1>Mapa interactivo de proyectos</h1>
      <p class="subtitle">
        Explore los proyectos financiados por la AECID por territorio y área de intervención.
      </p>
    </div>

    <div class="update-pill">
      <span></span>
      Actualización automática
    </div>
  </header>

  <main class="app-layout">
    <aside class="dashboard">
      <section class="search-card">
        <label for="searchInput">Buscar</label>
        <input
          id="searchInput"
          type="search"
          placeholder="Proyecto, socio, provincia, sector u ODS..."
        />
      </section>

      <section class="filters-card">
        <div class="filter-group">
          <label for="sectorFilter">Sector</label>
          <select id="sectorFilter">
            <option value="all">Todos los sectores</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="estadoFilter">Estado</label>
          <select id="estadoFilter">
            <option value="all">Todos los estados</option>
          </select>
        </div>
      </section>

      <section class="kpi-grid">
        <article class="kpi-card">
          <span class="kpi-icon">📁</span>
          <strong id="kpiProjects">0</strong>
          <small>Proyectos</small>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon">€</span>
          <strong id="kpiAmount">€ 0 M</strong>
          <small>Financiación AECID</small>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon">📍</span>
          <strong id="kpiTerritory">—</strong>
          <small>Ámbito territorial</small>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon">📅</span>
          <strong id="kpiYears">—</strong>
          <small>Periodo de ejecución</small>
        </article>
      </section>

      <section class="legend-card">
        <h2>Modalidad predominante</h2>

        <div class="legend-item">
          <span class="dot bilateral"></span>
          Bilateral
        </div>

        <div class="legend-item">
          <span class="dot ong"></span>
          Convocatoria ONGD
        </div>

        <div class="legend-item">
          <span class="dot convenio"></span>
          Convenio
        </div>

        <div class="legend-item">
          <span class="dot innovacion"></span>
          Innovación
        </div>
      </section>
    </aside>

    <section class="map-area">
      <div id="map"></div>

      <section id="mobileSheet" class="mobile-sheet">
        <button id="closeSheet" aria-label="Cerrar">×</button>
        <div id="mobileSheetContent"></div>
      </section>
    </section>
  </main>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
