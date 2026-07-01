/* ==========================================================
   MOBILE.JS
   Bottom Sheet móvil
   Mapa interactivo de proyectos
   Cooperación Española en Mozambique
   ========================================================== */

import { isMobile, qs, setHTML } from "./utils.js";

const SHEET_ID = "mobileSheet";
const CONTENT_ID = "mobileSheetContent";
const CLOSE_ID = "closeSheet";

let sheet = null;
let content = null;
let closeButton = null;

let startY = 0;
let currentY = 0;
let isDragging = false;

/* =========================
   INIT
========================= */

export function initMobile() {
  sheet = qs(`#${SHEET_ID}`);
  content = qs(`#${CONTENT_ID}`);
  closeButton = qs(`#${CLOSE_ID}`);

  if (!sheet || !content) return;

  closeButton?.addEventListener("click", closeMobileSheet);

  sheet.addEventListener("touchstart", handleTouchStart, { passive: true });
  sheet.addEventListener("touchmove", handleTouchMove, { passive: false });
  sheet.addEventListener("touchend", handleTouchEnd);

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      closeMobileSheet();
    }
  });
}

/* =========================
   OPEN / CLOSE
========================= */

export function openMobileSheet(html = "") {
  if (!sheet || !content) return;

  if (!isMobile()) return;

  setHTML(content, html);

  sheet.classList.add("active");
  document.body.classList.add("sheet-open");

  sheet.style.transform = "";
}

export function closeMobileSheet() {
  if (!sheet) return;

  sheet.classList.remove("active");
  document.body.classList.remove("sheet-open");

  sheet.style.transform = "";
}

/* =========================
   UPDATE
========================= */

export function updateMobileSheet(html = "") {
  if (!content) return;

  setHTML(content, html);
}

export function isMobileSheetOpen() {
  return sheet?.classList.contains("active") || false;
}

/* =========================
   TOUCH DRAG
========================= */

function handleTouchStart(event) {
  if (!sheet?.classList.contains("active")) return;

  startY = event.touches[0].clientY;
  currentY = startY;
  isDragging = true;

  sheet.style.transition = "none";
}

function handleTouchMove(event) {
  if (!isDragging) return;

  currentY = event.touches[0].clientY;

  const deltaY = currentY - startY;

  if (deltaY < 0) return;

  event.preventDefault();

  sheet.style.transform = `translateY(${deltaY}px)`;
}

function handleTouchEnd() {
  if (!isDragging) return;

  const deltaY = currentY - startY;

  isDragging = false;

  sheet.style.transition = "";

  if (deltaY > 120) {
    closeMobileSheet();
  } else {
    sheet.style.transform = "";
  }
}

/* =========================
   LEAFLET HELPER
========================= */

export function bindMobilePopup(marker, html) {
  if (!marker) return;

  marker.on("click", () => {
    if (isMobile()) {
      openMobileSheet(html);
    }
  });
}

/* =========================
   EXPORT DEFAULT
========================= */

export default {
  initMobile,
  openMobileSheet,
  closeMobileSheet,
  updateMobileSheet,
  isMobileSheetOpen,
  bindMobilePopup
};
