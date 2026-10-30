function uid() {
  return "seg_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function normalizeFontStyle(value, fallback = "normal") {
  return ["normal", "italic", "bold", "bolditalic"].includes(value) ? value : fallback;
}

function normalizeFillType(value, fallback = "color") {
  return value === "gradient" ? "gradient" : fallback;
}

function sameSegmentStyle(left, right) {
  return (
    (left.color || "#ffffff") === (right.color || "#ffffff") &&
    (left.fontStyle || "normal") === (right.fontStyle || "normal") &&
    (left.fontFamily || "inherit") === (right.fontFamily || "inherit") &&
    (left.fillType || "color") === (right.fillType || "color") &&
    (left.gradientStart || "") === (right.gradientStart || "") &&
    (left.gradientEnd || "") === (right.gradientEnd || "") &&
    Number(left.gradientAngle || 135) === Number(right.gradientAngle || 135) &&
    Number(left.fontSize || 0) === Number(right.fontSize || 0) &&
    Number(left.scaleX || 1) === Number(right.scaleX || 1)
  );
}

function mergeAdjacentSegments(segments) {
  return segments.reduce((acc, segment) => {
    if (!segment?.text) {
      return acc;
    }

    const last = acc[acc.length - 1];
    if (last && sameSegmentStyle(last, segment)) {
      last.text += segment.text;
      return acc;
    }

    acc.push({ ...segment });
    return acc;
  }, []);
}

function dedupeRepeatedText(text) {
  if (typeof text !== "string" || text.length < 40) return text;
  const n = text.length;
  for (let period = 1; period <= n / 2; period += 1) {
    if (n % period !== 0) continue;
    const head = text.slice(0, period);
    let isPeriodic = true;
    for (let offset = period; offset < n; offset += period) {
      if (text.slice(offset, offset + period) !== head) {
        isPeriodic = false;
        break;
      }
    }
    if (isPeriodic) return head;
  }
  return text;
}

function dedupeMirroredSegments(segments) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return segments;
  }
  if (segments.length === 1) {
    const only = segments[0];
    const text = String(only.text || "");
    const deduped = dedupeRepeatedText(text);
    if (deduped !== text) {
      return [{ ...only, text: deduped }];
    }
    return segments;
  }
  const n = segments.length;
  for (let period = 1; period <= n / 2; period += 1) {
    if (n % period !== 0) continue;
    let isPeriodic = true;
    for (let i = period; i < n; i += 1) {
      const a = segments[i];
      const b = segments[i % period];
      if ((a.text || "") !== (b.text || "") || !sameSegmentStyle(a, b)) {
        isPeriodic = false;
        break;
      }
    }
    if (isPeriodic) return segments.slice(0, period);
  }
  return segments;
}

export function getPlainTextFromSegments(segments) {
  return (Array.isArray(segments) ? segments : [])
    .map((segment) => String(segment?.text ?? ""))
    .join("");
}

export function normalizeTextSegments(segments, fallback = {}) {
  const baseColor = fallback.color || "#ffffff";
  const baseFontStyle = normalizeFontStyle(fallback.fontStyle, "normal");
  const baseFillType = normalizeFillType(fallback.fillType, "color");
  const baseGradientStart = fallback.gradientStart || baseColor;
  const baseGradientEnd = fallback.gradientEnd || "#f59e0b";
  const baseGradientAngle = Number.isFinite(fallback.gradientAngle) ? fallback.gradientAngle : 135;
  const baseFontSize = Number.isFinite(fallback.fontSize) ? fallback.fontSize : null;
  const baseScaleX = Number.isFinite(fallback.scaleX) ? fallback.scaleX : null;
  const baseFontFamily = fallback.fontFamily || "inherit";

  const normalized = (Array.isArray(segments) ? segments : []).filter(Boolean).map((segment) => ({
    id: segment.id || uid(),
    text: typeof segment.text === "string" ? segment.text : "",
    color: segment.color || baseColor,
    fontStyle: normalizeFontStyle(segment.fontStyle, baseFontStyle),
    fontFamily: segment.fontFamily || baseFontFamily,
    fillType: normalizeFillType(segment.fillType, baseFillType),
    gradientStart: segment.gradientStart || baseGradientStart,
    gradientEnd: segment.gradientEnd || baseGradientEnd,
    gradientAngle: Number.isFinite(segment.gradientAngle)
      ? segment.gradientAngle
      : baseGradientAngle,
    fontSize: Number.isFinite(segment.fontSize) ? segment.fontSize : baseFontSize,
    scaleX: Number.isFinite(segment.scaleX) ? segment.scaleX : baseScaleX,
  }));

  if (normalized.length > 0) {
    return mergeAdjacentSegments(dedupeMirroredSegments(normalized));
  }

  return [
    {
      id: uid(),
      text: dedupeRepeatedText(typeof fallback.text === "string" ? fallback.text : ""),
      color: baseColor,
      fontStyle: baseFontStyle,
      fillType: baseFillType,
      gradientStart: baseGradientStart,
      gradientEnd: baseGradientEnd,
      gradientAngle: baseGradientAngle,
      fontSize: baseFontSize,
      scaleX: baseScaleX,
      fontFamily: baseFontFamily,
    },
  ];
}

