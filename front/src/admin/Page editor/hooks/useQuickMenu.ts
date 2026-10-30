import { useEffect, useRef, useState } from "react";
import { getCanvasPoint } from "../editorMathCalcul";
import { clampValue } from "../utils/textBlockUtils";

function getMenuPosition(kind: string, x: number, y: number) {
  const estimatedHeight = kind === "block" ? 520 : 420;
  const maxX = Math.max(12, window.innerWidth - 360);
  const maxY = Math.max(12, window.innerHeight - estimatedHeight);
  return {
    x: clampValue(x, 12, maxX),
    y: clampValue(y, 12, maxY),
  };
}

export function useQuickMenu({
  blocks,
  pendingInsertPointRef,
  canvasRef,
  setters,
  commitTextBlockDom,
  getTextSelectionForBlock,
}: {
  blocks: any[];
  pendingInsertPointRef: React.MutableRefObject<{ x: number; y: number } | null>;
  canvasRef: React.RefObject<HTMLElement>;
  setters: any;
  commitTextBlockDom: (blockId: string) => void;
  getTextSelectionForBlock: (blockId: string) => {
    start: number;
    end: number;
    text: string;
  } | null;
}) {
  const [quickMenu, setQuickMenu] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const quickSelectedBlock =
    quickMenu?.type === "block" || quickMenu?.type === "textSelection"
      ? (blocks.find((b) => b.id === quickMenu.blockId) ?? null)
      : null;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setQuickMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setQuickMenu(null);
    }

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (quickMenu?.type === "block" && !quickSelectedBlock) {
      setQuickMenu(null);
    }
  }, [quickMenu, quickSelectedBlock]);

  useEffect(() => {
    if (!quickMenu) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [quickMenu]);

  useEffect(() => {
    if (!quickMenu) return undefined;

    function handleWheel(event: WheelEvent) {
      const menu = menuRef.current;
      if (!menu) return;
      const isInsideMenu = menu.contains(event.target as Node);
      if (!isInsideMenu) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      menu.scrollTop += event.deltaY;
    }

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [quickMenu]);

  function openBlockMenu(event: React.MouseEvent, blockId: string) {
    event.preventDefault();
    event.stopPropagation();

    if (quickMenu) {
      setQuickMenu(null);
      return;
    }

    const targetBlock = blocks.find((b) => b.id === blockId);
    if (targetBlock?.type === "text") {
      commitTextBlockDom(blockId);
      const textSelection = getTextSelectionForBlock(blockId);
      if (textSelection) {
        const position = getMenuPosition("block", event.clientX + 8, event.clientY + 8);
        setters.setSelectedId(blockId);
        setQuickMenu({
          type: "textSelection",
          blockId,
          x: position.x,
          y: position.y,
          selectionStart: textSelection.start,
          selectionEnd: textSelection.end,
          selectedText: textSelection.text,
        });
        return;
      }
    }

    const position = getMenuPosition("block", event.clientX + 8, event.clientY + 8);
    setters.setSelectedId(blockId);
    setQuickMenu({ type: "block", blockId, x: position.x, y: position.y });
  }

  function openCanvasMenu(event: React.MouseEvent) {
    event.preventDefault();

    if (quickMenu) {
      setQuickMenu(null);
      return;
    }

    if (!canvasRef.current || event.target !== canvasRef.current) return;

    const point = getCanvasPoint(event, canvasRef.current);
    const position = getMenuPosition("canvas", event.clientX + 6, event.clientY + 6);
    pendingInsertPointRef.current = point;
    setQuickMenu({ type: "canvas", x: position.x, y: position.y, point });
  }

  return { quickMenu, setQuickMenu, menuRef, quickSelectedBlock, openBlockMenu, openCanvasMenu };
}
