import { COLORS, escapeHtml } from "./utils.js";

const AECID_SEQUENCE = ["#e30613", "#ffcc00", "#002f6c", "#00a3e0", "#9f0010"];

export function createMiniBars(title, counts, useModalityColor = false) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!entries.length) return "";

  const max = Math.max(...entries.map(([, count]) => count), 1);
  const bars = entries.map(([name, count], index) => {
    const width = Math.max(8, Math.round((count / max) * 100));
    const color = useModalityColor ? COLORS[name] || COLORS.Default : AECID_SEQUENCE[index % AECID_SEQUENCE.length];
    const delay = `${80 + index * 110}ms`;

    return `
      <div class="mini-bar" style="--delay:${delay}">
        <span>${escapeHtml(name)}</span>
        <div class="mini-bar-track"><div class="mini-bar-fill" style="--w:${width}%;--c:${color}"></div></div>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");

  return `<section class="chart-block"><h3>${escapeHtml(title)}</h3>${bars}</section>`;
}
