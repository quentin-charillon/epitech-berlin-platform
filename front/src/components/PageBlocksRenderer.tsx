import React, { useEffect, useState } from "react";
import {
  buildLinearGradient,
  getBlockGradientConfig,
  getPageGradientConfig,
} from "../utils/gradients";
import { normalizeTextBlock } from "../utils/textSegments";
import { PUBLIC_CANVAS_WIDTH, useResponsiveCanvas } from "../utils/responsiveCanvas";

// --- Utilities ---

export function getBlockBoxShadow(block) {
  if (!block?.shadowEnabled) return undefined;
  const hex = block.shadowColor || "#000000";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = block.shadowOpacity ?? 0.4;
  return `${block.shadowX ?? 4}px ${block.shadowY ?? 4}px ${block.shadowBlur ?? 12}px rgba(${r},${g},${b},${a})`;
}

export function getBlockBorder(block, existingBoxShadow?: string) {
  if (!block?.borderEnabled) return {};
  const c = block.borderColor || "#ffffff";
  const s = block.borderStyle || "solid";
  const fb = block.borderWidth ?? 2;
  const top = block.borderTopWidth ?? fb;
  const right = block.borderRightWidth ?? fb;
  const bottom = block.borderBottomWidth ?? fb;
  const left = block.borderLeftWidth ?? fb;
  if (s === "solid") {
    const inset = [
      top > 0 && `inset 0 ${top}px 0 0 ${c}`,
      right > 0 && `inset -${right}px 0 0 0 ${c}`,
      bottom > 0 && `inset 0 -${bottom}px 0 0 ${c}`,
      left > 0 && `inset ${left}px 0 0 0 ${c}`,
    ]
      .filter(Boolean)
      .join(", ");
    const combined = [inset, existingBoxShadow].filter(Boolean).join(", ");
    return { boxShadow: combined };
  }
  return {
    borderTop: `${top}px ${s} ${c}`,
    borderRight: `${right}px ${s} ${c}`,
    borderBottom: `${bottom}px ${s} ${c}`,
    borderLeft: `${left}px ${s} ${c}`,
  };
}

export function styleToCss(fontStyle) {
  switch (fontStyle) {
    case "italic":
      return { fontStyle: "italic", fontWeight: 400 };
    case "bold":
      return { fontStyle: "normal", fontWeight: 700 };
    case "bolditalic":
      return { fontStyle: "italic", fontWeight: 700 };
    default:
      return { fontStyle: "normal", fontWeight: 400 };
  }
}

function getGradientTextStyle(source) {
  const gradient = getBlockGradientConfig(source);
  const background = buildLinearGradient(gradient.angle, gradient.start, gradient.end);
  return {
    backgroundImage: background,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };
}

export function getSegmentTextStyle(segment, block) {
  const source = { ...block, ...segment };
  const blockScaleX = Number.isFinite(block.scaleX) ? block.scaleX : 1;
  const segScaleX = Number.isFinite(segment.scaleX) ? segment.scaleX : blockScaleX;
  const relativeScaleX = blockScaleX !== 0 ? segScaleX / blockScaleX : 1;
  const scaleTransform =
    relativeScaleX !== 1
      ? {
          display: "inline-block",
          transform: `scaleX(${relativeScaleX})`,
          transformOrigin: "left center",
        }
      : {};

  return {
    fontFamily: segment.fontFamily || block.fontFamily || "inherit",
    fontSize: segment.fontSize || block.fontSize || 16,
    ...styleToCss(segment.fontStyle),
    ...scaleTransform,
    ...((segment.fillType || block.fillType) === "gradient"
      ? getGradientTextStyle(source)
      : { color: segment.color || block.color || "#fff" }),
  };
}

export function getBlockTags(block) {
  if (Array.isArray(block?.filterTags)) return block.filterTags.filter(Boolean);
  if (typeof block?.filterTag === "string" && block.filterTag.trim())
    return [block.filterTag.trim()];
  return [];
}

function getFilterScopeId(filterBlock: any): string {
  const explicitGroup =
    typeof filterBlock?.filterGroup === "string" ? filterBlock.filterGroup.trim() : "";
  if (explicitGroup) return explicitGroup;
  if (typeof filterBlock?.id === "string" && filterBlock.id.trim()) return filterBlock.id;
  return "__filter__";
}

function getSingleFilterScope(allBlocks: any[]): string | null {
  const filterBlocks = allBlocks.filter((block: any) => block.type === "filter");
  if (filterBlocks.length !== 1) return null;
  return getFilterScopeId(filterBlocks[0]);
}

function getBlockFilterScope(block: any, allBlocks: any[]): string | null {
  const explicitGroup = typeof block?.filterGroup === "string" ? block.filterGroup.trim() : "";
  if (explicitGroup) return explicitGroup;
  if (block?.type === "filter") return getFilterScopeId(block);
  return getSingleFilterScope(allBlocks);
}

function getScopedBlocks(allBlocks: any[], filterBlock: any): any[] {
  const scope = getFilterScopeId(filterBlock);
  return allBlocks.filter(
    (block: any) => block.type !== "filter" && getBlockFilterScope(block, allBlocks) === scope
  );
}

// --- Reveal on hover helpers ---

function getRevealGroup(tag: string): string {
  const dashIdx = tag.indexOf("-");
  return dashIdx > 0 ? tag.slice(0, dashIdx) : tag;
}

function getRevealTargetStyle(
  b: any,
  activatedTagPerGroup: Map<string, string>
): React.CSSProperties {
  // Bloc cible : visible seulement s'il est le dernier activé dans sa catégorie
  if (b?.revealHidden && b?.revealTag) {
    const group = getRevealGroup(b.revealTag);
    const active = activatedTagPerGroup.get(group) === b.revealTag;
    return {
      opacity: active ? 1 : 0,
      pointerEvents: active ? undefined : "none",
      transition: "opacity 0.25s ease",
    };
  }
  // Bloc par défaut : disparaît dès que sa catégorie a été activée une fois
  if (b?.revealDefault) {
    const shouldHide = b.revealTag
      ? activatedTagPerGroup.has(b.revealTag)
      : activatedTagPerGroup.size > 0;
    return {
      opacity: shouldHide ? 0 : 1,
      pointerEvents: shouldHide ? "none" : undefined,
      transition: "opacity 0.25s ease",
    };
  }
  return {};
}

