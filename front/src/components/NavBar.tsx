import { NavLink } from "react-router-dom";
import { loadPages } from "../admin/mockData";
import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "./SiteHeader";

function getPublicPagePath(slug) {
  const cleanSlug = String(slug || "").replace(/^\/+/, "");
  return cleanSlug === "home" ? "/" : `/${cleanSlug}`;
}

function hexToRgba(hex, opacity) {
  const value = String(hex || "#0a0a23").replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const number = Number.parseInt(normalized, 16);
  if (!Number.isFinite(number)) return `rgba(10, 10, 35, ${opacity})`;
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${opacity})`;
}

function NavGroup({ page, children, submenuSettings, navigationSettings }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  }

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <NavLink
        to={getPublicPagePath(page.slug)}
        className={({ isActive }) =>
          `px-3 py-2 rounded-xl transition-colors duration-150 inline-flex items-center gap-1.5 hover:bg-white/[0.08]${isActive ? " bg-white/[0.16]" : ""}`
        }
        style={{ color: "inherit" }}
      >
        <span>{page.navLabel ?? page.title}</span>
        <span className="text-xs opacity-60">▾</span>
      </NavLink>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] flex flex-col gap-1 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] z-[999]"
          style={{
            minWidth: submenuSettings?.minWidth ?? 200,
            color: submenuSettings?.color ?? navigationSettings?.color ?? "#ffffff",
            fontSize: submenuSettings?.fontSize ?? navigationSettings?.fontSize ?? 16,
            background: submenuSettings?.transparentBackground
              ? "transparent"
              : hexToRgba(
                  submenuSettings?.backgroundColor ?? "#0a0a23",
                  submenuSettings?.backgroundOpacity ?? 1
                ),
            border: submenuSettings?.borderEnabled === false
              ? "none"
              : `${submenuSettings?.borderWidth ?? 1}px solid ${submenuSettings?.borderColor ?? "rgba(255,255,255,0.1)"}`,
            borderRadius: submenuSettings?.borderRadius ?? 14,
            transform: `translate(${submenuSettings?.offsetX ?? 0}px, ${submenuSettings?.offsetY ?? 0}px)`,
          }}
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl transition-colors duration-150 inline-flex items-center gap-1.5 hover:bg-white/[0.08]${isActive ? " bg-white/[0.16]" : ""}`;

const dropdownLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl transition-colors duration-150 hover:bg-white/[0.08]${isActive ? " bg-white/[0.16]" : ""}`;

export function NavigationBar({ navigationSettings = {} }: any) {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const refresh = async () => {
      const pagesData = await loadPages();
      setPages(pagesData);
    };

    refresh();
    window.addEventListener("pages:changed", refresh);
    return () => window.removeEventListener("pages:changed", refresh);
  }, []);

  const visiblePages = useMemo(() => {
    return pages
      .filter((p) => p.showInNav && p.slug !== "home" && p.slug !== "__footer__")
      .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0));
  }, [pages]);

  const roots = useMemo(() => visiblePages.filter((p) => !p.parentSlug), [visiblePages]);

  function childrenOf(rootSlug) {
    return visiblePages.filter((p) => p.parentSlug === rootSlug);
  }

  const nav = (
    <header
      className="sticky top-0 z-50 px-5 py-4 pointer-events-none"
      style={{
        color: navigationSettings.color ?? "#ffffff",
        fontSize: navigationSettings.fontSize ?? 16,
        transform: `translate(${navigationSettings.offsetX ?? 0}px, ${navigationSettings.offsetY ?? 0}px)`,
      }}
    >
      <nav className="max-w-4xl mx-auto flex items-center gap-4 px-3.5 py-3 pointer-events-auto">
        <div className="flex flex-wrap gap-1">
          {roots.map((p) => {
            const kids = childrenOf(p.slug);

            if (!kids.length) {
              return (
                <NavLink key={p.slug} to={getPublicPagePath(p.slug)} className={linkClass} style={{ color: "inherit" }}>
                  {p.navLabel ?? p.title}
                </NavLink>
              );
            }

            return (
              <NavGroup
                key={p.slug}
                page={p}
                submenuSettings={navigationSettings.submenu}
                navigationSettings={navigationSettings}
              >
                {kids.map((c) => (
                  <NavLink
                    key={c.slug}
                    to={getPublicPagePath(c.slug)}
                    className={dropdownLinkClass}
                    style={{ color: "inherit" }}
                    role="menuitem"
                  >
                    {c.navLabel ?? c.title}
                  </NavLink>
                ))}
              </NavGroup>
            );
          })}
        </div>
      </nav>
    </header>
  );

  return nav;
}

export default function Navbar() {
  const nav = <NavigationBar />;
  return <SiteHeader fallback={nav}>{nav}</SiteHeader>;
}
