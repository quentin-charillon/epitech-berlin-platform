export function ShapeBlockSvg({ block }: { block: any }) {
  const w = Math.max(4, block.w || 200);
  const h = Math.max(4, block.h || 200);
  const strokeColor = block.strokeColor || "#ffffff";
  const sw = Math.max(0, block.strokeWidth ?? 3);
  const fillColor = block.fillEnabled ? block.fillColor || "#4f46e5" : "none";
  const st = block.shapeType || "circle";

  let content = null;

  if (st === "line") {
    content = (
      <line
        x1={sw / 2}
        y1={h / 2}
        x2={w - sw / 2}
        y2={h / 2}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
  } else if (st === "diagonal") {
    content = (
      <line
        x1={sw / 2}
        y1={h - sw / 2}
        x2={w - sw / 2}
        y2={sw / 2}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
  } else if (st === "zigzag") {
    const segs = 6;
    const segW = w / segs;
    const pts = [`M 0,${h / 2}`];
    for (let i = 0; i < segs; i++) {
      pts.push(`L ${(i + 1) * segW},${i % 2 === 0 ? sw : h - sw}`);
    }
    content = (
      <path
        d={pts.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  } else if (st === "wave") {
    const d = `M ${sw},${h / 2} C ${w * 0.25},${sw} ${w * 0.75},${h - sw} ${w - sw},${h / 2}`;
    content = (
      <path d={d} fill="none" stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" />
    );
  } else if (st === "dashed") {
    content = (
      <line
        x1={sw / 2}
        y1={h / 2}
        x2={w - sw / 2}
        y2={h / 2}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeDasharray={`${sw * 4} ${sw * 2}`}
        strokeLinecap="round"
      />
    );
  } else if (st === "circle") {
    content = (
      <ellipse
        cx={w / 2}
        cy={h / 2}
        rx={Math.max(1, w / 2 - sw / 2)}
        ry={Math.max(1, h / 2 - sw / 2)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
      />
    );
  } else if (st === "rect") {
    content = (
      <rect
        x={sw / 2}
        y={sw / 2}
        width={Math.max(1, w - sw)}
        height={Math.max(1, h - sw)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
      />
    );
  } else if (st === "triangle") {
    const pts = `${w / 2},${sw / 2} ${w - sw / 2},${h - sw / 2} ${sw / 2},${h - sw / 2}`;
    content = (
      <polygon
        points={pts}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  } else if (st === "diamond") {
    const pts = `${w / 2},${sw / 2} ${w - sw / 2},${h / 2} ${w / 2},${h - sw / 2} ${sw / 2},${h / 2}`;
    content = (
      <polygon
        points={pts}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  } else if (st === "star") {
    const cx = w / 2,
      cy = h / 2;
    const outerR = Math.min(w, h) / 2 - sw / 2;
    const innerR = outerR * 0.4;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    content = (
      <polygon
        points={pts.join(" ")}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  } else if (st === "arrow") {
    const shaftH = h * 0.36;
    const shaftY1 = (h - shaftH) / 2;
    const shaftY2 = shaftY1 + shaftH;
    const headX = w * 0.58 + sw / 2;
    const d = [
      `M ${sw / 2},${shaftY1}`,
      `L ${headX},${shaftY1}`,
      `L ${headX},${sw / 2}`,
      `L ${w - sw / 2},${h / 2}`,
      `L ${headX},${h - sw / 2}`,
      `L ${headX},${shaftY2}`,
      `L ${sw / 2},${shaftY2}`,
      "Z",
    ].join(" ");
    content = (
      <path d={d} fill={fillColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
    );
  } else {
    content = (
      <ellipse
        cx={w / 2}
        cy={h / 2}
        rx={Math.max(1, w / 2 - sw / 2)}
        ry={Math.max(1, h / 2 - sw / 2)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
      />
    );
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        display: "block",
        opacity: block.opacity ?? 1,
        overflow: "visible",
      }}
    >
      {content}
    </svg>
  );
}
