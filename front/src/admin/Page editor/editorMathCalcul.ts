export function uid() {
  return "b_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function styleToCss(fontStyle) {
  switch (fontStyle) {
    case "italic":
      return { fontStyle: "italic", fontWeight: 400 };
    case "bold":
      return { fontStyle: "normal", fontWeight: 700 };
    case "bolditalic":
      return { fontStyle: "italic", fontWeight: 700 };
    default:
      return { fontStyle: "normal", fontWeight: 400 };
  }
}

export function calculateCanvasHeight(blocks, minHeight, padding = 400) {
  let maxY = 0;
  for (const b of blocks) {
    if (!b) continue;
    if (b.type === "text") maxY = Math.max(maxY, (b.y ?? 0) + 140);
    if (b.type === "link") maxY = Math.max(maxY, (b.y ?? 0) + 120);
    if (b.type === "box" || b.type === "image") {
      maxY = Math.max(maxY, (b.y ?? 0) + (b.h ?? 0) + 140);
    }
  }
  return Math.max(minHeight, maxY + padding);
}

export function getCanvasPoint(e, canvasEl) {
  if (!canvasEl) return { x: 0, y: 0 };
  const rect = canvasEl.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  return { x, y };
}
