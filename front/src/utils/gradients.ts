export function buildLinearGradient(angle = 135, start = "#2a2424", end = "#433a68") {
  const safeAngle = Number.isFinite(Number(angle)) ? Number(angle) : 135;
  return `linear-gradient(${safeAngle}deg, ${start} 0%, ${end} 100%)`;
}

export function getPageGradientConfig(page = {}) {
  return {
    start: page.backgroundGradientStart || "#2a2424",
    end: page.backgroundGradientEnd || "#433a68",
    angle: Number.isFinite(Number(page.backgroundGradientAngle))
      ? Number(page.backgroundGradientAngle)
      : 135,
  };
}

export function getBlockGradientConfig(block = {}) {
  const start = block.gradientStart || block.color || "#5b4cf0";
  return {
    start,
    end: block.gradientEnd || start,
    angle: Number.isFinite(Number(block.gradientAngle)) ? Number(block.gradientAngle) : 135,
  };
}
