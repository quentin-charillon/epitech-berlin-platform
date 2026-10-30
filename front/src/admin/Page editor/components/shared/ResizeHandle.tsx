export function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      contentEditable={false}
      style={{
        position: "absolute",
        right: -6,
        bottom: -6,
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
        cursor: "nwse-resize",
        border: "2px solid #ffffff",
        boxShadow: "0 2px 8px rgba(124,58,237,0.5)",
        zIndex: 10,
      }}
    />
  );
}
