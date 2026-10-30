import { quickMenuInputStyle } from "../../editorStyles";

export function QuickMenu({
  x,
  y,
  menuRef,
  children,
}: {
  x: number;
  y: number;
  menuRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const maxHeight = Math.max(220, window.innerHeight - y - 12);

  return (
    <div
      ref={menuRef}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.scrollTop += e.deltaY;
      }}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 1000,
        minWidth: 260,
        maxWidth: 340,
        maxHeight,
        overflowY: "auto",
        overscrollBehavior: "contain",
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(20,20,40,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.1)",
        display: "grid",
        gap: 10,
        color: "#f5f5fb",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export function QuickMenuTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "#8ea2ff",
        paddingTop: 4,
      }}
    >
      {children}
    </div>
  );
}

export function QuickMenuButton({
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 12px",
        borderRadius: 10,
        border: danger ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.08)",
        background: danger
          ? "rgba(239,68,68,0.12)"
          : disabled
            ? "rgba(30,30,55,0.4)"
            : "rgba(30,30,55,0.85)",
        color: disabled ? "rgba(245,245,251,0.35)" : danger ? "#fca5a5" : "#f5f5fb",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "inherit",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

export function QuickMenuField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(245,245,251,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export { quickMenuInputStyle };
