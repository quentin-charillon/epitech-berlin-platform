import { QuickMenu, QuickMenuButton, QuickMenuTitle } from "./QuickMenu";

export function FlipBackContextMenu({
  quickMenu,
  menuRef,
  actions,
  setQuickMenu,
  flipBackEditId,
  selectedBackBlockId,
  fileInputRef,
  pendingBackInsertPointRef,
}: {
  quickMenu: any;
  menuRef: React.RefObject<HTMLDivElement>;
  actions: any;
  setQuickMenu: (v: any) => void;
  flipBackEditId: string;
  selectedBackBlockId: string | null;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  pendingBackInsertPointRef?: React.MutableRefObject<{ x: number; y: number } | null>;
}) {
  function add(type: string) {
    actions.createBlock(type, quickMenu.point.x, quickMenu.point.y);
    setQuickMenu(null);
  }

  return (
    <QuickMenu x={quickMenu.x} y={quickMenu.y} menuRef={menuRef}>
      <QuickMenuTitle>Add to back face</QuickMenuTitle>
      <QuickMenuButton onClick={() => add("text")}>Text</QuickMenuButton>
      <QuickMenuButton onClick={() => add("box")}>Box</QuickMenuButton>
      <QuickMenuButton onClick={() => add("emoji")}>Emoji</QuickMenuButton>
      {fileInputRef && (
        <QuickMenuButton
          onClick={() => {
            if (pendingBackInsertPointRef) pendingBackInsertPointRef.current = quickMenu.point;
            setQuickMenu(null);
            fileInputRef.current?.click();
          }}
        >
          Image
        </QuickMenuButton>
      )}

      {selectedBackBlockId && (
        <>
          <QuickMenuTitle>Selection</QuickMenuTitle>
          <QuickMenuButton
            onClick={() => {
              actions.duplicateBackBlock(flipBackEditId, selectedBackBlockId);
              setQuickMenu(null);
            }}
          >
            Duplicate
          </QuickMenuButton>
          <QuickMenuButton
            danger
            onClick={() => {
              actions.deleteBackBlock(flipBackEditId, selectedBackBlockId);
              setQuickMenu(null);
            }}
          >
            Delete
          </QuickMenuButton>
        </>
      )}
    </QuickMenu>
  );
}
