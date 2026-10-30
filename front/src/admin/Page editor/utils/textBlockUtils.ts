import { buildLinearGradient, getBlockGradientConfig } from "../../../utils/gradients";
import { styleToCss } from "../editorMathCalcul";

export function getCanvasBackground(
  backgroundType: string,
  backgroundColor: string,
  backgroundGradient: string
): string {
  if (backgroundType === "gradient") {
    return backgroundGradient || "linear-gradient(135deg, #2a2424 0%, #433a68 100%)";
  }
  if (backgroundType === "color") {
    return backgroundColor && backgroundColor !== "transparent" ? backgroundColor : "#2a2424";
  }
  return "#2a2424";
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function getMenuPosition(kind: string, x: number, y: number): { x: number; y: number } {
  const estimatedHeight = kind === "block" ? 520 : 420;
  const maxX = Math.max(12, window.innerWidth - 360);
  const maxY = Math.max(12, window.innerHeight - estimatedHeight);
  return {
    x: clampValue(x, 12, maxX),
    y: clampValue(y, 12, maxY),
  };
}

export function buildSegmentsSignature(segments: any[]): string {
  return segments
    .map((s) =>
      [
        s.text || "",
        s.color || "",
        s.fontStyle || "normal",
        s.fillType || "gradient",
        s.gradientStart || "",
        s.gradientEnd || "",
        s.fontFamily || "",
        Number(s.gradientAngle ?? 135),
        Number(s.fontSize ?? 0),
        Number(s.scaleX ?? 1),
      ].join("")
    )
    .join("");
}

export function getGradientTextStyle(source: any): React.CSSProperties {
  const gradient = getBlockGradientConfig(source);
  const background = buildLinearGradient(gradient.angle, gradient.start, gradient.end);
  return {
    backgroundImage: background,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };
}

export function getTextSegmentStyle(segment: any, block: any): React.CSSProperties {
  const source = { ...block, ...segment };
  const fillType = segment.fillType || block.fillType || "gradient";
  const fontSize = Number.isFinite(segment.fontSize) ? segment.fontSize : block.fontSize;
  const blockScaleX = Number.isFinite(block.scaleX) ? block.scaleX : 1;
  const segScaleX = Number.isFinite(segment.scaleX) ? segment.scaleX : blockScaleX;
  const relativeScaleX = blockScaleX !== 0 ? segScaleX / blockScaleX : 1;

  const transform: React.CSSProperties =
    relativeScaleX !== 1
      ? {
          display: "inline-block",
          transform: `scaleX(${relativeScaleX})`,
          transformOrigin: "left center",
        }
      : {};

  const base: React.CSSProperties = {
    fontSize,
    fontFamily: segment.fontFamily || block.fontFamily || "inherit",
    ...styleToCss(segment.fontStyle || block.fontStyle || "normal"),
    ...transform,
  };

  if (fillType === "gradient") {
    return { ...base, ...getGradientTextStyle(source) };
  }

  return { ...base, color: segment.color || block.color || "#ffffff" };
}

export function insertPlainTextAtSelection(text: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}
