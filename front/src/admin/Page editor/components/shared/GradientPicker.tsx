import {
  compactGradientRowStyle,
  compactGradientStyle,
  gradientControlsRowStyle,
  gradientPickerStyle,
  gradientPreviewStyle,
  quickMenuInputStyle,
} from "../../editorStyles";
import { Field } from "./Field";

export function GradientPicker({
  label,
  start,
  end,
  angle,
  preview,
  onStartChange,
  onEndChange,
  onAngleChange,
}: {
  label: string;
  start: string;
  end: string;
  angle: number;
  preview: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onAngleChange: (v: number) => void;
}) {
  return (
    <div style={gradientPickerStyle}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ ...gradientPreviewStyle, background: preview }} />
      <div style={gradientControlsRowStyle}>
        <Field label="Color 1">
          <input type="color" value={start} onChange={(e) => onStartChange(e.target.value)} />
        </Field>
        <Field label="Color 2">
          <input type="color" value={end} onChange={(e) => onEndChange(e.target.value)} />
        </Field>
        <Field label="Angle">
          <select
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
            style={quickMenuInputStyle}
          >
            <option value={0}>0 deg</option>
            <option value={45}>45 deg</option>
            <option value={90}>90 deg</option>
            <option value={135}>135 deg</option>
            <option value={180}>180 deg</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

export function CompactGradientPicker({
  start,
  end,
  angle,
  preview,
  onStartChange,
  onEndChange,
  onAngleChange,
}: {
  start: string;
  end: string;
  angle: number;
  preview: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onAngleChange: (v: number) => void;
}) {
  return (
    <div style={compactGradientStyle}>
      <div style={{ ...gradientPreviewStyle, minHeight: 32, background: preview }} />
      <div style={compactGradientRowStyle}>
        <input type="color" value={start} onChange={(e) => onStartChange(e.target.value)} />
        <input type="color" value={end} onChange={(e) => onEndChange(e.target.value)} />
        <select
          value={angle}
          onChange={(e) => onAngleChange(Number(e.target.value))}
          style={quickMenuInputStyle}
        >
          <option value={0}>0 deg</option>
          <option value={45}>45 deg</option>
          <option value={90}>90 deg</option>
          <option value={135}>135 deg</option>
          <option value={180}>180 deg</option>
        </select>
      </div>
    </div>
  );
}
