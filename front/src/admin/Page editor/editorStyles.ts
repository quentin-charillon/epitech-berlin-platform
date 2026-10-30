import type React from "react";

export const inputStyle: React.CSSProperties = {
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(10,10,25,0.6)",
  color: "#f5f5fb",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
};

export const smallInputStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(10,10,25,0.6)",
  color: "#f5f5fb",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

export const quickMenuInputStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(10,10,25,0.75)",
  color: "#f5f5fb",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

export const plainButtonStyle: React.CSSProperties = {
  padding: "9px 16px",
  background: "rgba(30,30,55,0.85)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 10,
  color: "#f5f5fb",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "inherit",
};

export const saveButtonStyle: React.CSSProperties = {
  padding: "9px 20px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
  transition: "all 0.2s ease",
  fontFamily: "inherit",
};

export const dangerButtonStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.12)",
  color: "#fca5a5",
  border: "1px solid rgba(239,68,68,0.25)",
  padding: "7px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  transition: "all 0.2s ease",
  fontFamily: "inherit",
};

export const panelStyle: React.CSSProperties = {
  background: "rgba(22,22,40,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 20,
  display: "grid",
  gap: 16,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
};

export const editorPanelStyle: React.CSSProperties = {
  background: "rgba(22,22,40,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  padding: 24,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
};

export const sectionStyle: React.CSSProperties = {
  background: "rgba(15,15,30,0.5)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: 18,
};

export const previewTextBoxStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 10,
  background: "rgba(10,10,25,0.6)",
  border: "1px solid rgba(255,255,255,0.08)",
  lineHeight: 1.6,
};

export const selectionHintStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 10,
  background: "rgba(124,58,237,0.08)",
  border: "1px dashed rgba(129,140,248,0.3)",
  color: "#c4b5fd",
  fontSize: 13,
  lineHeight: 1.5,
};

export const rowWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
  marginTop: 12,
  alignItems: "flex-end",
};

export const quickMenuActionRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 8,
};

export const quickPreviewStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  background: "rgba(10,10,25,0.6)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
  lineHeight: 1.5,
  color: "#f5f5fb",
};

export const menuBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 999,
  background: "rgba(0,0,0,0.2)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};

export const gradientPickerStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  minWidth: 320,
};

export const gradientControlsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "end",
  flexWrap: "wrap",
};

export const compactGradientStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

export const compactGradientRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 8,
  alignItems: "center",
};

export const gradientPreviewStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
};

export const shapePickerPanelStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  zIndex: 9999,
  background: "var(--admin-surface, #1a1a2e)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "12px 14px",
  minWidth: 240,
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

export const shapePickerCategoryStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.4)",
  marginBottom: 6,
  marginTop: 4,
};

export const shapePickerGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 4,
  marginBottom: 4,
};

export const shapeTypeButtonStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  padding: "6px 4px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
  lineHeight: 1,
};

export const filterBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  background: "rgba(20,20,40,0.9)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(129,140,248,0.3)",
  borderRadius: 12,
  padding: 12,
  minWidth: 220,
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
};

export function toolButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: "9px 16px",
    background: active
      ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
      : "rgba(30,30,55,0.85)",
    border: active ? "1px solid rgba(129,140,248,0.5)" : "1px solid rgba(255,255,255,0.14)",
    borderRadius: 10,
    color: "#f5f5fb",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: active ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  };
}

export function imageStyle(borderRadius?: number): React.CSSProperties {
  return {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius,
    display: "block",
  };
}