function getRevealTriggerHandlers(b: any, activateTag: (t: string) => void) {
  if (!b?.revealEnabled || !b?.revealTag) return {};
  return {
    onMouseEnter: () => activateTag(b.revealTag),
  };
}

// --- Block Components ---

export function HoverWrapper({ block, style, children, activatedTagPerGroup, onRevealHover }: any) {
  const [hovered, setHovered] = useState(false);
  const isActive = block?.hoverEnabled && hovered;
  const hoverScale = isActive ? block.hoverScale || 1.1 : 1;
  const duration = block?.hoverDuration ?? 0.25;
  const baseTransform = (style as { transform?: string })?.transform;
  const transforms: string[] = [];
  if (baseTransform) transforms.push(baseTransform);
  if (block?.hoverEnabled) transforms.push(`scale(${hoverScale})`);
  const finalTransform = transforms.length > 0 ? transforms.join(" ") : undefined;
  const existingTransition = (style as any)?.transition;
  const transition = existingTransition
    ? `transform ${duration}s ease, ${existingTransition}`
    : `transform ${duration}s ease`;

  const isRevealTarget = block?.revealHidden && block?.revealTag;
  const isRevealTrigger = block?.revealEnabled && block?.revealTag;
  const map: Map<string, string> = activatedTagPerGroup ?? new Map();
  const revealStyle = getRevealTargetStyle(block, map);

  return (
    <div
      onMouseEnter={() => {
        setHovered(true);
        if (isRevealTrigger) onRevealHover?.(block.revealTag);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={{
        ...style,
        ...(finalTransform !== undefined ? { transform: finalTransform } : {}),
        transformOrigin: "center center",
        transition: isRevealTarget ? `opacity 0.25s ease, ${transition}` : transition,
        ...revealStyle,
      }}
    >
      {children}
    </div>
  );
}

export function CountdownBlock({ block, style, revealHandlers = {} }: any) {
  const [timeLeft, setTimeLeft] = useState<any>({});

  useEffect(() => {
    function calc() {
      const diff = new Date(block.targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [block.targetDate]);

  const pad = (n: any) => String(n ?? 0).padStart(2, "0");
  const fs = block.fontSize ?? 32;

  return (
    <div
      style={{
        ...style,
        background: block.bgColor === "transparent" ? undefined : block.bgColor,
        borderRadius: block.borderRadius ?? 12,
        ...getBlockBorder(block, getBlockBoxShadow(block)),
        transform: `rotate(${block.rotation ?? 0}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
      {...revealHandlers}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
        {(
          [
            ["d", "Days"],
            ["h", "Hours"],
            ["m", "Min"],
            ["s", "Sec"],
          ] as const
        ).map(([k, label]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div
              style={{
                color: block.textColor || "#fff",
                fontSize: fs,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {pad(timeLeft[k])}
            </div>
            <div style={{ color: block.textColor || "#fff", fontSize: fs * 0.3, opacity: 0.7 }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      {block.label && (
        <div style={{ color: block.textColor || "#fff", fontSize: fs * 0.35, opacity: 0.8 }}>
          {block.label}
        </div>
      )}
    </div>
  );
}

function renderFrontBlock(fb: any) {
  if (fb.type === "image" || fb.type === "imageLink") {
    return fb.src ? (
      <img
        src={fb.src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ) : null;
  }
  if (fb.type === "box") {
    const gradient =
      fb.fillType === "transparent"
        ? "transparent"
        : fb.gradient ||
          `linear-gradient(135deg, ${fb.gradientStart || "#4f46e5"} 0%, ${fb.gradientEnd || "#7c3aed"} 100%)`;
    return (
      <div
        style={{ width: "100%", height: "100%", background: gradient, opacity: fb.opacity ?? 1 }}
      />
    );
  }
  if (fb.type === "text") {
    const seg = fb.segments?.[0] || {};
    return (
      <div
        style={{
          ...getSegmentTextStyle(seg, fb),
          lineHeight: 1.4,
          padding: 4,
          overflow: "hidden",
        }}
      >
        {seg?.text ?? fb.text ?? ""}
      </div>
    );
  }
  if (fb.type === "emoji") {
    return (
      <span
        style={{
          fontSize: fb.fontSize ?? 64,
          lineHeight: 1,
          display: "block",
          transform: fb.rotation ? `rotate(${fb.rotation}deg)` : undefined,
          transformOrigin: "center center",
        }}
      >
        {fb.emoji ?? "✨"}
      </span>
    );
  }
  return null;
}

export function FlipCard({ block, style, revealHandlers = {} }: any) {
  const [flipped, setFlipped] = useState(false);
  const duration = block.flipDuration ?? 0.6;
  const trigger = block.flipTrigger ?? "click";
  const frontBlocks: any[] = Array.isArray(block.frontBlocks) ? block.frontBlocks : [];

  const fcW = block.w ?? 300;
  const fcH = block.h ?? 200;
  const bfW = block.backW ?? fcW;
  const bfH = block.backH ?? fcH;
  const bfOX = (fcW - bfW) / 2;
  const bfOY = (fcH - bfH) / 2;

  const triggerProps =
    trigger === "hover"
      ? { onMouseEnter: () => setFlipped(true), onMouseLeave: () => setFlipped(false) }
      : { onClick: () => setFlipped((f) => !f) };

  return (
    <div
      {...triggerProps}
      style={{
        ...style,
        perspective: 1000,
        cursor: "pointer",
        overflow: "visible",
        ...getBlockBorder(block),
      }}
      {...revealHandlers}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "visible",
          transition: `transform ${duration}s`,
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: block.borderRadius ?? 12,
            overflow: "hidden",
            background: block.frontBgColor || "transparent",
            ...(block.frontBorderEnabled
              ? block.frontBorderStyle === "solid"
                ? {
                    boxShadow: `inset 0 ${block.frontBorderWidth ?? 2}px 0 0 ${block.frontBorderColor || "#fff"}, inset -${block.frontBorderWidth ?? 2}px 0 0 0 ${block.frontBorderColor || "#fff"}, inset 0 -${block.frontBorderWidth ?? 2}px 0 0 ${block.frontBorderColor || "#fff"}, inset ${block.frontBorderWidth ?? 2}px 0 0 0 ${block.frontBorderColor || "#fff"}`,
                  }
                : {
                    border: `${block.frontBorderWidth ?? 2}px ${block.frontBorderStyle || "solid"} ${block.frontBorderColor || "#fff"}`,
                  }
              : {}),
          }}
        >
          {frontBlocks.length > 0 ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: block.borderRadius ?? 12,
              }}
            >
              {frontBlocks.map((fb: any) => {
                const bColor = fb.borderColor || "#ffffff";
                const bStyle = fb.borderStyle || "solid";
                const bwBase = fb.borderEnabled ? (fb.borderWidth ?? 2) : 0;
                const bTop = fb.borderTopWidth ?? bwBase;
                const bRight = fb.borderRightWidth ?? bwBase;
                const bBottom = fb.borderBottomWidth ?? bwBase;
                const bLeft = fb.borderLeftWidth ?? bwBase;
                const insetShadow =
                  fb.borderEnabled && bStyle === "solid"
                    ? [
                        bTop > 0 && `inset 0 ${bTop}px 0 0 ${bColor}`,
                        bRight > 0 && `inset -${bRight}px 0 0 0 ${bColor}`,
                        bBottom > 0 && `inset 0 -${bBottom}px 0 0 ${bColor}`,
                        bLeft > 0 && `inset ${bLeft}px 0 0 0 ${bColor}`,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : undefined;
                return (
                  <div
                    key={fb.id}
                    style={{
                      position: "absolute",
                      left: fb.x ?? 0,
                      top: fb.y ?? 0,
                      width: fb.type === "emoji" ? (fb.fontSize ?? 64) : (fb.w ?? 200),
                      height: fb.type === "emoji" ? (fb.fontSize ?? 64) : (fb.h ?? 100),
                      overflow: fb.type === "emoji" ? "visible" : "hidden",
                      borderRadius: fb.borderRadius ?? 0,
                      ...(insetShadow ? { boxShadow: insetShadow } : {}),
                      ...(fb.borderEnabled && bStyle !== "solid"
                        ? { border: `${bwBase}px ${bStyle} ${bColor}` }
                        : {}),
                    }}
                  >
                    {renderFrontBlock(fb)}
                  </div>
                );
              })}
            </div>
          ) : block.frontType === "box" ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(${block.frontGradientAngle ?? 135}deg, ${block.frontBgColor || "#4f46e5"} 0%, ${block.frontBgColorEnd || "#7c3aed"} 100%)`,
              }}
            />
          ) : block.src ? (
            <img
              src={block.src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : null}
        </div>

        {/* Back face */}
        <div
          style={{
            position: "absolute",
            left: bfOX,
            top: bfOY,
            width: bfW,
            height: bfH,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: block.backBorderRadius ?? block.borderRadius ?? 12,
            background: block.backBgColor || "#1a1a2e",
            overflow: "hidden",
            ...(block.backBorderEnabled
              ? block.backBorderStyle === "solid"
                ? {
                    boxShadow: `inset 0 ${block.backBorderWidth ?? 2}px 0 0 ${block.backBorderColor || "#fff"}, inset -${block.backBorderWidth ?? 2}px 0 0 0 ${block.backBorderColor || "#fff"}, inset 0 -${block.backBorderWidth ?? 2}px 0 0 ${block.backBorderColor || "#fff"}, inset ${block.backBorderWidth ?? 2}px 0 0 0 ${block.backBorderColor || "#fff"}`,
                  }
                : {
                    border: `${block.backBorderWidth ?? 2}px ${block.backBorderStyle || "solid"} ${block.backBorderColor || "#ffffff"}`,
                  }
              : {}),
          }}
        >
          {(block.backBlocks ?? []).length > 0 ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {(block.backBlocks ?? []).map((bb: any) => (
                <div
                  key={bb.id}
                  style={{
                    position: "absolute",
                    left: bb.x ?? 0,
                    top: bb.y ?? 0,
                    width: bb.type === "emoji" ? (bb.fontSize ?? 64) : (bb.w ?? "auto"),
                    height: bb.type === "emoji" ? (bb.fontSize ?? 64) : (bb.h ?? "auto"),
                    overflow: bb.type === "emoji" ? "visible" : "hidden",
                    borderRadius: bb.borderRadius ?? 0,
                  }}
                >
                  {renderFrontBlock(bb)}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  color: block.backTextColor || "#ffffff",
                  fontSize: block.backFontSize ?? 18,
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {block.backText || ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ButtonBlock({ block, revealStyle = {}, revealHandlers = {} }: any) {
  return (
    <div
      style={{
        position: "absolute",
        left: block.x ?? 0,
        top: block.y ?? 0,
        zIndex: block.zIndex ?? 1,
        ...getBlockBorder(block, getBlockBoxShadow(block)),
        transform: `rotate(${block.rotation ?? 0}deg)`,
        ...revealStyle,
      }}
      {...revealHandlers}
    >
      <a
        href={block.url || "#"}
        target={block.newTab ? "_blank" : undefined}
        rel={block.newTab ? "noopener noreferrer" : undefined}
        style={{
          display: "inline-block",
          background: block.bgColor || "#4f46e5",
          color: block.textColor || "#ffffff",
          fontSize: block.fontSize ?? 16,
          fontWeight: block.fontStyle === "bold" || block.fontStyle === "bolditalic" ? 700 : 400,
          fontStyle:
            block.fontStyle === "italic" || block.fontStyle === "bolditalic" ? "italic" : "normal",
          padding: `${block.paddingY ?? 12}px ${block.paddingX ?? 24}px`,
          borderRadius: block.borderRadius ?? 8,
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        {block.label || "Button"}
      </a>
    </div>
  );
}

export function VideoBlock({ block, revealStyle = {}, revealHandlers = {} }: any) {
  return (
    <div
      style={{
        position: "absolute",
        left: block.x ?? 0,
        top: block.y ?? 0,
        zIndex: block.zIndex ?? 1,
        width: block.w ?? 560,
        height: block.h ?? 315,
        borderRadius: block.borderRadius ?? 8,
        overflow: "hidden",
        ...getBlockBorder(block, getBlockBoxShadow(block)),
        transform: `rotate(${block.rotation ?? 0}deg)`,
        ...revealStyle,
      }}
      {...revealHandlers}
    >
      {block.src ? (
        <video
          src={block.src}
          controls
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#555",
          }}
        >
          Aucune vidéo
        </div>
      )}
    </div>
  );
}

export function GalleryBlock({ block, revealStyle = {}, revealHandlers = {} }: any) {
  return (
    <div
      style={{
        position: "absolute",
        left: block.x ?? 0,
        top: block.y ?? 0,
        zIndex: block.zIndex ?? 1,
        width: block.w ?? 600,
        height: block.h ?? 400,
        borderRadius: block.borderRadius ?? 8,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: `repeat(${block.columns ?? 3}, 1fr)`,
        gap: block.gap ?? 8,
        ...getBlockBorder(block, getBlockBoxShadow(block)),
        transform: `rotate(${block.rotation ?? 0}deg)`,
        ...revealStyle,
      }}
      {...revealHandlers}
    >
      {(block.images || []).map((img: any) => (
        <img
          key={img.id}
          src={img.src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ))}
    </div>
  );
}

export function QuoteBlock({ block, revealStyle = {}, revealHandlers = {} }: any) {
  return (
    <div
      style={{
        position: "absolute",
        left: block.x ?? 0,
        top: block.y ?? 0,
        zIndex: block.zIndex ?? 1,
        width: block.w ?? 420,
        height: block.h ?? 200,
        borderRadius: block.borderRadius ?? 12,
        background: block.bgColor || "rgba(255,255,255,0.05)",
        borderLeft: `4px solid ${block.accentColor || "#4f46e5"}`,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 10,
        overflow: "hidden",
        boxSizing: "border-box",
        ...getBlockBorder(block, getBlockBoxShadow(block)),
        transform: `rotate(${block.rotation ?? 0}deg)`,
        ...revealStyle,
      }}
      {...revealHandlers}
    >
      <p
        style={{
          color: block.textColor || "#fff",
          fontSize: block.fontSize ?? 16,
          fontStyle: "italic",
          margin: 0,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {block.text || ""}
      </p>
      <p
        style={{
          color: block.authorColor || "#a0a0a0",
          fontSize: (block.fontSize ?? 16) * 0.85,
          margin: 0,
        }}
      >
        — {block.author || ""}
        {block.role ? `, ${block.role}` : ""}
      </p>
    </div>
  );
}

export function ShapeBlockSvg({ block }: { block: any }) {
  const w = Math.max(4, block.w || 200);
  const h = Math.max(4, block.h || 200);
  const strokeColor = block.strokeColor || "#ffffff";
  const sw = Math.max(0, block.strokeWidth ?? 3);
  const fillColor = block.fillEnabled ? block.fillColor || "#4f46e5" : "none";
  const rotation = block.rotation || 0;
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
    const pts: string[] = [];
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
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
        overflow: "visible",
      }}
    >
      {content}
    </svg>
  );
}

function renderGroupChild(child: any) {
  if (child.type === "box") {
    const bg =
      child.fillType === "transparent"
        ? "transparent"
        : child.fillType === "gradient"
          ? child.gradient ||
            `linear-gradient(135deg, ${child.gradientStart || "#4f46e5"}, ${child.gradientEnd || "#7c3aed"})`
          : child.color || "#4f46e5";
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          width: child.w ?? 100,
          height: child.h ?? 60,
          background: bg,
          borderRadius: child.borderRadius ?? 0,
          opacity: child.opacity ?? 1,
          zIndex: child.zIndex ?? 1,
          ...getBlockBorder(child, getBlockBoxShadow(child)),
        }}
      />
    );
  }
  if (child.type === "image" || child.type === "imageLink") {
    const inner = (
      <>
        {child.src && (
          <img
            src={child.src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {child.overlayEnabled && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: child.overlayColor || "#000",
              opacity: child.overlayOpacity ?? 0.18,
              pointerEvents: "none",
            }}
          />
        )}
      </>
    );
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          width: child.w ?? 200,
          height: child.h ?? 200,
          borderRadius: child.borderRadius ?? 0,
          overflow: "hidden",
          zIndex: child.zIndex ?? 1,
          ...getBlockBorder(child, getBlockBoxShadow(child)),
        }}
      >
        {child.url ? (
          <a
            href={child.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", width: "100%", height: "100%" }}
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
    );
  }
  if (child.type === "text") {
    const tb = normalizeTextBlock(child);
    const textContent = tb.segments.map((seg: any) => (
      <span key={seg.id} style={getSegmentTextStyle(seg, tb)}>
        {seg.text}
      </span>
    ));
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          zIndex: child.zIndex ?? 1,
          fontSize: tb.fontSize ?? 16,
          whiteSpace: "pre-wrap",
          lineHeight: 1.35,
          padding: 4,
          width: tb.w ? Math.max(80, tb.w) : "auto",
          ...((tb.scaleX ?? 1) !== 1 || (tb.scaleY ?? 1) !== 1
            ? {
                transform: `scale(${tb.scaleX ?? 1}, ${tb.scaleY ?? 1})`,
                transformOrigin: "left top",
              }
            : {}),
          ...getBlockBorder(tb),
        }}
      >
        {tb.url ? (
          <a
            href={tb.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {textContent}
          </a>
        ) : (
          textContent
        )}
      </div>
    );
  }
  if (child.type === "button") {
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          zIndex: child.zIndex ?? 1,
        }}
      >
        <a
          href={child.url || "#"}
          target={child.newTab ? "_blank" : undefined}
          rel={child.newTab ? "noopener noreferrer" : undefined}
          style={{
            display: "inline-block",
            background: child.bgColor || "#4f46e5",
            color: child.textColor || "#fff",
            fontSize: child.fontSize ?? 16,
            padding: `${child.paddingY ?? 12}px ${child.paddingX ?? 24}px`,
            borderRadius: child.borderRadius ?? 8,
            textDecoration: "none",
          }}
        >
          {child.label || "Button"}
        </a>
      </div>
    );
  }
  if (child.type === "link") {
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          zIndex: child.zIndex ?? 1,
          fontSize: child.fontSize ?? 16,
          ...styleToCss(child.fontStyle),
          ...getBlockBorder(child),
        }}
      >
        <a
          href={child.url || "#"}
          target={child.newTab ? "_blank" : undefined}
          rel={child.newTab ? "noopener noreferrer" : undefined}
          style={{
            color: child.color ?? "#60a5fa",
            textDecoration: child.underline ? "underline" : "none",
            display: "inline-block",
            padding: 4,
          }}
        >
          {child.label ?? child.url ?? "Link"}
        </a>
      </div>
    );
  }
  if (child.type === "shape") {
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          width: child.w ?? 100,
          height: child.h ?? 100,
          zIndex: child.zIndex ?? 1,
          pointerEvents: "none",
        }}
      >
        <ShapeBlockSvg block={child} />
      </div>
    );
  }
  if (child.type === "emoji") {
    return (
      <div
        key={child.id}
        style={{
          position: "absolute",
          left: child.x ?? 0,
          top: child.y ?? 0,
          width: child.fontSize ?? 64,
          height: child.fontSize ?? 64,
          zIndex: child.zIndex ?? 1,
          lineHeight: 1,
          overflow: "visible",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: child.fontSize ?? 64,
            lineHeight: 1,
          }}
        >
          {child.emoji ?? "✨"}
        </span>
      </div>
    );
  }
  return null;
}

