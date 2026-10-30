import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addPage, getPage, updatePage } from "../mockData";
import { clamp, getCanvasPoint, uid } from "./editorMathCalcul";
import {
  applyTextSelectionPatch,
  normalizeTextBlock,
  normalizeTextSegments,
} from "../../utils/textSegments";
import {
  hasClipboardContent,
  readPastedBlock,
  readTextClipboard,
  writeBlockClipboard,
} from "../../utils/blockClipboard";
import { popHistoryEntry, pushHistoryEntry } from "../../utils/historyState";
import {
  buildLinearGradient,
  getBlockGradientConfig,
  getPageGradientConfig,
} from "../../utils/gradients";

function withHoverDefaults(block) {
  return {
    ...block,
    hoverEnabled: block?.hoverEnabled ?? false,
    hoverScale: Number.isFinite(block?.hoverScale) ? block.hoverScale : 1.1,
    hoverDuration: Number.isFinite(block?.hoverDuration) ? block.hoverDuration : 0.25,
    shadowEnabled: block?.shadowEnabled ?? false,
    shadowX: Number.isFinite(block?.shadowX) ? block.shadowX : 4,
    shadowY: Number.isFinite(block?.shadowY) ? block.shadowY : 4,
    shadowBlur: Number.isFinite(block?.shadowBlur) ? block.shadowBlur : 12,
    shadowColor: block?.shadowColor ?? "#000000",
    shadowOpacity: Number.isFinite(block?.shadowOpacity) ? block.shadowOpacity : 0.4,
    borderEnabled: block?.borderEnabled ?? false,
    borderWidth: Number.isFinite(block?.borderWidth) ? block.borderWidth : 2,
    borderColor: block?.borderColor ?? "#ffffff",
    borderStyle: block?.borderStyle ?? "solid",
    borderTopWidth: Number.isFinite(block?.borderTopWidth)
      ? block.borderTopWidth
      : Number.isFinite(block?.borderWidth)
        ? block.borderWidth
        : 2,
    borderRightWidth: Number.isFinite(block?.borderRightWidth)
      ? block.borderRightWidth
      : Number.isFinite(block?.borderWidth)
        ? block.borderWidth
        : 2,
    borderBottomWidth: Number.isFinite(block?.borderBottomWidth)
      ? block.borderBottomWidth
      : Number.isFinite(block?.borderWidth)
        ? block.borderWidth
        : 2,
    borderLeftWidth: Number.isFinite(block?.borderLeftWidth)
      ? block.borderLeftWidth
      : Number.isFinite(block?.borderWidth)
        ? block.borderWidth
        : 2,
    rotation: Number.isFinite(block?.rotation) ? block.rotation : 0,
    locked: block?.locked ?? false,
    filterTags: Array.isArray(block?.filterTags)
      ? block.filterTags
      : block?.filterTag
        ? [block.filterTag]
        : [],
  };
}

function applyTextBlockStylePatch(block, patch) {
  const normalizedBlock = normalizeTextBlock(block);
  const styleKeys = [
    "color",
    "fontStyle",
    "fontFamily",
    "fontSize",
    "fillType",
    "gradientStart",
    "gradientEnd",
    "gradientAngle",
    "gradient",
  ];
  const nextStylePatch = Object.fromEntries(
    styleKeys
      .filter((key) => Object.prototype.hasOwnProperty.call(patch, key))
      .map((key) => [key, patch[key]])
  );

  if (Object.keys(nextStylePatch).length === 0) {
    return {
      ...normalizedBlock,
      ...patch,
    };
  }

  return {
    ...normalizedBlock,
    ...patch,
    segments: normalizeTextSegments(
      normalizedBlock.segments.map((segment) => ({
        ...segment,
        ...nextStylePatch,
      })),
      {
        ...normalizedBlock,
        ...patch,
      }
    ),
  };
}

function applyTextStretchPatch(block, scaleX, scaleY) {
  return applyTextBlockStylePatch(block, {
    scaleX,
    scaleY,
  });
}

function estimateBlockWidth(block) {
  if (!block) return 0;

  if (block.type === "emoji") {
    return (block.fontSize ?? 64) * (Number.isFinite(block.scaleX) ? block.scaleX : 1);
  }

  if (block.type === "filter") {
    return block.width ?? 220;
  }

  if (Number.isFinite(block.w)) {
    return block.w;
  }

  if (block.type === "text") {
    const textBlock = normalizeTextBlock(block);
    const lines = String(textBlock.text || "").split(/\r?\n/);
    const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
    const fontSize = textBlock.fontSize ?? textBlock.segments?.[0]?.fontSize ?? 16;
    const scaleX = Number.isFinite(textBlock.scaleX) ? textBlock.scaleX : 1;
    return Math.max(80, longestLine * fontSize * 0.6 * scaleX + 8);
  }

  return 200;
}

function estimateBlockHeight(block) {
  if (!block) return 0;

  if (block.type === "emoji") {
    return (block.fontSize ?? 64) * (Number.isFinite(block.scaleY) ? block.scaleY : 1);
  }

  if (block.type === "filter") {
    return 70;
  }

  if (Number.isFinite(block.h)) {
    return block.h;
  }

  if (block.type === "text") {
    const textBlock = normalizeTextBlock(block);
    const lines = Math.max(1, String(textBlock.text || "").split(/\r?\n/).length);
    const fontSize = textBlock.fontSize ?? textBlock.segments?.[0]?.fontSize ?? 16;
    const scaleY = Number.isFinite(textBlock.scaleY) ? textBlock.scaleY : 1;
    return Math.max(28, lines * fontSize * 1.35 * scaleY + 8);
  }

  return 50;
}

