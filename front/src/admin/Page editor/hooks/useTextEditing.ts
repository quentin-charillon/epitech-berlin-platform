import { useRef } from "react";
import { normalizeTextBlock, parseSegmentsFromElement } from "../../../utils/textSegments";
import { getTextSelectionStyle } from "../../../utils/textSegments";
import { writeTextClipboard } from "../../../utils/blockClipboard";

// Counts character offset from container start to (anchorNode, anchorOffset),
// treating <br> as \n (1 char) to match the internal segment text representation.
function getSegmentOffset(container: HTMLElement, anchorNode: Node, anchorOffset: number): number {
  let count = 0;

  function walk(node: Node): boolean {
    if (node.nodeType === 3) {
      if (node === anchorNode) {
        count += anchorOffset;
        return true;
      }
      count += String(node.textContent || "").replace(/​/g, "").length;
      return false;
    }

    if (node.nodeType !== 1) return false;

    const tag = (node as Element).tagName?.toUpperCase();

    if (tag === "BR") {
      if (node === anchorNode) return true;
      count += 1;
      return false;
    }

    if (node === anchorNode) {
      const children = Array.from(node.childNodes);
      for (let i = 0; i < Math.min(anchorOffset, children.length); i++) {
        walk(children[i]);
      }
      return true;
    }

    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }

    return false;
  }

  for (const child of Array.from(container.childNodes)) {
    if (walk(child)) break;
  }

  return count;
}

export function useTextEditing({ blocks, actions }: { blocks: any[]; actions: any }) {
  const textBlockRefs = useRef<Map<string, HTMLElement>>(new Map());

  function registerTextBlockRef(blockId: string, node: HTMLElement | null) {
    if (!node) {
      textBlockRefs.current.delete(blockId);
      return;
    }
    textBlockRefs.current.set(blockId, node);
  }

  function commitTextBlockDom(blockId: string) {
    const container = textBlockRefs.current.get(blockId);
    if (!container) return;
    const ceAttr = container.getAttribute && container.getAttribute("contenteditable");
    if (ceAttr !== "true" && !container.isContentEditable) return;
    const sourceBlock = blocks.find((b) => b.id === blockId);
    if (!sourceBlock || sourceBlock.type !== "text") return;
    const normalized = normalizeTextBlock(sourceBlock);
    const parsed = parseSegmentsFromElement(container, normalized);
    if (parsed.length === 0) return;

    const styleSig = (s: any) =>
      [
        s.text || "",
        s.color || "",
        s.fontStyle || "normal",
        s.fillType || "gradient",
        s.gradientStart || "",
        s.gradientEnd || "",
        Number(s.gradientAngle ?? 135),
        Number(s.fontSize ?? 0),
      ].join("|");

    const parsedSig = parsed.map(styleSig).join("||");
    const currentSig = normalized.segments.map(styleSig).join("||");
    if (parsedSig === currentSig) return;

    actions.updateBlockById(blockId, {
      text: parsed.map((s: any) => s.text).join(""),
      segments: parsed,
    });
  }

  function getTextSelectionForBlock(
    blockId: string
  ): { start: number; end: number; text: string } | null {
    const container = textBlockRefs.current.get(blockId);
    const selection = window.getSelection();

    if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const ancestor = range.commonAncestorContainer;

    if (!container.contains(ancestor)) return null;

    const start = getSegmentOffset(container, range.startContainer, range.startOffset);
    const end = getSegmentOffset(container, range.endContainer, range.endOffset);

    if (start === end) return null;

    return { start: Math.min(start, end), end: Math.max(start, end), text: range.toString() };
  }

  function syncSelectedTextClipboard(blockId: string): boolean {
    const textSelection = getTextSelectionForBlock(blockId);
    const sourceBlock = blocks.find((b) => b.id === blockId);

    if (!textSelection?.text || sourceBlock?.type !== "text") return false;

    const selectionStyle = getTextSelectionStyle(
      sourceBlock,
      textSelection.start,
      textSelection.end
    );

    return writeTextClipboard({
      text: textSelection.text,
      style: {
        color: selectionStyle.color,
        fontStyle: selectionStyle.fontStyle,
        fontSize: selectionStyle.fontSize,
        gradientStart: selectionStyle.gradientStart,
        gradientEnd: selectionStyle.gradientEnd,
        gradientAngle: selectionStyle.gradientAngle,
      },
    });
  }

  return {
    registerTextBlockRef,
    commitTextBlockDom,
    getTextSelectionForBlock,
    syncSelectedTextClipboard,
  };
}
