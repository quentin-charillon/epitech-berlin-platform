import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useResponsiveCanvas } from "../utils/responsiveCanvas";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3001";
const FOOTER_SLUG = "__footer__";

function normalizeFooterSettings(data: any) {
  return {
    enabled: data?.footerEnabled ?? true,
    backgroundColor: data?.backgroundColor ?? "#1a1a2e",
    backgroundType: data?.backgroundType ?? "color",
    backgroundImage: data?.backgroundImage ?? "",
    backgroundPositionX: Number.isFinite(data?.backgroundPositionX) ? data.backgroundPositionX : 50,
    backgroundPositionY: Number.isFinite(data?.backgroundPositionY) ? data.backgroundPositionY : 50,
    overlayOpacity: data?.overlayOpacity ?? 0.35,
    height: data?.height ?? 160,
    blocks: Array.isArray(data?.blocks) ? data.blocks : [],
  };
}

function normalizeBlockTarget(target: unknown): string {
  if (typeof target !== "string") return "";
  const value = target.trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function isExternalTarget(target: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(target);
}

function wrapFooterBlock(target: string, content: React.ReactNode): React.ReactNode {
  if (!target) return content;
  if (isExternalTarget(target)) {
    return (
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      to={target}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {content}
    </Link>
  );
}

function styleToCss(fontStyle: string) {
  switch (fontStyle) {
    case "italic":
      return { fontStyle: "italic" as const, fontWeight: 400 };
    case "bold":
      return { fontStyle: "normal" as const, fontWeight: 700 };
    case "bolditalic":
      return { fontStyle: "italic" as const, fontWeight: 700 };
    default:
      return { fontStyle: "normal" as const, fontWeight: 400 };
  }
}

export default function SiteFooter() {
  const [footer, setFooter] = useState<any>(null);
  const { containerRef, scale, designWidth } = useResponsiveCanvas();

  async function loadFooter() {
    try {
      const res = await fetch(`${API_BASE}/api/pages/${FOOTER_SLUG}`);
      if (!res.ok) return;
      const data = await res.json();
      setFooter(normalizeFooterSettings(data));
    } catch (err) {
      console.error("Failed to load footer", err);
    }
  }

  useEffect(() => {
    loadFooter();
    window.addEventListener("pages:changed", loadFooter);
    return () => window.removeEventListener("pages:changed", loadFooter);
  }, []);

  if (!footer || !footer.enabled) return null;

  const hasImage =
    footer.backgroundType === "image" &&
    typeof footer.backgroundImage === "string" &&
    footer.backgroundImage.trim() !== "";

  const backgroundPosition = `${footer.backgroundPositionX}% ${footer.backgroundPositionY}%`;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: footer.height * scale,
        backgroundColor: footer.backgroundColor,
        backgroundImage: hasImage
          ? `linear-gradient(rgba(0,0,0,${footer.overlayOpacity}), rgba(0,0,0,${footer.overlayOpacity})), url(${footer.backgroundImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition,
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: designWidth,
          height: footer.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
      {footer.blocks.map((block: any) => {
        const blockTarget = normalizeBlockTarget(block.linkTarget || block.url);

        if (block.type === "text") {
          return (
            <div
              key={block.id}
              style={{
                position: "absolute",
                left: block.x ?? 0,
                top: block.y ?? 0,
                color: block.color ?? "#ffffff",
                fontSize: block.fontSize ?? 18,
                whiteSpace: "pre-wrap",
                maxWidth: 500,
                zIndex: 2,
                cursor: blockTarget ? "pointer" : "default",
                pointerEvents: "auto",
                ...styleToCss(block.fontStyle),
              }}
            >
              {wrapFooterBlock(blockTarget, <span>{block.text}</span>)}
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <div
              key={block.id}
              style={{
                position: "absolute",
                left: block.x ?? 0,
                top: block.y ?? 0,
                width: block.w ?? 140,
                height: block.h ?? 80,
                zIndex: 2,
                borderRadius: block.borderRadius ?? 8,
                overflow: "hidden",
                cursor: blockTarget ? "pointer" : "default",
                pointerEvents: "auto",
              }}
            >
              {wrapFooterBlock(
                blockTarget,
                <img
                  src={block.src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
            </div>
          );
        }

        if (block.type === "box") {
          return (
            <div
              key={block.id}
              style={{
                position: "absolute",
                left: block.x ?? 0,
                top: block.y ?? 0,
                width: block.w ?? 180,
                height: block.h ?? 60,
                background: block.color ?? "#5b4cf0",
                borderRadius: block.borderRadius ?? 12,
                zIndex: 1,
                cursor: blockTarget ? "pointer" : "default",
                pointerEvents: "auto",
              }}
            >
              {wrapFooterBlock(blockTarget, <div style={{ width: "100%", height: "100%" }} />)}
            </div>
          );
        }

        return null;
      })}
      </div>
    </div>
  );
}
