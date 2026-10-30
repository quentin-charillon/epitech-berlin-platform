import { useRef } from "react";
import { getBlockGradientConfig } from "../../../../utils/gradients";
import {
  buildSegmentsEditHtml,
  buildSegmentsHtml,
  normalizeTextBlock,
  parseSegmentsFromElement,
} from "../../../../utils/textSegments";
import { buildSegmentsSignature, insertPlainTextAtSelection } from "../../utils/textBlockUtils";
import { ResizeHandle } from "../shared/ResizeHandle";

export function TextBlock({
  block,
  isSelected,
  isInSelection,
  canvasRef,
  handlers,
  actions,
  onSetSelectedId,
  onOpenMenu,
  onRegisterRef,
  onGetTextSelection,
  onSyncTextClipboard,
  hoveredRevealTag = null,
  onRevealHover,
}: {
  block: any;
  isSelected: boolean;
  isInSelection: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
  handlers: any;
  actions: any;
  onSetSelectedId: (id: string) => void;
  onOpenMenu: (e: React.MouseEvent, id: string) => void;
  onRegisterRef: (id: string, node: HTMLElement | null) => void;
  onGetTextSelection: (id: string) => any;
  onSyncTextClipboard: (id: string) => void;
  hoveredRevealTag?: string | null;
  onRevealHover?: (tag: string | null) => void;
}) {
  const textBlock = normalizeTextBlock(block);
  const editorRef = useRef<HTMLDivElement>(null);

  const segmentsHash = buildSegmentsSignature(textBlock.segments);
  const editHtmlRef = useRef({ hash: "", html: "", editHtml: "" });
  if (editHtmlRef.current.hash !== segmentsHash) {
    editHtmlRef.current = {
      hash: segmentsHash,
      html: buildSegmentsHtml(textBlock),
      editHtml: buildSegmentsEditHtml(textBlock),
    };
  }
  // Use solid-colour HTML while editing — background-clip:text breaks in contentEditable.
  const currentHtml = isSelected ? editHtmlRef.current.editHtml : editHtmlRef.current.html;

  const currentGradient = getBlockGradientConfig(textBlock);

  const blockScaleX = textBlock.scaleX ?? 1;
  const blockScaleY = textBlock.scaleY ?? 1;
  const isRevealHidden = block.revealHidden && block.revealTag;
  const isRevealDefault = block.revealDefault;

  function getEditorRevealOpacity() {
    if (isRevealHidden) return hoveredRevealTag === block.revealTag ? 1 : 0.25;
    if (isRevealDefault) {
      const shouldHide = block.revealTag
        ? hoveredRevealTag !== null &&
          (hoveredRevealTag === block.revealTag ||
            hoveredRevealTag.startsWith(block.revealTag + "-"))
        : hoveredRevealTag !== null;
      return shouldHide ? 0.25 : 1;
    }
    return undefined;
  }

  const editorOpacity = getEditorRevealOpacity();
  const outerStyle: React.CSSProperties = {
    position: "absolute",
    left: block.x,
    top: block.y,
    zIndex: block.zIndex ?? 1,
    width: textBlock.w ? Math.max(140, textBlock.w) : "auto",
    maxWidth: textBlock.w ? Math.max(140, textBlock.w) : 900,
    outline: isSelected
      ? "2px solid #a78bfa"
      : isInSelection
        ? "2px dashed rgba(167,139,250,0.55)"
        : "none",
    outlineOffset: isSelected || isInSelection ? "2px" : 0,
    cursor: isSelected ? "text" : "grab",
    ...(blockScaleX !== 1 || blockScaleY !== 1
      ? { transform: `scale(${blockScaleX}, ${blockScaleY})`, transformOrigin: "left top" }
      : {}),
    ...(editorOpacity !== undefined
      ? { opacity: editorOpacity, transition: "opacity 0.2s ease" }
      : {}),
  };

  const containerStyle: React.CSSProperties = {
    fontSize: textBlock.fontSize ?? 16,
    whiteSpace: "pre-wrap",
    lineHeight: 1.35,
    padding: 4,
    userSelect: "text",
    outline: "none",
    caretColor: currentGradient.start || textBlock.color || "#ffffff",
    minHeight: textBlock.h ?? "1em",
  };

  function commitFromDom() {
    const node = editorRef.current;
    if (!node) return;
    const ceAttr = node.getAttribute && node.getAttribute("contenteditable");
    if (ceAttr !== "true" && !node.isContentEditable) return;

    const parsed = parseSegmentsFromElement(node, textBlock);
    let nextSegments = parsed;
    if (nextSegments.length === 0) {
      const base = textBlock.segments[0] || {};
      nextSegments = [
        {
          id: base.id || `${block.id}_text`,
          text: "",
          color: base.color || textBlock.color || "#ffffff",
          fontStyle: base.fontStyle || textBlock.fontStyle || "normal",
          fillType: base.fillType || textBlock.fillType || "gradient",
          gradientStart: base.gradientStart || textBlock.gradientStart,
          gradientEnd: base.gradientEnd || textBlock.gradientEnd,
          gradientAngle: base.gradientAngle ?? textBlock.gradientAngle ?? 135,
          fontSize: base.fontSize ?? textBlock.fontSize,
        },
      ];
    }

    const nextHash = buildSegmentsSignature(nextSegments);
    if (nextHash === segmentsHash) return;

    actions.updateSelected({
      text: nextSegments.map((s: any) => s.text).join(""),
      segments: nextSegments,
    });
  }

  function registerRef(node: HTMLDivElement | null) {
    (editorRef as any).current = node;
    onRegisterRef(block.id, node);
  }

  return (
    <div
      style={outerStyle}
      onMouseDown={(e) => handlers.onBlockMouseDown(e, block, canvasRef)}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onContextMenu={(e) => onOpenMenu(e, block.id)}
      onMouseEnter={() =>
        block.revealEnabled && block.revealTag && onRevealHover?.(block.revealTag)
      }
      onMouseLeave={() => block.revealEnabled && onRevealHover?.(null)}
    >
      {/* Single persistent div — contentEditable attribute is toggled, never remounted.
          This mirrors the link component and lets the browser place the cursor naturally. */}
      <div
        ref={registerRef}
        contentEditable={isSelected}
        suppressContentEditableWarning
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: currentHtml }}
        onKeyDown={(e) => {
          const isClipboardShortcut = e.ctrlKey || e.metaKey;
          if (!isClipboardShortcut) return;
          const lowerKey = e.key.toLowerCase();
          const hasTextSelection = !!onGetTextSelection(block.id);
          if (hasTextSelection) {
            if (lowerKey === "c" || lowerKey === "x") onSyncTextClipboard(block.id);
            return;
          }
          if (lowerKey === "c") {
            e.preventDefault();
            actions.copyBlock(block.id);
          }
          if (lowerKey === "x") {
            e.preventDefault();
            actions.cutBlock(block.id);
          }
        }}
        onCopy={() => onSyncTextClipboard(block.id)}
        onCut={() => onSyncTextClipboard(block.id)}
        onPaste={(e) => {
          e.preventDefault();
          const plainText = e.clipboardData?.getData("text/plain") || "";
          if (!plainText) return;
          insertPlainTextAtSelection(plainText);
        }}
        onBlur={commitFromDom}
      />
      {isSelected && (
        <ResizeHandle onMouseDown={(e) => handlers.onResizeMouseDown(e, block, canvasRef)} />
      )}
      {block.revealHidden && block.revealTag && (
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 4,
            background: "rgba(239,68,68,0.85)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          HIDDEN · {block.revealTag}
        </div>
      )}
      {block.revealDefault && (
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 4,
            background: "rgba(16,185,129,0.85)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          DEFAULT{block.revealTag ? ` · ${block.revealTag}` : ""}
        </div>
      )}
      {block.revealEnabled && block.revealTag && (
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 4,
            background: "rgba(79,70,229,0.85)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          TRIGGER · {block.revealTag}
        </div>
      )}
    </div>
  );
}
