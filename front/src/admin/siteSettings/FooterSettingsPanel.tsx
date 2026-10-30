export function FooterSettingsPanel({
  footer,
  setFooterField,
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
      <h2>Footer settings</h2>

      <div className="adminFormGroup">
        <label className="adminCheckbox">
          <input
            type="checkbox"
            checked={!!footer.enabled}
            onChange={(e) => setFooterField("enabled", e.target.checked)}
          />
          <span>Enable global footer</span>
        </label>

        <h3 style={{ marginTop: 8 }}>Appearance</h3>

        <label className="adminLabel">
          <span>Background color</span>
          <div className="adminColorRow">
            <input
              type="color"
              value={footer.backgroundColor || "#1a1a2e"}
              onChange={(e) => setFooterField("backgroundColor", e.target.value)}
              className="adminColorInput"
            />
            <input
              type="text"
              value={footer.backgroundColor || "#1a1a2e"}
              onChange={(e) => setFooterField("backgroundColor", e.target.value)}
              className="adminInput"
            />
          </div>
        </label>

        <label className="adminLabel">
          <span>Footer height (px)</span>
          <input
            type="number"
            min="60"
            max="600"
            value={footer.height ?? 160}
            onChange={(e) => setFooterField("height", Number(e.target.value) || 160)}
            className="adminInput"
          />
        </label>

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
          {footer.backgroundImage ? (
            <img
              src={footer.backgroundImage}
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
              value={footer.backgroundPositionX ?? 50}
              onChange={(e) => setFooterField("backgroundPositionX", Number(e.target.value))}
              className="adminRange"
            />
            <span className="adminRangeValue">{footer.backgroundPositionX ?? 50}%</span>
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
              value={footer.backgroundPositionY ?? 50}
              onChange={(e) => setFooterField("backgroundPositionY", Number(e.target.value))}
              className="adminRange"
            />
            <span className="adminRangeValue">{footer.backgroundPositionY ?? 50}%</span>
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
              value={footer.overlayOpacity ?? 0.35}
              onChange={(e) => setFooterField("overlayOpacity", Number(e.target.value))}
              className="adminRange"
            />
            <span className="adminRangeValue">{(footer.overlayOpacity ?? 0.35).toFixed(2)}</span>
          </div>
        </label>
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
          <button
            onClick={() => addImageLinkBlock()}
            className="adminBtn adminBtnSecondary adminBtnSm"
          >
            + Clickable image
          </button>
          <button onClick={() => addBoxBlock()} className="adminBtn adminBtnSecondary adminBtnSm">
            + Shape
          </button>
        </div>
      </div>
    </div>
  );
}
