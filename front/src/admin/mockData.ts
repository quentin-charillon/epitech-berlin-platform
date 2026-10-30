import { normalizeTextBlock } from "../utils/textSegments";
import { buildLinearGradient, getPageGradientConfig } from "../utils/gradients";

const STORAGE_KEY = "epitech_pages";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function cleanSlug(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s/-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\//, "")
    .replace(/\/$/, "");
}

function normalizePage(p, index) {
  const pageGradient = getPageGradientConfig(p);
  const base = {
    slug: p.slug,
    title: p.title ?? p.slug,
    showInNav: p.showInNav ?? true,
    navLabel: p.navLabel ?? p.title ?? p.slug,
    navOrder: p.navOrder ?? index * 10,
    parentSlug: p.parentSlug ?? null,
    backgroundType: p.backgroundType ?? "transparent",
    backgroundColor: p.backgroundColor ?? "transparent",
    backgroundImage: p.backgroundImage ?? "",
    backgroundGradient:
      p.backgroundGradient ??
      buildLinearGradient(pageGradient.angle, pageGradient.start, pageGradient.end),
    backgroundGradientStart: pageGradient.start,
    backgroundGradientEnd: pageGradient.end,
    backgroundGradientAngle: pageGradient.angle,
    overlayEnabled: p.overlayEnabled ?? false,
    overlayColor: p.overlayColor ?? "#000000",
    overlayOpacity: Number.isFinite(p.overlayOpacity) ? p.overlayOpacity : 0.25,
  };

  if (Array.isArray(p.blocks)) {
    return {
      ...base,
      blocks: p.blocks.map((block) => (block?.type === "text" ? normalizeTextBlock(block) : block)),
    };
  }

  const legacyText = p.content ?? "";
  return {
    ...base,
    blocks: [
      normalizeTextBlock({
        id: "t_" + uid(),
        type: "text",
        x: 120,
        y: 120,
        text: legacyText,
        fontSize: 18,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      }),
    ],
  };
}

function normalizeSiteSettings(settings) {
  const incoming = settings || {};

  return {
    header: {
      enabled: incoming.header?.enabled ?? true,
      title: incoming.header?.title ?? "Welcome to Epitech Berlin",
      subtitle: incoming.header?.subtitle ?? "Student life, accommodation, events and more",
      backgroundType: incoming.header?.backgroundType ?? "color",
      backgroundColor: incoming.header?.backgroundColor ?? "#3a3a3a",
      backgroundImage: incoming.header?.backgroundImage ?? "",
      overlayOpacity: incoming.header?.overlayOpacity ?? 0.35,
      height: incoming.header?.height ?? 120,
      blocks: Array.isArray(incoming.header?.blocks)
        ? incoming.header.blocks
        : [
            {
              id: "h_title",
              type: "text",
              x: 40,
              y: 35,
              text: "Welcome to Epitech Berlin",
              fontSize: 28,
              color: "#ffffff",
              fontStyle: "bold",
            },
          ],
    },
  };
}

