import { COLORS, escapeHtml } from "./utils.js";

export function createMiniBars(title, counts, useModalityColor = false) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!entries.length) return "";

  const max = Math.max(...entries.map(([, count]) => count), 1);
  const bars = entries.map(([name, count]) => {
    const width = Math.max(8, Math.round((count / max) * 100));
    const color = useModalityColor ? COLORS[name] || COLORS.Default : "#d0001b";
    return `
      <div class="mini-bar">
        <span>${escapeHtml(name)}</span>
        <div class="mini-bar-track"><div class="mini-bar-fill" style="--w:${width}%;--c:${color}"></div></div>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");

  return `<section class="chart-block"><h3>${escapeHtml(title)}</h3>${bars}</section>`;
}
