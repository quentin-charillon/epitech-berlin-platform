import {
  hasBlockClipboard,
  hasClipboardContent,
  hasTextClipboard,
} from "../../../../utils/blockClipboard";
import { QuickMenu, QuickMenuButton, QuickMenuTitle } from "./QuickMenu";

export function CanvasContextMenu({
  quickMenu,
  menuRef,
  actions,
  setQuickMenu,
  setters,
  fileInputRef,
  pendingInsertPointRef,
}: {
  quickMenu: any;
  menuRef: React.RefObject<HTMLDivElement>;
  actions: any;
  setQuickMenu: (v: any) => void;
  setters: any;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  pendingInsertPointRef?: React.MutableRefObject<{ x: number; y: number } | null>;
}) {
  const canPasteClipboard = hasClipboardContent();
  const pasteCanvasLabel = hasBlockClipboard()
    ? "Paste copied block here"
    : hasTextClipboard()
      ? "Create text block here"
      : "Paste copied block here";

  function createBlockFromMenu(type: string) {
    const point = quickMenu?.point;
    actions.createBlock(type, point.x, point.y);
    setQuickMenu(null);
  }

  return (
    <QuickMenu x={quickMenu.x} y={quickMenu.y} menuRef={menuRef}>
      <QuickMenuTitle>Add block here</QuickMenuTitle>
      <QuickMenuButton onClick={() => createBlockFromMenu("text")}>Add text block</QuickMenuButton>
      <QuickMenuButton onClick={() => createBlockFromMenu("box")}>Add box block</QuickMenuButton>
      <QuickMenuButton
        onClick={() => {
          if (pendingInsertPointRef) pendingInsertPointRef.current = quickMenu.point;
          setQuickMenu(null);
          fileInputRef?.current?.click();
        }}
      >
        Add image block
      </QuickMenuButton>
      <QuickMenuButton onClick={() => createBlockFromMenu("filter")}>
        Add filter block
      </QuickMenuButton>
      <QuickMenuButton
        onClick={() => {
          actions.addVideo(quickMenu.point.x, quickMenu.point.y);
          setQuickMenu(null);
        }}
      >
        Add video block
      </QuickMenuButton>
      <QuickMenuButton onClick={() => createBlockFromMenu("countdown")}>
        Add countdown block
      </QuickMenuButton>
      <QuickMenuButton
        disabled={!canPasteClipboard}
        onClick={() => {
          actions.pasteClipboardAt(quickMenu.point.x, quickMenu.point.y);
          setQuickMenu(null);
        }}
      >
        {pasteCanvasLabel}
      </QuickMenuButton>
    </QuickMenu>
  );
}
