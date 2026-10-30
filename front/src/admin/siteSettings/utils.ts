export const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3001";

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function styleToCss(fontStyle: string) {
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

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizePreviewLinkTarget(target: unknown) {
  if (typeof target !== "string") return "";
  const value = target.trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", quality));
      };
      img.onerror = reject;
      img.src = String(reader.result || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function normalizeSiteSettings(data: unknown) {
  const incoming = (data as any) || {};
  const header = incoming.header || {};
  const footer = incoming.footer || {};
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
          backgroundOpacity: Number.isFinite(header.navigation?.submenu?.backgroundOpacity)
            ? header.navigation.submenu.backgroundOpacity
            : 1,
          borderEnabled: header.navigation?.submenu?.borderEnabled ?? true,
          borderColor: header.navigation?.submenu?.borderColor ?? "#2a2a45",
          borderWidth: Number.isFinite(header.navigation?.submenu?.borderWidth)
            ? header.navigation.submenu.borderWidth
            : 1,
          borderRadius: Number.isFinite(header.navigation?.submenu?.borderRadius)
            ? header.navigation.submenu.borderRadius
            : 14,
          minWidth: Number.isFinite(header.navigation?.submenu?.minWidth)
            ? header.navigation.submenu.minWidth
            : 200,
        },
      },
      blocks: Array.isArray(header.blocks) ? header.blocks : [],
    },
    footer: {
      enabled: footer.enabled ?? true,
      backgroundType: footer.backgroundType ?? "color",
      backgroundColor: footer.backgroundColor ?? "#1a1a2e",
      backgroundImage: footer.backgroundImage ?? "",
      backgroundPositionX: Number.isFinite(footer.backgroundPositionX)
        ? footer.backgroundPositionX
        : 50,
      backgroundPositionY: Number.isFinite(footer.backgroundPositionY)
        ? footer.backgroundPositionY
        : 50,
      overlayOpacity: footer.overlayOpacity ?? 0.35,
      height: footer.height ?? 160,
      blocks: Array.isArray(footer.blocks) ? footer.blocks : [],
    },
  };
}

export const defaultSettings = normalizeSiteSettings({
  header: {
    enabled: true,
    backgroundType: "color",
    backgroundColor: "#3a3a3a",
    backgroundImage: "",
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    overlayOpacity: 0.35,
    height: 120,
    blocks: [],
  },
  footer: {
    enabled: true,
    backgroundType: "color",
    backgroundColor: "#1a1a2e",
    backgroundImage: "",
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    overlayOpacity: 0.35,
    height: 160,
    blocks: [],
  },
});
