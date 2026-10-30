import { useState } from "react";
import { buildLinearGradient, getBlockGradientConfig } from "../../../../utils/gradients";
import { getTextPreview, normalizeTextBlock } from "../../../../utils/textSegments";
import {
  dangerButtonStyle,
  editorPanelStyle,
  inputStyle,
  plainButtonStyle,
  previewTextBoxStyle,
  rowWrapStyle,
  sectionStyle,
  selectionHintStyle,
  smallInputStyle,
} from "../../editorStyles";
import { getTextSegmentStyle } from "../../utils/textBlockUtils";
import { BorderEditor } from "../shared/BorderEditor";
import { ColorInput } from "../shared/ColorInput";
import { Field } from "../shared/Field";
import { GradientPicker } from "../shared/GradientPicker";

function CategoriesEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  function addTag(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
      <span
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Categories
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 28 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(79,70,229,0.25)",
              border: "1px solid rgba(79,70,229,0.5)",
              color: "#a5b4fc",
              borderRadius: 20,
              padding: "2px 8px 2px 10px",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(165,180,252,0.6)",
                cursor: "pointer",
                padding: "0 1px",
                lineHeight: 1,
                fontSize: 13,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
            setInputValue("");
          }
        }}
        onBlur={() => {
          if (inputValue.trim()) {
            addTag(inputValue);
            setInputValue("");
          }
        }}
        placeholder="Add category, press Enter"
        style={{ ...smallInputStyle, minWidth: 200 }}
      />
    </div>
  );
}

