import { useState } from "react";
import { buildLinearGradient, getBlockGradientConfig } from "../../../../utils/gradients";
import { styleToCss } from "../../editorMathCalcul";
import { filterBlockStyle, imageStyle, smallInputStyle } from "../../editorStyles";
import { insertPlainTextAtSelection } from "../../utils/textBlockUtils";
import { ResizeHandle } from "../shared/ResizeHandle";
import { RotateHandle } from "../shared/RotateHandle";
import { ShapeBlockSvg } from "./ShapeBlockSvg";

function BackBlockEditor({
  bb,
  isSelected,
  flipCardId,
  canvasRef,
  handlers,
  actions,
}: {
  bb: any;
  isSelected: boolean;
  flipCardId: string;
  canvasRef: React.RefObject<HTMLDivElement>;
  handlers: any;
  actions: any;
}) {
  const bbW =
    bb.type === "emoji" ? (bb.fontSize ?? 64) : (bb.w ?? (bb.type === "text" ? "auto" : 120));
  const bbH =
    bb.type === "emoji" ? (bb.fontSize ?? 64) : (bb.h ?? (bb.type === "text" ? "auto" : 60));
  const blockGrad =
    bb.type === "box"
      ? {
          start: bb.gradientStart || "#5b4cf0",
          end: bb.gradientEnd || "#22d3ee",
          angle: bb.gradientAngle || 135,
        }
      : null;
  const boxBg =
    bb.type === "box"
      ? bb.fillType === "transparent"
        ? "transparent"
        : bb.fillType === "gradient"
          ? bb.gradient ||
            `linear-gradient(${blockGrad!.angle}deg,${blockGrad!.start},${blockGrad!.end})`
          : bb.color || "#4f46e5"
      : undefined;

  return (
    <div
      onMouseDown={(e) => handlers.onBackBlockMouseDown(e, bb, flipCardId, canvasRef)}
      onClick={(e) => {
        e.stopPropagation();
        actions.selectBackBlock(bb.id);
      }}
      style={{
        position: "absolute",
        left: bb.x ?? 0,
        top: bb.y ?? 0,
        width: bbW,
        height: bbH,
        zIndex: bb.zIndex ?? 1,
        borderRadius: bb.borderRadius ?? 0,
        outline: isSelected ? "2px solid #a78bfa" : "none",
        outlineOffset: 2,
        cursor: "grab",
        overflow: bb.type === "emoji" ? "visible" : "hidden",
      }}
    >
      {bb.type === "box" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: boxBg,
            borderRadius: bb.borderRadius ?? 0,
            opacity: bb.opacity ?? 1,
          }}
        />
      )}
      {bb.type === "text" && (
        <div
          contentEditable={isSelected}
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.innerText;
            actions.updateBackBlockById(flipCardId, bb.id, {
              text,
              segments: [{ ...(bb.segments?.[0] ?? {}), text }],
            });
          }}
          style={{
            outline: "none",
            color: bb.segments?.[0]?.color || "#fff",
            fontSize: bb.segments?.[0]?.fontSize ?? bb.fontSize ?? 16,
            fontWeight:
              bb.segments?.[0]?.fontStyle === "bold" || bb.segments?.[0]?.fontStyle === "bolditalic"
                ? 700
                : 400,
            whiteSpace: "pre-wrap",
            padding: 4,
            minWidth: 20,
            minHeight: 16,
            lineHeight: 1.35,
          }}
        >
          {bb.segments?.[0]?.text ?? bb.text ?? ""}
        </div>
      )}
      {bb.type === "emoji" && (
        <span
          style={{
            fontSize: bb.fontSize ?? 64,
            lineHeight: 1,
            userSelect: "none",
            display: "block",
          }}
        >
          {bb.emoji ?? "✨"}
        </span>
      )}
      {(bb.type === "image" || bb.type === "imageLink") && bb.src && (
        <img
          src={bb.src}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: bb.borderRadius ?? 0,
          }}
        />
      )}
      {bb.type === "button" && (
        <div
          style={{
            display: "inline-block",
            background: bb.bgColor || "#4f46e5",
            color: bb.textColor || "#fff",
            fontSize: bb.fontSize ?? 14,
            padding: `${bb.paddingY ?? 8}px ${bb.paddingX ?? 16}px`,
            borderRadius: bb.borderRadius ?? 8,
          }}
        >
          {bb.label || "Button"}
        </div>
      )}
      {isSelected && (
        <ResizeHandle
          onMouseDown={(e) => handlers.onBackBlockResizeMouseDown(e, bb, flipCardId, canvasRef)}
        />
      )}
    </div>
  );
}

