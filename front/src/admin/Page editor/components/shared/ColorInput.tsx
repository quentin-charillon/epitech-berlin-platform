import { useEffect, useRef, useState } from "react";
import { smallInputStyle } from "../../editorStyles";

export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [hex, setHex] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHex(value);
  }, [value]);

  const isValidHex = (h: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h);

  const handleHexChange = (raw: string) => {
    const val = raw.startsWith("#") ? raw : `#${raw}`;
    setHex(val);
    if (isValidHex(val)) onChange(val);
  };

  const handleHexBlur = () => {
    if (!isValidHex(hex)) setHex(value);
  };

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: isValidHex(hex) ? hex : value,
            border: "2px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
          }}
          title="Click to open color picker"
        />
        <input
          ref={inputRef}
          type="color"
          value={isValidHex(value) ? value : "#ffffff"}
          onChange={(e) => {
            setHex(e.target.value);
            onChange(e.target.value);
          }}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          tabIndex={-1}
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          onBlur={handleHexBlur}
          maxLength={7}
          spellCheck={false}
          style={{
            ...smallInputStyle,
            width: 80,
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}
