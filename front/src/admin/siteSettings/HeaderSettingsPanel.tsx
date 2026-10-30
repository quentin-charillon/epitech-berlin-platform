function SettingsCategory({ title, description, children, open = false }) {
  return (
    <details
      open={open}
      style={{
        border: "1px solid var(--admin-border)",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <summary
        style={{ cursor: "pointer", padding: "14px 16px", fontWeight: 700, userSelect: "none" }}
      >
        {title}
        {description ? (
          <span style={{ display: "block", marginTop: 4, fontSize: 12, fontWeight: 400, opacity: 0.6 }}>
            {description}
          </span>
        ) : null}
      </summary>
      <div className="adminFormGroup" style={{ padding: "4px 16px 16px" }}>
        {children}
      </div>
    </details>
  );
}

export function HeaderSettingsPanel({
  header,
  setHeaderField,
  backgroundInputRef,
  handleBackgroundUpload,
  clearBackgroundImage,
  addTextBlock,
  addImageBlock,
  addImageLinkBlock,
  addBoxBlock,
}) {
  return (
    <div className="adminEditorPanel">
      <h2>Header settings</h2>

      <div className="adminFormGroup">
        <label className="adminCheckbox">
          <input
            type="checkbox"
            checked={!!header.enabled}
            onChange={(e) => setHeaderField("enabled", e.target.checked)}
          />
          <span>Enable global header</span>
        </label>

        <SettingsCategory title="General appearance" description="Header background and height." open>

        <label className="adminLabel">
          <span>Background color</span>
          <div className="adminColorRow">
            <input
              type="color"
              value={header.backgroundColor || "#3a3a3a"}
              onChange={(e) => setHeaderField("backgroundColor", e.target.value)}
              className="adminColorInput"
            />
            <input
              type="text"
              value={header.backgroundColor || "#3a3a3a"}
              onChange={(e) => setHeaderField("backgroundColor", e.target.value)}
              className="adminInput"
            />
          </div>
        </label>

        <label className="adminLabel">
          <span>Header height (px)</span>
          <input
            type="number"
            min="60"
            max="500"
            value={header.height ?? 120}
            onChange={(e) => setHeaderField("height", Number(e.target.value) || 120)}
            className="adminInput"
          />
        </label>

        </SettingsCategory>

        <SettingsCategory title="Pages" description="Main page titles displayed in the navigation." open>
        <div className="adminFormRow">
          <label className="adminLabel">
            <span>Horizontal position</span>
            <input
              type="number"
              value={header.navigation?.offsetX ?? 0}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  offsetX: Number(e.target.value) || 0,
                })
              }
              className="adminInput"
            />
          </label>
          <label className="adminLabel">
            <span>Vertical position</span>
            <input
              type="number"
              value={header.navigation?.offsetY ?? 0}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  offsetY: Number(e.target.value) || 0,
                })
              }
              className="adminInput"
            />
          </label>
        </div>

        <div className="adminFormRow">
          <label className="adminLabel">
            <span>Text color</span>
            <input
              type="color"
              value={header.navigation?.color ?? "#ffffff"}
              onChange={(e) =>
                setHeaderField("navigation", { ...header.navigation, color: e.target.value })
              }
              className="adminColorInputBlock"
            />
          </label>
          <label className="adminLabel">
            <span>Text size</span>
            <input
              type="number"
              min="8"
              max="80"
              value={header.navigation?.fontSize ?? 16}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  fontSize: Math.max(8, Number(e.target.value) || 16),
                })
              }
              className="adminInput"
            />
          </label>
        </div>
        </SettingsCategory>

        <SettingsCategory title="Subpages" description="Dropdown menus and subpage titles.">
        <div className="adminFormRow">
          <label className="adminLabel">
            <span>Horizontal position</span>
            <input
              type="number"
              value={header.navigation?.submenu?.offsetX ?? 0}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, offsetX: Number(e.target.value) || 0 },
                })
              }
              className="adminInput"
            />
          </label>
          <label className="adminLabel">
            <span>Vertical position</span>
            <input
              type="number"
              value={header.navigation?.submenu?.offsetY ?? 0}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, offsetY: Number(e.target.value) || 0 },
                })
              }
              className="adminInput"
            />
          </label>
        </div>
        <div className="adminFormRow">
          <label className="adminLabel">
            <span>Text color</span>
            <input
              type="color"
              value={header.navigation?.submenu?.color ?? "#ffffff"}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, color: e.target.value },
                })
              }
              className="adminColorInputBlock"
            />
          </label>
          <label className="adminLabel">
            <span>Text size</span>
            <input
              type="number"
              min="8"
              max="80"
              value={header.navigation?.submenu?.fontSize ?? 16}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, fontSize: Math.max(8, Number(e.target.value) || 16) },
                })
              }
              className="adminInput"
            />
          </label>
        </div>
        <div className="adminFormRow">
          <label className="adminLabel">
            <span>Background color</span>
            <input
              type="color"
              value={header.navigation?.submenu?.backgroundColor ?? "#0a0a23"}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, backgroundColor: e.target.value },
                })
              }
              className="adminColorInputBlock"
            />
          </label>
          <label className="adminLabel">
            <span>Menu width</span>
            <input
              type="number"
              min="80"
              value={header.navigation?.submenu?.minWidth ?? 200}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, minWidth: Math.max(80, Number(e.target.value) || 200) },
                })
              }
              className="adminInput"
            />
          </label>
        </div>
        <label className="adminLabel">
          <span>Background opacity</span>
          <div className="adminRangeRow">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={header.navigation?.submenu?.backgroundOpacity ?? 1}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, backgroundOpacity: Number(e.target.value) },
                })
              }
              className="adminRange"
            />
            <span className="adminRangeValue">
              {Math.round((header.navigation?.submenu?.backgroundOpacity ?? 1) * 100)}%
            </span>
          </div>
        </label>
        <label className="adminCheckbox">
          <input
            type="checkbox"
            checked={!!header.navigation?.submenu?.transparentBackground}
            onChange={(e) =>
              setHeaderField("navigation", {
                ...header.navigation,
                submenu: {
                  ...header.navigation?.submenu,
                  transparentBackground: e.target.checked,
                },
              })
            }
          />
          <span>Transparent background</span>
        </label>
        <label className="adminCheckbox">
          <input
            type="checkbox"
            checked={header.navigation?.submenu?.borderEnabled ?? true}
            onChange={(e) =>
              setHeaderField("navigation", {
                ...header.navigation,
                submenu: { ...header.navigation?.submenu, borderEnabled: e.target.checked },
              })
            }
          />
          <span>Enable submenu border</span>
        </label>
        <div className="adminFormRow">
          <label className="adminLabel">
            <span>Border color</span>
            <input
              type="color"
              value={header.navigation?.submenu?.borderColor ?? "#2a2a45"}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, borderColor: e.target.value },
                })
              }
              className="adminColorInputBlock"
            />
          </label>
          <label className="adminLabel">
            <span>Border width</span>
            <input
              type="number"
              min="0"
              value={header.navigation?.submenu?.borderWidth ?? 1}
              onChange={(e) =>
                setHeaderField("navigation", {
                  ...header.navigation,
                  submenu: { ...header.navigation?.submenu, borderWidth: Math.max(0, Number(e.target.value) || 0) },
                })
              }
              className="adminInput"
            />
          </label>
        </div>
        <label className="adminLabel">
          <span>Corner radius</span>
          <input
            type="number"
            min="0"
            value={header.navigation?.submenu?.borderRadius ?? 14}
            onChange={(e) =>
              setHeaderField("navigation", {
                ...header.navigation,
                submenu: { ...header.navigation?.submenu, borderRadius: Math.max(0, Number(e.target.value) || 0) },
              })
            }
            className="adminInput"
          />
        </label>
        </SettingsCategory>

        {false && <SettingsCategory title="Background image" description="Image, position and overlay.">
        <label className="adminLabel">
          <span>Background image</span>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => backgroundInputRef.current?.click()}
              className="adminBtn adminBtnSecondary adminBtnSm"
            >
              📁 Upload
            </button>
            <button
              type="button"
              onClick={clearBackgroundImage}
              className="adminBtn adminBtnDanger adminBtnSm"
            >
              Remove
            </button>
          </div>
          {header.backgroundImage ? (
            <img
              src={header.backgroundImage}
              alt="Background preview"
              className="adminImagePreview"
            />
          ) : null}
        </label>

        <label className="adminLabel">
          <span>Background position — horizontal</span>
          <div className="adminRangeRow">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={header.backgroundPositionX ?? 50}
              onChange={(e) => setHeaderField("backgroundPositionX", Number(e.target.value))}
              className="adminRange"
            />
            <span className="adminRangeValue">{header.backgroundPositionX ?? 50}%</span>
          </div>
        </label>

        <label className="adminLabel">
          <span>Background position — vertical</span>
          <div className="adminRangeRow">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={header.backgroundPositionY ?? 50}
              onChange={(e) => setHeaderField("backgroundPositionY", Number(e.target.value))}
              className="adminRange"
            />
            <span className="adminRangeValue">{header.backgroundPositionY ?? 50}%</span>
          </div>
        </label>

        <label className="adminLabel">
          <span>Overlay opacity</span>
          <div className="adminRangeRow">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={header.overlayOpacity ?? 0.35}
              onChange={(e) => setHeaderField("overlayOpacity", Number(e.target.value))}
              className="adminRange"
            />
            <span className="adminRangeValue">{(header.overlayOpacity ?? 0.35).toFixed(2)}</span>
          </div>
        </label>
        </SettingsCategory>}
      </div>

      <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--admin-border)" }}>
        <h3>Add a block</h3>
        <p className="adminHelpText" style={{ marginBottom: 12 }}>
          Tip: right-click on the preview to insert at a specific spot.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => addTextBlock()} className="adminBtn adminBtnSecondary adminBtnSm">
            + Text
          </button>
          <button onClick={() => addImageBlock()} className="adminBtn adminBtnSecondary adminBtnSm">
            + Image
          </button>
          <button onClick={() => addBoxBlock()} className="adminBtn adminBtnSecondary adminBtnSm">
            + Shape
          </button>
        </div>
      </div>
    </div>
  );
}
