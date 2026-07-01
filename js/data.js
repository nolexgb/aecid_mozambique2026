/**
 * Fuente de datos del mapa interactivo de proyectos.
 * Cambia únicamente SHEET_URL si se publica una nueva hoja de Google Sheets.
 */

export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTytpCJzKx-_qUTj2kBRdFMOqrpawv75VD9CXpfFhefmpLqnRQ5TP1PlLkmXRbYew/pub?output=csv";

export async function loadRawProjectsCsv() {
  const response = await fetch(SHEET_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo cargar Google Sheets. Error HTTP ${response.status}`);
  }

  return response.text();
}