function withBlockDefaults(block) {
  const normalizedBlock = block?.type === "text" ? normalizeTextBlock(block) : block;
  const withDefaults = {
    ...normalizedBlock,
    zIndex: Number.isFinite(normalizedBlock?.zIndex) ? normalizedBlock.zIndex : 1,
  };

  if (withDefaults?.type === "text") {
    const textGradient = getBlockGradientConfig(withDefaults);

    return withHoverDefaults({
      ...withDefaults,
      scaleX: Number.isFinite(withDefaults.scaleX) ? withDefaults.scaleX : 1,
      scaleY: Number.isFinite(withDefaults.scaleY) ? withDefaults.scaleY : 1,
      fillType: "gradient",
      gradientStart: textGradient.start,
      gradientEnd: textGradient.end,
      gradientAngle: textGradient.angle,
      gradient: buildLinearGradient(textGradient.angle, textGradient.start, textGradient.end),
    });
  }

  if (withDefaults?.type === "box") {
    const blockGradient = getBlockGradientConfig(withDefaults);
    return withHoverDefaults({
      ...withDefaults,
      fillType: withDefaults.fillType ?? "gradient",
      gradientStart: blockGradient.start,
      gradientEnd: blockGradient.end,
      gradientAngle: blockGradient.angle,
      gradient: buildLinearGradient(blockGradient.angle, blockGradient.start, blockGradient.end),
      opacity: Number.isFinite(withDefaults.opacity) ? withDefaults.opacity : 0.92,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 12,
    });
  }

  if (withDefaults?.type === "image" || withDefaults?.type === "imageLink") {
    return withHoverDefaults({
      ...withDefaults,
      overlayEnabled: withDefaults.overlayEnabled ?? false,
      overlayColor: withDefaults.overlayColor ?? "#000000",
      overlayOpacity: Number.isFinite(withDefaults.overlayOpacity)
        ? withDefaults.overlayOpacity
        : 0.18,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 12,
    });
  }

  if (withDefaults?.type === "button") {
    return withHoverDefaults({
      ...withDefaults,
      label: withDefaults.label ?? "Click me",
      url: withDefaults.url ?? "https://",
      newTab: withDefaults.newTab ?? false,
      bgColor: withDefaults.bgColor ?? "#4f46e5",
      textColor: withDefaults.textColor ?? "#ffffff",
      fontSize: Number.isFinite(withDefaults.fontSize) ? withDefaults.fontSize : 16,
      fontStyle: withDefaults.fontStyle ?? "bold",
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 8,
      paddingX: Number.isFinite(withDefaults.paddingX) ? withDefaults.paddingX : 24,
      paddingY: Number.isFinite(withDefaults.paddingY) ? withDefaults.paddingY : 12,
    });
  }

  if (withDefaults?.type === "video") {
    return withHoverDefaults({
      ...withDefaults,
      src: withDefaults.src ?? "",
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 560,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : 315,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 8,
    });
  }

  if (withDefaults?.type === "gallery") {
    return withHoverDefaults({
      ...withDefaults,
      images: Array.isArray(withDefaults.images) ? withDefaults.images : [],
      columns: Number.isFinite(withDefaults.columns) ? withDefaults.columns : 3,
      gap: Number.isFinite(withDefaults.gap) ? withDefaults.gap : 8,
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 600,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : 400,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 8,
    });
  }

  if (withDefaults?.type === "countdown") {
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return withHoverDefaults({
      ...withDefaults,
      targetDate: withDefaults.targetDate ?? thirtyDays,
      label: withDefaults.label ?? "Until the event",
      textColor: withDefaults.textColor ?? "#ffffff",
      bgColor: withDefaults.bgColor ?? "transparent",
      fontSize: Number.isFinite(withDefaults.fontSize) ? withDefaults.fontSize : 32,
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 420,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : 130,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 12,
    });
  }

  if (withDefaults?.type === "quote") {
    return withHoverDefaults({
      ...withDefaults,
      text: withDefaults.text ?? '"This is a great experience."',
      author: withDefaults.author ?? "Student name",
      role: withDefaults.role ?? "Student",
      textColor: withDefaults.textColor ?? "#ffffff",
      authorColor: withDefaults.authorColor ?? "#a0a0a0",
      accentColor: withDefaults.accentColor ?? "#4f46e5",
      bgColor: withDefaults.bgColor ?? "rgba(255,255,255,0.05)",
      fontSize: Number.isFinite(withDefaults.fontSize) ? withDefaults.fontSize : 16,
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 420,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : 200,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 12,
    });
  }

  if (withDefaults?.type === "flipCard") {
    return withHoverDefaults({
      ...withDefaults,
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 300,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : 200,
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 12,
      frontBlocks: Array.isArray(withDefaults.frontBlocks) ? withDefaults.frontBlocks : [],
      frontBgColor: withDefaults.frontBgColor ?? "transparent",
      frontBorderEnabled: withDefaults.frontBorderEnabled ?? false,
      frontBorderWidth: Number.isFinite(withDefaults.frontBorderWidth)
        ? withDefaults.frontBorderWidth
        : 2,
      frontBorderColor: withDefaults.frontBorderColor ?? "#ffffff",
      frontBorderStyle: withDefaults.frontBorderStyle ?? "solid",
      backBlocks: Array.isArray(withDefaults.backBlocks) ? withDefaults.backBlocks : [],
      backText: withDefaults.backText ?? "Description",
      backBgColor: withDefaults.backBgColor ?? "#1a1a2e",
      backTextColor: withDefaults.backTextColor ?? "#ffffff",
      backFontSize: Number.isFinite(withDefaults.backFontSize) ? withDefaults.backFontSize : 18,
      flipDuration: Number.isFinite(withDefaults.flipDuration) ? withDefaults.flipDuration : 0.6,
      backBorderEnabled: withDefaults.backBorderEnabled ?? false,
      backBorderWidth: Number.isFinite(withDefaults.backBorderWidth)
        ? withDefaults.backBorderWidth
        : 2,
      backBorderColor: withDefaults.backBorderColor ?? "#ffffff",
      backBorderStyle: withDefaults.backBorderStyle ?? "solid",
    });
  }

  if (withDefaults?.type === "filter") {
    return withHoverDefaults({
      ...withDefaults,
      chipActiveBg: withDefaults.chipActiveBg ?? "#ffffff",
      chipActiveColor: withDefaults.chipActiveColor ?? "#0a0a0a",
      chipInactiveBg: withDefaults.chipInactiveBg ?? "rgba(255,255,255,0.06)",
      chipInactiveColor: withDefaults.chipInactiveColor ?? "rgba(255,255,255,0.7)",
      chipBorderColor: withDefaults.chipBorderColor ?? "rgba(255,255,255,0.15)",
      chipActiveBorderColor: withDefaults.chipActiveBorderColor ?? "#ffffff",
      chipBorderRadius: Number.isFinite(withDefaults.chipBorderRadius)
        ? withDefaults.chipBorderRadius
        : 999,
      chipFontSize: Number.isFinite(withDefaults.chipFontSize) ? withDefaults.chipFontSize : 13,
      chipPaddingX: Number.isFinite(withDefaults.chipPaddingX) ? withDefaults.chipPaddingX : 14,
      chipPaddingY: Number.isFinite(withDefaults.chipPaddingY) ? withDefaults.chipPaddingY : 7,
      chipGap: Number.isFinite(withDefaults.chipGap) ? withDefaults.chipGap : 8,
      showCount: withDefaults.showCount ?? true,
      containerBg: withDefaults.containerBg ?? "transparent",
      containerPadding: Number.isFinite(withDefaults.containerPadding)
        ? withDefaults.containerPadding
        : 0,
      containerBorderRadius: Number.isFinite(withDefaults.containerBorderRadius)
        ? withDefaults.containerBorderRadius
        : 0,
    });
  }

  if (withDefaults?.type === "group") {
    return withHoverDefaults({
      ...withDefaults,
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 300,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : 200,
      blocks: Array.isArray(withDefaults.blocks) ? withDefaults.blocks : [],
      borderRadius: Number.isFinite(withDefaults.borderRadius) ? withDefaults.borderRadius : 0,
    });
  }

  if (withDefaults?.type === "emoji") {
    return withHoverDefaults({
      ...withDefaults,
      emoji: withDefaults.emoji ?? "✨",
      fontSize: Number.isFinite(withDefaults.fontSize) ? withDefaults.fontSize : 64,
    });
  }

  if (withDefaults?.type === "shape") {
    const lineTypes = ["line", "diagonal", "zigzag", "wave", "dashed"];
    const st = withDefaults.shapeType ?? "circle";
    return withHoverDefaults({
      ...withDefaults,
      w: Number.isFinite(withDefaults.w) ? withDefaults.w : 200,
      h: Number.isFinite(withDefaults.h) ? withDefaults.h : lineTypes.includes(st) ? 60 : 200,
      shapeType: st,
      strokeColor: withDefaults.strokeColor ?? "#ffffff",
      strokeWidth: Number.isFinite(withDefaults.strokeWidth) ? withDefaults.strokeWidth : 3,
      fillColor: withDefaults.fillColor ?? "#4f46e5",
      fillEnabled: withDefaults.fillEnabled ?? !lineTypes.includes(st),
      opacity: Number.isFinite(withDefaults.opacity) ? withDefaults.opacity : 1,
    });
  }

  return withHoverDefaults(withDefaults);
}