export function GroupBlock({ block, style, revealHandlers = {} }: any) {
  const children = Array.isArray(block.blocks) ? block.blocks : [];
  const sorted = [...children].sort((a: any, b: any) => (a.zIndex ?? 1) - (b.zIndex ?? 1));

  return (
    <div
      style={{
        ...style,
        borderRadius: block.borderRadius ?? 0,
        ...getBlockBorder(block, getBlockBoxShadow(block)),
        transform: `rotate(${block.rotation ?? 0}deg)`,
      }}
      {...revealHandlers}
    >
      {sorted.map((child: any) => renderGroupChild(child))}
    </div>
  );
}

type LayoutAdjustments = Record<string, { x?: number; y?: number }>;

// Re-flows filterable blocks into the original grid, starting from the top-left.
// Visible blocks are placed in reading order (row by row, left to right) using
// the column X positions and row heights from the original layout.
function computeScopeLayoutAdjustments(
  scopedBlocks: any[],
  activeFilters: string[]
): LayoutAdjustments {
  if (activeFilters.length === 0) return {};

  const filterable = scopedBlocks.filter((b: any) => getBlockTags(b).length > 0);
  if (filterable.length < 2) return {};

  // Build rows sorted by Y, each row sorted by X
  const sortedByY = [...filterable].sort((a: any, b: any) => (a.y ?? 0) - (b.y ?? 0));
  const rows: any[][] = [];
  for (const block of sortedByY) {
    const y = block.y ?? 0;
    const row = rows.find((r) => r.some((rb: any) => Math.abs((rb.y ?? 0) - y) < 80));
    if (row) row.push(block);
    else rows.push([block]);
  }
  const sortedRows = rows.map((row) => [...row].sort((a: any, b: any) => (a.x ?? 0) - (b.x ?? 0)));

  // Visible blocks in original reading order
  const visibleBlocks = sortedRows
    .flat()
    .filter((b: any) => getBlockTags(b).some((t: string) => activeFilters.includes(t)));

  if (visibleBlocks.length === filterable.length) return {};

  // Grid reference: column X positions from the widest row, row heights from original layout
  const maxCols = Math.max(...sortedRows.map((r) => r.length));
  const referenceRow = sortedRows.find((r) => r.length === maxCols) ?? sortedRows[0];
  const colXPositions = referenceRow.map((b: any) => b.x ?? 0);

  const rowYPositions = sortedRows.map((row) => Math.min(...row.map((b: any) => b.y ?? 0)));
  const rowHeights = sortedRows.map((row, i) => {
    const nextY =
      i < sortedRows.length - 1
        ? rowYPositions[i + 1]
        : rowYPositions[i] + Math.max(...row.map((b: any) => b.h ?? 200));
    return nextY - rowYPositions[i];
  });
  // Use median row height so one outlier row doesn't skew the spacing
  const medianRowHeight = [...rowHeights].sort((a, b) => a - b)[Math.floor(rowHeights.length / 2)];
  const originY = rowYPositions[0];

  const adjustments: LayoutAdjustments = {};

  visibleBlocks.forEach((b: any, idx: number) => {
    const targetRow = Math.floor(idx / maxCols);
    const targetCol = idx % maxCols;
    const targetX = colXPositions[targetCol] ?? colXPositions[colXPositions.length - 1];
    const targetY = originY + targetRow * medianRowHeight;

    const origX = b.x ?? 0;
    const origY = b.y ?? 0;

    if (targetX !== origX || targetY !== origY) {
      adjustments[b.id] = {};
      if (targetX !== origX) adjustments[b.id].x = targetX;
      if (targetY !== origY) adjustments[b.id].y = targetY;
    }
  });

  return adjustments;
}

