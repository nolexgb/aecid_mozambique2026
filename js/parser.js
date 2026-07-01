/* ==========================================================
   PARSER.JS
   Limpieza y normalización de datos
   Google Sheets CSV → estructura usable por el mapa
   ========================================================== */

import { normalizeText, parseAmount, toNumber, unique } from "./utils.js";

export function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (value || row.length) {
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = "";
      }
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  return rows.filter(r => r.some(cell => String(cell).trim() !== ""));
}

export function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}

export function csvToObjects(csvText) {
  const rows = parseCSV(csvText);

  if (!rows.length) return [];

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map(row => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = row[index] ? String(row[index]).trim() : "";
    });

    return item;
  });
}

export function normalizeModality(value) {
  const text = normalizeText(value);

  if (text.includes("bilateral")) return "Bilateral";
  if (text.includes("ongd")) return "Convocatoria ONGD";
  if (text.includes("convenio")) return "Convenio";
  if (text.includes("innovacion")) return "Innovación";

  return value || "Otros";
}

export function normalizeStatus(value) {
  const text = normalizeText(value);

  if (text.includes("ejecucion") || text.includes("activo")) return "En ejecución";
  if (text.includes("finalizado") || text.includes("cerrado")) return "Finalizado";
  if (text.includes("formulacion")) return "En formulación";

  return value || "Sin estado";
}

export function parseODS(value) {
  if (!value) return [];

  return String(value)
    .split(/[,;/|]+/)
    .map(v => v.trim())
    .map(v => {
      const match = v.match(/\d+/);
      return match ? Number(match[0]) : null;
    })
    .filter(Boolean);
}

export function isVisible(row) {
  const value = normalizeText(row.visible_mapa || row.visible || "");

  if (!value) return true;

  return value === "si" || value === "sí" || value === "yes" || value === "true" || value === "1";
}

export function normalizeProject(row) {
  const province =
    row.provincia ||
    row.ambito ||
    row.ambito_geografico ||
    row.localizacion ||
    "Sin localización";

  const lat = toNumber(row.latitud || row.lat);
  const lng = toNumber(row.longitud || row.lng || row.lon);

  return {
    id: row.id || crypto.randomUUID?.() || String(Math.random()),

    title:
      row.proyecto ||
      row.titulo ||
      row.title ||
      "Proyecto sin título",

    year:
      row.ano ||
      row.año ||
      row.year ||
      "",

    partners:
      row.socios ||
      row.socio ||
      row.entidad ||
      row.partners ||
      "",

    amount:
      parseAmount(
        row.importe_eur ||
        row.importe ||
        row.amount ||
        row.financiacion
      ),

    amountLabel:
      row.importe_eur ||
      row.importe ||
      row.amount ||
      "",

    modality: normalizeModality(row.modalidad || row.modality),

    sector:
      row.sector ||
      "Sin sector",

    subsector:
      row.subsector ||
      "",

    status: normalizeStatus(row.estado || row.status),

    ods: parseODS(row.ods),

    beneficiaries:
      row.beneficiarios ||
      "",

    province,
    district:
      row.distrito ||
      "",

    locality:
      row.localidad ||
      "",

    lat,
    lng,

    visible: isVisible(row),

    searchText: normalizeText([
      row.socios,
      row.socio,
      row.entidad,
      row.proyecto,
      row.provincia,
      row.distrito,
      row.localidad,
      row.sector,
      row.ods
    ].join(" "))
  };
}

export function groupByLocation(projects) {
  const grouped = new Map();

  projects.forEach(project => {
    if (!project.visible) return;
    if (project.lat === null || project.lng === null) return;

    const key = project.province;

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: project.province,
        lat: project.lat,
        lng: project.lng,
        projects: []
      });
    }

    grouped.get(key).projects.push(project);
  });

  return Array.from(grouped.values());
}

export function buildMetadata(projects) {
  return {
    projectsCount: projects.length,

    totalAmount: projects.reduce((sum, project) => {
      return sum + (project.amount || 0);
    }, 0),

    years: unique(
      projects
        .map(project => Number(project.year))
        .filter(Boolean)
    ).sort(),

    modalities: unique(
      projects
        .map(project => project.modality)
        .filter(Boolean)
    ).sort(),

    sectors: unique(
      projects
        .map(project => project.sector)
        .filter(Boolean)
    ).sort(),

    statuses: unique(
      projects
        .map(project => project.status)
        .filter(Boolean)
    ).sort(),

    ods: unique(
      projects.flatMap(project => project.ods || [])
    ).sort((a, b) => a - b),

    partners: unique(
      projects
        .map(project => project.partners)
        .filter(Boolean)
    ).sort()
  };
}

export function normalizeProjects(csvText) {
  const rows = csvToObjects(csvText);

  const projects = rows
    .map(normalizeProject)
    .filter(project => project.visible)
    .filter(project => project.lat !== null && project.lng !== null);

  return {
    rows,
    projects,
    locations: groupByLocation(projects),
    metadata: buildMetadata(projects)
  };
}

export default normalizeProjects;