export function useEditorLogic(slug) {
  const [page, setPage] = useState(null);
  const [title, setTitle] = useState("");
  const [navLabel, setNavLabel] = useState("");
  const [backgroundType, setBackgroundType] = useState("transparent");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [backgroundGradient, setBackgroundGradient] = useState(
    "linear-gradient(135deg, #2a2424 0%, #433a68 100%)"
  );
  const [backgroundGradientStart, setBackgroundGradientStart] = useState("#2a2424");
  const [backgroundGradientEnd, setBackgroundGradientEnd] = useState("#433a68");
  const [backgroundGradientAngle, setBackgroundGradientAngle] = useState(135);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlayColor, setOverlayColor] = useState("#000000");
  const [overlayOpacity, setOverlayOpacity] = useState(0.25);
  const [bottomPadding, setBottomPadding] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [rotating, setRotating] = useState(null);

  const [flipBackEditId, setFlipBackEditId] = useState<string | null>(null);
  const [selectedBackBlockId, setSelectedBackBlockId] = useState<string | null>(null);

  const [modes, setModes] = useState({
    text: false,
    box: false,
    image: false,
    imageLink: false,
    link: false,
    filter: false,
    button: false,
    countdown: false,
    quote: false,
    shape: false,
    emoji: false,
  });

  const [pendingShapeType, setPendingShapeType] = useState("circle");

  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);

  const [textColor, setTextColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#5b4cf0");
  const [linkColor, setLinkColor] = useState("#60a5fa");

  const [defaultFontStyle, setDefaultFontStyle] = useState("normal");
  const [showInNav, setShowInNav] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("");

  const [pendingLink, setPendingLink] = useState({
    label: "New link",
    url: "https://",
  });

  const historyRef = useRef([]);
  const redoHistoryRef = useRef([]);
  const interactionHistoryRef = useRef({
    draggingId: null,
    resizingId: null,
    rotatingId: null,
  });
  const pastePointRef = useRef({ x: 100, y: 100 });
  const multiDragOffsetsRef = useRef({});

  const getNextZIndex = useCallback(
    () =>
      blocks.reduce(
        (highest, block) => Math.max(highest, Number.isFinite(block?.zIndex) ? block.zIndex : 1),
        1
      ) + 1,
    [blocks]
  );

  const createTextBlockData = useCallback(
    (text, x = 100, y = 100, style = {}) => {
      const id = uid();
      const start = style.gradientStart || style.color || textColor;
      const end = style.gradientEnd || start;
      const angle = Number.isFinite(style.gradientAngle) ? style.gradientAngle : 135;
      const fontSize = Number.isFinite(style.fontSize) ? style.fontSize : 24;
      const fontStyle = style.fontStyle || defaultFontStyle;
      const fontFamily = style.fontFamily || "inherit";

      return withBlockDefaults({
        id,
        type: "text",
        x,
        y,
        zIndex: getNextZIndex(),
        filterTag: "",
        text,
        w: Number.isFinite(style.w) ? style.w : 420,
        fontSize,
        color: start,
        fillType: "gradient",
        gradientStart: start,
        gradientEnd: end,
        gradientAngle: angle,
        gradient: buildLinearGradient(angle, start, end),
        fontStyle,
        fontFamily,
        segments: [
          {
            id: uid(),
            text,
            color: start,
            fillType: "gradient",
            gradientStart: start,
            gradientEnd: end,
            gradientAngle: angle,
            fontStyle,
            fontSize,
            fontFamily,
          },
        ],
      });
    },
    [defaultFontStyle, getNextZIndex, textColor]
  );

  const rememberHistory = useCallback(
    (
      snapshot = {
        title,
        navLabel,
        backgroundType,
        backgroundColor,
        backgroundGradient,
        backgroundGradientStart,
        backgroundGradientEnd,
        backgroundGradientAngle,
        overlayEnabled,
        overlayColor,
        overlayOpacity,
        bottomPadding,
        blocks,
        selectedId,
        showInNav,
        backgroundImage,
      }
    ) => {
      setIsDirty(true);
      redoHistoryRef.current = [];
      pushHistoryEntry(historyRef, snapshot);
    },
    [
      backgroundColor,
      backgroundGradient,
      backgroundGradientAngle,
      backgroundGradientEnd,
      backgroundGradientStart,
      backgroundType,
      blocks,
      navLabel,
      overlayColor,
      overlayEnabled,
      overlayOpacity,
      bottomPadding,
      selectedId,
      title,
      showInNav,
      backgroundImage,
    ]
  );

  const captureCurrentSnapshot = useCallback(
    () => ({
      title,
      navLabel,
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundGradientStart,
      backgroundGradientEnd,
      backgroundGradientAngle,
      overlayEnabled,
      overlayColor,
      overlayOpacity,
      bottomPadding,
      blocks,
      selectedId,
      showInNav,
      backgroundImage,
    }),
    [
      title,
      navLabel,
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundGradientStart,
      backgroundGradientEnd,
      backgroundGradientAngle,
      overlayEnabled,
      overlayColor,
      overlayOpacity,
      bottomPadding,
      blocks,
      selectedId,
      showInNav,
      backgroundImage,
    ]
  );

  function restoreSnapshot(snapshot) {
    if (!snapshot) return;

    setTitle(snapshot.title ?? "");
    setNavLabel(snapshot.navLabel ?? "");
    setBackgroundType(snapshot.backgroundType ?? "transparent");
    setBackgroundColor(snapshot.backgroundColor ?? "transparent");
    setBackgroundGradient(
      snapshot.backgroundGradient ?? "linear-gradient(135deg, #2a2424 0%, #433a68 100%)"
    );
    setBackgroundGradientStart(snapshot.backgroundGradientStart ?? "#2a2424");
    setBackgroundGradientEnd(snapshot.backgroundGradientEnd ?? "#433a68");
    setBackgroundGradientAngle(
      Number.isFinite(snapshot.backgroundGradientAngle) ? snapshot.backgroundGradientAngle : 135
    );
    setOverlayEnabled(snapshot.overlayEnabled ?? false);
    setOverlayColor(snapshot.overlayColor ?? "#000000");
    setOverlayOpacity(Number.isFinite(snapshot.overlayOpacity) ? snapshot.overlayOpacity : 0.25);
    setBottomPadding(Number.isFinite(snapshot.bottomPadding) ? snapshot.bottomPadding : 0);
    setShowInNav(snapshot.showInNav ?? true);
    setBackgroundImage(snapshot.backgroundImage ?? "");
    setBlocks(
      Array.isArray(snapshot.blocks) ? snapshot.blocks.map((block) => withBlockDefaults(block)) : []
    );
    setSelectedId(snapshot.selectedId ?? null);
    setDragging(null);
    setResizing(null);
    setFlipBackEditId(null);
    setSelectedBackBlockId(null);
    setModes({
      text: false,
      box: false,
      image: false,
      imageLink: false,
      link: false,
      filter: false,
      button: false,
      countdown: false,
      quote: false,
      shape: false,
      emoji: false,
    });
  }

  useEffect(() => {
    async function loadPage() {
      let p = await getPage(slug);

      if (!p && slug === "home") {
        const created = await addPage({
          title: "Home",
          slug: "home",
        });

        if (created.ok) {
          p = created.page;
        }
      }

      if (!p && slug === "__footer__") {
        const created = await addPage({
          title: "Footer",
          slug: "__footer__",
          showInNav: false,
        });

        if (created.ok) {
          p = created.page;
        }
      }

      setPage(p || null);

      if (!p) return;

      historyRef.current = [];
      redoHistoryRef.current = [];
      interactionHistoryRef.current = {
        draggingId: null,
        resizingId: null,
        rotatingId: null,
      };
      setTitle(p.title || "");
      setNavLabel(p.navLabel || p.title || "");
      const pageGradient = getPageGradientConfig(p);
      setBackgroundType(p.backgroundType || "transparent");
      setBackgroundColor(p.backgroundColor || "transparent");
      setBackgroundGradient(
        p.backgroundGradient ||
          buildLinearGradient(pageGradient.angle, pageGradient.start, pageGradient.end)
      );
      setBackgroundGradientStart(pageGradient.start);
      setBackgroundGradientEnd(pageGradient.end);
      setBackgroundGradientAngle(pageGradient.angle);
      setOverlayEnabled(!!p.overlayEnabled);
      setOverlayColor(p.overlayColor || "#000000");
      setOverlayOpacity(Number.isFinite(p.overlayOpacity) ? p.overlayOpacity : 0.25);
      setBottomPadding(Number.isFinite(p.bottomPadding) ? p.bottomPadding : 0);
      setShowInNav(p.showInNav ?? true);
      setBackgroundImage(p.backgroundImage ?? "");
      setBlocks(Array.isArray(p.blocks) ? p.blocks.map((block) => withBlockDefaults(block)) : []);
    }

    loadPage();
  }, [slug]);

  useEffect(() => {
    function handleKeyDown(e) {
      const activeElement = document.activeElement;
      const tag = document.activeElement?.tagName;
      const isClipboardShortcut = e.ctrlKey || e.metaKey;
      const selectedBlock = selectedId ? blocks.find((block) => block.id === selectedId) : null;
      const selection = window.getSelection();
      const hasSelectedText =
        !!selection &&
        selection.rangeCount > 0 &&
        !selection.isCollapsed &&
        String(selection.toString() || "").length > 0;
      const isEditingSelectedTextBlock =
        activeElement?.isContentEditable && selectedBlock?.type === "text";

      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || activeElement?.isContentEditable;

      if (
        isClipboardShortcut &&
        isEditingSelectedTextBlock &&
        !hasSelectedText &&
        (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "x")
      ) {
        e.preventDefault();
        writeBlockClipboard(selectedBlock);

        if (e.key.toLowerCase() === "x") {
          rememberHistory();
          setBlocks((prev) => prev.filter((item) => item.id !== selectedId));
          setSelectedId(null);
        }
        return;
      }

      if (e.key === "Escape" && flipBackEditId) {
        setFlipBackEditId(null);
        setSelectedBackBlockId(null);
        return;
      }

      if (isTyping) return;

      if (isClipboardShortcut && e.key.toLowerCase() === "z" && !e.shiftKey) {
        const previousSnapshot = popHistoryEntry(historyRef);
        if (!previousSnapshot) return;

        e.preventDefault();
        pushHistoryEntry(redoHistoryRef, captureCurrentSnapshot());
        restoreSnapshot(previousSnapshot);
        return;
      }

      if (
        isClipboardShortcut &&
        (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        const redoSnapshot = popHistoryEntry(redoHistoryRef);
        if (!redoSnapshot) return;

        e.preventDefault();
        pushHistoryEntry(historyRef, captureCurrentSnapshot());
        restoreSnapshot(redoSnapshot);
        return;
      }

      if (!isTyping && selectedIds.length > 1 && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        rememberHistory();
        const idsToRemove = new Set(selectedIds);
        setBlocks((prev) => prev.filter((b) => !idsToRemove.has(b.id)));
        setSelectedId(null);
        setSelectedIds([]);
        return;
      }

      if (
        !isTyping &&
        selectedIds.length > 1 &&
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight")
      ) {
        e.preventDefault();
        const nudge = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
        const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;
        if (!e.repeat) rememberHistory();
        setBlocks((prev) =>
          prev.map((b) => {
            if (!selectedIds.includes(b.id) || b.locked) return b;
            return { ...b, x: (b.x ?? 0) + dx, y: (b.y ?? 0) + dy };
          })
        );
        return;
      }

      if (
        !isTyping &&
        selectedId &&
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight")
      ) {
        const block = blocks.find((b) => b.id === selectedId);
        if (block && !block.locked) {
          e.preventDefault();
          const nudge = e.shiftKey ? 10 : 1;
          const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
          const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;
          if (!e.repeat) rememberHistory();
          setBlocks((prev) =>
            prev.map((b) =>
              b.id === selectedId ? { ...b, x: (b.x ?? 0) + dx, y: (b.y ?? 0) + dy } : b
            )
          );
        }
        return;
      }

      if (isClipboardShortcut && e.key.toLowerCase() === "v") {
        if (!hasClipboardContent()) return;

        e.preventDefault();
        const pastePoint = pastePointRef.current || { x: 100, y: 100 };

        const pastedBlock = readPastedBlock();
        if (pastedBlock) {
          rememberHistory();
          const nextBlock = withBlockDefaults({
            ...pastedBlock,
            x: Number.isFinite(pastePoint.x) ? pastePoint.x : pastedBlock.x,
            y: Number.isFinite(pastePoint.y) ? pastePoint.y : pastedBlock.y,
            zIndex: getNextZIndex(),
          });
          setBlocks((prev) => [...prev, nextBlock]);
          setSelectedId(nextBlock.id);
          return;
        }

        const pastedText = readTextClipboard();
        if (!pastedText?.text) return;

        const nextBlock = createTextBlockData(
          pastedText.text,
          Number.isFinite(pastePoint.x) ? pastePoint.x : 100,
          Number.isFinite(pastePoint.y) ? pastePoint.y : 100,
          pastedText.style
        );

        rememberHistory();
        setBlocks((prev) => [...prev, nextBlock]);
        setSelectedId(nextBlock.id);
        return;
      }

      if (
        !isTyping &&
        selectedBackBlockId &&
        flipBackEditId &&
        (e.key === "Delete" || e.key === "Backspace")
      ) {
        e.preventDefault();
        rememberHistory();
        setBlocks((prev) =>
          prev.map((b) => {
            if (b.id !== flipBackEditId) return b;
            return {
              ...b,
              backBlocks: (b.backBlocks ?? []).filter((bb: any) => bb.id !== selectedBackBlockId),
            };
          })
        );
        setSelectedBackBlockId(null);
        return;
      }

      if (!selectedId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        rememberHistory();
        setBlocks((prev) => prev.filter((b) => b.id !== selectedId));
        setSelectedId(null);
        return;
      }

      if (!selectedBlock || !isClipboardShortcut) return;

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        writeBlockClipboard(selectedBlock);
      }

      if (e.key.toLowerCase() === "x") {
        e.preventDefault();
        writeBlockClipboard(selectedBlock);
        rememberHistory();
        setBlocks((prev) => prev.filter((b) => b.id !== selectedId));
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    blocks,
    captureCurrentSnapshot,
    createTextBlockData,
    flipBackEditId,
    getNextZIndex,
    rememberHistory,
    selectedBackBlockId,
    selectedId,
    selectedIds,
  ]);

  const selected = useMemo(
    () => blocks.find((b) => b.id === selectedId) || null,
    [blocks, selectedId]
  );

  const selectedBackBlock = useMemo(() => {
    if (!flipBackEditId || !selectedBackBlockId) return null;
    const flipCard = blocks.find((b) => b.id === flipBackEditId);
    return (flipCard?.backBlocks ?? []).find((b: any) => b.id === selectedBackBlockId) ?? null;
  }, [blocks, flipBackEditId, selectedBackBlockId]);

  const canvasHeight =
    Math.max(
      900,
      ...blocks.map((b) => {
        const y = b?.y ?? 0;
        const h =
          b?.type === "box" ||
          b?.type === "image" ||
          b?.type === "imageLink" ||
          b?.type === "flipCard" ||
          b?.type === "video" ||
          b?.type === "gallery" ||
          b?.type === "countdown" ||
          b?.type === "quote" ||
          b?.type === "shape" ||
          b?.type === "group"
            ? (b?.h ?? 0)
            : b?.type === "text"
              ? Math.max(b?.h ?? 0, (b?.fontSize ?? 20) * 3)
              : b?.type === "filter"
                ? 70
                : 0;

        return y + h + 200;
      })
    ) + 600;

  const actions = {
    setMode: (m) =>
      setModes({
        text: m === "text",
        box: m === "box",
        image: m === "image",
        imageLink: m === "imageLink",
        link: m === "link",
        filter: m === "filter",
        button: m === "button",
        countdown: m === "countdown",
        quote: m === "quote",
        shape: m === "shape",
        emoji: m === "emoji",
      }),

    setShapeMode: (shapeType) => {
      setPendingShapeType(shapeType);
      setModes({
        text: false,
        box: false,
        image: false,
        imageLink: false,
        link: false,
        filter: false,
        button: false,
        countdown: false,
        quote: false,
        shape: true,
        emoji: false,
      });
    },

    updateSelected: (patch) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedId
            ? withBlockDefaults(
                b.type === "text" ? applyTextBlockStylePatch(b, patch) : { ...b, ...patch }
              )
            : b
        )
      );
    },

    updateBlockById: (blockId, patch) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? withBlockDefaults(
                block.type === "text"
                  ? applyTextBlockStylePatch(block, patch)
                  : { ...block, ...patch }
              )
            : block
        )
      );
    },

    updateInlineContent: (id, newContent, field) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? withBlockDefaults({ ...b, [field]: newContent }) : b))
      );
    },

    updateTextSegment: (blockId, segmentId, patch) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId || block.type !== "text") {
            return block;
          }

          const normalizedBlock = normalizeTextBlock(block);
          const nextSegments = normalizedBlock.segments.map((segment) =>
            segment.id === segmentId ? { ...segment, ...patch } : segment
          );

          return withBlockDefaults({
            ...normalizedBlock,
            segments: normalizeTextSegments(nextSegments, normalizedBlock),
          });
        })
      );
    },

    updateTextSegmentsStyle: (blockId, patch) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId || block.type !== "text") {
            return block;
          }

          const normalizedBlock = normalizeTextBlock(block);
          const nextSegments = normalizedBlock.segments.map((segment) => ({
            ...segment,
            ...patch,
          }));

          return withBlockDefaults({
            ...normalizedBlock,
            segments: normalizeTextSegments(nextSegments, normalizedBlock),
            ...patch,
          });
        })
      );
    },

    applyTextSelectionStyle: (blockId, selectionStart, selectionEnd, patch) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId || block.type !== "text") {
            return block;
          }

          return withBlockDefaults(
            applyTextSelectionPatch(block, selectionStart, selectionEnd, patch)
          );
        })
      );
    },

    addTextSegment: (blockId) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId || block.type !== "text") {
            return block;
          }

          const normalizedBlock = normalizeTextBlock(block);
          const lastSegment = normalizedBlock.segments[normalizedBlock.segments.length - 1];

          return withBlockDefaults({
            ...normalizedBlock,
            segments: [
              ...normalizedBlock.segments,
              {
                id: uid(),
                text: "Accent text",
                color: lastSegment?.color || normalizedBlock.color || "#ffffff",
                fontStyle: lastSegment?.fontStyle || normalizedBlock.fontStyle || "normal",
              },
            ],
          });
        })
      );
    },

    removeTextSegment: (blockId, segmentId) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId || block.type !== "text") {
            return block;
          }

          const normalizedBlock = normalizeTextBlock(block);
          const remainingSegments = normalizedBlock.segments.filter(
            (segment) => segment.id !== segmentId
          );

          return withBlockDefaults({
            ...normalizedBlock,
            segments: normalizeTextSegments(remainingSegments, normalizedBlock),
          });
        })
      );
    },

    deleteBlock: (id) => {
      rememberHistory();
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      setSelectedId(null);
    },

    copyBlock: (id = selectedId) => {
      const block = blocks.find((item) => item.id === id);
      if (!block) return false;
      return writeBlockClipboard(block);
    },

    cutBlock: (id = selectedId) => {
      const block = blocks.find((item) => item.id === id);
      if (!block) return false;

      writeBlockClipboard(block);
      rememberHistory();
      setBlocks((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      return true;
    },

    pasteBlockAt: (x, y) => {
      const pastedBlock = readPastedBlock();
      if (!pastedBlock) return false;

      const nextBlock = withBlockDefaults({
        ...pastedBlock,
        x: Number.isFinite(x) ? x : pastedBlock.x,
        y: Number.isFinite(y) ? y : pastedBlock.y,
        zIndex: getNextZIndex(),
      });

      rememberHistory();
      setBlocks((prev) => [...prev, nextBlock]);
      setSelectedId(nextBlock.id);
      return true;
    },

    pasteClipboardAt: (x, y) => {
      const pastedBlock = readPastedBlock();
      if (pastedBlock) {
        const nextBlock = withBlockDefaults({
          ...pastedBlock,
          x: Number.isFinite(x) ? x : pastedBlock.x,
          y: Number.isFinite(y) ? y : pastedBlock.y,
          zIndex: getNextZIndex(),
        });

        rememberHistory();
        setBlocks((prev) => [...prev, nextBlock]);
        setSelectedId(nextBlock.id);
        return true;
      }

      const pastedText = readTextClipboard();
      if (!pastedText?.text) {
        return false;
      }

      const nextBlock = createTextBlockData(
        pastedText.text,
        Number.isFinite(x) ? x : 100,
        Number.isFinite(y) ? y : 100,
        pastedText.style
      );

      rememberHistory();
      setBlocks((prev) => [...prev, nextBlock]);
      setSelectedId(nextBlock.id);
      return true;
    },

    save: async () => {
      const result = await updatePage(slug, {
        title,
        navLabel,
        showInNav,
        backgroundType,
        backgroundColor,
        backgroundImage,
        backgroundGradient,
        backgroundGradientStart,
        backgroundGradientEnd,
        backgroundGradientAngle,
        overlayEnabled,
        overlayColor,
        overlayOpacity,
        bottomPadding,
        blocks,
      });
      if (result?.ok) setIsDirty(false);
      return result;
    },

    createBlock: (type, x, y) => {
      const id = uid();

      // In back-edit mode, create block inside the flip card's backBlocks
      if (flipBackEditId) {
        const flipCard = blocks.find((b) => b.id === flipBackEditId);
        if (!flipCard) return;
        const backBlocks = flipCard.backBlocks ?? [];
        const bZIndex =
          backBlocks.reduce((h: number, bb: any) => Math.max(h, bb.zIndex ?? 1), 1) + 1;
        let nb: any = { id, type, x, y, zIndex: bZIndex, filterTag: "" };
        if (type === "text") nb = { ...createTextBlockData("New text", x, y), id, zIndex: bZIndex };
        if (type === "box")
          nb = {
            ...nb,
            w: 200,
            h: 120,
            color: "#5b4cf0",
            fillType: "gradient",
            gradientStart: "#5b4cf0",
            gradientEnd: "#22d3ee",
            gradientAngle: 135,
            gradient: buildLinearGradient(135, "#5b4cf0", "#22d3ee"),
            opacity: 0.92,
            borderRadius: 12,
          };
        if (type === "emoji") nb = { ...nb, emoji: "✨", fontSize: 64 };
        if (type === "button")
          nb = {
            ...nb,
            label: "Click me",
            url: "https://",
            newTab: false,
            bgColor: "#4f46e5",
            textColor: "#ffffff",
            fontSize: 16,
            fontStyle: "bold",
            borderRadius: 8,
            paddingX: 24,
            paddingY: 12,
          };
        if (type === "shape") {
          const st = pendingShapeType || "circle";
          const lineTypes = ["line", "diagonal", "zigzag", "wave", "dashed"];
          nb = {
            ...nb,
            w: 150,
            h: lineTypes.includes(st) ? 50 : 150,
            shapeType: st,
            strokeColor: "#ffffff",
            strokeWidth: 3,
            fillColor: "#4f46e5",
            fillEnabled: !lineTypes.includes(st),
            opacity: 1,
          };
        }
        const finalNb = withBlockDefaults(nb);
        rememberHistory();
        setBlocks((prev) =>
          prev.map((fc) =>
            fc.id !== flipBackEditId
              ? fc
              : { ...fc, backBlocks: [...(fc.backBlocks ?? []), finalNb] }
          )
        );
        setSelectedBackBlockId(id);
        setModes({
          text: false,
          box: false,
          image: false,
          imageLink: false,
          link: false,
          filter: false,
          button: false,
          countdown: false,
          quote: false,
          shape: false,
          emoji: false,
        });
        return;
      }

      const zIndex = getNextZIndex();

      let b = { id, type, x, y, zIndex, filterTag: "" };

      if (type === "text") {
        b = createTextBlockData("New text", x, y);
      }

      if (type === "box") {
        b = {
          ...b,
          w: 200,
          h: 120,
          color: boxColor,
          fillType: "gradient",
          gradientStart: boxColor,
          gradientEnd: "#22d3ee",
          gradientAngle: 135,
          gradient: buildLinearGradient(135, boxColor, "#22d3ee"),
          opacity: 0.92,
          borderRadius: 12,
        };
      }

      if (type === "link") {
        b = {
          ...b,
          label: pendingLink.label,
          url: pendingLink.url,
          fontSize: 20,
          color: linkColor,
          underline: false,
          fontStyle: defaultFontStyle,
        };
      }

      if (type === "filter") {
        b = {
          ...b,
          label: "Filter",
          options: ["all", "solo-flat", "shared-flat", "studio"],
          selected: "all",
          filterGroup: b.id,
          width: 220,
        };
      }

      if (type === "button") {
        b = {
          ...b,
          label: "Click me",
          url: "https://",
          newTab: false,
          bgColor: "#4f46e5",
          textColor: "#ffffff",
          fontSize: 16,
          fontStyle: "bold",
          borderRadius: 8,
          paddingX: 24,
          paddingY: 12,
        };
      }

      if (type === "countdown") {
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        b = {
          ...b,
          targetDate: thirtyDays,
          label: "Until the event",
          textColor: "#ffffff",
          bgColor: "transparent",
          fontSize: 32,
          w: 420,
          h: 130,
          borderRadius: 12,
        };
      }

      if (type === "quote") {
        b = {
          ...b,
          text: '"This is a great experience."',
          author: "Student name",
          role: "Student",
          textColor: "#ffffff",
          authorColor: "#a0a0a0",
          accentColor: "#4f46e5",
          bgColor: "rgba(255,255,255,0.05)",
          fontSize: 16,
          w: 420,
          h: 200,
          borderRadius: 12,
        };
      }

      if (type === "shape") {
        const lineTypes = ["line", "diagonal", "zigzag", "wave", "dashed"];
        const st = pendingShapeType || "circle";
        b = {
          ...b,
          w: 200,
          h: lineTypes.includes(st) ? 60 : 200,
          shapeType: st,
          strokeColor: "#ffffff",
          strokeWidth: 3,
          fillColor: "#4f46e5",
          fillEnabled: !lineTypes.includes(st),
          opacity: 1,
        };
      }

      if (type === "emoji") {
        b = { ...b, emoji: "✨", fontSize: 64 };
      }

      const finalBlock = withBlockDefaults(b);

      rememberHistory();
      setBlocks((prev) => [...prev, finalBlock]);
      setSelectedId(id);

      setModes({
        text: false,
        box: false,
        image: false,
        imageLink: false,
        link: false,
        filter: false,
        button: false,
        countdown: false,
        quote: false,
        shape: false,
        emoji: false,
      });
    },

    addImage: (src, x, y) => {
      const id = uid();

      const imageBlock = withHoverDefaults({
        id,
        type: "image",
        x,
        y,
        zIndex: getNextZIndex(),
        src,
        w: 300,
        h: 200,
        borderRadius: 12,
        overlayEnabled: false,
        overlayColor: "#000000",
        overlayOpacity: 0.18,
        filterTag: "",
      });

      rememberHistory();
      setBlocks((prev) => [...prev, imageBlock]);
      setSelectedId(id);
    },

    addImageLink: (src, x, y) => {
      const id = uid();

      const imageLinkBlock = withHoverDefaults({
        id,
        type: "imageLink",
        x,
        y,
        zIndex: getNextZIndex(),
        src,
        url: "https://",
        w: 300,
        h: 200,
        borderRadius: 12,
        overlayEnabled: false,
        overlayColor: "#000000",
        overlayOpacity: 0.18,
        filterTag: "",
      });

      rememberHistory();
      setBlocks((prev) => [...prev, imageLinkBlock]);
      setSelectedId(id);
    },

    addVideo: (src, x, y) => {
      const id = uid();
      const videoBlock = withBlockDefaults({
        id,
        type: "video",
        x,
        y,
        zIndex: getNextZIndex(),
        src,
        w: 560,
        h: 315,
        borderRadius: 8,
        filterTag: "",
      });
      rememberHistory();
      setBlocks((prev) => [...prev, videoBlock]);
      setSelectedId(id);
    },

    addGalleryImages: (images, x, y) => {
      const id = uid();
      const galleryBlock = withBlockDefaults({
        id,
        type: "gallery",
        x,
        y,
        zIndex: getNextZIndex(),
        images,
        columns: 3,
        gap: 8,
        w: 600,
        h: 400,
        borderRadius: 8,
        filterTag: "",
      });
      rememberHistory();
      setBlocks((prev) => [...prev, galleryBlock]);
      setSelectedId(id);
    },

    duplicateBlock: (id = selectedId) => {
      const block = blocks.find((item) => item.id === id);
      if (!block) return;
      const newId = uid();
      const duplicated = withBlockDefaults({
        ...block,
        id: newId,
        x: (block.x ?? 0) + 24,
        y: (block.y ?? 0) + 24,
        zIndex: getNextZIndex(),
      });
      rememberHistory();
      setBlocks((prev) => [...prev, duplicated]);
      setSelectedId(newId);
    },

    createFlipCardFromSelection: (ids: string[]) => {
      const selectedBlocks = blocks.filter((b) => ids.includes(b.id));
      if (selectedBlocks.length === 0) return;

      const getW = (b) =>
        b.type === "emoji"
          ? (b.fontSize ?? 64)
          : (b.w ?? (b.type === "filter" ? (b.width ?? 220) : 200));
      const getH = (b) =>
        b.type === "emoji"
          ? (b.fontSize ?? 64)
          : (b.h ?? (b.type === "text" ? 40 : b.type === "filter" ? 70 : 50));

      const minX = Math.min(...selectedBlocks.map((b) => b.x ?? 0));
      const minY = Math.min(...selectedBlocks.map((b) => b.y ?? 0));
      const maxX = Math.max(...selectedBlocks.map((b) => (b.x ?? 0) + getW(b)));
      const maxY = Math.max(...selectedBlocks.map((b) => (b.y ?? 0) + getH(b)));

      const containerW = Math.max(maxX - minX, 100);
      const containerH = Math.max(maxY - minY, 60);

      const frontBlocks = selectedBlocks.map((b) => ({
        ...b,
        x: (b.x ?? 0) - minX,
        y: (b.y ?? 0) - minY,
      }));

      const id = uid();
      const flipCard = withBlockDefaults({
        id,
        type: "flipCard",
        x: minX,
        y: minY,
        w: containerW,
        h: containerH,
        zIndex: getNextZIndex(),
        frontBlocks,
        backText: "Description",
        backBgColor: "#1a1a2e",
        backTextColor: "#ffffff",
        backFontSize: 18,
        flipDuration: 0.6,
        borderRadius: 12,
        filterTag: "",
      });

      rememberHistory();
      setBlocks((prev) => [...prev.filter((b) => !ids.includes(b.id)), flipCard]);
      setSelectedId(id);
      setSelectedIds([]);
    },

    decomposeFlipCard: (id: string) => {
      const flipCard = blocks.find((b) => b.id === id);
      if (!flipCard || flipCard.type !== "flipCard") return;

      const restoredBlocks = (flipCard.frontBlocks ?? []).map((fb) => ({
        ...fb,
        x: (fb.x ?? 0) + (flipCard.x ?? 0),
        y: (fb.y ?? 0) + (flipCard.y ?? 0),
      }));

      rememberHistory();
      setBlocks((prev) => [...prev.filter((b) => b.id !== id), ...restoredBlocks]);
      setSelectedId(null);
      setSelectedIds([]);
    },

    enterFlipBackEdit: (id) => {
      setFlipBackEditId(id);
      setSelectedBackBlockId(null);
      setSelectedId(null);
      setSelectedIds([]);
    },

    exitFlipBackEdit: () => {
      setFlipBackEditId(null);
      setSelectedBackBlockId(null);
    },

    selectBackBlock: (id) => {
      setSelectedBackBlockId(id);
    },

    updateBackBlockById: (flipCardId, blockId, patch) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== flipCardId) return b;
          return {
            ...b,
            backBlocks: (b.backBlocks ?? []).map((bb: any) =>
              bb.id === blockId
                ? withBlockDefaults(
                    bb.type === "text" ? applyTextBlockStylePatch(bb, patch) : { ...bb, ...patch }
                  )
                : bb
            ),
          };
        })
      );
    },

    deleteBackBlock: (flipCardId, blockId) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== flipCardId) return b;
          return { ...b, backBlocks: (b.backBlocks ?? []).filter((bb: any) => bb.id !== blockId) };
        })
      );
      setSelectedBackBlockId(null);
    },

    duplicateBackBlock: (flipCardId, blockId) => {
      rememberHistory();
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== flipCardId) return b;
          const bb = (b.backBlocks ?? []).find((x: any) => x.id === blockId);
          if (!bb) return b;
          const newBb = withBlockDefaults({
            ...bb,
            id: uid(),
            x: (bb.x ?? 0) + 16,
            y: (bb.y ?? 0) + 16,
          });
          return { ...b, backBlocks: [...(b.backBlocks ?? []), newBb] };
        })
      );
    },

    groupSelectedBlocks: (ids: string[]) => {
      const selectedBlocks = blocks.filter((b) => ids.includes(b.id));
      if (selectedBlocks.length < 2) return;

      const minX = Math.min(...selectedBlocks.map((b) => b.x ?? 0));
      const minY = Math.min(...selectedBlocks.map((b) => b.y ?? 0));
      const maxX = Math.max(...selectedBlocks.map((b) => (b.x ?? 0) + estimateBlockWidth(b)));
      const maxY = Math.max(...selectedBlocks.map((b) => (b.y ?? 0) + estimateBlockHeight(b)));

      const padding = 12;
      const groupW = Math.max(maxX - minX + padding * 2, 100);
      const groupH = Math.max(maxY - minY + padding * 2, 60);

      const childBlocks = selectedBlocks.map((b) => ({
        ...b,
        x: (b.x ?? 0) - minX + padding,
        y: (b.y ?? 0) - minY + padding,
      }));

      const id = uid();
      const groupBlock = withBlockDefaults({
        id,
        type: "group",
        x: minX - padding,
        y: minY - padding,
        w: groupW,
        h: groupH,
        zIndex: getNextZIndex(),
        blocks: childBlocks,
      });

      rememberHistory();
      setBlocks((prev) => [...prev.filter((b) => !ids.includes(b.id)), groupBlock]);
      setSelectedId(id);
      setSelectedIds([]);
    },

    ungroupBlocks: (id: string) => {
      const groupBlock = blocks.find((b) => b.id === id);
      if (!groupBlock || groupBlock.type !== "group") return;

      const restoredBlocks = (groupBlock.blocks ?? []).map((cb) => ({
        ...cb,
        x: (cb.x ?? 0) + (groupBlock.x ?? 0),
        y: (cb.y ?? 0) + (groupBlock.y ?? 0),
        zIndex: cb.zIndex ?? groupBlock.zIndex,
      }));

      rememberHistory();
      setBlocks((prev) => [...prev.filter((b) => b.id !== id), ...restoredBlocks]);
      setSelectedId(null);
      setSelectedIds([]);
    },

    moveBlockLayer: (blockId, direction) => {
      const sorted = [...blocks].sort(
        (a, b) =>
          (Number.isFinite(a?.zIndex) ? a.zIndex : 1) - (Number.isFinite(b?.zIndex) ? b.zIndex : 1)
      );
      const index = sorted.findIndex((b) => b.id === blockId);
      const neighborIndex = index + direction;
      if (index === -1 || neighborIndex < 0 || neighborIndex >= sorted.length) return;

      const current = sorted[index];
      const neighbor = sorted[neighborIndex];
      const currentZ = Number.isFinite(current.zIndex) ? current.zIndex : 1;
      const neighborZ = Number.isFinite(neighbor.zIndex) ? neighbor.zIndex : 1;

      rememberHistory();
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id === current.id) return { ...block, zIndex: neighborZ };
          if (block.id === neighbor.id) return { ...block, zIndex: currentZ };
          return block;
        })
      );
    },

    alignBlocks: (direction) => {
      if (selectedIds.length < 2) return;
      const targetBlocks = blocks.filter((b) => selectedIds.includes(b.id));
      rememberHistory();
      setBlocks((prev) =>
        prev.map((b) => {
          if (!selectedIds.includes(b.id)) return b;
          switch (direction) {
            case "left":
              return { ...b, x: Math.min(...targetBlocks.map((t) => t.x ?? 0)) };
            case "right":
              return {
                ...b,
                x:
                  Math.max(...targetBlocks.map((t) => (t.x ?? 0) + estimateBlockWidth(t))) -
                  estimateBlockWidth(b),
              };
            case "centerH": {
              const minX = Math.min(...targetBlocks.map((t) => t.x ?? 0));
              const maxRight = Math.max(
                ...targetBlocks.map((t) => (t.x ?? 0) + estimateBlockWidth(t))
              );
              return {
                ...b,
                x: Math.round((minX + maxRight) / 2 - estimateBlockWidth(b) / 2),
              };
            }
            case "top":
              return { ...b, y: Math.min(...targetBlocks.map((t) => t.y ?? 0)) };
            case "bottom":
              return {
                ...b,
                y:
                  Math.max(...targetBlocks.map((t) => (t.y ?? 0) + estimateBlockHeight(t))) -
                  estimateBlockHeight(b),
              };
            case "centerV": {
              const minY = Math.min(...targetBlocks.map((t) => t.y ?? 0));
              const maxBottom = Math.max(
                ...targetBlocks.map((t) => (t.y ?? 0) + estimateBlockHeight(t))
              );
              return {
                ...b,
                y: Math.round((minY + maxBottom) / 2 - estimateBlockHeight(b) / 2),
              };
            }
            default:
              return b;
          }
        })
      );
    },

    distributeBlocks: (axis) => {
      if (selectedIds.length < 3) return;
      const targetBlocks = blocks.filter((b) => selectedIds.includes(b.id));
      rememberHistory();
      if (axis === "horizontal") {
        const sorted = [...targetBlocks].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalW = sorted.reduce((s, b) => s + estimateBlockWidth(b), 0);
        const gap =
          ((last.x ?? 0) + estimateBlockWidth(last) - (first.x ?? 0) - totalW) /
          (sorted.length - 1);
        let cursor = first.x ?? 0;
        const positions = {};
        sorted.forEach((b) => {
          positions[b.id] = cursor;
          cursor += estimateBlockWidth(b) + gap;
        });
        setBlocks((prev) =>
          prev.map((b) =>
            positions[b.id] !== undefined ? { ...b, x: Math.round(positions[b.id]) } : b
          )
        );
      } else {
        const sorted = [...targetBlocks].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalH = sorted.reduce((s, b) => s + estimateBlockHeight(b), 0);
        const gap =
          ((last.y ?? 0) + estimateBlockHeight(last) - (first.y ?? 0) - totalH) /
          (sorted.length - 1);
        let cursor = first.y ?? 0;
        const positions = {};
        sorted.forEach((b) => {
          positions[b.id] = cursor;
          cursor += estimateBlockHeight(b) + gap;
        });
        setBlocks((prev) =>
          prev.map((b) =>
            positions[b.id] !== undefined ? { ...b, y: Math.round(positions[b.id]) } : b
          )
        );
      }
    },

  };

  const setters = {
    setTitle: (value) => {
      rememberHistory();
      setTitle(value);
    },
    setNavLabel: (value) => {
      rememberHistory();
      setNavLabel(value);
    },
    setBackgroundColor: (value) => {
      rememberHistory();
      setBackgroundColor(value);
    },
    setBackgroundType: (value) => {
      rememberHistory();
      setBackgroundType(value);
    },
    setBackgroundGradient: (value) => {
      rememberHistory();
      setBackgroundGradient(value);
    },
    setBackgroundGradientStart: (value) => {
      rememberHistory();
      setBackgroundGradientStart(value);
      setBackgroundGradient(
        buildLinearGradient(backgroundGradientAngle, value, backgroundGradientEnd)
      );
    },
    setBackgroundGradientEnd: (value) => {
      rememberHistory();
      setBackgroundGradientEnd(value);
      setBackgroundGradient(
        buildLinearGradient(backgroundGradientAngle, backgroundGradientStart, value)
      );
    },
    setBackgroundGradientAngle: (value) => {
      const angle = Number.isFinite(Number(value)) ? Number(value) : 135;
      rememberHistory();
      setBackgroundGradientAngle(angle);
      setBackgroundGradient(
        buildLinearGradient(angle, backgroundGradientStart, backgroundGradientEnd)
      );
    },
    setOverlayEnabled: (value) => {
      rememberHistory();
      setOverlayEnabled(value);
    },
    setOverlayColor: (value) => {
      rememberHistory();
      setOverlayColor(value);
    },
    setOverlayOpacity: (value) => {
      rememberHistory();
      setOverlayOpacity(value);
    },
    setBottomPadding: (value) => {
      rememberHistory();
      setBottomPadding(value);
    },
    setSelectedId,
    setTextColor: (color) => {
      setTextColor(color);
    },
    setBoxColor: (color) => {
      setBoxColor(color);
      if (selected?.type === "box") actions.updateSelected({ color });
    },
    setLinkColor: (color) => {
      setLinkColor(color);
      if (selected?.type === "link") actions.updateSelected({ color });
    },
    setDefaultFontStyle,
    setShowInNav: (value) => {
      rememberHistory();
      setShowInNav(value);
    },
    setBackgroundImage: (value) => {
      rememberHistory();
      setBackgroundImage(value);
    },
    clearSelectedIds: () => setSelectedIds([]),
    setPendingLink,
    setPendingShapeType,
    setSnapToGrid,
    setGridSize,
    setPastePoint: (point) => {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        return;
      }

      pastePointRef.current = {
        x: point.x,
        y: point.y,
      };
    },
  };

  const handlers = {
    onWrapperClick: (e, canvasRef) => {
      const p = getCanvasPoint(e, canvasRef.current);

      if (flipBackEditId) {
        const flipCard = blocks.find((b) => b.id === flipBackEditId);
        if (flipCard) {
          const relX = p.x - (flipCard.x ?? 0);
          const relY = p.y - (flipCard.y ?? 0);
          const fcW = flipCard.w ?? 300;
          const fcH = flipCard.h ?? 200;
          const inside = relX >= 0 && relX <= fcW && relY >= 0 && relY <= fcH;
          // When a creation mode is active, always create in backBlocks.
          // If clicking outside the flip card, default to center.
          const bfW = flipCard.backW ?? fcW;
          const bfH = flipCard.backH ?? fcH;
          const bfOX = (fcW - bfW) / 2;
          const bfOY = (fcH - bfH) / 2;
          const insideBF = relX >= bfOX && relX <= bfOX + bfW && relY >= bfOY && relY <= bfOY + bfH;
          const cx = insideBF ? relX - bfOX : bfW / 2 - 60;
          const cy = insideBF ? relY - bfOY : bfH / 2 - 20;
          const anyMode = modes.text || modes.box || modes.emoji || modes.button || modes.shape;
          if (anyMode) {
            if (modes.text) actions.createBlock("text", cx, cy);
            else if (modes.box) actions.createBlock("box", cx, cy);
            else if (modes.emoji) actions.createBlock("emoji", cx, cy);
            else if (modes.button) actions.createBlock("button", cx, cy);
            else if (modes.shape) actions.createBlock("shape", cx, cy);
          } else if (insideBF && e.target === canvasRef.current) {
            setSelectedBackBlockId(null);
          }
        }
        return;
      }

      if (modes.text) actions.createBlock("text", p.x, p.y);
      else if (modes.box) actions.createBlock("box", p.x, p.y);
      else if (modes.link) actions.createBlock("link", p.x, p.y);
      else if (modes.filter) actions.createBlock("filter", p.x, p.y);
      else if (modes.button) actions.createBlock("button", p.x, p.y);
      else if (modes.countdown) actions.createBlock("countdown", p.x, p.y);
      else if (modes.quote) actions.createBlock("quote", p.x, p.y);
      else if (modes.shape) actions.createBlock("shape", p.x, p.y);
      else if (modes.emoji) actions.createBlock("emoji", p.x, p.y);
      else if (e.target === canvasRef.current) {
        setSelectedId(null);
        setSelectedIds([]);
      }
    },

    onBlockMouseDown: (e, block, canvasRef) => {
      if (e.button !== 0) {
        return;
      }

      // Don't drag the flip card being back-edited
      if (flipBackEditId === block.id) {
        e.stopPropagation();
        return;
      }

      if (block.locked) {
        e.stopPropagation();
        setSelectedId(block.id);
        setSelectedIds([]);
        return;
      }

      if (e.shiftKey) {
        e.stopPropagation();
        setSelectedIds((prev) => {
          const s = new Set(prev);
          if (selectedId && !s.has(selectedId)) s.add(selectedId);
          if (s.has(block.id)) s.delete(block.id);
          else s.add(block.id);
          return [...s];
        });
        setSelectedId(block.id);
        return;
      }

      const isInMultiSelection = selectedIds.length > 1 && selectedIds.includes(block.id);

      if (!isInMultiSelection && selectedIds.length > 0) {
        setSelectedIds([]);
      }

      if ((block.type === "text" || block.type === "link") && selectedId === block.id) {
        e.stopPropagation();
        return;
      }

      e.stopPropagation();
      setSelectedId(block.id);

      if (interactionHistoryRef.current.draggingId !== block.id) {
        rememberHistory();
        interactionHistoryRef.current.draggingId = block.id;
      }

      const p = getCanvasPoint(e, canvasRef.current);

      if (isInMultiSelection) {
        selectedIds.forEach((id) => {
          const b = blocks.find((bl) => bl.id === id);
          if (b) {
            multiDragOffsetsRef.current[id] = {
              offsetX: p.x - (b.x ?? 0),
              offsetY: p.y - (b.y ?? 0),
            };
          }
        });
        setDragging({
          id: block.id,
          offsetX: p.x - (block.x ?? 0),
          offsetY: p.y - (block.y ?? 0),
          isMulti: true,
        });
      } else {
        setDragging({
          id: block.id,
          offsetX: p.x - block.x,
          offsetY: p.y - block.y,
        });
      }
    },

    onResizeMouseDown: (e, block, canvasRef, resizeAxis = "both") => {
      if (e.button !== 0) {
        return;
      }

      e.stopPropagation();

      if (interactionHistoryRef.current.resizingId !== block.id) {
        rememberHistory();
        interactionHistoryRef.current.resizingId = block.id;
      }

      const p = getCanvasPoint(e, canvasRef.current);

      setResizing({
        id: block.id,
        startW: block.w ?? block.width ?? 220,
        startH: block.type === "text" ? Math.max(20, p.y - (block.y ?? 0)) : (block.h ?? 48),
        startX: p.x,
        startY: p.y,
        startFontSize: block.fontSize || 20,
        startRotation: block.rotation ?? 0,
        resizeAxis,
        startScaleX: Number.isFinite(block.scaleX) ? block.scaleX : 1,
        startScaleY: Number.isFinite(block.scaleY) ? block.scaleY : 1,
      });
    },

    onRotateMouseDown: (e, block, canvasRef) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      if (interactionHistoryRef.current.rotatingId !== block.id) {
        rememberHistory();
        interactionHistoryRef.current.rotatingId = block.id;
      }

      const p = getCanvasPoint(e, canvasRef.current);
      const sizeW = block.type === "emoji" ? (block.fontSize ?? 64) : (block.w ?? 100);
      const sizeH = block.type === "emoji" ? (block.fontSize ?? 64) : (block.h ?? 100);
      const centerX = (block.x ?? 0) + sizeW / 2;
      const centerY = (block.y ?? 0) + sizeH / 2;
      const startAngle = (Math.atan2(p.y - centerY, p.x - centerX) * 180) / Math.PI;

      setRotating({
        id: block.id,
        startAngle,
        startRotation: block.rotation ?? 0,
        centerX,
        centerY,
      });
    },

    onBackBlockMouseDown: (e, block, flipCardId, canvasRef) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      setSelectedBackBlockId(block.id);
      if (interactionHistoryRef.current.draggingId !== block.id) {
        rememberHistory();
        interactionHistoryRef.current.draggingId = block.id;
      }
      const flipCard = blocks.find((b) => b.id === flipCardId);
      if (!flipCard) return;
      const p = getCanvasPoint(e, canvasRef.current);
      setDragging({
        id: block.id,
        offsetX: p.x - (flipCard.x ?? 0) - (block.x ?? 0),
        offsetY: p.y - (flipCard.y ?? 0) - (block.y ?? 0),
        flipCardId,
      });
    },

    onFlipBackFaceResizeMouseDown: (e, block, canvasRef) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      if (interactionHistoryRef.current.resizingId !== block.id) {
        rememberHistory();
        interactionHistoryRef.current.resizingId = block.id;
      }
      const p = getCanvasPoint(e, canvasRef.current);
      setResizing({
        id: block.id,
        startW: block.backW ?? block.w ?? 300,
        startH: block.backH ?? block.h ?? 200,
        startX: p.x,
        startY: p.y,
        startFontSize: 0,
        startRotation: 0,
        isBackFace: true,
      });
    },

    onBackBlockResizeMouseDown: (e, block, flipCardId, canvasRef) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      if (interactionHistoryRef.current.resizingId !== block.id) {
        rememberHistory();
        interactionHistoryRef.current.resizingId = block.id;
      }
      const p = getCanvasPoint(e, canvasRef.current);
      setResizing({
        id: block.id,
        startW: block.w ?? 200,
        startH: block.h ?? 100,
        startX: p.x,
        startY: p.y,
        startFontSize: block.fontSize ?? 20,
        startRotation: block.rotation ?? 0,
        flipCardId,
      });
    },

    handleMouseMove: (e, canvasRef) => {
      if (!dragging && !resizing && !rotating) return;

      const p = getCanvasPoint(e, canvasRef.current);

      if (dragging) {
        if (dragging.flipCardId) {
          const fc = blocks.find((b) => b.id === dragging.flipCardId);
          if (fc) {
            const bfDragW = fc.backW ?? fc.w ?? 300;
            const bfDragH = fc.backH ?? fc.h ?? 200;
            const rawX = clamp(p.x - dragging.offsetX - (fc.x ?? 0), 0, bfDragW - 10);
            const rawY = clamp(p.y - dragging.offsetY - (fc.y ?? 0), 0, bfDragH - 10);
            const snappedX = snapToGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
            const snappedY = snapToGrid ? Math.round(rawY / gridSize) * gridSize : rawY;
            setBlocks((prev) =>
              prev.map((b) => {
                if (b.id !== dragging.flipCardId) return b;
                return {
                  ...b,
                  backBlocks: (b.backBlocks ?? []).map((bb: any) =>
                    bb.id === dragging.id ? { ...bb, x: snappedX, y: snappedY } : bb
                  ),
                };
              })
            );
          }
        } else if (dragging.isMulti) {
          setBlocks((prev) =>
            prev.map((b) => {
              const offset = multiDragOffsetsRef.current[b.id];
              if (!offset || b.locked) return b;
              const rawX = clamp(p.x - offset.offsetX, 0, 2400);
              const rawY = Math.max(0, p.y - offset.offsetY);
              const snappedX = snapToGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
              const snappedY = snapToGrid ? Math.round(rawY / gridSize) * gridSize : rawY;
              return { ...b, x: snappedX, y: snappedY };
            })
          );
        } else {
          const rawX = clamp(p.x - dragging.offsetX, 0, 2400);
          const rawY = Math.max(0, p.y - dragging.offsetY);
          const snappedX = snapToGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
          const snappedY = snapToGrid ? Math.round(rawY / gridSize) * gridSize : rawY;
          setBlocks((prev) =>
            prev.map((b) => (b.id === dragging.id ? { ...b, x: snappedX, y: snappedY } : b))
          );
        }
      }

      if (resizing) {
        if (resizing.isBackFace) {
          const dx = p.x - resizing.startX;
          const dy = p.y - resizing.startY;
          setBlocks((prev) =>
            prev.map((b) =>
              b.id !== resizing.id
                ? b
                : {
                    ...b,
                    backW: Math.max(80, resizing.startW + dx),
                    backH: Math.max(40, resizing.startH + dy),
                  }
            )
          );
        } else if (resizing.flipCardId) {
          setBlocks((prev) =>
            prev.map((b) => {
              if (b.id !== resizing.flipCardId) return b;
              return {
                ...b,
                backBlocks: (b.backBlocks ?? []).map((bb: any) => {
                  if (bb.id !== resizing.id) return bb;
                  const dx = p.x - resizing.startX;
                  const dy = p.y - resizing.startY;
                  if (bb.type === "emoji")
                    return {
                      ...bb,
                      fontSize: Math.max(12, resizing.startFontSize + (dx + dy) / 2),
                    };
                  if (bb.type === "text") {
                    const nextScaleX = Math.max(
                      0.2,
                      (resizing.startScaleX ?? 1) + dx / Math.max(120, resizing.startW)
                    );
                    const nextScaleY = Math.max(
                      0.2,
                      (resizing.startScaleY ?? 1) + dy / Math.max(80, resizing.startH)
                    );
                    return withBlockDefaults(applyTextStretchPatch(bb, nextScaleX, nextScaleY));
                  }
                  return {
                    ...bb,
                    w: Math.max(20, resizing.startW + dx),
                    h: Math.max(20, resizing.startH + dy),
                  };
                }),
              };
            })
          );
        } else {
          setBlocks((prev) =>
            prev.map((b) => {
              if (b.id !== resizing.id) return b;

              const rawDx = p.x - resizing.startX;
              const rawDy = p.y - resizing.startY;
              const rotRad = ((resizing.startRotation ?? 0) * Math.PI) / 180;
              const dx = rawDx * Math.cos(rotRad) + rawDy * Math.sin(rotRad);
              const dy = -rawDx * Math.sin(rotRad) + rawDy * Math.cos(rotRad);

              if (b.type === "filter") {
                return {
                  ...b,
                  width: Math.max(120, resizing.startW + dx),
                };
              }

              if (b.type === "emoji") {
                return {
                  ...b,
                  fontSize: Math.max(12, resizing.startFontSize + (dx + dy) / 2),
                };
              }

              if (b.type === "text") {
                const nextScaleX = Math.max(
                  0.2,
                  (resizing.startScaleX ?? 1) + dx / Math.max(140, resizing.startW)
                );
                const nextScaleY = Math.max(
                  0.2,
                  (resizing.startScaleY ?? 1) + dy / Math.max(80, resizing.startH)
                );
                return withBlockDefaults(applyTextStretchPatch(b, nextScaleX, nextScaleY));
              }

              return {
                ...b,
                w: Math.max(20, resizing.startW + dx),
                h: Math.max(20, resizing.startH + dy),
                fontSize:
                  b.type === "link" ? Math.max(8, resizing.startFontSize + dy / 4) : b.fontSize,
              };
            })
          );
        } // end else (not back block resizing)
      }

      if (rotating) {
        const currentAngle =
          (Math.atan2(p.y - rotating.centerY, p.x - rotating.centerX) * 180) / Math.PI;
        const delta = currentAngle - rotating.startAngle;
        let newRotation = rotating.startRotation + delta;

        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }

        setBlocks((prev) =>
          prev.map((b) => (b.id === rotating.id ? { ...b, rotation: newRotation } : b))
        );
      }
    },

    stop: () => {
      interactionHistoryRef.current.draggingId = null;
      interactionHistoryRef.current.resizingId = null;
      interactionHistoryRef.current.rotatingId = null;
      setDragging(null);
      setResizing(null);
      setRotating(null);
    },
  };

  return {
    states: {
      page,
      title,
      navLabel,
      showInNav,
      backgroundType,
      backgroundColor,
      backgroundImage,
      backgroundGradient,
      backgroundGradientStart,
      backgroundGradientEnd,
      backgroundGradientAngle,
      overlayEnabled,
      overlayColor,
      overlayOpacity,
      bottomPadding,
      blocks,
      selectedId,
      selected,
      canvasHeight,
      modes,
      textColor,
      boxColor,
      linkColor,
      defaultFontStyle,
      pendingLink,
      snapToGrid,
      gridSize,
      isDirty,
      selectedIds,
      flipBackEditId,
      selectedBackBlockId,
      selectedBackBlock,
    },
    actions,
    setters,
    handlers,
  };
}
