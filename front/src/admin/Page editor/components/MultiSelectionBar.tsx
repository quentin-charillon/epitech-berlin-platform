import { plainButtonStyle } from "../editorStyles";

export function MultiSelectionBar({
  selectedIds,
  actions,
  setters,
}: {
  selectedIds: string[];
  actions: any;
  setters: any;
}) {
  if (selectedIds.length < 2) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "10px 14px",
        background: "rgba(79,70,229,0.1)",
        borderRadius: 10,
        border: "1px solid rgba(129,140,248,0.25)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#8ea2ff",
          marginRight: 4,
        }}
      >
        {selectedIds.length} selected
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 2 }}>Align:</span>
      {[
        { label: "←", title: "Align left edges", dir: "left" },
        { label: "↔", title: "Center horizontally", dir: "centerH" },
        { label: "→", title: "Align right edges", dir: "right" },
      ].map(({ label, title, dir }) => (
        <button
          key={dir}
          title={title}
          onClick={() => actions.alignBlocks(dir)}
          style={{ ...plainButtonStyle, padding: "5px 10px", fontSize: 15, minWidth: 34 }}
        >
          {label}
        </button>
      ))}
      <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 2px" }}>|</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 2 }}>
        Vertical:
      </span>
      {[
        { label: "↑", title: "Align top edges", dir: "top" },
        { label: "↕", title: "Center vertically", dir: "centerV" },
        { label: "↓", title: "Align bottom edges", dir: "bottom" },
      ].map(({ label, title, dir }) => (
        <button
          key={dir}
          title={title}
          onClick={() => actions.alignBlocks(dir)}
          style={{ ...plainButtonStyle, padding: "5px 10px", fontSize: 15, minWidth: 34 }}
        >
          {label}
        </button>
      ))}
      {selectedIds.length >= 3 && (
        <>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 2px" }}>|</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 2 }}>
            Distribute:
          </span>
          <button
            title="Distribute horizontally"
            onClick={() => actions.distributeBlocks("horizontal")}
            style={{ ...plainButtonStyle, padding: "5px 10px", fontSize: 12 }}
          >
            ⟺ H
          </button>
          <button
            title="Distribute vertically"
            onClick={() => actions.distributeBlocks("vertical")}
            style={{ ...plainButtonStyle, padding: "5px 10px", fontSize: 12 }}
          >
            ⟺ V
          </button>
        </>
      )}
      <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 2px" }}>|</span>
      <button
        title="Group selected blocks into one unit"
        onClick={() => actions.groupSelectedBlocks(selectedIds)}
        style={{
          ...plainButtonStyle,
          padding: "5px 12px",
          fontSize: 12,
          color: "#a78bfa",
          fontWeight: 600,
        }}
      >
        ⊞ Group
      </button>
      <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 2px" }}>|</span>
      <button
        title="Clear selection (Escape or click canvas)"
        onClick={() => setters.clearSelectedIds()}
        style={{ ...plainButtonStyle, padding: "5px 10px", fontSize: 12, color: "#f87171" }}
      >
        ✕ Clear
      </button>
    </div>
  );
}
