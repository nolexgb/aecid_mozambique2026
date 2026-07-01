export const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?output=csv";

export const COLORS = {
  Bilateral: "#2563eb",
  "Convocatoria ONGD": "#f97316",
  Convenio: "#16a34a",
  Innovación: "#8e24aa",
  Default: "#6b7280"
};

export function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
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

  if (value || row.length) row.push(value.trim()), rows.push(row);
  return rows;
}

export function csvToObjects(csvText) {
  const rows = parseCSV(csvText).filter(row => row.some(cell => String(cell).trim() !== ""));
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] ? row[index].trim() : "";
    });
    return item;
  });
}

export function toNumber(value) {
  if (!value) return null;
  const number = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(number) ? number : null;
}

export function parseAmount(value) {
  if (!value) return 0;
  return Number(
    String(value)
      .replace("€", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}

export function formatAmount(value) {
  if (!value) return "€ 0";
  if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1).replace(".", ",")} M`;
  return `€ ${Math.round(value).toLocaleString("es-ES")}`;
}

export function normalizeModality(modality) {
  const text = String(modality || "").trim();
  if (text.includes("Bilateral")) return "Bilateral";
  if (text.includes("ONGD")) return "Convocatoria ONGD";
  if (text.includes("Convenio")) return "Convenio";
  if (text.includes("Innovación")) return "Innovación";
  return "Default";
}

export function isVisible(row) {
  const visible = String(row.visible_mapa || "").trim().toLowerCase();
  return ["sí", "si", "yes", "true", "1"].includes(visible);
}

export function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

export function slug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function countBy(values) {
  return values.reduce((acc, value) => {
    const key = value || "Sin dato";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function dominant(values) {
  const counts = countBy(values.filter(Boolean));
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "Default";
}

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export function isMobile() {
  return window.matchMedia("(max-width: 760px)").matches;
}
