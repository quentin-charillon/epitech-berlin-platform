import { useState } from "react";
import { Link } from "react-router-dom";
import {
  plainButtonStyle,
  saveButtonStyle,
  shapePickerPanelStyle,
  shapePickerCategoryStyle,
  shapePickerGridStyle,
  shapeTypeButtonStyle,
  toolButtonStyle,
} from "../editorStyles";

// ---------- helpers ----------

function Swatch({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (v: string) => void;
  title: string;
}) {
  return (
    <label
      title={title}
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: value,
        border: "2px solid rgba(255,255,255,0.2)",
        cursor: "pointer",
        flexShrink: 0,
        display: "block",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: "absolute",
          opacity: 0,
          width: "200%",
          height: "200%",
          cursor: "pointer",
          top: "-50%",
          left: "-50%",
        }}
      />
    </label>
  );
}

const LABEL: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.3)",
  marginBottom: 6,
  userSelect: "none",
};

const GROUP: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const SEP: React.CSSProperties = {
  width: 1,
  height: 32,
  background: "rgba(255,255,255,0.09)",
  flexShrink: 0,
  margin: "0 10px",
  alignSelf: "flex-end",
  marginBottom: 2,
};

// ---------- component ----------

export function Toolbar({
  modes,
  textColor,
  boxColor,
  isDirty,
  pendingInsertPointRef,
  fileInputRef,
  galleryInputRef,
  videoInputRef,
  onPickImage,
  onPickGallery,
  onPickVideo,
  setters,
  actions,
  showToast,
}: {
  modes: Record<string, boolean>;
  textColor: string;
  boxColor: string;
  isDirty: boolean;
  pendingInsertPointRef: React.MutableRefObject<{ x: number; y: number } | null>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  galleryInputRef: React.RefObject<HTMLInputElement>;
  videoInputRef: React.RefObject<HTMLInputElement>;
  onPickImage: React.ChangeEventHandler<HTMLInputElement>;
  onPickGallery: React.ChangeEventHandler<HTMLInputElement>;
  onPickVideo: React.ChangeEventHandler<HTMLInputElement>;
  setters: any;
  actions: any;
  showToast: (message: string, type?: string) => void;
}) {
  const [showShapePicker, setShowShapePicker] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0,
        rowGap: 10,
        padding: "10px 16px",
        background: "rgba(14,14,28,0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
        zIndex: 200,
      }}
    >
      {/* ── Content ── */}
      <div style={GROUP}>
        <span style={LABEL}>Content</span>
        <div style={ROW}>
          <button onClick={() => actions.setMode("text")} style={toolButtonStyle(modes.text)}>
            Text
          </button>
          <Swatch
            value={textColor}
            onChange={(v) => setters.setTextColor(v)}
            title="Default text colour"
          />

          <div style={{ width: 8 }} />

          <button onClick={() => actions.setMode("box")} style={toolButtonStyle(modes.box)}>
            Box
          </button>
          <Swatch
            value={boxColor}
            onChange={(v) => setters.setBoxColor(v)}
            title="Default box colour"
          />
        </div>
      </div>

      <div style={SEP} />

      {/* ── Media ── */}
      <div style={GROUP}>
        <span style={LABEL}>Media</span>
        <div style={ROW}>
          <button
            onClick={() => {
              pendingInsertPointRef.current = { x: 100, y: 100 };
              fileInputRef.current?.click();
            }}
            style={plainButtonStyle}
          >
            Image
          </button>
          <button
            onClick={() => {
              pendingInsertPointRef.current = { x: 100, y: 100 };
              videoInputRef.current?.click();
            }}
            style={plainButtonStyle}
          >
            Video
          </button>
        </div>
      </div>

      <div style={SEP} />

      {/* ── Elements ── */}
      <div style={GROUP}>
        <span style={LABEL}>Elements</span>
        <div style={ROW}>
          <button onClick={() => actions.setMode("emoji")} style={toolButtonStyle(modes.emoji)}>
            Emoji
          </button>
          <button onClick={() => actions.setMode("filter")} style={toolButtonStyle(modes.filter)}>
            Filter
          </button>
          <button
            onClick={() => actions.setMode("countdown")}
            style={toolButtonStyle(modes.countdown)}
          >
            Countdown
          </button>

          {/* Shapes dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowShapePicker((prev) => !prev)}
              style={toolButtonStyle(modes.shape)}
            >
              Shapes ▾
            </button>
            {showShapePicker && (
              <div style={shapePickerPanelStyle} onMouseDown={(e) => e.stopPropagation()}>
                <div style={shapePickerCategoryStyle}>Lines</div>
                <div style={shapePickerGridStyle}>
                  {[
                    { type: "line", label: "Line", icon: "─" },
                    { type: "diagonal", label: "Diagonal", icon: "╱" },
                    { type: "zigzag", label: "Zigzag", icon: "⚡" },
                    { type: "wave", label: "Wave", icon: "〜" },
                    { type: "dashed", label: "Dashed", icon: "╌" },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      style={shapeTypeButtonStyle}
                      onClick={() => {
                        actions.setShapeMode(type);
                        setShowShapePicker(false);
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
                      <span style={{ fontSize: 11 }}>{label}</span>
                    </button>
                  ))}
                </div>
                <div style={shapePickerCategoryStyle}>Shapes</div>
                <div style={shapePickerGridStyle}>
                  {[
                    { type: "circle", label: "Circle", icon: "○" },
                    { type: "rect", label: "Rect", icon: "□" },
                    { type: "triangle", label: "Triangle", icon: "△" },
                    { type: "diamond", label: "Diamond", icon: "◇" },
                    { type: "star", label: "Star", icon: "★" },
                    { type: "arrow", label: "Arrow", icon: "→" },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      style={shapeTypeButtonStyle}
                      onClick={() => {
                        actions.setShapeMode(type);
                        setShowShapePicker(false);
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
                      <span style={{ fontSize: 11 }}>{label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                  Click on canvas to place
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* push settings + actions to the right */}
      <div style={{ flex: 1, minWidth: 16 }} />

      <div style={SEP} />

      {/* ── Actions ── */}
      <div style={GROUP}>
        <span style={LABEL}>Actions</span>
        <div style={ROW}>
          <button
            onClick={async () => {
              const result = await actions.save();
              if (result?.ok) {
                showToast("Page saved");
              } else {
                showToast("Save failed — try again", "error");
              }
            }}
            style={{ ...saveButtonStyle, position: "relative" }}
          >
            {isDirty && (
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  border: "2px solid #0a0a18",
                  pointerEvents: "none",
                }}
              />
            )}
            Save
          </button>
          <Link
            to="/admin/pages"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#818cf8",
              textDecoration: "none",
              padding: "9px 14px",
              borderRadius: 10,
              background: "rgba(129,140,248,0.08)",
              border: "1px solid rgba(129,140,248,0.2)",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
            }}
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" hidden onChange={onPickImage} />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onPickGallery}
      />
      <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={onPickVideo} />
    </div>
  );
}