function computeLayoutAdjustments(
  allBlocks: any[],
  activeFiltersByScope: Record<string, string[]>
): LayoutAdjustments {
  const adjustments: LayoutAdjustments = {};
  const scopes = new Set<string>();

  allBlocks.forEach((block: any) => {
    const scope = getBlockFilterScope(block, allBlocks);
    if (scope) scopes.add(scope);
  });

  scopes.forEach((scope) => {
    const activeFilters = activeFiltersByScope[scope] ?? [];
    if (activeFilters.length === 0 || activeFilters.includes("all")) return;
    const scopedBlocks = allBlocks.filter(
      (block: any) => block.type !== "filter" && getBlockFilterScope(block, allBlocks) === scope
    );
    Object.assign(adjustments, computeScopeLayoutAdjustments(scopedBlocks, activeFilters));
  });

  return adjustments;
}

// --- Main Canvas Renderer ---

interface PageCanvasProps {
  page: any;
  canvasHeightMin?: number;
  canvasPaddingBottom?: number;
  fillViewport?: boolean;
}

export function PageCanvas({
  page,
  canvasHeightMin = 900,
  canvasPaddingBottom = 600,
  fillViewport = true,
}: PageCanvasProps) {
  const [activeFiltersByScope, setActiveFiltersByScope] = useState<Record<string, string[]>>({});
  const [activatedTagPerGroup, setActivatedTagPerGroup] = useState<Map<string, string>>(new Map());

  function handleRevealHover(tag: string) {
    const group = getRevealGroup(tag);
    setActivatedTagPerGroup((prev) => {
      if (prev.get(group) === tag) return prev;
      const next = new Map(prev);
      next.set(group, tag);
      return next;
    });
  }

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  const adjustments = computeLayoutAdjustments(blocks, activeFiltersByScope);
  const adjX = (b: any): number => adjustments[b.id]?.x ?? b.x ?? 0;
  const adjY = (b: any): number => adjustments[b.id]?.y ?? b.y ?? 0;
  const REFLOW_TRANSITION =
    "left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

  const pageGradient = getPageGradientConfig(page);
  const pageBackground =
    page?.backgroundType === "gradient"
      ? page.backgroundGradient ||
        buildLinearGradient(pageGradient.angle, pageGradient.start, pageGradient.end)
      : page?.backgroundType === "image"
        ? undefined
        : page?.backgroundColor && page.backgroundColor !== "transparent"
          ? page.backgroundColor
          : "#2a2424";

  const visibleBlocks = blocks.filter((b: any) => {
    if (b.type === "filter") return true;
    const activeFilters = (() => {
      const scope = getBlockFilterScope(b, blocks);
      return scope ? activeFiltersByScope[scope] ?? [] : [];
    })();
    if (activeFilters.length === 0 || activeFilters.includes("all")) return true;
    const tags = getBlockTags(b);
    if (tags.length === 0) return true;
    return tags.some((tag: string) => activeFilters.includes(tag));
  });

  const orderedVisibleBlocks = [...visibleBlocks].sort(
    (a: any, b: any) => (Number(a?.zIndex) || 1) - (Number(b?.zIndex) || 1)
  );

  const canvasHeight =
    Math.max(
      canvasHeightMin,
      ...orderedVisibleBlocks.map((b: any) => {
        const y = adjY(b);
        const h =
          b?.type === "box" ||
          b?.type === "image" ||
          b?.type === "imageLink" ||
          b?.type === "flipCard" ||
          b?.type === "video" ||
          b?.type === "gallery" ||
          b?.type === "countdown" ||
          b?.type === "quote" ||
          b?.type === "shape" ||
          b?.type === "group"
            ? (b?.h ?? 0)
            : b?.type === "text"
              ? Math.max(b?.h ?? 0, (b?.fontSize ?? 20) * 3)
              : b?.type === "filter"
                ? 120
                : 0;
        return y + h + 200;
      })
    ) + canvasPaddingBottom;

  const canvasWidth = Math.max(
    PUBLIC_CANVAS_WIDTH,
    ...orderedVisibleBlocks.map((b: any) => {
      const width =
        b?.type === "text"
          ? (b?.w ?? 500)
          : b?.type === "filter"
            ? (b?.width ?? 500)
            : b?.type === "emoji"
              ? (b?.fontSize ?? 64)
              : (b?.w ?? 0);
      return adjX(b) + width + 32;
    })
  );

  const { containerRef, scale, designWidth } = useResponsiveCanvas(canvasWidth);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        ...(fillViewport ? { minHeight: `max(100vh, ${canvasHeight * scale}px)` } : {}),
        background: pageBackground,
        backgroundImage:
          page?.backgroundType === "image" && page.backgroundImage
            ? `url(${page.backgroundImage})`
            : undefined,
        backgroundSize: page?.backgroundType === "image" ? "cover" : undefined,
        backgroundPosition: page?.backgroundType === "image" ? "center" : undefined,
        backgroundAttachment: page?.backgroundType === "image" ? "fixed" : undefined,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: canvasHeight * scale }}>
        <div
          style={{
            position: "relative",
            width: designWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
        {page?.overlayEnabled && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: page.overlayColor || "#000000",
              opacity: page.overlayOpacity ?? 0.25,
              pointerEvents: "none",
            }}
          />
        )}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "box")
          .map((b: any) => {
            const boxGradient = getBlockGradientConfig(b);
            return (
              <HoverWrapper
                key={b.id}
                block={b}
                onRevealHover={handleRevealHover}
                activatedTagPerGroup={activatedTagPerGroup}
                style={{
                  position: "absolute",
                  left: adjX(b),
                  top: adjY(b),
                  zIndex: b.zIndex ?? 1,
                  width: b.w ?? 10,
                  height: b.h ?? 10,
                  background:
                    b.fillType === "transparent"
                      ? "transparent"
                      : b.fillType === "gradient"
                        ? b.gradient ||
                          buildLinearGradient(boxGradient.angle, boxGradient.start, boxGradient.end)
                        : (b.color ?? "#444"),
                  borderRadius: b.borderRadius ?? 12,
                  opacity: b.opacity ?? 0.92,
                  overflow: b.linkUrl ? "hidden" : undefined,
                  ...getBlockBorder(b, getBlockBoxShadow(b)),
                  transform: b.rotation ? `rotate(${b.rotation}deg)` : undefined,
                  transition: REFLOW_TRANSITION,
                }}
              >
                {b.linkUrl && (
                  <a
                    href={b.linkUrl}
                    target={b.newTab !== false ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "block",
                      cursor: "pointer",
                      borderRadius: b.borderRadius ?? 12,
                    }}
                  />
                )}
              </HoverWrapper>
            );
          })}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "image" || b.type === "imageLink")
          .map((b: any) => {
            const imgContent = (
              <>
                <img
                  src={b.src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {b.overlayEnabled && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: b.overlayColor || "#000000",
                      opacity: b.overlayOpacity ?? 0.18,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </>
            );
            return (
              <HoverWrapper
                key={b.id}
                block={b}
                onRevealHover={handleRevealHover}
                activatedTagPerGroup={activatedTagPerGroup}
                style={{
                  position: "absolute",
                  left: adjX(b),
                  top: adjY(b),
                  zIndex: b.zIndex ?? 1,
                  width: b.w ?? 200,
                  height: b.h ?? 200,
                  borderRadius: b.borderRadius ?? 12,
                  overflow: "hidden",
                  ...getBlockBorder(b, getBlockBoxShadow(b)),
                  transform: b.rotation ? `rotate(${b.rotation}deg)` : undefined,
                  transition: REFLOW_TRANSITION,
                }}
              >
                {b.url ? (
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", width: "100%", height: "100%" }}
                  >
                    {imgContent}
                  </a>
                ) : (
                  imgContent
                )}
              </HoverWrapper>
            );
          })}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "flipCard")
          .map((b: any) => (
            <FlipCard
              key={b.id}
              block={b}
              style={{
                position: "absolute",
                left: adjX(b),
                top: adjY(b),
                zIndex: b.zIndex ?? 1,
                width: b.w ?? 300,
                height: b.h ?? 200,
                transition: REFLOW_TRANSITION,
                ...getRevealTargetStyle(b, activatedTagPerGroup),
              }}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "button")
          .map((b: any) => (
            <ButtonBlock
              key={b.id}
              block={b}
              revealStyle={getRevealTargetStyle(b, activatedTagPerGroup)}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "video")
          .map((b: any) => (
            <VideoBlock
              key={b.id}
              block={b}
              revealStyle={getRevealTargetStyle(b, activatedTagPerGroup)}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "gallery")
          .map((b: any) => (
            <GalleryBlock
              key={b.id}
              block={b}
              revealStyle={getRevealTargetStyle(b, activatedTagPerGroup)}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "countdown")
          .map((b: any) => (
            <CountdownBlock
              key={b.id}
              block={b}
              style={{
                position: "absolute",
                left: adjX(b),
                top: adjY(b),
                zIndex: b.zIndex ?? 1,
                width: b.w ?? 420,
                height: b.h ?? 130,
                transition: REFLOW_TRANSITION,
                ...getRevealTargetStyle(b, activatedTagPerGroup),
              }}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "quote")
          .map((b: any) => (
            <QuoteBlock
              key={b.id}
              block={b}
              revealStyle={getRevealTargetStyle(b, activatedTagPerGroup)}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "link")
          .map((b: any) => (
            <HoverWrapper
              key={b.id}
              block={b}
              onRevealHover={handleRevealHover}
              activatedTagPerGroup={activatedTagPerGroup}
              style={{
                position: "absolute",
                left: adjX(b),
                top: adjY(b),
                zIndex: b.zIndex ?? 1,
                fontSize: b.fontSize ?? 16,
                color: b.color ?? "#60a5fa",
                textDecoration: b.underline ? "underline" : "none",
                padding: 4,
                display: "inline-block",
                ...styleToCss(b.fontStyle),
                ...getBlockBorder(b),
                transition: REFLOW_TRANSITION,
              }}
            >
              <a
                href={b.url || "#"}
                target={b.newTab ? "_blank" : undefined}
                rel={b.newTab ? "noopener noreferrer" : undefined}
                style={{ color: "inherit", textDecoration: "inherit", display: "inline-block" }}
              >
                {b.label ?? b.url ?? "Link"}
              </a>
            </HoverWrapper>
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "text")
          .map((block: any) => {
            const textBlock = normalizeTextBlock(block);
            const textContent = textBlock.segments.map((segment: any) => (
              <span key={segment.id} style={getSegmentTextStyle(segment, textBlock)}>
                {segment.text}
              </span>
            ));
            return (
              <HoverWrapper
                key={textBlock.id}
                block={textBlock}
                onRevealHover={handleRevealHover}
                activatedTagPerGroup={activatedTagPerGroup}
                style={{
                  position: "absolute",
                  left: adjX(textBlock),
                  top: adjY(textBlock),
                  zIndex: textBlock.zIndex ?? 1,
                  width: textBlock.w ? Math.max(140, textBlock.w) : "auto",
                  minHeight: textBlock.h,
                  fontSize: textBlock.fontSize ?? 16,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.35,
                  padding: 4,
                  maxWidth: textBlock.w ? Math.max(140, textBlock.w) : 900,
                  ...((textBlock.scaleX ?? 1) !== 1 || (textBlock.scaleY ?? 1) !== 1
                    ? {
                        transform: `scale(${textBlock.scaleX ?? 1}, ${textBlock.scaleY ?? 1})`,
                        transformOrigin: "left top",
                      }
                    : {}),
                  ...getBlockBorder(textBlock),
                  transition: REFLOW_TRANSITION,
                }}
              >
                {textBlock.url ? (
                  <a
                    href={textBlock.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {textContent}
                  </a>
                ) : (
                  textContent
                )}
              </HoverWrapper>
            );
          })}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "emoji")
          .map((b: any) => (
            <HoverWrapper
              key={b.id}
              block={b}
              onRevealHover={handleRevealHover}
              activatedTagPerGroup={activatedTagPerGroup}
              style={{
                position: "absolute",
                left: adjX(b),
                top: adjY(b),
                zIndex: b.zIndex ?? 1,
                fontSize: b.fontSize ?? 64,
                lineHeight: 1,
                userSelect: "none",
                transform: b.rotation ? `rotate(${b.rotation}deg)` : undefined,
                transformOrigin: "center center",
                transition: REFLOW_TRANSITION,
                ...getBlockBorder(b),
              }}
            >
              <span>{b.emoji ?? "✨"}</span>
            </HoverWrapper>
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "shape")
          .map((b: any) => {
            const hasLink = !!b.linkUrl;
            const shapeWrapper = (
              <div
                style={{
                  width: b.w ?? 200,
                  height: b.h ?? 200,
                  cursor: hasLink ? "pointer" : "default",
                }}
              >
                <ShapeBlockSvg block={b} />
              </div>
            );
            return (
              <div
                key={b.id}
                style={{
                  position: "absolute",
                  left: adjX(b),
                  top: adjY(b),
                  zIndex: b.zIndex ?? 1,
                  width: b.w ?? 200,
                  height: b.h ?? 200,
                  pointerEvents: hasLink ? "auto" : "none",
                  transition: REFLOW_TRANSITION,
                  ...getRevealTargetStyle(b, activatedTagPerGroup),
                }}
                {...getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
              >
                {hasLink ? (
                  <a
                    href={b.linkUrl}
                    target={b.newTab !== false ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    style={{ display: "block", width: "100%", height: "100%" }}
                  >
                    {shapeWrapper}
                  </a>
                ) : (
                  shapeWrapper
                )}
              </div>
            );
          })}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "group")
          .map((b: any) => (
            <GroupBlock
              key={b.id}
              block={b}
              style={{
                position: "absolute",
                left: adjX(b),
                top: adjY(b),
                zIndex: b.zIndex ?? 1,
                width: b.w ?? 300,
                height: b.h ?? 200,
                transition: REFLOW_TRANSITION,
                ...getRevealTargetStyle(b, activatedTagPerGroup),
              }}
              revealHandlers={getRevealTriggerHandlers(b, handleRevealHover as (t: string) => void)}
            />
          ))}

        {orderedVisibleBlocks
          .filter((b: any) => b.type === "filter")
          .map((b: any) => {
            const filterScope = getFilterScopeId(b);
            const scopedBlocks = getScopedBlocks(blocks, b);
            const activeFilters = activeFiltersByScope[filterScope] ?? [];
            const allCategories = Array.from(
              new Set(scopedBlocks.flatMap((bl: any) => getBlockTags(bl)))
            ) as string[];

            const totalCount = scopedBlocks.length;
            const isAllActive = activeFilters.length === 0;

            function toggleCategory(cat: string) {
              setActiveFiltersByScope((prev) => {
                const current = prev[filterScope] ?? [];
                if (current.includes(cat)) {
                  return { ...prev, [filterScope]: current.filter((v) => v !== cat) };
                }
                return { ...prev, [filterScope]: [...current, cat] };
              });
            }

            const br = b.chipBorderRadius ?? 999;
            const fs = b.chipFontSize ?? 13;
            const px = b.chipPaddingX ?? 14;
            const py = b.chipPaddingY ?? 7;
            const gap = b.chipGap ?? 8;
            const showCount = b.showCount !== false;

            const chipBase: React.CSSProperties = {
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: br,
              padding: `${py}px ${px}px`,
              fontSize: fs,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            };

            const chipInactive: React.CSSProperties = {
              ...chipBase,
              background: b.chipInactiveBg ?? "rgba(255,255,255,0.06)",
              color: b.chipInactiveColor ?? "rgba(255,255,255,0.7)",
              border: `1px solid ${b.chipBorderColor ?? "rgba(255,255,255,0.15)"}`,
            };

            const chipActive: React.CSSProperties = {
              ...chipBase,
              background: b.chipActiveBg ?? "#ffffff",
              color: b.chipActiveColor ?? "#0a0a0a",
              border: `1px solid ${b.chipActiveBorderColor ?? b.chipActiveBg ?? "#ffffff"}`,
            };

            const dotActive = b.chipActiveColor ?? "#0a0a0a";
            const dotInactive = b.chipInactiveColor ?? "rgba(255,255,255,0.4)";

            const countBadge = (active: boolean): React.CSSProperties => ({
              fontSize: Math.max(9, fs - 2),
              fontWeight: 700,
              opacity: active ? 0.6 : 0.5,
              marginLeft: 1,
            });

            return (
              <div
                key={b.id}
                style={{
                  position: "absolute",
                  left: b.x ?? 0,
                  top: adjY(b),
                  zIndex: b.zIndex ?? 20,
                  width: b.width ?? "auto",
                  maxWidth: "90vw",
                  background:
                    b.containerBg && b.containerBg !== "transparent" ? b.containerBg : undefined,
                  borderRadius: b.containerBorderRadius ?? 0,
                  padding: b.containerPadding ? `${b.containerPadding}px` : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap,
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() =>
                      setActiveFiltersByScope((prev) => ({ ...prev, [filterScope]: [] }))
                    }
                    style={isAllActive ? chipActive : chipInactive}
                  >
                    <span
                      style={{
                        width: Math.max(4, fs * 0.5),
                        height: Math.max(4, fs * 0.5),
                        borderRadius: "50%",
                        background: isAllActive ? dotActive : dotInactive,
                        flexShrink: 0,
                      }}
                    />
                    All
                    {showCount && <span style={countBadge(isAllActive)}>{totalCount}</span>}
                  </button>

                  {allCategories.map((cat) => {
                    const isActive = activeFilters.includes(cat);
                    const count = scopedBlocks.filter((bl: any) => getBlockTags(bl).includes(cat))
                      .length;
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        style={isActive ? chipActive : chipInactive}
                      >
                        <span
                          style={{
                            width: Math.max(4, fs * 0.5),
                            height: Math.max(4, fs * 0.5),
                            borderRadius: "50%",
                            background: isActive ? dotActive : dotInactive,
                            flexShrink: 0,
                          }}
                        />
                        {cat}
                        {showCount && <span style={countBadge(isActive)}>{count}</span>}
                      </button>
                    );
                  })}

                  {activeFilters.length > 0 && (
                    <button
                      onClick={() =>
                        setActiveFiltersByScope((prev) => ({ ...prev, [filterScope]: [] }))
                      }
                      style={{
                        ...chipBase,
                        background: "transparent",
                        color: b.chipInactiveColor ?? "rgba(255,255,255,0.45)",
                        border: `1px solid ${b.chipBorderColor ?? "rgba(255,255,255,0.18)"}`,
                        letterSpacing: "0.08em",
                        fontSize: Math.max(9, fs - 2),
                      }}
                    >
                      CLEAR ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