export function PropertiesPanel({
  selected,
  actions,
  highestZIndex,
  pendingInsertPointRef,
  galleryInputRef,
  hideHeader = false,
}: {
  selected: any;
  actions: any;
  highestZIndex: number;
  pendingInsertPointRef: React.MutableRefObject<{ x: number; y: number }>;
  galleryInputRef: React.RefObject<HTMLInputElement>;
  hideHeader?: boolean;
}) {
  if (!selected) return null;

  const selectedTextBlock = selected.type === "text" ? normalizeTextBlock(selected) : null;
  const selectedTextGradient = selected.type === "text" ? getBlockGradientConfig(selected) : null;
  const selectedBoxGradient = selected.type === "box" ? getBlockGradientConfig(selected) : null;

  const content = (
    <>
      {/* Position, layer, lock, rotation */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Field label="X">
          <input
            type="number"
            value={selected.x ?? 0}
            onChange={(e) => actions.updateSelected({ x: Number(e.target.value) || 0 })}
            style={smallInputStyle}
          />
        </Field>
        <Field label="Y">
          <input
            type="number"
            value={selected.y ?? 0}
            onChange={(e) => actions.updateSelected({ y: Number(e.target.value) || 0 })}
            style={smallInputStyle}
          />
        </Field>
        <Field label="Z index">
          <input
            type="number"
            value={selected.zIndex ?? 1}
            onChange={(e) => actions.updateSelected({ zIndex: Number(e.target.value) || 1 })}
            style={smallInputStyle}
          />
        </Field>

        {selected.type !== "filter" && (
          <CategoriesEditor
            tags={selected.filterTags || []}
            onChange={(tags) => actions.updateSelected({ filterTags: tags })}
          />
        )}

        {selected.type !== "filter" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Filter group
            </span>
            <input
              style={inputStyle}
              placeholder="ex: listings-paris"
              value={selected.filterGroup || ""}
              onChange={(e) =>
                actions.updateSelected({ filterGroup: e.target.value || undefined })
              }
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>
              Same group as the filter = counted, shown and moved with that filter
            </span>
          </div>
        )}

        {(selected.type === "text" ||
          selected.type === "link" ||
          selected.type === "image" ||
          selected.type === "imageLink" ||
          selected.type === "box" ||
          selected.type === "flipCard") && (
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={selected.hoverEnabled || false}
              onChange={(e) => actions.updateSelected({ hoverEnabled: e.target.checked })}
            />
            Hover effect
          </label>
        )}

        {selected.hoverEnabled && (
          <>
            <Field label="Hover scale">
              <input
                type="number"
                step="0.05"
                min="1"
                max="3"
                value={selected.hoverScale || 1.1}
                onChange={(e) => actions.updateSelected({ hoverScale: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 100 }}
              />
            </Field>
            <Field label="Hover duration (s)">
              <input
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={selected.hoverDuration || 0.25}
                onChange={(e) => actions.updateSelected({ hoverDuration: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 120 }}
              />
            </Field>
          </>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={selected.locked || false}
            onChange={(e) => actions.updateSelected({ locked: e.target.checked })}
          />
          Lock (prevent drag)
        </label>

        <Field label="Rotation (deg)">
          <input
            type="number"
            step="1"
            min="-360"
            max="360"
            value={selected.rotation ?? 0}
            onChange={(e) => actions.updateSelected({ rotation: Number(e.target.value) || 0 })}
            style={{ ...smallInputStyle, width: 100 }}
          />
        </Field>
      </div>

      {/* Shadow & Border */}
      <div style={sectionStyle}>
        <strong>Shadow &amp; Border</strong>
        <div style={rowWrapStyle}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={selected.shadowEnabled || false}
              onChange={(e) => actions.updateSelected({ shadowEnabled: e.target.checked })}
            />
            Shadow
          </label>
          {selected.shadowEnabled && (
            <>
              <Field label="X">
                <input
                  type="number"
                  value={selected.shadowX ?? 4}
                  onChange={(e) => actions.updateSelected({ shadowX: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Y">
                <input
                  type="number"
                  value={selected.shadowY ?? 4}
                  onChange={(e) => actions.updateSelected({ shadowY: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Blur">
                <input
                  type="number"
                  min="0"
                  value={selected.shadowBlur ?? 12}
                  onChange={(e) => actions.updateSelected({ shadowBlur: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Color">
                <input
                  type="color"
                  value={selected.shadowColor || "#000000"}
                  onChange={(e) => actions.updateSelected({ shadowColor: e.target.value })}
                />
              </Field>
              <Field label="Opacity">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selected.shadowOpacity ?? 0.4}
                  onChange={(e) =>
                    actions.updateSelected({ shadowOpacity: Number(e.target.value) })
                  }
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
            </>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={selected.borderEnabled || false}
              onChange={(e) => actions.updateSelected({ borderEnabled: e.target.checked })}
            />
            Border
          </label>
          {selected.borderEnabled && (
            <BorderEditor selected={selected} onUpdate={(patch) => actions.updateSelected(patch)} />
          )}
        </div>
      </div>

      {/* Text */}
      {selectedTextBlock && (
        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <strong>Text styling</strong>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              Preview: {getTextPreview(selectedTextBlock)}
            </span>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
              <Field label="Size Y (px)">
                <input
                  type="number"
                  value={Math.round(selectedTextBlock.fontSize || 16)}
                  onChange={(e) =>
                    actions.updateSelected({ fontSize: Number(e.target.value) || 16 })
                  }
                  style={{ ...smallInputStyle, width: 90 }}
                />
              </Field>
              <Field label="Size X (%)">
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={Math.round((selectedTextBlock.scaleX ?? 1) * 100)}
                  onChange={(e) =>
                    actions.updateSelected({
                      scaleX: (Number(e.target.value) || 100) / 100,
                    })
                  }
                  style={{ ...smallInputStyle, width: 90 }}
                />
              </Field>
            </div>
          </div>

          <div style={previewTextBoxStyle}>
            {selectedTextBlock.segments.map((segment: any) => (
              <span key={segment.id} style={getTextSegmentStyle(segment, selectedTextBlock)}>
                {segment.text}
              </span>
            ))}
          </div>

          <Field label="Font">
            <select
              value={selectedTextBlock.fontFamily || "inherit"}
              onChange={(e) =>
                actions.updateSelected({ fontFamily: e.target.value })
              }
              style={smallInputStyle}
            >
              <option value="inherit">Default</option>
              <option value="'Anton', sans-serif">Anton (Epitech)</option>
              <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans (Epitech)</option>
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Playfair Display', serif">Playfair Display</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto Mono', monospace">Roboto Mono</option>
              <option value="'DM Serif Display', serif">DM Serif Display</option>
            </select>
          </Field>

          <Field label="Text content">
            <textarea
              value={selectedTextBlock.text || ""}
              onChange={(e) =>
                actions.updateSelected({
                  text: e.target.value,
                  segments: [
                    {
                      id: selectedTextBlock.segments[0]?.id || `seg_${selected.id}`,
                      text: e.target.value,
                      color:
                        selectedTextBlock.segments[0]?.color ||
                        selectedTextBlock.color ||
                        "#ffffff",
                      fontStyle:
                        selectedTextBlock.segments[0]?.fontStyle ||
                        selectedTextBlock.fontStyle ||
                        "normal",
                      fillType:
                        selectedTextBlock.segments[0]?.fillType ||
                        selectedTextBlock.fillType ||
                        "color",
                      gradientStart:
                        selectedTextBlock.segments[0]?.gradientStart ||
                        selectedTextGradient?.start ||
                        "#ffffff",
                      gradientEnd:
                        selectedTextBlock.segments[0]?.gradientEnd ||
                        selectedTextGradient?.end ||
                        "#f59e0b",
                      gradientAngle:
                        selectedTextBlock.segments[0]?.gradientAngle ||
                        selectedTextGradient?.angle ||
                        135,
                      fontSize:
                        selectedTextBlock.segments[0]?.fontSize || selectedTextBlock.fontSize || 16,
                    },
                  ],
                })
              }
              style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            />
          </Field>

          <Field label="Link URL">
            <input
              placeholder="https://..."
              value={selected.url || ""}
              onChange={(e) => actions.updateSelected({ url: e.target.value })}
              style={{ ...inputStyle }}
            />
          </Field>

          <div style={selectionHintStyle}>
            Select letters directly inside the text block on the canvas, then right-click to edit
            only that selection.
          </div>

          <GradientPicker
            label="Color"
            start={selectedTextGradient?.start || "#ffffff"}
            end={selectedTextGradient?.end || "#f59e0b"}
            angle={selectedTextGradient?.angle || 135}
            preview={buildLinearGradient(
              selectedTextGradient?.angle || 135,
              selectedTextGradient?.start || "#ffffff",
              selectedTextGradient?.end || "#f59e0b"
            )}
            onStartChange={(value) =>
              actions.updateSelected({
                gradientStart: value,
                gradient: buildLinearGradient(
                  selectedTextGradient?.angle || 135,
                  value,
                  selectedTextGradient?.end || "#f59e0b"
                ),
              })
            }
            onEndChange={(value) =>
              actions.updateSelected({
                gradientEnd: value,
                gradient: buildLinearGradient(
                  selectedTextGradient?.angle || 135,
                  selectedTextGradient?.start || "#ffffff",
                  value
                ),
              })
            }
            onAngleChange={(value) =>
              actions.updateSelected({
                gradientAngle: value,
                gradient: buildLinearGradient(
                  value,
                  selectedTextGradient?.start || "#ffffff",
                  selectedTextGradient?.end || "#f59e0b"
                ),
              })
            }
          />
        </div>
      )}

      {/* Link */}
      {selected.type === "link" && (
        <div style={sectionStyle}>
          <strong>Link</strong>
          <div style={rowWrapStyle}>
            <Field label="Label">
              <input
                value={selected.label || ""}
                onChange={(e) => actions.updateSelected({ label: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 220 }}
              />
            </Field>
            <Field label="Size (px)">
              <input
                type="number"
                value={Math.round(selected.fontSize || 16)}
                onChange={(e) => actions.updateSelected({ fontSize: Number(e.target.value) || 16 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                value={selected.color || "#60a5fa"}
                onChange={(e) => actions.updateSelected({ color: e.target.value })}
              />
            </Field>
            <Field label="Link URL">
              <input
                value={selected.url || ""}
                onChange={(e) => actions.updateSelected({ url: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 260 }}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Image / ImageLink */}
      {(selected.type === "image" || selected.type === "imageLink") && (
        <div style={sectionStyle}>
          <strong>Image</strong>
          <div style={rowWrapStyle}>
            <Field label="Link URL">
              <input
                placeholder="https://..."
                value={selected.url || ""}
                onChange={(e) => actions.updateSelected({ url: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 260 }}
              />
            </Field>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 140}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) || 140 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 80}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) || 80 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 12}
                onChange={(e) =>
                  actions.updateSelected({ borderRadius: Number(e.target.value) || 0 })
                }
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={selected.overlayEnabled || false}
                onChange={(e) => actions.updateSelected({ overlayEnabled: e.target.checked })}
              />
              Image overlay
            </label>
            {selected.overlayEnabled && (
              <>
                <Field label="Overlay color">
                  <input
                    type="color"
                    value={selected.overlayColor || "#000000"}
                    onChange={(e) => actions.updateSelected({ overlayColor: e.target.value })}
                  />
                </Field>
                <Field label="Overlay opacity">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selected.overlayOpacity ?? 0.18}
                    onChange={(e) =>
                      actions.updateSelected({
                        overlayOpacity: Number(e.target.value) || 0,
                      })
                    }
                    style={{ ...smallInputStyle, width: 90 }}
                  />
                </Field>
              </>
            )}
          </div>
        </div>
      )}

      {/* FlipCard */}
      {selected.type === "flipCard" && (
        <div style={sectionStyle}>
          <strong>Flip Card</strong>
          <div style={rowWrapStyle}>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 300}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) || 300 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 200}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) || 200 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 12}
                onChange={(e) =>
                  actions.updateSelected({ borderRadius: Number(e.target.value) || 0 })
                }
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Animation duration (s)">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="2"
                value={selected.flipDuration ?? 0.6}
                onChange={(e) =>
                  actions.updateSelected({ flipDuration: Number(e.target.value) || 0.6 })
                }
                style={{ ...smallInputStyle, width: 100 }}
              />
            </Field>
            <Field label="Trigger">
              <select
                value={selected.flipTrigger ?? "click"}
                onChange={(e) => actions.updateSelected({ flipTrigger: e.target.value })}
                style={smallInputStyle}
              >
                <option value="click">Click</option>
                <option value="hover">Hover</option>
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              style={dangerButtonStyle}
              onClick={() => actions.decomposeFlipCard(selected.id)}
            >
              Break apart Flip Card
            </button>
          </div>

          {/* ── RECTO ── */}
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>Front</strong>
            <div style={rowWrapStyle}>
              <Field label="BG color">
                <input
                  type="color"
                  value={
                    selected.frontBgColor === "transparent"
                      ? "#000000"
                      : selected.frontBgColor || "#000000"
                  }
                  onChange={(e) => actions.updateSelected({ frontBgColor: e.target.value })}
                />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!selected.frontBgColor || selected.frontBgColor === "transparent"}
                  onChange={(e) =>
                    actions.updateSelected({
                      frontBgColor: e.target.checked ? "transparent" : "#1a1a2e",
                    })
                  }
                />
                Transparent background
              </label>
            </div>
            <div style={{ ...rowWrapStyle, marginTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selected.frontBorderEnabled || false}
                  onChange={(e) => actions.updateSelected({ frontBorderEnabled: e.target.checked })}
                />
                Enable border
              </label>
              {selected.frontBorderEnabled && (
                <>
                  <Field label="Color">
                    <input
                      type="color"
                      value={selected.frontBorderColor || "#ffffff"}
                      onChange={(e) => actions.updateSelected({ frontBorderColor: e.target.value })}
                    />
                  </Field>
                  <Field label="Width">
                    <input
                      type="number"
                      min="1"
                      value={selected.frontBorderWidth ?? 2}
                      onChange={(e) =>
                        actions.updateSelected({
                          frontBorderWidth: Number(e.target.value) || 1,
                        })
                      }
                      style={{ ...smallInputStyle, width: 70 }}
                    />
                  </Field>
                  <Field label="Style">
                    <select
                      value={selected.frontBorderStyle || "solid"}
                      onChange={(e) => actions.updateSelected({ frontBorderStyle: e.target.value })}
                      style={smallInputStyle}
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </Field>
                </>
              )}
            </div>
          </div>

          {/* ── VERSO ── */}
          <div
            style={{
              marginTop: 10,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>Back</strong>
            <div style={rowWrapStyle}>
              <Field label="BG color">
                <input
                  type="color"
                  value={
                    selected.backBgColor === "transparent"
                      ? "#000000"
                      : selected.backBgColor || "#1a1a2e"
                  }
                  onChange={(e) => actions.updateSelected({ backBgColor: e.target.value })}
                />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selected.backBgColor === "transparent"}
                  onChange={(e) =>
                    actions.updateSelected({
                      backBgColor: e.target.checked ? "transparent" : "#1a1a2e",
                    })
                  }
                />
                Transparent background
              </label>
              <Field label="Text color">
                <input
                  type="color"
                  value={selected.backTextColor || "#ffffff"}
                  onChange={(e) => actions.updateSelected({ backTextColor: e.target.value })}
                />
              </Field>
              <Field label="Font size">
                <input
                  type="number"
                  value={selected.backFontSize ?? 18}
                  onChange={(e) =>
                    actions.updateSelected({ backFontSize: Number(e.target.value) || 18 })
                  }
                  style={{ ...smallInputStyle, width: 90 }}
                />
              </Field>
            </div>
            <div style={{ marginTop: 10 }}>
              <Field label="Back text">
                <textarea
                  value={selected.backText || ""}
                  onChange={(e) => actions.updateSelected({ backText: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: 80,
                    resize: "vertical",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </Field>
            </div>
            <div style={{ ...rowWrapStyle, marginTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selected.backBorderEnabled || false}
                  onChange={(e) => actions.updateSelected({ backBorderEnabled: e.target.checked })}
                />
                Enable border
              </label>
              {selected.backBorderEnabled && (
                <>
                  <Field label="Color">
                    <input
                      type="color"
                      value={selected.backBorderColor || "#ffffff"}
                      onChange={(e) => actions.updateSelected({ backBorderColor: e.target.value })}
                    />
                  </Field>
                  <Field label="Width">
                    <input
                      type="number"
                      min="1"
                      value={selected.backBorderWidth ?? 2}
                      onChange={(e) =>
                        actions.updateSelected({ backBorderWidth: Number(e.target.value) || 1 })
                      }
                      style={{ ...smallInputStyle, width: 70 }}
                    />
                  </Field>
                  <Field label="Style">
                    <select
                      value={selected.backBorderStyle || "solid"}
                      onChange={(e) => actions.updateSelected({ backBorderStyle: e.target.value })}
                      style={smallInputStyle}
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </Field>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emoji */}
      {selected.type === "emoji" && (
        <div style={sectionStyle}>
          <strong>Emoji</strong>
          <div style={rowWrapStyle}>
            <Field label="Size (px)">
              <input
                type="number"
                min="12"
                max="400"
                value={selected.fontSize ?? 64}
                onChange={(e) => actions.updateSelected({ fontSize: Number(e.target.value) || 64 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
          </div>

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 48,
                lineHeight: 1,
                textAlign: "center",
                padding: "12px 0",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
              }}
            >
              {selected.emoji ?? "✨"}
            </div>
          </div>

          {[
            {
              label: "Smileys",
              emojis: ["😀", "😂", "😍", "🥰", "😎", "🤩", "😢", "😡", "🤔", "🥳", "😴", "🤯"],
            },
            {
              label: "Nature",
              emojis: ["🌟", "⭐", "🔥", "💫", "🌈", "☀️", "🌙", "❄️", "🌊", "🌺", "🌸", "🍀"],
            },
            {
              label: "Objects",
              emojis: ["💻", "📱", "🎓", "📚", "🏆", "🎯", "💡", "🔑", "📌", "✉️", "🎨", "🎵"],
            },
            {
              label: "Symbols",
              emojis: ["✅", "❌", "⚡", "💎", "👑", "🚀", "💪", "👍", "🙏", "✨", "🔮", "💬"],
            },
            {
              label: "Animals",
              emojis: ["🐶", "🐱", "🦊", "🐻", "🦁", "🐯", "🦋", "🐬", "🦅", "🐙", "🦄", "🐉"],
            },
          ].map(({ label, emojis }) => (
            <div key={label} style={{ marginTop: 10 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                {label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => actions.updateSelected({ emoji: e })}
                    style={{
                      fontSize: 22,
                      lineHeight: 1,
                      background:
                        selected.emoji === e ? "rgba(129,140,248,0.25)" : "rgba(255,255,255,0.06)",
                      border:
                        selected.emoji === e
                          ? "1px solid rgba(129,140,248,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      padding: "4px 6px",
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                    }}
                    title={e}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 10 }}>
            <Field label="Or paste an emoji">
              <input
                value={selected.emoji ?? ""}
                onChange={(e) => {
                  const val = [...e.target.value].slice(0, 2).join("");
                  if (val) actions.updateSelected({ emoji: val });
                }}
                style={{ ...smallInputStyle, fontSize: 22, width: 80, textAlign: "center" }}
                maxLength={4}
                placeholder="😀"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Box */}
      {selected.type === "box" && (
        <div style={sectionStyle}>
          <strong>Box</strong>
          <div style={rowWrapStyle}>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 180}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) || 180 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 70}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) || 70 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 12}
                onChange={(e) =>
                  actions.updateSelected({ borderRadius: Number(e.target.value) || 0 })
                }
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Opacity">
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={selected.opacity ?? 0.92}
                onChange={(e) => actions.updateSelected({ opacity: Number(e.target.value) || 0 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              checked={selected.fillType === "transparent"}
              onChange={(e) =>
                actions.updateSelected({
                  fillType: e.target.checked ? "transparent" : "gradient",
                })
              }
            />
            Transparent background
          </label>

          {selected.fillType !== "transparent" && (
            <GradientPicker
              label="Color"
              start={selectedBoxGradient?.start || "#5b4cf0"}
              end={selectedBoxGradient?.end || "#22d3ee"}
              angle={selectedBoxGradient?.angle || 135}
              preview={buildLinearGradient(
                selectedBoxGradient?.angle || 135,
                selectedBoxGradient?.start || "#5b4cf0",
                selectedBoxGradient?.end || "#22d3ee"
              )}
              onStartChange={(value) =>
                actions.updateSelected({
                  gradientStart: value,
                  gradient: buildLinearGradient(
                    selectedBoxGradient?.angle || 135,
                    value,
                    selectedBoxGradient?.end || "#22d3ee"
                  ),
                })
              }
              onEndChange={(value) =>
                actions.updateSelected({
                  gradientEnd: value,
                  gradient: buildLinearGradient(
                    selectedBoxGradient?.angle || 135,
                    selectedBoxGradient?.start || "#5b4cf0",
                    value
                  ),
                })
              }
              onAngleChange={(value) =>
                actions.updateSelected({
                  gradientAngle: value,
                  gradient: buildLinearGradient(
                    value,
                    selectedBoxGradient?.start || "#5b4cf0",
                    selectedBoxGradient?.end || "#22d3ee"
                  ),
                })
              }
            />
          )}

          <div
            style={{
              marginTop: 8,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Link (optional)
            </div>
            <Field label="URL">
              <input
                value={selected.linkUrl || ""}
                placeholder="https://..."
                onChange={(e) => actions.updateSelected({ linkUrl: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 260 }}
              />
            </Field>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#f5f5fb",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={selected.newTab ?? true}
                onChange={(e) => actions.updateSelected({ newTab: e.target.checked })}
              />
              Open in new tab
            </label>
          </div>
        </div>
      )}

      {/* Shape */}
      {selected.type === "shape" && (
        <div style={sectionStyle}>
          <strong>Shape</strong>
          <div style={rowWrapStyle}>
            <Field label="Shape type">
              <select
                value={selected.shapeType || "circle"}
                onChange={(e) => {
                  const lineTypes = ["line", "diagonal", "zigzag", "wave", "dashed"];
                  const st = e.target.value;
                  actions.updateSelected({
                    shapeType: st,
                    fillEnabled: selected.fillEnabled ?? !lineTypes.includes(st),
                  });
                }}
                style={smallInputStyle}
              >
                <optgroup label="Lines">
                  <option value="line">─ Line</option>
                  <option value="diagonal">╱ Diagonal</option>
                  <option value="zigzag">⚡ Zigzag</option>
                  <option value="wave">〜 Wave</option>
                  <option value="dashed">╌ Dashed</option>
                </optgroup>
                <optgroup label="Shapes">
                  <option value="circle">○ Circle</option>
                  <option value="rect">□ Rectangle</option>
                  <option value="triangle">△ Triangle</option>
                  <option value="diamond">◇ Diamond</option>
                  <option value="star">★ Star</option>
                  <option value="arrow">→ Arrow</option>
                </optgroup>
              </select>
            </Field>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 200}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) || 10 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 200}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) || 10 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Stroke
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <ColorInput
                label="Color"
                value={selected.strokeColor || "#ffffff"}
                onChange={(v) => actions.updateSelected({ strokeColor: v })}
              />
              <Field label="Width (px)">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={selected.strokeWidth ?? 3}
                  onChange={(e) => actions.updateSelected({ strokeWidth: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 70 }}
                />
              </Field>
            </div>
          </div>

          {!["line", "diagonal", "zigzag", "wave", "dashed"].includes(
            selected.shapeType || "circle"
          ) && (
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                display: "grid",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Fill
                </div>
                <button
                  onClick={() => actions.updateSelected({ fillEnabled: !selected.fillEnabled })}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    background: selected.fillEnabled ? "#4f46e5" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    transition: "background 0.15s",
                  }}
                >
                  {selected.fillEnabled ? "On" : "Off"}
                </button>
              </div>
              {selected.fillEnabled && (
                <ColorInput
                  label="Color"
                  value={selected.fillColor || "#4f46e5"}
                  onChange={(v) => actions.updateSelected({ fillColor: v })}
                />
              )}
            </div>
          )}

          <div style={{ ...rowWrapStyle, marginTop: 8 }}>
            <Field label="Rotation (°)">
              <input
                type="number"
                min="-360"
                max="360"
                value={selected.rotation ?? 0}
                onChange={(e) => actions.updateSelected({ rotation: Number(e.target.value) || 0 })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Opacity">
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={selected.opacity ?? 1}
                onChange={(e) => actions.updateSelected({ opacity: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
          </div>

          <div
            style={{
              marginTop: 8,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Link (optional)
            </div>
            <Field label="URL">
              <input
                value={selected.linkUrl || ""}
                placeholder="https://..."
                onChange={(e) => actions.updateSelected({ linkUrl: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 260 }}
              />
            </Field>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#f5f5fb",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={selected.newTab ?? true}
                onChange={(e) => actions.updateSelected({ newTab: e.target.checked })}
              />
              Open in new tab
            </label>
          </div>
        </div>
      )}

      {/* Button */}
      {selected.type === "button" && (
        <div style={sectionStyle}>
          <strong>Button</strong>
          <div style={rowWrapStyle}>
            <Field label="Label">
              <input
                value={selected.label || ""}
                onChange={(e) => actions.updateSelected({ label: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 180 }}
              />
            </Field>
            <Field label="URL">
              <input
                value={selected.url || ""}
                onChange={(e) => actions.updateSelected({ url: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 260 }}
              />
            </Field>
            <Field label="Font size">
              <input
                type="number"
                value={selected.fontSize ?? 16}
                onChange={(e) => actions.updateSelected({ fontSize: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Padding X">
              <input
                type="number"
                value={selected.paddingX ?? 24}
                onChange={(e) => actions.updateSelected({ paddingX: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <Field label="Padding Y">
              <input
                type="number"
                value={selected.paddingY ?? 12}
                onChange={(e) => actions.updateSelected({ paddingY: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 8}
                onChange={(e) => actions.updateSelected({ borderRadius: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <Field label="BG color">
              <input
                type="color"
                value={selected.bgColor || "#4f46e5"}
                onChange={(e) => actions.updateSelected({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                value={selected.textColor || "#ffffff"}
                onChange={(e) => actions.updateSelected({ textColor: e.target.value })}
              />
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={selected.newTab || false}
                onChange={(e) => actions.updateSelected({ newTab: e.target.checked })}
              />
              Open in new tab
            </label>
          </div>
        </div>
      )}

      {/* Video */}
      {selected.type === "video" && (
        <div style={sectionStyle}>
          <strong>Video</strong>
          <div style={rowWrapStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <span
                style={{
                  fontSize: 12,
                  color: selected.src ? "rgba(134,239,172,0.85)" : "rgba(255,255,255,0.35)",
                }}
              >
                {selected.src ? "✓ Video loaded" : "No video"}
              </span>
              <label
                style={{
                  ...plainButtonStyle,
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                {selected.src ? "Replace video" : "Choose a video"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 100 * 1024 * 1024) {
                      alert("Video too large (max 100 MB). Choose a smaller file.");
                      e.target.value = "";
                      return;
                    }
                    try {
                      const src = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });
                      actions.updateSelected({ src });
                    } catch {
                      alert("Unable to read this video.");
                    } finally {
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 560}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 315}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 8}
                onChange={(e) => actions.updateSelected({ borderRadius: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Gallery */}
      {selected.type === "gallery" && (
        <div style={sectionStyle}>
          <strong>Gallery</strong>
          <div style={rowWrapStyle}>
            <Field label="Columns">
              <input
                type="number"
                min="1"
                max="6"
                value={selected.columns ?? 3}
                onChange={(e) => actions.updateSelected({ columns: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <Field label="Gap (px)">
              <input
                type="number"
                min="0"
                value={selected.gap ?? 8}
                onChange={(e) => actions.updateSelected({ gap: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 600}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 400}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 8}
                onChange={(e) => actions.updateSelected({ borderRadius: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13 }}>{(selected.images || []).length} image(s)</span>
              <button
                type="button"
                style={plainButtonStyle}
                onClick={() => {
                  pendingInsertPointRef.current = { x: selected.x, y: selected.y };
                  galleryInputRef.current?.click();
                }}
              >
                Add images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {selected.type === "countdown" && (
        <div style={sectionStyle}>
          <strong>Countdown</strong>
          <div style={rowWrapStyle}>
            <Field label="Target date">
              <input
                type="date"
                value={selected.targetDate || ""}
                onChange={(e) => actions.updateSelected({ targetDate: e.target.value })}
                style={smallInputStyle}
              />
            </Field>
            <Field label="Label">
              <input
                value={selected.label || ""}
                onChange={(e) => actions.updateSelected({ label: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 220 }}
              />
            </Field>
            <Field label="Font size">
              <input
                type="number"
                value={selected.fontSize ?? 32}
                onChange={(e) => actions.updateSelected({ fontSize: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                value={selected.textColor || "#ffffff"}
                onChange={(e) => actions.updateSelected({ textColor: e.target.value })}
              />
            </Field>
            <Field label="BG color">
              <input
                type="color"
                value={
                  selected.bgColor === "transparent" ? "#000000" : selected.bgColor || "#000000"
                }
                onChange={(e) => actions.updateSelected({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 420}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 130}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 12}
                onChange={(e) => actions.updateSelected({ borderRadius: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Quote */}
      {selected.type === "quote" && (
        <div style={sectionStyle}>
          <strong>Quote / Testimonial</strong>
          <div style={rowWrapStyle}>
            <Field label="Quote text">
              <textarea
                value={selected.text || ""}
                onChange={(e) => actions.updateSelected({ text: e.target.value })}
                style={{
                  ...inputStyle,
                  minHeight: 80,
                  resize: "vertical",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </Field>
          </div>
          <div style={rowWrapStyle}>
            <Field label="Author">
              <input
                value={selected.author || ""}
                onChange={(e) => actions.updateSelected({ author: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 180 }}
              />
            </Field>
            <Field label="Role">
              <input
                value={selected.role || ""}
                onChange={(e) => actions.updateSelected({ role: e.target.value })}
                style={{ ...smallInputStyle, minWidth: 180 }}
              />
            </Field>
            <Field label="Font size">
              <input
                type="number"
                value={selected.fontSize ?? 16}
                onChange={(e) => actions.updateSelected({ fontSize: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                value={selected.textColor || "#ffffff"}
                onChange={(e) => actions.updateSelected({ textColor: e.target.value })}
              />
            </Field>
            <Field label="Author color">
              <input
                type="color"
                value={selected.authorColor || "#a0a0a0"}
                onChange={(e) => actions.updateSelected({ authorColor: e.target.value })}
              />
            </Field>
            <Field label="Accent color">
              <input
                type="color"
                value={selected.accentColor || "#4f46e5"}
                onChange={(e) => actions.updateSelected({ accentColor: e.target.value })}
              />
            </Field>
            <Field label="BG color">
              <input
                type="color"
                value={
                  selected.bgColor === "transparent" ? "#000000" : selected.bgColor || "#000000"
                }
                onChange={(e) => actions.updateSelected({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Width">
              <input
                type="number"
                value={selected.w ?? 420}
                onChange={(e) => actions.updateSelected({ w: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                value={selected.h ?? 200}
                onChange={(e) => actions.updateSelected({ h: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 90 }}
              />
            </Field>
            <Field label="Radius">
              <input
                type="number"
                value={selected.borderRadius ?? 12}
                onChange={(e) => actions.updateSelected({ borderRadius: Number(e.target.value) })}
                style={{ ...smallInputStyle, width: 80 }}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Group */}
      {selected.type === "group" && (
        <div style={sectionStyle}>
          <strong>Group</strong>
          <div style={rowWrapStyle}>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.5,
                width: "100%",
              }}
            >
              {(selected.blocks ?? []).length} block
              {(selected.blocks ?? []).length !== 1 ? "s" : ""} grouped. Move, resize, and assign
              categories to the whole group.
            </p>
            <button
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
                borderRadius: 8,
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={() => actions.ungroupBlocks(selected.id)}
            >
              ⊟ Ungroup
            </button>
          </div>
        </div>
      )}

      {/* Hover Reveal */}
      {selected.type !== "filter" && (
        <div style={sectionStyle}>
          <strong>Hover reveal</strong>

          {/* Trigger */}
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.revealEnabled || false}
                onChange={(e) => actions.updateSelected({ revealEnabled: e.target.checked })}
              />
              This block triggers the appearance (trigger)
            </label>
            {selected.revealEnabled && (
              <Field label="Group tag">
                <input
                  value={selected.revealTag || ""}
                  placeholder="e.g. card-1"
                  onChange={(e) => actions.updateSelected({ revealTag: e.target.value })}
                  style={{ ...smallInputStyle, minWidth: 200 }}
                />
              </Field>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "10px 0" }} />

          {/* Target hidden */}
          <div style={{ display: "grid", gap: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.revealHidden || false}
                onChange={(e) => actions.updateSelected({ revealHidden: e.target.checked })}
              />
              This block is hidden by default (target)
            </label>
            {selected.revealHidden && (
              <Field label="Group tag">
                <input
                  value={selected.revealTag || ""}
                  placeholder="e.g. card-1"
                  onChange={(e) => actions.updateSelected({ revealTag: e.target.value })}
                  style={{ ...smallInputStyle, minWidth: 200 }}
                />
              </Field>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "10px 0" }} />

          {/* Default visible (disappears on hover) */}
          <div style={{ display: "grid", gap: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.revealDefault || false}
                onChange={(e) => actions.updateSelected({ revealDefault: e.target.checked })}
              />
              This block is visible by default (disappears on hover)
            </label>
            {selected.revealDefault && (
              <Field label="Category tag">
                <input
                  value={selected.revealTag || ""}
                  placeholder="e.g. contact"
                  onChange={(e) => actions.updateSelected({ revealTag: e.target.value })}
                  style={{ ...smallInputStyle, minWidth: 200 }}
                />
              </Field>
            )}
          </div>

          {(selected.revealEnabled || selected.revealHidden || selected.revealDefault) && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 12px",
                background: "rgba(129,140,248,0.08)",
                border: "1px dashed rgba(129,140,248,0.3)",
                borderRadius: 8,
                fontSize: 12,
                color: "rgba(167,139,250,0.9)",
                lineHeight: 1.5,
              }}
            >
              Targets appear when the trigger is hovered. The "default visible" block disappears as
              soon as a trigger from its category is activated — set the same category on the
              default block (e.g. "contact") and a prefixed tag on triggers (e.g. "contact-home",
              "contact-about").
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      {selected.type === "filter" && (
        <>
          <div style={sectionStyle}>
            <strong>Category filter bar</strong>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.5,
              }}
            >
              Categories are auto-detected from the <em>Categories</em> field of blocks in the
              same filter group.
            </p>
          </div>

          <div style={sectionStyle}>
            <strong>Filter group</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                style={inputStyle}
                placeholder="ex: listings-paris"
                value={selected.filterGroup || ""}
                onChange={(e) =>
                  actions.updateSelected({ filterGroup: e.target.value || undefined })
                }
              />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                Only blocks with the same group are counted and filtered here. Leave empty to keep
                this filter isolated.
              </span>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Active chip</strong>
            <div style={rowWrapStyle}>
              <Field label="Background">
                <ColorInput
                  value={selected.chipActiveBg ?? "#ffffff"}
                  onChange={(v) => actions.updateSelected({ chipActiveBg: v })}
                />
              </Field>
              <Field label="Text color">
                <ColorInput
                  value={selected.chipActiveColor ?? "#0a0a0a"}
                  onChange={(v) => actions.updateSelected({ chipActiveColor: v })}
                />
              </Field>
              <Field label="Border color">
                <ColorInput
                  value={selected.chipActiveBorderColor ?? selected.chipActiveBg ?? "#ffffff"}
                  onChange={(v) => actions.updateSelected({ chipActiveBorderColor: v })}
                />
              </Field>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Inactive chip</strong>
            <div style={rowWrapStyle}>
              <Field label="Background">
                <ColorInput
                  value={selected.chipInactiveBg ?? "rgba(255,255,255,0.06)"}
                  onChange={(v) => actions.updateSelected({ chipInactiveBg: v })}
                />
              </Field>
              <Field label="Text color">
                <ColorInput
                  value={selected.chipInactiveColor ?? "rgba(255,255,255,0.7)"}
                  onChange={(v) => actions.updateSelected({ chipInactiveColor: v })}
                />
              </Field>
              <Field label="Border color">
                <ColorInput
                  value={selected.chipBorderColor ?? "rgba(255,255,255,0.15)"}
                  onChange={(v) => actions.updateSelected({ chipBorderColor: v })}
                />
              </Field>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Shape &amp; size</strong>
            <div style={rowWrapStyle}>
              <Field label="Border radius">
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={selected.chipBorderRadius ?? 999}
                  onChange={(e) =>
                    actions.updateSelected({ chipBorderRadius: Number(e.target.value) })
                  }
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Font size">
                <input
                  type="number"
                  min={8}
                  max={32}
                  value={selected.chipFontSize ?? 13}
                  onChange={(e) => actions.updateSelected({ chipFontSize: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Padding X">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={selected.chipPaddingX ?? 14}
                  onChange={(e) => actions.updateSelected({ chipPaddingX: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Padding Y">
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={selected.chipPaddingY ?? 7}
                  onChange={(e) => actions.updateSelected({ chipPaddingY: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Gap between chips">
                <input
                  type="number"
                  min={0}
                  value={selected.chipGap ?? 8}
                  onChange={(e) => actions.updateSelected({ chipGap: Number(e.target.value) })}
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selected.showCount !== false}
                  onChange={(e) => actions.updateSelected({ showCount: e.target.checked })}
                />
                Show count
              </label>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Container</strong>
            <div style={rowWrapStyle}>
              <Field label="Background">
                <ColorInput
                  value={selected.containerBg ?? "transparent"}
                  onChange={(v) => actions.updateSelected({ containerBg: v })}
                />
              </Field>
              <Field label="Padding">
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={selected.containerPadding ?? 0}
                  onChange={(e) =>
                    actions.updateSelected({ containerPadding: Number(e.target.value) })
                  }
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
              <Field label="Border radius">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={selected.containerBorderRadius ?? 0}
                  onChange={(e) =>
                    actions.updateSelected({ containerBorderRadius: Number(e.target.value) })
                  }
                  style={{ ...smallInputStyle, width: 80 }}
                />
              </Field>
            </div>
          </div>
        </>
      )}
    </>
  );

  return hideHeader ? content : <div style={editorPanelStyle}>{content}</div>;
}