export function normalizeTextBlock(block) {
  if (!block || block.type !== "text") {
    return block;
  }

  const segments = normalizeTextSegments(block.segments, {
    text: block.text,
    color: block.color,
    fontStyle: block.fontStyle,
    fontFamily: block.fontFamily,
    fillType: block.fillType,
    gradientStart: block.gradientStart,
    gradientEnd: block.gradientEnd,
    gradientAngle: block.gradientAngle,
    fontSize: block.fontSize,
  });

  return {
    ...block,
    text: getPlainTextFromSegments(segments),
    color: segments[0]?.color || block.color || "#ffffff",
    fontStyle: segments[0]?.fontStyle || block.fontStyle || "normal",
    fontFamily: segments[0]?.fontFamily || block.fontFamily || "inherit",
    segments,
  };
}

export function getTextSelectionStyle(block, selectionStart, selectionEnd) {
  const normalizedBlock = normalizeTextBlock(block);
  const start = Math.max(0, Math.min(selectionStart, selectionEnd));
  const end = Math.max(start, Math.max(selectionStart, selectionEnd));

  let cursor = 0;
  const matchedSegment = normalizedBlock.segments.find((segment) => {
    const text = String(segment.text || "");
    const segmentStart = cursor;
    const segmentEnd = cursor + text.length;
    cursor = segmentEnd;
    return segmentEnd > start && segmentStart < end;
  });

  return matchedSegment ? { ...normalizedBlock, ...matchedSegment } : normalizedBlock;
}

