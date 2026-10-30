export function SelectedBlockPanel({
  selectedBlock,
  updateBlock,
  deleteBlock,
  blockImageInputRef,
  handleSelectedBlockImageUpload,
  clearSelectedBlockImage,
  openBlockLink,
}) {
  if (!selectedBlock) {
    return (
      <div className="adminEditorPanel">
        <h2>Selected block</h2>
        <div className="adminEditorEmptyState">Click a block in the preview above to edit it.</div>
      </div>
    );
  }

  return (
    <div className="adminEditorPanel">
      <h2>Selected block</h2>

      <div className="adminFormGroup">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: "var(--admin-accent-soft)",
            border: "1px solid var(--admin-border-accent)",
            borderRadius: "var(--admin-radius)",
            fontSize: 13,
          }}
        >
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: "#c4b5fd",
            }}
          >
            {selectedBlock.type === "text"
              ? "Text"
              : selectedBlock.type === "image"
                ? "Image"
                : "Shape"}
          </span>
        </div>

        <h3 style={{ marginTop: 4 }}>Position</h3>
        <div className="adminFormRow">
          <label className="adminLabel">
            <span>X</span>
            <input
              type="number"
              value={selectedBlock.x ?? 0}
              onChange={(e) => updateBlock(selectedBlock.id, { x: Number(e.target.value) || 0 })}
              className="adminInput"
            />
          </label>
          <label className="adminLabel">
            <span>Y</span>
            <input
              type="number"
              value={selectedBlock.y ?? 0}
              onChange={(e) => updateBlock(selectedBlock.id, { y: Number(e.target.value) || 0 })}
              className="adminInput"
            />
          </label>
        </div>

        {selectedBlock.type === "text" && (
          <>
            <h3>Content</h3>
            <label className="adminLabel">
              <span>Text</span>
              <textarea
                value={selectedBlock.text ?? ""}
                onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                className="adminTextarea"
              />
            </label>
            <div className="adminFormRow">
              <label className="adminLabel">
                <span>Size</span>
                <input
                  type="number"
                  value={selectedBlock.fontSize ?? 20}
                  onChange={(e) =>
                    updateBlock(selectedBlock.id, { fontSize: Number(e.target.value) || 20 })
                  }
                  className="adminInput"
                />
              </label>
              <label className="adminLabel">
                <span>Color</span>
                <input
                  type="color"
                  value={selectedBlock.color || "#ffffff"}
                  onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                  className="adminColorInputBlock"
                />
              </label>
            </div>
            <label className="adminLabel">
              <span>Style</span>
              <select
                value={selectedBlock.fontStyle || "normal"}
                onChange={(e) => updateBlock(selectedBlock.id, { fontStyle: e.target.value })}
                className="adminSelect"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="bold">Bold</option>
                <option value="bolditalic">Bold italic</option>
              </select>
            </label>
          </>
        )}

        {selectedBlock.type === "image" && (
          <>
            <h3>Image</h3>
            <label className="adminLabel">
              <span>Image file</span>
              <input
                ref={blockImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelectedBlockImageUpload}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => blockImageInputRef.current?.click()}
                  className="adminBtn adminBtnSecondary adminBtnSm"
                >
                  📁 Upload
                </button>
                <button
                  type="button"
                  onClick={clearSelectedBlockImage}
                  className="adminBtn adminBtnDanger adminBtnSm"
                >
                  Remove
                </button>
              </div>
              {selectedBlock.src ? (
                <img src={selectedBlock.src} alt="Selected block" className="adminImagePreview" />
              ) : null}
            </label>

            <h3>Size</h3>
            <div className="adminFormRow">
              <label className="adminLabel">
                <span>Width</span>
                <input
                  type="number"
                  value={selectedBlock.w ?? 140}
                  onChange={(e) =>
                    updateBlock(selectedBlock.id, { w: Number(e.target.value) || 140 })
                  }
                  className="adminInput"
                />
              </label>
              <label className="adminLabel">
                <span>Height</span>
                <input
                  type="number"
                  value={selectedBlock.h ?? 80}
                  onChange={(e) =>
                    updateBlock(selectedBlock.id, { h: Number(e.target.value) || 80 })
                  }
                  className="adminInput"
                />
              </label>
            </div>
            <label className="adminLabel">
              <span>Corner radius</span>
              <input
                type="number"
                value={selectedBlock.borderRadius ?? 12}
                onChange={(e) =>
                  updateBlock(selectedBlock.id, { borderRadius: Number(e.target.value) || 0 })
                }
                className="adminInput"
              />
            </label>
          </>
        )}

        {selectedBlock.type === "box" && (
          <>
            <h3>Shape</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() =>
                  updateBlock(selectedBlock.id, {
                    zIndex: (selectedBlock.zIndex ?? 1) - 1,
                  })
                }
                className="adminBtn adminBtnSecondary adminBtnSm"
              >
                Send backward
              </button>
              <button
                type="button"
                onClick={() =>
                  updateBlock(selectedBlock.id, { zIndex: (selectedBlock.zIndex ?? 1) + 1 })
                }
                className="adminBtn adminBtnSecondary adminBtnSm"
              >
                Bring forward
              </button>
              <span className="adminHelpText" style={{ alignSelf: "center" }}>
                Layer {selectedBlock.zIndex ?? 1}
              </span>
            </div>
            <div className="adminFormRow">
              <label className="adminLabel">
                <span>Width</span>
                <input
                  type="number"
                  value={selectedBlock.w ?? 180}
                  onChange={(e) =>
                    updateBlock(selectedBlock.id, { w: Number(e.target.value) || 180 })
                  }
                  className="adminInput"
                />
              </label>
              <label className="adminLabel">
                <span>Height</span>
                <input
                  type="number"
                  value={selectedBlock.h ?? 70}
                  onChange={(e) =>
                    updateBlock(selectedBlock.id, { h: Number(e.target.value) || 70 })
                  }
                  className="adminInput"
                />
              </label>
            </div>
            <div className="adminFormRow">
              <label className="adminLabel">
                <span>Color</span>
                <input
                  type="color"
                  value={selectedBlock.color || "#5b4cf0"}
                  onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                  className="adminColorInputBlock"
                />
              </label>
              <label className="adminLabel">
                <span>Radius</span>
                <input
                  type="number"
                  value={selectedBlock.borderRadius ?? 16}
                  onChange={(e) =>
                    updateBlock(selectedBlock.id, { borderRadius: Number(e.target.value) || 0 })
                  }
                  className="adminInput"
                />
              </label>
            </div>
            <label className="adminCheckbox">
              <input
                type="checkbox"
                checked={!!selectedBlock.transparent}
                onChange={(e) => updateBlock(selectedBlock.id, { transparent: e.target.checked })}
              />
              <span>Transparent fill</span>
            </label>
            <label className="adminLabel">
              <span>Opacity</span>
              <div className="adminRangeRow">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedBlock.opacity ?? 1}
                  onChange={(e) => updateBlock(selectedBlock.id, { opacity: Number(e.target.value) })}
                  className="adminRange"
                />
                <span className="adminRangeValue">{Math.round((selectedBlock.opacity ?? 1) * 100)}%</span>
              </div>
            </label>
            <label className="adminCheckbox">
              <input
                type="checkbox"
                checked={!!selectedBlock.borderEnabled}
                onChange={(e) => updateBlock(selectedBlock.id, { borderEnabled: e.target.checked })}
              />
              <span>Enable border</span>
            </label>
            {selectedBlock.borderEnabled && (
              <div className="adminFormRow">
                <label className="adminLabel">
                  <span>Border color</span>
                  <input
                    type="color"
                    value={selectedBlock.borderColor || "#ffffff"}
                    onChange={(e) => updateBlock(selectedBlock.id, { borderColor: e.target.value })}
                    className="adminColorInputBlock"
                  />
                </label>
                <label className="adminLabel">
                  <span>Border width</span>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={selectedBlock.borderWidth ?? 2}
                    onChange={(e) =>
                      updateBlock(selectedBlock.id, { borderWidth: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="adminInput"
                  />
                </label>
              </div>
            )}
          </>
        )}

        <h3>Link</h3>
        <label className="adminLabel">
          <span>{selectedBlock.type === "image" ? "Image link" : "Click target"}</span>
          <input
            type="text"
            value={selectedBlock.linkTarget ?? ""}
            onChange={(e) => updateBlock(selectedBlock.id, { linkTarget: e.target.value })}
            placeholder={
              selectedBlock.type === "image" ? "https://... or /about" : "/ or https://..."
            }
            className="adminInput"
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => openBlockLink(selectedBlock)}
            disabled={!selectedBlock.linkTarget}
            className="adminBtn adminBtnSecondary adminBtnSm"
          >
            Test ↗
          </button>
          <button
            type="button"
            onClick={() => updateBlock(selectedBlock.id, { linkTarget: "/" })}
            className="adminBtn adminBtnGhost adminBtnSm"
          >
            Link to home
          </button>
          <button
            type="button"
            onClick={() => updateBlock(selectedBlock.id, { linkTarget: "" })}
            className="adminBtn adminBtnGhost adminBtnSm"
          >
            Remove link
          </button>
        </div>
        <p className="adminHelpText">
          Tip: use <code className="adminInlineCode">https://...</code> for an external site or{" "}
          <code className="adminInlineCode">/about</code> for an internal page.{" "}
          <code className="adminInlineCode">Ctrl+click</code> to test from the preview.
        </p>

        <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--admin-border)" }}>
          <button
            onClick={() => deleteBlock(selectedBlock.id)}
            className="adminBtn adminBtnDanger"
            style={{ width: "100%" }}
          >
            🗑 Delete this block
          </button>
        </div>
      </div>
    </div>
  );
}
