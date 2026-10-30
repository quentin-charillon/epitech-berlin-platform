import { GradientPicker } from "./shared/GradientPicker";
import { plainButtonStyle, smallInputStyle, panelStyle } from "../editorStyles";

export function PageSettingsPanel({
  backgroundType,
  currentBgColor,
  pageGradientConfig,
  backgroundGradient,
  backgroundImage,
  defaultFontStyle,
  bgImageFileInputRef,
  onPickBgImage,
  setters,
}: {
  backgroundType: string;
  currentBgColor: string;
  pageGradientConfig: { start: string; end: string; angle: number };
  backgroundGradient: string;
  backgroundImage: string;
  defaultFontStyle: string;
  bgImageFileInputRef: React.RefObject<HTMLInputElement>;
  onPickBgImage: React.ChangeEventHandler<HTMLInputElement>;
  setters: any;
}) {
  return (
    <>
      <div style={panelStyle}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <strong>Page background</strong>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Type
            <select
              value={backgroundType}
              onChange={(e) => setters.setBackgroundType(e.target.value)}
              style={smallInputStyle}
            >
              <option value="transparent">Transparent</option>
              <option value="color">Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </label>

          {backgroundType === "color" && (
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Color
              <input
                type="color"
                value={currentBgColor}
                onChange={(e) => setters.setBackgroundColor(e.target.value)}
              />
            </label>
          )}

          {backgroundType === "gradient" && (
            <GradientPicker
              label="Background"
              start={pageGradientConfig.start}
              end={pageGradientConfig.end}
              angle={pageGradientConfig.angle}
              preview={backgroundGradient}
              onStartChange={setters.setBackgroundGradientStart}
              onEndChange={setters.setBackgroundGradientEnd}
              onAngleChange={setters.setBackgroundGradientAngle}
            />
          )}

          {backgroundType === "image" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                style={plainButtonStyle}
                onClick={() => bgImageFileInputRef.current?.click()}
              >
                {backgroundImage ? "Change image" : "Upload image"}
              </button>
              <input
                ref={bgImageFileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onPickBgImage}
              />
              {backgroundImage && (
                <img
                  src={backgroundImage}
                  alt=""
                  style={{ height: 36, borderRadius: 6, objectFit: "cover", maxWidth: 80 }}
                />
              )}
              {backgroundImage && (
                <button
                  type="button"
                  style={{ ...plainButtonStyle, color: "#f87171" }}
                  onClick={() => setters.setBackgroundImage("")}
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 13, flexWrap: "wrap" }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Default font
          <select
            value={defaultFontStyle}
            onChange={(e) => setters.setDefaultFontStyle(e.target.value)}
            style={smallInputStyle}
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
            <option value="bold">Bold</option>
            <option value="bolditalic">Bold italic</option>
          </select>
        </label>
      </div>
    </>
  );
}
