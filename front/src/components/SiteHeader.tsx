import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useResponsiveCanvas } from "../utils/responsiveCanvas";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3001";

function normalizeSiteSettings(data) {
  const incoming = data || {};
  const header = incoming.header || {};

  return {
    header: {
      enabled: header.enabled ?? true,
      backgroundType: header.backgroundType ?? "color",
      backgroundColor: header.backgroundColor ?? "#3a3a3a",
      backgroundImage: header.backgroundImage ?? "",
      backgroundPositionX: Number.isFinite(header.backgroundPositionX)
        ? header.backgroundPositionX
        : 50,
      backgroundPositionY: Number.isFinite(header.backgroundPositionY)
        ? header.backgroundPositionY
        : 50,
      overlayOpacity: header.overlayOpacity ?? 0.35,
      height: header.height ?? 120,
      navigation: {
        offsetX: Number.isFinite(header.navigation?.offsetX) ? header.navigation.offsetX : 0,
        offsetY: Number.isFinite(header.navigation?.offsetY) ? header.navigation.offsetY : 0,
        color: header.navigation?.color ?? "#ffffff",
        fontSize: Number.isFinite(header.navigation?.fontSize) ? header.navigation.fontSize : 16,
        submenu: {
          offsetX: Number.isFinite(header.navigation?.submenu?.offsetX) ? header.navigation.submenu.offsetX : 0,
          offsetY: Number.isFinite(header.navigation?.submenu?.offsetY) ? header.navigation.submenu.offsetY : 0,
          color: header.navigation?.submenu?.color ?? "#ffffff",
          fontSize: Number.isFinite(header.navigation?.submenu?.fontSize) ? header.navigation.submenu.fontSize : 16,
          backgroundColor: header.navigation?.submenu?.backgroundColor ?? "#0a0a23",
          transparentBackground: header.navigation?.submenu?.transparentBackground ?? false,
          backgroundOpacity: Number.isFinite(header.navigation?.submenu?.backgroundOpacity) ? header.navigation.submenu.backgroundOpacity : 1,
          borderEnabled: header.navigation?.submenu?.borderEnabled ?? true,
          borderColor: header.navigation?.submenu?.borderColor ?? "#2a2a45",
          borderWidth: Number.isFinite(header.navigation?.submenu?.borderWidth) ? header.navigation.submenu.borderWidth : 1,
          borderRadius: Number.isFinite(header.navigation?.submenu?.borderRadius) ? header.navigation.submenu.borderRadius : 14,
          minWidth: Number.isFinite(header.navigation?.submenu?.minWidth) ? header.navigation.submenu.minWidth : 200,
        },
      },
      blocks: Array.isArray(header.blocks) ? header.blocks : [],
    },
  };
}

function styleToCss(fontStyle) {
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

function normalizeBlockTarget(target) {
  if (typeof target !== "string") return "";

  const value = target.trim();
  if (!value) return "";

  if (/^(https?:|mailto:|tel:)/i.test(value)) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function isExternalTarget(target) {
  return /^(https?:|mailto:|tel:)/i.test(target);
}

function getDefaultHomeBlockId(blocks) {
  return [...(Array.isArray(blocks) ? blocks : [])]
    .filter((block) => block?.type === "image" && block?.src)
    .sort((a, b) => {
      const xDiff = (a?.x ?? 0) - (b?.x ?? 0);
      if (xDiff !== 0) return xDiff;
      return (a?.y ?? 0) - (b?.y ?? 0);
    })[0]?.id;
}

function wrapHeaderBlock(target, content) {
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

export default function SiteHeader({ children, fallback }) {
  const [siteSettings, setSiteSettings] = useState(null);
  const { containerRef, scale, designWidth } = useResponsiveCanvas();

  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/site-settings`);
      const data = await res.json();
      setSiteSettings(normalizeSiteSettings(data));
    } catch (err) {
      console.error("Failed to load header", err);
    }
  }

  useEffect(() => {
    loadSettings();

    const refresh = () => loadSettings();
    const refreshFromAnotherTab = (event: StorageEvent) => {
      if (event.key === "site-settings-updated") loadSettings();
    };
    window.addEventListener("site:changed", refresh);
    window.addEventListener("storage", refreshFromAnotherTab);

    return () => {
      window.removeEventListener("site:changed", refresh);
      window.removeEventListener("storage", refreshFromAnotherTab);
    };
  }, []);

  if (!siteSettings) return fallback ?? null;

  const header = siteSettings.header;

  if (!header.enabled) return children;

  const hasImage =
    header.backgroundType === "image" &&
    typeof header.backgroundImage === "string" &&
    header.backgroundImage.trim() !== "";

  const backgroundPosition = `${
    Number.isFinite(header.backgroundPositionX) ? header.backgroundPositionX : 50
  }% ${Number.isFinite(header.backgroundPositionY) ? header.backgroundPositionY : 50}%`;
  const defaultHomeBlockId = getDefaultHomeBlockId(header.blocks);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100vw",
        contain: "inline-size",
        height: header.height * scale,
        backgroundColor: header.backgroundColor,
        backgroundImage: hasImage
          ? `linear-gradient(rgba(0,0,0,${header.overlayOpacity}), rgba(0,0,0,${header.overlayOpacity})), url(${header.backgroundImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition,
        backgroundRepeat: "no-repeat",
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "relative",
          width: designWidth,
          height: header.height,
          zoom: scale,
        }}
      >
      {header.blocks?.map((block) => {
        const blockTarget =
          normalizeBlockTarget(block.linkTarget || block.url) ||
          (block.id === defaultHomeBlockId ? "/" : "");

        if (block.type === "text") {
          return (
            <div
              key={block.id}
              style={{
                position: "absolute",
                left: block.x ?? 0,
                top: block.y ?? 0,
                color: block.color ?? "#ffffff",
                fontSize: block.fontSize ?? 20,
                whiteSpace: "pre-wrap",
                maxWidth: 500,
                zIndex: block.zIndex ?? 2,
                cursor: blockTarget ? "pointer" : "default",
                pointerEvents: "auto",
                ...styleToCss(block.fontStyle),
              }}
            >
              {wrapHeaderBlock(blockTarget, <span>{block.text}</span>)}
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
                zIndex: block.zIndex ?? 2,
                borderRadius: block.borderRadius ?? 12,
                overflow: "hidden",
                cursor: blockTarget ? "pointer" : "default",
                pointerEvents: "auto",
              }}
            >
              {wrapHeaderBlock(
                blockTarget,
                <img
                  src={block.src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: block.borderRadius ?? 12,
                    display: "block",
                  }}
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
                height: block.h ?? 70,
                boxSizing: "border-box",
                background: block.transparent ? "transparent" : (block.color ?? "#5b4cf0"),
                opacity: block.opacity ?? 1,
                border: block.borderEnabled
                  ? `${block.borderWidth ?? 2}px solid ${block.borderColor ?? "#ffffff"}`
                  : "none",
                borderRadius: block.borderRadius ?? 16,
                zIndex: block.zIndex ?? 1,
                cursor: blockTarget ? "pointer" : "default",
                pointerEvents: "auto",
              }}
            >
              {wrapHeaderBlock(
                blockTarget,
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "transparent",
                    borderRadius: block.borderRadius ?? 16,
                  }}
                />
              )}
            </div>
          );
        }

        return null;
      })}

      <div style={{ position: "relative", zIndex: 3, pointerEvents: "none" }}>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              navigationSettings: header.navigation,
            })
          : children}
      </div>
      </div>
    </div>
  );
}
