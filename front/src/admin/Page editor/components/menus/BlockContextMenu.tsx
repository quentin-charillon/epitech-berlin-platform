import { hasClipboardContent } from "../../../../utils/blockClipboard";
import { buildLinearGradient } from "../../../../utils/gradients";
import { getBlockGradientConfig } from "../../../../utils/gradients";
import { normalizeTextBlock } from "../../../../utils/textSegments";
import {
  quickMenuInputStyle,
  quickMenuActionRowStyle,
  quickPreviewStyle,
} from "../../editorStyles";
import { ColorInput } from "../shared/ColorInput";
import { CompactGradientPicker } from "../shared/GradientPicker";
import { QuickMenu, QuickMenuButton, QuickMenuField, QuickMenuTitle } from "./QuickMenu";
import { getTextPreview } from "../../../../utils/textSegments";

export function BlockContextMenu({
  quickMenu,
  menuRef,
  quickSelectedBlock,
  actions,
  setQuickMenu,
  selectedIds,
}: {
  quickMenu: any;
  menuRef: React.RefObject<HTMLDivElement>;
  quickSelectedBlock: any;
  actions: any;
  setQuickMenu: (v: any) => void;
  selectedIds: string[];
}) {
  const canPasteClipboard = hasClipboardContent();

  const quickSelectedTextBlock =
    quickSelectedBlock?.type === "text" ? normalizeTextBlock(quickSelectedBlock) : null;
  const quickSelectedTextGradient =
    quickSelectedBlock?.type === "text" ? getBlockGradientConfig(quickSelectedBlock) : null;
  const quickSelectedBoxGradient =
    quickSelectedBlock?.type === "box" ? getBlockGradientConfig(quickSelectedBlock) : null;

  return (
    <QuickMenu x={quickMenu.x} y={quickMenu.y} menuRef={menuRef}>
      <QuickMenuTitle>{quickSelectedBlock.type} block</QuickMenuTitle>

      <div style={quickMenuActionRowStyle}>
        <QuickMenuButton
          onClick={() => {
            actions.copyBlock(quickSelectedBlock.id);
            setQuickMenu(null);
          }}
        >
          Copy
        </QuickMenuButton>
        <QuickMenuButton
          onClick={() => {
            actions.cutBlock(quickSelectedBlock.id);
            setQuickMenu(null);
          }}
        >
          Cut
        </QuickMenuButton>
        <QuickMenuButton
          disabled={!canPasteClipboard}
          onClick={() => {
            actions.pasteClipboardAt(
              (quickSelectedBlock.x ?? 0) + 24,
              (quickSelectedBlock.y ?? 0) + 24
            );
            setQuickMenu(null);
          }}
        >
          Paste
        </QuickMenuButton>
      </div>

      <QuickMenuButton
        onClick={() => {
          actions.duplicateBlock(quickSelectedBlock.id);
          setQuickMenu(null);
        }}
      >
        Duplicate
      </QuickMenuButton>
      <QuickMenuButton
        danger
        onClick={() => {
          actions.deleteBlock(quickSelectedBlock.id);
          setQuickMenu(null);
        }}
      >
        Delete block
      </QuickMenuButton>

      {selectedIds.length >= 2 && quickSelectedBlock.type !== "group" && (
        <QuickMenuButton
          onClick={() => {
            const ids = selectedIds.includes(quickSelectedBlock.id)
              ? selectedIds
              : [...selectedIds, quickSelectedBlock.id];
            actions.groupSelectedBlocks(ids);
            setQuickMenu(null);
          }}
        >
          ⊞ Group blocks
        </QuickMenuButton>
      )}

      {quickSelectedBlock.type === "group" && (
        <QuickMenuButton
          onClick={() => {
            actions.ungroupBlocks(quickSelectedBlock.id);
            setQuickMenu(null);
          }}
        >
          ⊟ Ungroup
        </QuickMenuButton>
      )}

      {quickSelectedBlock.type !== "flipCard" && quickSelectedBlock.type !== "group" && (
        <QuickMenuButton
          onClick={() => {
            const ids = selectedIds.includes(quickSelectedBlock.id)
              ? selectedIds
              : [...selectedIds, quickSelectedBlock.id];
            actions.createFlipCardFromSelection(ids);
            setQuickMenu(null);
          }}
        >
          🃏 Create Flip Card
        </QuickMenuButton>
      )}

      {quickSelectedBlock.type === "flipCard" && (
        <QuickMenuButton
          onClick={() => {
            actions.decomposeFlipCard(quickSelectedBlock.id);
            setQuickMenu(null);
          }}
        >
          Break apart Flip Card
        </QuickMenuButton>
      )}

      <div style={quickMenuActionRowStyle}>
        <QuickMenuButton
          onClick={() => {
            actions.moveBlockLayer(quickSelectedBlock.id, 1);
            setQuickMenu(null);
          }}
        >
          Forward
        </QuickMenuButton>
        <QuickMenuButton
          onClick={() => {
            actions.moveBlockLayer(quickSelectedBlock.id, -1);
            setQuickMenu(null);
          }}
        >
          Backward
        </QuickMenuButton>
      </div>

      <QuickMenuField label="X">
        <input
          type="number"
          value={quickSelectedBlock.x ?? 0}
          onChange={(e) =>
            actions.updateBlockById(quickSelectedBlock.id, { x: Number(e.target.value) || 0 })
          }
          style={quickMenuInputStyle}
        />
      </QuickMenuField>
      <QuickMenuField label="Y">
        <input
          type="number"
          value={quickSelectedBlock.y ?? 0}
          onChange={(e) =>
            actions.updateBlockById(quickSelectedBlock.id, { y: Number(e.target.value) || 0 })
          }
          style={quickMenuInputStyle}
        />
      </QuickMenuField>
      {quickSelectedBlock.type === "text" && (
        <CompactGradientPicker
          start={quickSelectedTextGradient?.start || "#ffffff"}
          end={quickSelectedTextGradient?.end || "#f59e0b"}
          angle={quickSelectedTextGradient?.angle || 135}
          preview={quickSelectedBlock.gradient || buildLinearGradient(135, "#ffffff", "#f59e0b")}
          onStartChange={(value) =>
            actions.updateBlockById(quickSelectedBlock.id, {
              gradientStart: value,
              gradient: buildLinearGradient(
                quickSelectedTextGradient?.angle || 135,
                value,
                quickSelectedTextGradient?.end || "#f59e0b"
              ),
            })
          }
          onEndChange={(value) =>
            actions.updateBlockById(quickSelectedBlock.id, {
              gradientEnd: value,
              gradient: buildLinearGradient(
                quickSelectedTextGradient?.angle || 135,
                quickSelectedTextGradient?.start || "#ffffff",
                value
              ),
            })
          }
          onAngleChange={(value) =>
            actions.updateBlockById(quickSelectedBlock.id, {
              gradientAngle: value,
              gradient: buildLinearGradient(
                value,
                quickSelectedTextGradient?.start || "#ffffff",
                quickSelectedTextGradient?.end || "#f59e0b"
              ),
            })
          }
        />
      )}

      {quickSelectedBlock.type === "box" && (
        <>
          <CompactGradientPicker
            start={quickSelectedBoxGradient?.start || "#5b4cf0"}
            end={quickSelectedBoxGradient?.end || "#22d3ee"}
            angle={quickSelectedBoxGradient?.angle || 135}
            preview={buildLinearGradient(
              quickSelectedBoxGradient?.angle || 135,
              quickSelectedBoxGradient?.start || "#5b4cf0",
              quickSelectedBoxGradient?.end || "#22d3ee"
            )}
            onStartChange={(value) =>
              actions.updateBlockById(quickSelectedBlock.id, {
                gradientStart: value,
                gradient: buildLinearGradient(
                  quickSelectedBoxGradient?.angle || 135,
                  value,
                  quickSelectedBoxGradient?.end || "#22d3ee"
                ),
              })
            }
            onEndChange={(value) =>
              actions.updateBlockById(quickSelectedBlock.id, {
                gradientEnd: value,
                gradient: buildLinearGradient(
                  quickSelectedBoxGradient?.angle || 135,
                  quickSelectedBoxGradient?.start || "#5b4cf0",
                  value
                ),
              })
            }
            onAngleChange={(value) =>
              actions.updateBlockById(quickSelectedBlock.id, {
                gradientAngle: value,
                gradient: buildLinearGradient(
                  value,
                  quickSelectedBoxGradient?.start || "#5b4cf0",
                  quickSelectedBoxGradient?.end || "#22d3ee"
                ),
              })
            }
          />
        </>
      )}

      {quickSelectedBlock.type === "link" && (
        <QuickMenuField label="Color">
          <input
            type="color"
            value={quickSelectedBlock.color || "#ffffff"}
            onChange={(e) =>
              actions.updateBlockById(quickSelectedBlock.id, { color: e.target.value })
            }
          />
        </QuickMenuField>
      )}

      {(quickSelectedBlock.type === "text" || quickSelectedBlock.type === "link") && (
        <QuickMenuField label="Size">
          <input
            type="number"
            value={Math.round(quickSelectedBlock.fontSize || 16)}
            onChange={(e) =>
              actions.updateBlockById(quickSelectedBlock.id, {
                fontSize: Number(e.target.value) || 16,
              })
            }
            style={quickMenuInputStyle}
          />
        </QuickMenuField>
      )}

      {quickSelectedBlock.type === "text" && quickSelectedTextBlock && (
        <QuickMenuField label="Quick preview">
          <div style={quickPreviewStyle}>{getTextPreview(quickSelectedTextBlock)}</div>
        </QuickMenuField>
      )}

      {quickSelectedBlock.type === "link" && (
        <QuickMenuField label="URL">
          <input
            type="text"
            value={quickSelectedBlock.url || ""}
            onChange={(e) =>
              actions.updateBlockById(quickSelectedBlock.id, { url: e.target.value })
            }
            style={{ ...quickMenuInputStyle, minWidth: 220 }}
          />
        </QuickMenuField>
      )}

      {quickSelectedBlock.type === "imageLink" && (
        <QuickMenuField label="URL">
          <input
            type="text"
            value={quickSelectedBlock.url || ""}
            onChange={(e) =>
              actions.updateBlockById(quickSelectedBlock.id, { url: e.target.value })
            }
            style={{ ...quickMenuInputStyle, minWidth: 220 }}
          />
        </QuickMenuField>
      )}

      {(quickSelectedBlock.type === "box" ||
        quickSelectedBlock.type === "image" ||
        quickSelectedBlock.type === "imageLink" ||
        quickSelectedBlock.type === "flipCard") && (
        <>
          <QuickMenuField label="Width">
            <input
              type="number"
              value={quickSelectedBlock.w ?? 140}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  w: Number(e.target.value) || 140,
                })
              }
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Height">
            <input
              type="number"
              value={quickSelectedBlock.h ?? 80}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  h: Number(e.target.value) || 80,
                })
              }
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
        </>
      )}

      {(quickSelectedBlock.type === "box" ||
        quickSelectedBlock.type === "image" ||
        quickSelectedBlock.type === "imageLink" ||
        quickSelectedBlock.type === "flipCard") && (
        <QuickMenuField label="Radius">
          <input
            type="number"
            value={quickSelectedBlock.borderRadius ?? 12}
            onChange={(e) =>
              actions.updateBlockById(quickSelectedBlock.id, {
                borderRadius: Number(e.target.value) || 0,
              })
            }
            style={quickMenuInputStyle}
          />
        </QuickMenuField>
      )}

      {quickSelectedBlock.type === "flipCard" && (
        <>
          <QuickMenuField label="Animation duration (s)">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="2"
              value={quickSelectedBlock.flipDuration ?? 0.6}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  flipDuration: Number(e.target.value) || 0.6,
                })
              }
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Back text">
            <textarea
              value={quickSelectedBlock.backText || ""}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, { backText: e.target.value })
              }
              style={{
                ...quickMenuInputStyle,
                minHeight: 80,
                resize: "vertical",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </QuickMenuField>
          <QuickMenuField label="Back text color">
            <input
              type="color"
              value={quickSelectedBlock.backTextColor || "#ffffff"}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  backTextColor: e.target.value,
                })
              }
            />
          </QuickMenuField>
          <QuickMenuField label="Back font size">
            <input
              type="number"
              value={quickSelectedBlock.backFontSize ?? 18}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  backFontSize: Number(e.target.value) || 18,
                })
              }
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          <QuickMenuField label="Back border color">
            <input
              type="color"
              value={quickSelectedBlock.backBorderColor || "#ffffff"}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  backBorderEnabled: true,
                  backBorderColor: e.target.value,
                })
              }
            />
          </QuickMenuField>
        </>
      )}

      {quickSelectedBlock.type === "box" && (
        <>
          <QuickMenuField label="Opacity">
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={quickSelectedBlock.opacity ?? 0.92}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  opacity: Number(e.target.value) || 0,
                })
              }
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
          {quickSelectedBlock.fillType === "gradient" && (
            <CompactGradientPicker
              start={quickSelectedBoxGradient?.start || "#5b4cf0"}
              end={quickSelectedBoxGradient?.end || "#22d3ee"}
              angle={quickSelectedBoxGradient?.angle || 135}
              preview={
                quickSelectedBlock.gradient || buildLinearGradient(135, "#5b4cf0", "#22d3ee")
              }
              onStartChange={(value) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  gradientStart: value,
                  gradient: buildLinearGradient(
                    quickSelectedBoxGradient?.angle || 135,
                    value,
                    quickSelectedBoxGradient?.end || "#22d3ee"
                  ),
                })
              }
              onEndChange={(value) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  gradientEnd: value,
                  gradient: buildLinearGradient(
                    quickSelectedBoxGradient?.angle || 135,
                    quickSelectedBoxGradient?.start || "#5b4cf0",
                    value
                  ),
                })
              }
              onAngleChange={(value) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  gradientAngle: value,
                  gradient: buildLinearGradient(
                    value,
                    quickSelectedBoxGradient?.start || "#5b4cf0",
                    quickSelectedBoxGradient?.end || "#22d3ee"
                  ),
                })
              }
            />
          )}
        </>
      )}

      {(quickSelectedBlock.type === "image" || quickSelectedBlock.type === "imageLink") && (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={quickSelectedBlock.overlayEnabled || false}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  overlayEnabled: e.target.checked,
                })
              }
            />
            Image overlay
          </label>
          {quickSelectedBlock.overlayEnabled && (
            <>
              <QuickMenuField label="Overlay color">
                <input
                  type="color"
                  value={quickSelectedBlock.overlayColor || "#000000"}
                  onChange={(e) =>
                    actions.updateBlockById(quickSelectedBlock.id, {
                      overlayColor: e.target.value,
                    })
                  }
                />
              </QuickMenuField>
              <QuickMenuField label="Overlay opacity">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={quickSelectedBlock.overlayOpacity ?? 0.18}
                  onChange={(e) =>
                    actions.updateBlockById(quickSelectedBlock.id, {
                      overlayOpacity: Number(e.target.value) || 0,
                    })
                  }
                  style={quickMenuInputStyle}
                />
              </QuickMenuField>
            </>
          )}
        </>
      )}

      {quickSelectedBlock.type === "shape" && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 4,
            }}
          >
            Stroke
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <ColorInput
              label="Color"
              value={quickSelectedBlock.strokeColor || "#ffffff"}
              onChange={(v) => actions.updateBlockById(quickSelectedBlock.id, { strokeColor: v })}
            />
            <QuickMenuField label="Width (px)">
              <input
                type="number"
                min="0"
                max="40"
                value={quickSelectedBlock.strokeWidth ?? 3}
                onChange={(e) =>
                  actions.updateBlockById(quickSelectedBlock.id, {
                    strokeWidth: Number(e.target.value),
                  })
                }
                style={{ ...quickMenuInputStyle, width: 60 }}
              />
            </QuickMenuField>
          </div>

          {!["line", "diagonal", "zigzag", "wave", "dashed"].includes(
            quickSelectedBlock.shapeType || "circle"
          ) && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Fill
                </div>
                <button
                  onClick={() =>
                    actions.updateBlockById(quickSelectedBlock.id, {
                      fillEnabled: !quickSelectedBlock.fillEnabled,
                    })
                  }
                  style={{
                    padding: "2px 10px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    background: quickSelectedBlock.fillEnabled
                      ? "#4f46e5"
                      : "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                >
                  {quickSelectedBlock.fillEnabled ? "On" : "Off"}
                </button>
              </div>
              {quickSelectedBlock.fillEnabled && (
                <ColorInput
                  label="Color"
                  value={quickSelectedBlock.fillColor || "#4f46e5"}
                  onChange={(v) => actions.updateBlockById(quickSelectedBlock.id, { fillColor: v })}
                />
              )}
            </>
          )}

          <QuickMenuField label="Opacity">
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={quickSelectedBlock.opacity ?? 1}
              onChange={(e) =>
                actions.updateBlockById(quickSelectedBlock.id, {
                  opacity: Number(e.target.value),
                })
              }
              style={quickMenuInputStyle}
            />
          </QuickMenuField>
        </>
      )}
    </QuickMenu>
  );
}
