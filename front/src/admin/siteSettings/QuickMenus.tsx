import { hasBlockClipboard } from "../../utils/blockClipboard";

export const resizeHandleStyle = {
  position: "absolute" as const,
  right: -6,
  bottom: -6,
  width: 14,
  height: 14,
  borderRadius: 999,
  background: "#7aa2ff",
  border: "2px solid white",
  cursor: "nwse-resize",
};

const quickMenuInputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--admin-border-strong)",
  background: "var(--admin-surface-input)",
  color: "var(--admin-text)",
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
  fontSize: 13,
};

const quickMenuActionRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 6,
};

// --- Primitives ---

function QuickMenu({ x, y, menuRef, children }) {
  return (
    <div
      ref={menuRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="adminQuickMenu"
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 1000,
        minWidth: 240,
        maxWidth: 320,
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      {children}
    </div>
  );
}

function QuickMenuTitle({ children }) {
  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--admin-text-muted)",
        paddingBottom: 6,
        borderBottom: "1px solid var(--admin-border)",
      }}
    >
      {children}
    </div>
  );
}

function QuickMenuButton({ children, onClick, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        danger ? "adminBtn adminBtnDanger adminBtnSm" : "adminBtn adminBtnSecondary adminBtnSm"
      }
      style={{ justifyContent: "flex-start", textAlign: "left" }}
    >
      {children}
    </button>
  );
}

function QuickMenuField({ label, children }) {
  return (
    <label className="adminLabel" style={{ gap: 4 }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

// --- Composed menus ---

export function CanvasQuickMenu({
  x,
  y,
  menuRef,
  point,
  addTextBlock,
  addImageBlock,
  addImageLinkBlock,
  showClickableImage = true,
  addBoxBlock,
  pasteCopiedBlockAt,
  onClose,
}) {
  return (
    <QuickMenu x={x} y={y} menuRef={menuRef}>
      <QuickMenuTitle>Add a block here</QuickMenuTitle>
      <QuickMenuButton
        onClick={() => {
          addTextBlock(point);
          onClose();
        }}
      >
        + Text
      </QuickMenuButton>
      <QuickMenuButton
        onClick={() => {
          addImageBlock(point);
          onClose();
        }}
      >
        + Image
      </QuickMenuButton>
      {showClickableImage && <QuickMenuButton
        onClick={() => {
          addImageLinkBlock(point);
          onClose();
        }}
      >
        + Clickable image
      </QuickMenuButton>}
      <QuickMenuButton
        onClick={() => {
          addBoxBlock(point);
          onClose();
        }}
      >
        + Shape
      </QuickMenuButton>
      <QuickMenuButton
        disabled={!hasBlockClipboard()}
        onClick={() => {
          pasteCopiedBlockAt(point.x, point.y);
          onClose();
        }}
      >
        Paste here
      </QuickMenuButton>
    </QuickMenu>
  );
}

export function BlockQuickMenu({
  x,
  y,
  menuRef,
  block,
  updateBlock,
  deleteBlock,
  copyBlock,
  cutBlock,
  pasteCopiedBlockAt,
  onClose,
}) {
  if (!block) return null;

  const blockLabel = block.type === "text" ? "Text" : block.type === "image" ? "Image" : "Shape";

  return (
    <QuickMenu x={x} y={y} menuRef={menuRef}>
      <QuickMenuTitle>{blockLabel} block</QuickMenuTitle>

      <div style={quickMenuActionRowStyle}>
        <QuickMenuButton onClick={() => copyBlock(block.id)}>Copy</QuickMenuButton>
        <QuickMenuButton
          onClick={() => {
            cutBlock(block.id);
            onClose();
          }}
        >
          Cut
        </QuickMenuButton>
        <QuickMenuButton
          disabled={!hasBlockClipboard()}
          onClick={() => {
            pasteCopiedBlockAt((block.x ?? 0) + 24, (block.y ?? 0) + 24);
            onClose();
          }}
        >
          Paste
        </QuickMenuButton>
      </div>

      <QuickMenuButton
        danger
        onClick={() => {
          deleteBlock(block.id);
          onClose();
        }}
      >
        Delete block
      </QuickMenuButton>

      <QuickMenuField label="X">
        <input
          type="number"
          value={block.x ?? 0}
          onChange={(e) => updateBlock(block.id, { x: Number(e.target.value) || 0 })}
          style={quickMenuInputStyle}
        />
      </QuickMenuField>
      <QuickMenuField label="Y">
        <input
          type="number"
          value={block.y ?? 0}
          onChange={(e) => updateBlock(block.id, { y: Number(e.target.value) || 0 })}
          style={quickMenuInputStyle}
        />
      </QuickMenuField>

      {block.type === "text" && (
        <>
          <QuickMenuField label="Text">
            <textarea
              value={block.text ?? ""}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              style={{ ...quickMenuInputStyle, minHeight: 90, resize: "vertical" }}
            />
          </QuickMenuField>
          <QuickMenuField label="Color">
            <input
              type="color"
              value={block.color || "#ffffff"}
              onChange={(e) => updateBlock(block.id, { color: e.target.value })}
            />
          </QuickMenuField>
          <QuickMenuField label="Font size">
            <input
              type="number"
              value={block.fontSize ?? 20}
              onChange={(e) => updateBlock(block.id, { fontSize: Number(e.target.value) || 20 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Style">
            <select
              value={block.fontStyle || "normal"}
              onChange={(e) => updateBlock(block.id, { fontStyle: e.target.value })}
              style={quickMenuInputStyle}
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="bold">Bold</option>
              <option value="bolditalic">Bold italic</option>
            </select>
          </QuickMenuField>
        </>
      )}

      {block.type === "image" && (
        <>
          <QuickMenuField label="Width">
            <input
              type="number"
              value={block.w ?? 140}
              onChange={(e) => updateBlock(block.id, { w: Number(e.target.value) || 140 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Height">
            <input
              type="number"
              value={block.h ?? 80}
              onChange={(e) => updateBlock(block.id, { h: Number(e.target.value) || 80 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Radius">
            <input
              type="number"
              value={block.borderRadius ?? 12}
              onChange={(e) => updateBlock(block.id, { borderRadius: Number(e.target.value) || 0 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
        </>
      )}

      {block.type === "box" && (
        <>
          <QuickMenuField label="Width">
            <input
              type="number"
              value={block.w ?? 180}
              onChange={(e) => updateBlock(block.id, { w: Number(e.target.value) || 180 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Height">
            <input
              type="number"
              value={block.h ?? 70}
              onChange={(e) => updateBlock(block.id, { h: Number(e.target.value) || 70 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Color">
            <input
              type="color"
              value={block.color || "#5b4cf0"}
              onChange={(e) => updateBlock(block.id, { color: e.target.value })}
            />
          </QuickMenuField>
          <QuickMenuField label="Radius">
            <input
              type="number"
              value={block.borderRadius ?? 16}
              onChange={(e) => updateBlock(block.id, { borderRadius: Number(e.target.value) || 0 })}
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
        </>
      )}
    </QuickMenu>
  );
}