function getBlockTags(b: any): string[] {
  if (Array.isArray(b?.filterTags)) return b.filterTags.filter(Boolean);
  if (typeof b?.filterTag === "string" && b.filterTag.trim()) return [b.filterTag.trim()];
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
  const filterBlocks = allBlocks.filter((candidate: any) => candidate.type === "filter");
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
    (candidate: any) =>
      candidate.type !== "filter" && getBlockFilterScope(candidate, allBlocks) === scope
  );
}

export function CanvasBlock({
  block,
  isSelected,
  isInSelection = false,
  canvasRef,
  actions,
  handlers,
  onOpenMenu,
  onOpenBackFaceMenu,
  allBlocks = [],
  hoveredRevealTag = null,
  onRevealHover,
  flipBackEditId = null,
  selectedBackBlockId = null,
}: {
  block: any;
  isSelected: boolean;
  isInSelection?: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
  actions: any;
  handlers: any;
  onOpenMenu: (e: React.MouseEvent, id: string) => void;
  onOpenBackFaceMenu?: (e: React.MouseEvent, flipCardId: string) => void;
  allBlocks?: any[];
  hoveredRevealTag?: string | null;
  onRevealHover?: (tag: string | null) => void;
  flipBackEditId?: string | null;
  selectedBackBlockId?: string | null;
}) {
  const blockGradient = block.type === "box" ? getBlockGradientConfig(block) : null;
  const boxBackground =
    block.type === "box"
      ? block.fillType === "transparent"
        ? "transparent"
        : block.fillType === "gradient"
          ? block.gradient ||
            buildLinearGradient(
              blockGradient?.angle || 135,
              blockGradient?.start || "#5b4cf0",
              blockGradient?.end || "#22d3ee"
            )
          : block.color
      : "transparent";

  const blockWidth =
    block.type === "box" ||
    block.type === "image" ||
    block.type === "imageLink" ||
    block.type === "flipCard" ||
    block.type === "video" ||
    block.type === "gallery" ||
    block.type === "countdown" ||
    block.type === "quote" ||
    block.type === "shape" ||
    block.type === "group"
      ? block.w
      : block.type === "filter"
          ? (block.width ?? "auto")
          : "auto";

  const blockHeight =
    block.type === "box" ||
    block.type === "image" ||
    block.type === "imageLink" ||
    block.type === "flipCard" ||
    block.type === "video" ||
    block.type === "gallery" ||
    block.type === "countdown" ||
    block.type === "quote" ||
    block.type === "shape" ||
    block.type === "group"
      ? block.h
      : "auto";

  // Solid borders use 4 directional inset box-shadows on an overlay div.
  // The overlay sits inside the clipping div (overflow:hidden + borderRadius) so the
  // shadows are clipped to the rounded shape and the content fills the full radius.
  // Dashed/dotted/double fall back to CSS border (accepts reduced inner radius).
  const borderColor = block.borderColor || "#ffffff";
  const borderStyle = block.borderStyle || "solid";
  const fb = block.borderWidth ?? 2;
  const bTop = block.borderTopWidth ?? fb;
  const bRight = block.borderRightWidth ?? fb;
  const bBottom = block.borderBottomWidth ?? fb;
  const bLeft = block.borderLeftWidth ?? fb;
  const solidBorder = block.borderEnabled && borderStyle === "solid";
  const cssBorder = block.borderEnabled && borderStyle !== "solid";

  // Each shadow pushes inward from its edge: top→down, right→left, bottom→up, left→right.
  const insetBorderShadow = solidBorder
    ? [
        bTop > 0 && `inset 0 ${bTop}px 0 0 ${borderColor}`,
        bRight > 0 && `inset -${bRight}px 0 0 0 ${borderColor}`,
        bBottom > 0 && `inset 0 -${bBottom}px 0 0 ${borderColor}`,
        bLeft > 0 && `inset ${bLeft}px 0 0 0 ${borderColor}`,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const cssBorderStyles = cssBorder
    ? {
        borderTop: `${bTop}px ${borderStyle} ${borderColor}`,
        borderRight: `${bRight}px ${borderStyle} ${borderColor}`,
        borderBottom: `${bBottom}px ${borderStyle} ${borderColor}`,
        borderLeft: `${bLeft}px ${borderStyle} ${borderColor}`,
      }
    : {};

  return (
    <div
      onMouseDown={(e) => handlers.onBlockMouseDown(e, block, canvasRef)}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => onOpenMenu(e, block.id)}
      onMouseEnter={() =>
        block.revealEnabled && block.revealTag && onRevealHover?.(block.revealTag)
      }
      onMouseLeave={() => block.revealEnabled && onRevealHover?.(null)}
      style={{
        position: "absolute",
        left: block.x,
        top: block.y,
        zIndex: block.zIndex ?? 1,
        width: blockWidth,
        height: blockHeight,
        borderRadius: block.borderRadius || 0,
        outline:
          isSelected || flipBackEditId === block.id
            ? "2px solid #a78bfa"
            : isInSelection
              ? "2px dashed rgba(167,139,250,0.55)"
              : "none",
        outlineOffset: isSelected || isInSelection || flipBackEditId === block.id ? 2 : 0,
        cursor: isSelected && (block.type === "text" || block.type === "link") ? "text" : "grab",
        transform:
          (block.type === "shape" || block.type === "emoji") && block.rotation
            ? `rotate(${block.rotation}deg)`
            : undefined,
        transformOrigin:
          block.type === "shape" || block.type === "emoji" ? "center center" : undefined,
        opacity:
          block.revealHidden && block.revealTag
            ? hoveredRevealTag === block.revealTag
              ? 1
              : 0.25
            : block.revealDefault
              ? block.revealTag
                ? hoveredRevealTag !== null &&
                  (hoveredRevealTag === block.revealTag ||
                    hoveredRevealTag.startsWith(block.revealTag + "-"))
                  ? 0.25
                  : 1
                : hoveredRevealTag !== null
                  ? 0.25
                  : 1
              : undefined,
        transition: block.revealHidden || block.revealDefault ? "opacity 0.2s ease" : undefined,
      }}
    >
      {/* Inner content div: borderRadius + overflow:hidden clips all children.
          The inset-shadow border overlay is the last child so it renders above content.
          ResizeHandle/RotateHandle live in the outer wrapper and are never clipped. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: block.borderRadius || 0,
          overflow: "hidden",
          ...cssBorderStyles,
          background: boxBackground,
          opacity: block.type === "box" ? (block.opacity ?? 1) : undefined,
          color: block.color,
          fontSize: block.fontSize,
          display: block.type === "filter" ? "block" : "flex",
          alignItems: block.type === "filter" ? undefined : "center",
          justifyContent: block.type === "filter" ? undefined : "center",
          ...styleToCss(block.fontStyle),
        }}
      >
        {block.type === "link" && (
          <div
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onPaste={(e) => {
              e.preventDefault();
              const plainText = e.clipboardData?.getData("text/plain") || "";
              if (!plainText) return;
              insertPlainTextAtSelection(plainText);
            }}
            onBlur={(e) =>
              actions.updateInlineContent(block.id, e.currentTarget.innerText, "label")
            }
            style={{
              outline: "none",
              padding: "4px",
              textDecoration: block.underline ? "underline" : "none",
              minWidth: "1em",
            }}
          >
            {block.label}
          </div>
        )}

        {block.type === "image" && (
          <>
            <img src={block.src} alt="" draggable={false} style={imageStyle(block.borderRadius)} />
            {block.overlayEnabled && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: block.overlayColor || "#000000",
                  opacity: block.overlayOpacity ?? 0.18,
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        )}

        {block.type === "imageLink" && (
          <>
            <img src={block.src} alt="" draggable={false} style={imageStyle(block.borderRadius)} />
            {block.overlayEnabled && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: block.overlayColor || "#000000",
                  opacity: block.overlayOpacity ?? 0.18,
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        )}

        {block.type === "button" && (
          <a
            href={block.url || "#"}
            target={block.newTab ? "_blank" : undefined}
            rel={block.newTab ? "noopener noreferrer" : undefined}
            onClick={(e) => e.preventDefault()}
            style={{
              display: "inline-block",
              background: block.bgColor || "#4f46e5",
              color: block.textColor || "#ffffff",
              fontSize: block.fontSize ?? 16,
              fontWeight:
                block.fontStyle === "bold" || block.fontStyle === "bolditalic" ? 700 : 400,
              fontStyle:
                block.fontStyle === "italic" || block.fontStyle === "bolditalic"
                  ? "italic"
                  : "normal",
              padding: `${block.paddingY ?? 12}px ${block.paddingX ?? 24}px`,
              borderRadius: block.borderRadius ?? 8,
              textDecoration: "none",
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            {block.label || "Button"}
          </a>
        )}

        {block.type === "video" && (
          <div style={{ width: "100%", height: "100%", background: "#111", overflow: "hidden" }}>
            {block.src ? (
              <video
                src={block.src}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 28, color: "#555" }}>▶</div>
                <div style={{ fontSize: 12, color: "#555" }}>No video</div>
              </div>
            )}
          </div>
        )}

        {block.type === "gallery" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: `repeat(${block.columns ?? 3}, 1fr)`,
              gap: block.gap ?? 8,
            }}
          >
            {(block.images || []).slice(0, (block.columns ?? 3) * 3).map((img: any) => (
              <img
                key={img.id}
                src={img.src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ))}
            {(block.images || []).length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#555",
                  fontSize: 13,
                }}
              >
                No images
              </div>
            )}
          </div>
        )}

        {block.type === "countdown" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                block.bgColor === "transparent" ? "rgba(255,255,255,0.06)" : block.bgColor,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                color: block.textColor || "#fff",
                fontSize: (block.fontSize ?? 32) * 0.6,
                fontWeight: 700,
              }}
            >
              00:00:00:00
            </div>
            <div style={{ color: block.textColor || "#fff", fontSize: 11, opacity: 0.7 }}>
              {block.label || "Until the event"}
            </div>
          </div>
        )}

        {block.type === "quote" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: block.bgColor || "rgba(255,255,255,0.05)",
              borderLeft: `4px solid ${block.accentColor || "#4f46e5"}`,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                color: block.textColor || "#fff",
                fontSize: block.fontSize ?? 16,
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
            >
              {block.text || "Quote text"}
            </div>
            <div
              style={{
                color: block.authorColor || "#a0a0a0",
                fontSize: (block.fontSize ?? 16) * 0.8,
              }}
            >
              — {block.author || "Author"}
              {block.role ? `, ${block.role}` : ""}
            </div>
          </div>
        )}

        {block.type === "flipCard" && flipBackEditId === block.id && null}

        {block.type === "flipCard" && flipBackEditId !== block.id && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              background: block.frontBgColor || "transparent",
              overflow: "hidden",
              borderRadius: block.borderRadius || 0,
              ...(block.frontBorderEnabled
                ? {
                    boxShadow:
                      block.frontBorderStyle === "solid"
                        ? `inset 0 ${block.frontBorderWidth ?? 2}px 0 0 ${block.frontBorderColor || "#fff"}, inset -${block.frontBorderWidth ?? 2}px 0 0 0 ${block.frontBorderColor || "#fff"}, inset 0 -${block.frontBorderWidth ?? 2}px 0 0 ${block.frontBorderColor || "#fff"}, inset ${block.frontBorderWidth ?? 2}px 0 0 0 ${block.frontBorderColor || "#fff"}`
                        : undefined,
                    border:
                      block.frontBorderStyle !== "solid"
                        ? `${block.frontBorderWidth ?? 2}px ${block.frontBorderStyle || "solid"} ${block.frontBorderColor || "#fff"}`
                        : undefined,
                  }
                : {}),
            }}
          >
            {(block.frontBlocks ?? []).length === 0 && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  fontSize: 13,
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 22, opacity: 0.4 }}>⊞</span>
                <span>Select blocks</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>then "Create Flip Card"</span>
              </div>
            )}
            {(block.frontBlocks ?? []).map((fb) => {
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
                    pointerEvents: "none",
                    ...(insetShadow ? { boxShadow: insetShadow } : {}),
                    ...(fb.borderEnabled && bStyle !== "solid"
                      ? { border: `${bwBase}px ${bStyle} ${bColor}` }
                      : {}),
                  }}
                >
                  {fb.type === "image" || fb.type === "imageLink" ? (
                    fb.src ? (
                      <img
                        src={fb.src}
                        alt=""
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#2a2a2a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#666",
                          fontSize: 11,
                        }}
                      >
                        Image
                      </div>
                    )
                  ) : fb.type === "box" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          fb.fillType === "transparent"
                            ? "transparent"
                            : fb.gradient ||
                              `linear-gradient(135deg, ${fb.gradientStart || "#4f46e5"} 0%, ${fb.gradientEnd || "#7c3aed"} 100%)`,
                        opacity: fb.opacity ?? 1,
                      }}
                    />
                  ) : fb.type === "text" ? (
                    <div
                      style={{
                        color: "#fff",
                        fontSize: fb.segments?.[0]?.fontSize ?? 14,
                        padding: 4,
                        overflow: "hidden",
                        lineHeight: 1.4,
                      }}
                    >
                      {fb.segments?.[0]?.text ?? fb.text ?? ""}
                    </div>
                  ) : fb.type === "emoji" ? (
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
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#888",
                        fontSize: 11,
                      }}
                    >
                      {fb.type}
                    </div>
                  )}
                </div>
              );
            })}
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(79,70,229,0.85)",
                borderRadius: 4,
                padding: "2px 7px",
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                letterSpacing: 1,
              }}
            >
              FLIP
            </div>
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  actions.enterFlipBackEdit(block.id);
                }}
                style={{
                  position: "absolute",
                  bottom: 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(79,70,229,0.9)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                ✏️ Edit back face
              </button>
            )}
          </div>
        )}

        {block.type === "group" && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              border: "2px dashed rgba(167,139,250,0.4)",
              borderRadius: block.borderRadius ?? 0,
            }}
          >
            {[...(Array.isArray(block.blocks) ? block.blocks : [])]
              .sort((a: any, b: any) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
              .map((child: any) => {
                const seg0 = child.segments?.[0];
                const textColor =
                  seg0?.fillType === "gradient" || child.fillType === "gradient"
                    ? seg0?.gradientStart ||
                      child.gradientStart ||
                      seg0?.color ||
                      child.color ||
                      "#fff"
                    : seg0?.color || child.color || "#fff";
                const textFontSize = Number.isFinite(seg0?.fontSize)
                  ? seg0.fontSize
                  : Number.isFinite(child.fontSize)
                    ? child.fontSize
                    : 16;
                return (
                  <div
                    key={child.id}
                    style={{
                      position: "absolute",
                      left: child.x ?? 0,
                      top: child.y ?? 0,
                      width:
                        child.type === "emoji"
                          ? (child.fontSize ?? 64)
                          : child.w ?? (child.type === "text" ? "auto" : 100),
                      height:
                        child.type === "emoji"
                          ? (child.fontSize ?? 64)
                          : child.h ?? (child.type === "text" ? "auto" : 60),
                      borderRadius: child.borderRadius ?? 0,
                      zIndex: child.zIndex ?? 1,
                      background:
                        child.type === "box"
                          ? child.fillType === "transparent"
                            ? "transparent"
                            : child.gradient || child.color || "rgba(79,70,229,0.5)"
                          : "transparent",
                      overflow: child.type === "emoji" ? "visible" : "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    {(child.type === "image" || child.type === "imageLink") && child.src && (
                      <img
                        src={child.src}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        draggable={false}
                      />
                    )}
                    {child.type === "text" && (
                      <span
                        style={{
                          color: textColor,
                          fontSize: textFontSize,
                          fontWeight:
                            child.fontStyle === "bold" || child.fontStyle === "bolditalic"
                              ? 700
                              : 400,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {child.segments?.map((s: any) => s.text).join("") ?? child.text ?? ""}
                      </span>
                    )}
                    {child.type === "button" && (
                      <div
                        style={{
                          background: child.bgColor || "#4f46e5",
                          color: child.textColor || "#fff",
                          fontSize: child.fontSize ?? 14,
                          padding: `${child.paddingY ?? 8}px ${child.paddingX ?? 16}px`,
                          borderRadius: child.borderRadius ?? 8,
                          display: "inline-block",
                        }}
                      >
                        {child.label || "Button"}
                      </div>
                    )}
                    {child.type === "link" && (
                      <span
                        style={{ color: child.color ?? "#60a5fa", fontSize: child.fontSize ?? 14 }}
                      >
                        {child.label ?? child.url ?? "Link"}
                      </span>
                    )}
                    {child.type === "emoji" && (
                      <span
                        style={{
                          fontSize: child.fontSize ?? 64,
                          lineHeight: 1,
                          display: "block",
                        }}
                      >
                        {child.emoji ?? "✨"}
                      </span>
                    )}
                    {child.type === "shape" && <ShapeBlockSvg block={child} />}
                  </div>
                );
              })}
            <div
              style={{
                position: "absolute",
                top: 4,
                left: 6,
                background: "rgba(79,70,229,0.7)",
                borderRadius: 4,
                padding: "2px 7px",
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                letterSpacing: 1,
                pointerEvents: "none",
              }}
            >
              GROUP
            </div>
          </div>
        )}

        {block.type === "filter" && (
          <div
            style={{
              padding: block.containerPadding ? `${block.containerPadding}px` : "10px 14px",
              background:
                block.containerBg && block.containerBg !== "transparent"
                  ? block.containerBg
                  : undefined,
              borderRadius: block.containerBorderRadius ?? 0,
              display: "flex",
              flexWrap: "wrap",
              gap: block.chipGap ?? 7,
              alignItems: "center",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {(() => {
              const scopedBlocks = getScopedBlocks(allBlocks, block);
              const cats = Array.from(new Set(scopedBlocks.flatMap((b: any) => getBlockTags(b)))) as string[];

              const br = block.chipBorderRadius ?? 999;
              const fs = block.chipFontSize ?? 13;
              const px = block.chipPaddingX ?? 14;
              const py = block.chipPaddingY ?? 7;
              const showCount = block.showCount !== false;
              const activeBg = block.chipActiveBg ?? "#ffffff";
              const activeColor = block.chipActiveColor ?? "#0a0a0a";
              const inactiveBg = block.chipInactiveBg ?? "rgba(255,255,255,0.06)";
              const inactiveColor = block.chipInactiveColor ?? "rgba(255,255,255,0.7)";
              const borderColor = block.chipBorderColor ?? "rgba(255,255,255,0.15)";
              const activeBorderColor = block.chipActiveBorderColor ?? activeBg;

              const chipStyle = (active: boolean): React.CSSProperties => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: br,
                padding: `${py}px ${px}px`,
                fontSize: fs,
                fontWeight: 600,
                cursor: "default",
                border: active ? `1px solid ${activeBorderColor}` : `1px solid ${borderColor}`,
                background: active ? activeBg : inactiveBg,
                color: active ? activeColor : inactiveColor,
                whiteSpace: "nowrap" as const,
              });

              const dotSize = Math.max(4, fs * 0.5);

              return (
                <>
                  <span style={chipStyle(true)}>
                    <span
                      style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: "50%",
                        background: activeColor,
                        flexShrink: 0,
                      }}
                    />
                    All
                    {showCount && (
                      <span style={{ fontSize: Math.max(9, fs - 2), opacity: 0.6 }}>
                        {scopedBlocks.length}
                      </span>
                    )}
                  </span>
                  {cats.length === 0 ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.3)",
                        fontStyle: "italic",
                      }}
                    >
                      Assign categories to blocks in the same filter group
                    </span>
                  ) : (
                    cats.map((cat) => {
                      const count = scopedBlocks.filter((b: any) =>
                        getBlockTags(b).includes(cat)
                      ).length;
                      return (
                        <span key={cat} style={chipStyle(false)}>
                          <span
                            style={{
                              width: dotSize,
                              height: dotSize,
                              borderRadius: "50%",
                              background: inactiveColor,
                              flexShrink: 0,
                            }}
                          />
                          {cat}
                          {showCount && (
                            <span style={{ fontSize: Math.max(9, fs - 2), opacity: 0.5 }}>
                              {count}
                            </span>
                          )}
                        </span>
                      );
                    })
                  )}
                </>
              );
            })()}
          </div>
        )}

        {block.type === "emoji" && (
          <span
            style={{
              fontSize: block.fontSize ?? 64,
              lineHeight: 1,
              userSelect: "none",
              display: "block",
            }}
          >
            {block.emoji ?? "✨"}
          </span>
        )}

        {block.type === "shape" && <ShapeBlockSvg block={block} />}

        {block.type === "shape" && block.linkUrl && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              background: "rgba(79,70,229,0.85)",
              borderRadius: 4,
              padding: "2px 6px",
              fontSize: 10,
              fontWeight: 700,
              color: "white",
              pointerEvents: "none",
              letterSpacing: 0.5,
            }}
          >
            🔗
          </div>
        )}

        {/* Inset border overlay: renders above all content, clipped by parent overflow:hidden */}
        {insetBorderShadow && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: block.borderRadius || 0,
              boxShadow: insetBorderShadow,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {block.type === "flipCard" &&
        flipBackEditId === block.id &&
        (() => {
          const bfW = block.backW ?? block.w ?? 300;
          const bfH = block.backH ?? block.h ?? 200;
          const bfOX = ((block.w ?? 300) - bfW) / 2;
          const bfOY = ((block.h ?? 200) - bfH) / 2;
          return (
            <>
              <div
                onContextMenu={
                  onOpenBackFaceMenu
                    ? (e) => {
                        e.stopPropagation();
                        onOpenBackFaceMenu(e, block.id);
                      }
                    : undefined
                }
                style={{
                  position: "absolute",
                  left: bfOX,
                  top: bfOY,
                  width: bfW,
                  height: bfH,
                  background: block.backBgColor || "rgba(17,17,34,0.95)",
                  borderRadius: block.backBorderRadius ?? block.borderRadius ?? 0,
                  overflow: "hidden",
                  ...(block.backBorderEnabled
                    ? {
                        boxShadow:
                          block.backBorderStyle === "solid"
                            ? `inset 0 ${block.backBorderWidth ?? 2}px 0 0 ${block.backBorderColor || "#fff"}, inset -${block.backBorderWidth ?? 2}px 0 0 0 ${block.backBorderColor || "#fff"}, inset 0 -${block.backBorderWidth ?? 2}px 0 0 ${block.backBorderColor || "#fff"}, inset ${block.backBorderWidth ?? 2}px 0 0 0 ${block.backBorderColor || "#fff"}`
                            : undefined,
                        border:
                          block.backBorderStyle !== "solid"
                            ? `${block.backBorderWidth ?? 2}px ${block.backBorderStyle || "solid"} ${block.backBorderColor || "#fff"}`
                            : undefined,
                      }
                    : {}),
                }}
              >
                {(block.backBlocks ?? []).map((bb: any) => (
                  <BackBlockEditor
                    key={bb.id}
                    bb={bb}
                    isSelected={selectedBackBlockId === bb.id}
                    flipCardId={block.id}
                    canvasRef={canvasRef}
                    handlers={handlers}
                    actions={actions}
                  />
                ))}
                {(block.backBlocks ?? []).length === 0 && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      fontSize: 13,
                      flexDirection: "column",
                      gap: 6,
                      pointerEvents: "none",
                    }}
                  >
                    <span style={{ fontSize: 22, opacity: 0.4 }}>⊞</span>
                    <span>Right-click to add a block</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.exitFlipBackEdit();
                  }}
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(79,70,229,0.9)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    padding: "3px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                  }}
                >
                  ← Front
                </button>
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(79,70,229,0.85)",
                    borderRadius: 4,
                    padding: "2px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: 1,
                    pointerEvents: "none",
                  }}
                >
                  BACK
                </div>
              </div>
              <div
                onMouseDown={(e) => handlers.onFlipBackFaceResizeMouseDown(e, block, canvasRef)}
                style={{
                  position: "absolute",
                  left: bfOX + bfW - 7,
                  top: bfOY + bfH - 7,
                  width: 14,
                  height: 14,
                  background: "#a78bfa",
                  border: "2px solid #fff",
                  borderRadius: 3,
                  cursor: "se-resize",
                  zIndex: 20,
                }}
              />
            </>
          );
        })()}

      {isSelected && (block.type === "shape" || block.type === "emoji") && (
        <RotateHandle onMouseDown={(e) => handlers.onRotateMouseDown(e, block, canvasRef)} />
      )}

      {isSelected && (
        <ResizeHandle onMouseDown={(e) => handlers.onResizeMouseDown(e, block, canvasRef)} />
      )}

      {block.revealHidden && block.revealTag && (
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 4,
            background: "rgba(239,68,68,0.85)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          HIDDEN · {block.revealTag}
        </div>
      )}

      {block.revealDefault && (
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 4,
            background: "rgba(16,185,129,0.85)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          DEFAULT{block.revealTag ? ` · ${block.revealTag}` : ""}
        </div>
      )}

      {block.type === "box" && block.linkUrl && (
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            background: "rgba(79,70,229,0.85)",
            borderRadius: 4,
            padding: "2px 6px",
            fontSize: 10,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
          }}
        >
          🔗
        </div>
      )}

      {block.revealEnabled && block.revealTag && (
        <div
          style={{
            position: "absolute",
            top: 2,
            right: block.linkUrl ? 28 : 4,
            background: "rgba(79,70,229,0.85)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            pointerEvents: "none",
            letterSpacing: 0.5,
            zIndex: 10,
          }}
        >
          TRIGGER · {block.revealTag}
        </div>
      )}
    </div>
  );
}