export function getTextPreview(block, limit = 72) {
  const normalizedBlock = normalizeTextBlock(block);
  const text = normalizedBlock?.text || "";

  if (text.length <= limit) {
    return text || "Empty text";
  }

  return text.slice(0, limit).trimEnd() + "...";
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSegmentInlineStyle(segment, block) {
  const fontSize = Number.isFinite(segment.fontSize)
    ? segment.fontSize
    : Number.isFinite(block?.fontSize)
      ? block.fontSize
      : 16;
  const blockScaleX = Number.isFinite(block?.scaleX) ? (block.scaleX as number) : 1;
  const segScaleX = Number.isFinite(segment.scaleX) ? (segment.scaleX as number) : blockScaleX;
  const relativeScaleX = blockScaleX !== 0 ? segScaleX / blockScaleX : 1;
  const fs = segment.fontStyle || block?.fontStyle || "normal";
  const fontWeight = fs === "bold" || fs === "bolditalic" ? 700 : 400;
  const fontStyle = fs === "italic" || fs === "bolditalic" ? "italic" : "normal";
  const fillType = segment.fillType || block?.fillType;

  const styles = [
    `font-size: ${fontSize}px`,
    `font-weight: ${fontWeight}`,
    `font-style: ${fontStyle}`,
    `font-family: ${segment.fontFamily || block?.fontFamily || "inherit"}`,
  ];

  if (relativeScaleX !== 1) {
    styles.push(`display: inline-block`);
    styles.push(`transform: scaleX(${relativeScaleX})`);
    styles.push(`transform-origin: left center`);
  }

  if (fillType === "gradient") {
    const start = segment.gradientStart || block?.gradientStart || segment.color || "#ffffff";
    const end = segment.gradientEnd || block?.gradientEnd || start;
    const angle = Number.isFinite(segment.gradientAngle)
      ? segment.gradientAngle
      : Number.isFinite(block?.gradientAngle)
        ? block.gradientAngle
        : 135;
    styles.push(`background-image: linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`);
    styles.push("background-clip: text");
    styles.push("-webkit-background-clip: text");
    styles.push("color: transparent");
    styles.push("-webkit-text-fill-color: transparent");
  } else {
    styles.push(`color: ${segment.color || "#ffffff"}`);
  }

  return styles.join("; ");
}

export function buildSegmentsHtml(block) {
  const normalized = normalizeTextBlock(block);
  if (!normalized.segments || normalized.segments.length === 0) {
    return "";
  }
  return normalized.segments
    .map((seg) => {
      const style = buildSegmentInlineStyle(seg, normalized);
      const text = escapeHtml(seg.text || "").replace(/\n/g, "<br>");
      const content = text || "&#8203;";
      return `<span data-seg-id="${seg.id}" style="${style}">${content}</span>`;
    })
    .join("");
}

// Solid-color variant used when the block is contentEditable.
// background-clip:text + color:transparent breaks in Chrome's contenteditable mode,
// so we render the primary gradient colour as a plain `color` instead.
export function buildSegmentsEditHtml(block) {
  const normalized = normalizeTextBlock(block);
  if (!normalized.segments || normalized.segments.length === 0) {
    return "";
  }
  return normalized.segments
    .map((seg) => {
      const fontSize = Number.isFinite(seg.fontSize)
        ? seg.fontSize
        : Number.isFinite(normalized.fontSize)
          ? normalized.fontSize
          : 16;
      const fs = seg.fontStyle || normalized.fontStyle || "normal";
      const fontWeight = fs === "bold" || fs === "bolditalic" ? 700 : 400;
      const fontStyle = fs === "italic" || fs === "bolditalic" ? "italic" : "normal";
      const fillType = seg.fillType || normalized.fillType || "color";
      const color =
        fillType === "gradient"
          ? seg.gradientStart ||
            normalized.gradientStart ||
            seg.color ||
            normalized.color ||
            "#ffffff"
          : seg.color || normalized.color || "#ffffff";
      const style = [
        `font-size: ${fontSize}px`,
        `font-weight: ${fontWeight}`,
        `font-style: ${fontStyle}`,
        `font-family: ${seg.fontFamily || normalized.fontFamily || "inherit"}`,
        `color: ${color}`,
      ].join("; ");
      const text = escapeHtml(seg.text || "").replace(/\n/g, "<br>");
      const content = text || "&#8203;";
      return `<span data-seg-id="${seg.id}" style="${style}">${content}</span>`;
    })
    .join("");
}

export function parseSegmentsFromElement(element, originalBlock) {
  const segmentLookup = new Map();
  const baseSegments = Array.isArray(originalBlock?.segments) ? originalBlock.segments : [];
  baseSegments.forEach((s) => segmentLookup.set(s.id, s));

  const fallbackBase = baseSegments[0] || {
    color: originalBlock?.color || "#ffffff",
    fontStyle: originalBlock?.fontStyle || "normal",
    fillType: originalBlock?.fillType || "gradient",
    gradientStart: originalBlock?.gradientStart,
    gradientEnd: originalBlock?.gradientEnd,
    gradientAngle: originalBlock?.gradientAngle,
    fontSize: originalBlock?.fontSize,
  };

  function getBaseSegment(segId) {
    if (segId && segmentLookup.has(segId)) {
      return segmentLookup.get(segId);
    }
    return fallbackBase;
  }

  const result = [];

  function appendText(segId, text) {
    if (!text) return;
    const last = result[result.length - 1];

    let effectiveSegId = segId;
    if (!effectiveSegId && last) {
      effectiveSegId = last._segId;
    }

    if (last && last._segId === effectiveSegId) {
      last.text += text;
      return;
    }
    const base = getBaseSegment(effectiveSegId);
    result.push({
      id: uid(),
      _segId: effectiveSegId || null,
      text,
      color: base.color || "#ffffff",
      fontStyle: base.fontStyle || "normal",
      fillType: base.fillType || "gradient",
      gradientStart: base.gradientStart,
      gradientEnd: base.gradientEnd,
      gradientAngle: base.gradientAngle,
      fontSize: base.fontSize,
      scaleX: base.scaleX,
      fontFamily: base.fontFamily,
    });
  }

  function walk(node, currentSegId) {
    if (!node) return;
    if (node.nodeType === 3) {
      const text = String(node.textContent || "").replace(/​/g, "");
      if (text) appendText(currentSegId, text);
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = (node.tagName || "").toUpperCase();

    if (tag === "BR") {
      appendText(currentSegId, "\n");
      return;
    }

    let segId = currentSegId;
    if (tag === "SPAN" && node.getAttribute) {
      const id = node.getAttribute("data-seg-id");
      if (id) segId = id;
    }

    if (tag === "DIV" || tag === "P") {
      if (result.length > 0) {
        appendText(segId, "\n");
      }
    }

    Array.from(node.childNodes).forEach((child) => walk(child, segId));
  }

  Array.from(element.childNodes).forEach((child) => walk(child, null));

  return result
    .map(({ _segId, ...rest }) => rest)
    .filter((s) => typeof s.text === "string" && s.text.length > 0);
}

export function applyTextSelectionPatch(block, selectionStart, selectionEnd, patch) {
  const normalizedBlock = normalizeTextBlock(block);
  const start = Math.max(0, Math.min(selectionStart, selectionEnd));
  const end = Math.max(start, Math.max(selectionStart, selectionEnd));

  if (start === end) {
    return normalizedBlock;
  }

  let cursor = 0;
  const nextSegments = [];

  normalizedBlock.segments.forEach((segment) => {
    const text = String(segment.text || "");
    const segmentStart = cursor;
    const segmentEnd = cursor + text.length;
    cursor = segmentEnd;

    if (segmentEnd <= start || segmentStart >= end) {
      nextSegments.push({ ...segment });
      return;
    }

    const localStart = Math.max(start - segmentStart, 0);
    const localEnd = Math.min(end - segmentStart, text.length);

    if (localStart > 0) {
      nextSegments.push({
        ...segment,
        id: uid(),
        text: text.slice(0, localStart),
      });
    }

    if (localEnd > localStart) {
      nextSegments.push({
        ...segment,
        ...patch,
        id: uid(),
        text: text.slice(localStart, localEnd),
      });
    }

    if (localEnd < text.length) {
      nextSegments.push({
        ...segment,
        id: uid(),
        text: text.slice(localEnd),
      });
    }
  });

  return {
    ...normalizedBlock,
    segments: normalizeTextSegments(nextSegments, normalizedBlock),
  };
}