export const defaultPages = [
  {
    slug: "home",
    title: "Epitech Berlin",
    showInNav: true,
    navLabel: "Home",
    navOrder: 1,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_home1",
        type: "text",
        x: 120,
        y: 120,
        text: "Welcome 👋",
        fontSize: 32,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
  {
    slug: "about",
    title: "About Epitech Berlin",
    showInNav: true,
    navLabel: "About",
    navOrder: 10,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_about1",
        type: "text",
        x: 120,
        y: 120,
        text: "Write something here...",
        fontSize: 24,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
  {
    slug: "student-life",
    title: "Student Life",
    showInNav: true,
    navLabel: "Student Life",
    navOrder: 20,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_sl1",
        type: "text",
        x: 120,
        y: 120,
        text: "Student life content...",
        fontSize: 24,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
  {
    slug: "school-event",
    title: "School Event",
    showInNav: true,
    navLabel: "School Event",
    navOrder: 30,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_ev1",
        type: "text",
        x: 120,
        y: 120,
        text: "School Event...",
        fontSize: 24,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
  {
    slug: "where-to-eat",
    title: "Where to eat",
    showInNav: true,
    navLabel: "Where to eat",
    navOrder: 40,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_eat1",
        type: "text",
        x: 120,
        y: 120,
        text: "Where to eat...",
        fontSize: 24,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
  {
    slug: "find-accommodation",
    title: "Find accommodation",
    showInNav: true,
    navLabel: "Accommodation",
    navOrder: 50,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_acc1",
        type: "text",
        x: 120,
        y: 120,
        text: "Find accommodation...",
        fontSize: 24,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    showInNav: true,
    navLabel: "FAQ",
    navOrder: 60,
    parentSlug: null,
    backgroundColor: "transparent",
    blocks: [
      {
        id: "t_faq1",
        type: "text",
        x: 120,
        y: 120,
        text: "FAQ content...",
        fontSize: 24,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      },
    ],
  },
];

export const defaultSiteSettings = normalizeSiteSettings({
  header: {
    enabled: true,
    title: "Welcome to Epitech Berlin",
    subtitle: "Student life, accommodation, events and more",
    backgroundType: "color",
    backgroundColor: "#3a3a3a",
    backgroundImage: "",
    overlayOpacity: 0.35,
    height: 120,
    blocks: [
      {
        id: "h_title",
        type: "text",
        x: 40,
        y: 35,
        text: "Welcome to Epitech Berlin",
        fontSize: 28,
        color: "#ffffff",
        fontStyle: "bold",
      },
    ],
  },
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loadPages() {
  try {
    const res = await fetch(`${API_BASE}/api/pages`);
    if (!res.ok) throw new Error("Failed to load pages");
    const pages = await res.json();
    return Array.isArray(pages) ? pages.map(normalizePage) : [];
  } catch (err) {
    console.error("loadPages error:", err);
    return [];
  }
}

export async function getPage(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${slug}`);
    if (!res.ok) return null;
    const page = await res.json();
    return normalizePage(page);
  } catch (err) {
    console.error("getPage error:", err);
    return null;
  }
}

export async function addPage({ title, slug, parentSlug = null, showInNav = true }) {
  const baseSlug = cleanSlug(slug);
  if (!baseSlug) return { ok: false, error: "Slug is required" };

  const cleanParent = parentSlug ? cleanSlug(parentSlug) : null;

  const finalSlug = cleanParent
    ? baseSlug.startsWith(cleanParent + "/")
      ? baseSlug
      : `${cleanParent}/${baseSlug}`
    : baseSlug;

  const t = (title || finalSlug).trim();

  const page = {
    slug: finalSlug,
    title: t,
    showInNav,
    navLabel: t,
    navOrder: 50,
    parentSlug: cleanParent,
    backgroundType: "transparent",
    backgroundColor: "transparent",
    backgroundGradient: "linear-gradient(135deg, #2a2424 0%, #433a68 100%)",
    backgroundGradientStart: "#2a2424",
    backgroundGradientEnd: "#433a68",
    backgroundGradientAngle: 135,
    overlayEnabled: false,
    overlayColor: "#000000",
    overlayOpacity: 0.25,
    blocks: [
      normalizeTextBlock({
        id: "t_" + uid(),
        type: "text",
        x: 120,
        y: 120,
        text: t,
        fontSize: 32,
        color: "#ffffff",
        fontStyle: "normal",
        filterTag: "",
      }),
    ],
  };

  try {
    const res = await fetch(`${API_BASE}/api/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(page),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { ok: false, error: errorData.error || "Failed to create page" };
    }

    const created = await res.json();
    window.dispatchEvent(new Event("pages:changed"));
    return { ok: true, page: normalizePage(created) };
  } catch (err) {
    console.error("addPage error:", err);
    return { ok: false, error: "Failed to create page" };
  }
}

export async function updatePage(slug, data) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { ok: false, error: errorData.error || "Failed to update page" };
    }

    const updated = await res.json();
    window.dispatchEvent(new Event("pages:changed"));
    return { ok: true, page: normalizePage(updated) };
  } catch (err) {
    console.error("updatePage error:", err);
    return { ok: false, error: "Failed to update page" };
  }
}

export async function deletePage(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${slug}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    if (!res.ok) {
      return { ok: false, error: "Failed to delete page" };
    }

    window.dispatchEvent(new Event("pages:changed"));
    return { ok: true };
  } catch (err) {
    console.error("deletePage error:", err);
    return { ok: false, error: "Failed to delete page" };
  }
}

export async function savePages(pages) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/bulk`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(pages),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save pages");
    }

    window.dispatchEvent(new Event("pages:changed"));
    return { ok: true };
  } catch (error) {
    console.error("savePages error:", error);
    return { ok: false, error };
  }
}

export async function loadSiteSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/site-settings`);
    if (!res.ok) throw new Error("Failed to load site settings");
    const data = await res.json();
    return normalizeSiteSettings(data);
  } catch (err) {
    console.error("loadSiteSettings error:", err);
    return defaultSiteSettings;
  }
}

export async function saveSiteSettings(settings) {
  try {
    const res = await fetch(`${API_BASE}/api/site-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(settings),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save site settings");
    }

    const saved = await res.json();
    window.dispatchEvent(new Event("site:changed"));
    return { ok: true, settings: normalizeSiteSettings(saved) };
  } catch (error) {
    console.error("saveSiteSettings error:", error);
    return { ok: false, error };
  }
}

export async function loadUsers() {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function createUser(data: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) return { ok: false, error: body.message || "Failed to create user" };
  return { ok: true, user: body };
}

export async function updateUserRole(id: string, role: "ADMIN" | "STAFF") {
  const res = await fetch(`${API_BASE}/api/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  const body = await res.json();
  if (!res.ok) return { ok: false, error: body.message || "Failed to update role" };
  return { ok: true, user: body };
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) return { ok: false, error: "Failed to delete user" };
  return { ok: true };
}
