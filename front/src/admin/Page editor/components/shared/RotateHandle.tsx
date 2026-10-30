export function RotateHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      contentEditable={false}
      style={{
        position: "absolute",
        top: -30,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 11,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
          cursor: "grab",
          border: "2px solid #ffffff",
          boxShadow: "0 2px 8px rgba(34,211,238,0.55)",
          pointerEvents: "all",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          width: 1,
          height: 14,
          background: "#a78bfa",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
