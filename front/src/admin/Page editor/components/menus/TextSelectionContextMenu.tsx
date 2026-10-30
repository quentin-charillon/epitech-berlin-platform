import { buildLinearGradient } from "../../../../utils/gradients";
import { getTextSelectionStyle } from "../../../../utils/textSegments";
import { quickMenuInputStyle, quickPreviewStyle } from "../../editorStyles";
import { CompactGradientPicker } from "../shared/GradientPicker";
import { QuickMenu, QuickMenuField, QuickMenuTitle } from "./QuickMenu";

export function TextSelectionContextMenu({
  quickMenu,
  menuRef,
  quickSelectedBlock,
  actions,
}: {
  quickMenu: any;
  menuRef: React.RefObject<HTMLDivElement>;
  quickSelectedBlock: any;
  actions: any;
}) {
  const quickSelectedTextStyle = getTextSelectionStyle(
    quickSelectedBlock,
    quickMenu.selectionStart,
    quickMenu.selectionEnd
  );

  const quickSelectedTextGradient = quickSelectedTextStyle
    ? {
        start: quickSelectedTextStyle.gradientStart || "#ffffff",
        end: quickSelectedTextStyle.gradientEnd || "#f59e0b",
        angle: quickSelectedTextStyle.gradientAngle || 135,
      }
    : { start: "#ffffff", end: "#f59e0b", angle: 135 };

  return (
    <QuickMenu x={quickMenu.x} y={quickMenu.y} menuRef={menuRef}>
      <QuickMenuTitle>Selected text</QuickMenuTitle>
      <div style={quickPreviewStyle}>{quickMenu.selectedText || "Text selection"}</div>

      <QuickMenuField label="Color">
        <div style={quickPreviewStyle}>Two colors = one style</div>
      </QuickMenuField>
      <CompactGradientPicker
        start={quickSelectedTextGradient.start}
        end={quickSelectedTextGradient.end}
        angle={quickSelectedTextGradient.angle}
        preview={buildLinearGradient(
          quickSelectedTextGradient.angle,
          quickSelectedTextGradient.start,
          quickSelectedTextGradient.end
        )}
        onStartChange={(value) =>
          actions.applyTextSelectionStyle(
            quickSelectedBlock.id,
            quickMenu.selectionStart,
            quickMenu.selectionEnd,
            { fillType: "gradient", gradientStart: value }
          )
        }
        onEndChange={(value) =>
          actions.applyTextSelectionStyle(
            quickSelectedBlock.id,
            quickMenu.selectionStart,
            quickMenu.selectionEnd,
            { fillType: "gradient", gradientEnd: value }
          )
        }
        onAngleChange={(value) =>
          actions.applyTextSelectionStyle(
            quickSelectedBlock.id,
            quickMenu.selectionStart,
            quickMenu.selectionEnd,
            { fillType: "gradient", gradientAngle: value }
          )
        }
      />

      <QuickMenuField label="Style">
        <select
          value={quickSelectedTextStyle?.fontStyle || "normal"}
          onChange={(e) =>
            actions.applyTextSelectionStyle(
              quickSelectedBlock.id,
              quickMenu.selectionStart,
              quickMenu.selectionEnd,
              { fontStyle: e.target.value }
            )
          }
          style={quickMenuInputStyle}
        >
          <option value="normal">Normal</option>
          <option value="italic">Italic</option>
          <option value="bold">Bold</option>
          <option value="bolditalic">Bold italic</option>
        </select>
      </QuickMenuField>

      <QuickMenuField label="Size Y (px)">
        <input
          type="number"
          value={Math.round(quickSelectedTextStyle?.fontSize || quickSelectedBlock.fontSize || 16)}
          onChange={(e) =>
            actions.applyTextSelectionStyle(
              quickSelectedBlock.id,
              quickMenu.selectionStart,
              quickMenu.selectionEnd,
              { fontSize: Number(e.target.value) || 16 }
            )
          }
          style={quickMenuInputStyle}
        />
      </QuickMenuField>

      <QuickMenuField label="Size X (%)">
        <input
          type="number"
          min="10"
          max="500"
          value={Math.round(
            (quickSelectedTextStyle?.scaleX ?? quickSelectedBlock.scaleX ?? 1) * 100
          )}
          onChange={(e) =>
            actions.applyTextSelectionStyle(
              quickSelectedBlock.id,
              quickMenu.selectionStart,
              quickMenu.selectionEnd,
              { scaleX: (Number(e.target.value) || 100) / 100 }
            )
          }
          style={quickMenuInputStyle}
        />
      </QuickMenuField>

      <QuickMenuField label="Quick preview">
        <div style={quickPreviewStyle}>{quickMenu.selectedText}</div>
      </QuickMenuField>
    </QuickMenu>
  );
}
