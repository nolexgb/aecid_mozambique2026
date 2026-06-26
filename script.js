const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([-18.6657, 35.5296], 5.5);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);

function getColor(projects) {
  const count = projects.length;
  if (count >= 5) return "#c90016";
  if (count >= 3) return "#f15a24";
  if (count >= 2) return "#f7941d";
  return "#f9c642";
}

function createPopupContent(location) {
  const total = location.projects.length;

  const projectsHtml = location.projects.map((project, index) => `
    <details class="project">
      <summary>${index + 1}. ${project.title}</summary>
      <div class="project-body">
        <p><strong>Año:</strong> ${project.year}</p>
        <p><strong>Socio / entidad:</strong> ${project.partners}</p>
        <p><strong>Importe:</strong> ${project.amount}</p>
        <span class="badge">${project.modality}</span>
      </div>
    </details>
  `).join("");

  return `
    <div class="popup-card">
      <div class="popup-header">
        <h2>${location.name}</h2>
        <p>${total} ${total === 1 ? "proyecto activo" : "proyectos activos"}</p>
      </div>
      ${projectsHtml}
    </div>
  `;
}

projectData.forEach(location => {
  const marker = L.circleMarker([location.lat, location.lng], {
    radius: 11 + location.projects.length * 1.4,
    fillColor: getColor(location.projects),
    color: "#ffffff",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.88
  }).addTo(map);

  marker.bindPopup(createPopupContent(location), {
    maxWidth: 420,
    closeButton: true
  });

  marker.bindTooltip(
    `<strong>${location.name}</strong><br>${location.projects.length} proyectos`,
    {
      direction: "top",
      offset: [0, -10],
      opacity: 0.95
    }
  );
});
