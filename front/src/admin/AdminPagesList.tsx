import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { loadPages, addPage, deletePage, getPage } from "./mockData";

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-\/]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\//, "")
    .replace(/\/$/, "");
}

function getPublicPagePath(slug) {
  const cleanSlug = slugify(slug);
  return cleanSlug === "home" ? "/" : `/${cleanSlug}`;
}

export default function AdminPagesList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const navigate = useNavigate();

  async function refresh() {
    setLoading(true);
    const pagesData = await loadPages();
    setPages(pagesData);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    window.addEventListener("pages:changed", refresh);
    return () => window.removeEventListener("pages:changed", refresh);
  }, []);

  useEffect(() => {
    if (!slug && title) setSlug(slugify(title));
  }, [title]);

  const roots = useMemo(() => {
    return pages
      .filter((p) => !p.parentSlug && p.slug !== "home" && p.slug !== "__footer__")
      .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0));
  }, [pages]);

  const homePage = useMemo(() => pages.find((page) => page.slug === "home") || null, [pages]);

  function childrenOf(rootSlug) {
    return pages
      .filter((p) => p.parentSlug === rootSlug)
      .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0));
  }

  function resetCreateForm() {
    setTitle("");
    setSlug("");
    setParentSlug("");
    setShowCreateForm(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const baseSlug = slugify(slug || title);
    if (!baseSlug) return alert("Slug is required");

    const res = await addPage({
      title,
      slug: baseSlug,
      parentSlug: parentSlug || null,
    });

    if (!res.ok) {
      alert(res.error);
      return;
    }

    resetCreateForm();
    await refresh();
    navigate(`/admin/pages/${res.page.slug}`);
  }

  async function handleDelete(s) {
    const ok = confirm(`Delete page "${s}"? (subpages will also be deleted)`);
    if (!ok) return;

    const res = await deletePage(s);
    if (!res.ok) {
      alert(res.error || "Failed to delete page");
      return;
    }
    await refresh();
  }

  async function handleOpenHomeEditor() {
    let currentHome = homePage;
    if (!currentHome) currentHome = await getPage("home");

    if (!currentHome) {
      const res = await addPage({ title: "Home", slug: "home" });
      if (!res.ok) {
        alert(res.error || "Unable to create the home page");
        return;
      }
      await refresh();
    }

    navigate("/admin/pages/home");
  }

  const previewUrl = (() => {
    const baseSlug = slugify(slug || title || "");
    if (!baseSlug) return "/";
    return parentSlug ? `/${parentSlug}/${baseSlug}` : `/${baseSlug}`;
  })();

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="adminPageHeader">
        <div className="adminPageHeaderTitle">
          <span className="adminPageEyebrow">Content</span>
          <h1>Pages</h1>
          <p className="adminPageDescription">
            Manage your site's pages, their hierarchy and their visibility.
          </p>
        </div>

        <div className="adminPageActions">
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className={`adminBtn ${showCreateForm ? "adminBtnSecondary" : "adminBtnPrimary"}`}
          >
            <span>{showCreateForm ? "✕" : "+"}</span>
            <span>{showCreateForm ? "Cancel" : "Create a page"}</span>
          </button>
        </div>
      </div>

      {/* Homepage highlight card */}
      <div
        className="adminCardHighlight"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div className="adminQuickActionIcon" style={{ marginBottom: 0 }}>
            ⌂
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: 15 }}>Homepage</strong>
            <span style={{ color: "rgba(245,245,251,0.7)", fontSize: 13 }}>
              Edit the <code className="adminInlineCode">/home</code> page directly, or create it if
              it doesn't exist.
            </span>
          </div>
        </div>
        <button type="button" onClick={handleOpenHomeEditor} className="adminBtn adminBtnPrimary">
          {homePage ? "Edit homepage" : "Create homepage"}
        </button>
      </div>

      {/* Create page form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="adminCard" style={{ marginBottom: 24 }}>
          <div className="adminCardHeader">
            <div>
              <h3>New page</h3>
              <p className="adminHelpText">New pages are added to the navigation by default.</p>
            </div>
          </div>

          <div className="adminFormGroup">
            <label className="adminLabel">
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="adminInput"
                placeholder="e.g. Parameters"
                autoFocus
              />
            </label>

            <label className="adminLabel">
              <span>Slug (URL)</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="adminInput"
                placeholder="parameters"
              />
              <small style={{ color: "var(--admin-text-muted)", fontSize: 12 }}>
                Full path: <code className="adminInlineCode">{previewUrl}</code>
              </small>
            </label>

            <label className="adminLabel">
              <span>Parent page</span>
              <select
                value={parentSlug}
                onChange={(e) => setParentSlug(e.target.value)}
                className="adminSelect"
              >
                <option value="">(None — top-level page)</option>
                {roots.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="submit" className="adminBtn adminBtnPrimary">
                <span>+</span>
                <span>Create page</span>
              </button>
              <button type="button" onClick={resetCreateForm} className="adminBtn adminBtnGhost">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Pages list */}
      <div className="adminCardHeader" style={{ marginTop: 8, marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 14,
            color: "var(--admin-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          All pages
        </h2>
        <span style={{ color: "var(--admin-text-dim)", fontSize: 13 }}>
          {roots.length} top-level page{roots.length > 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {loading && <div className="adminEditorEmptyState">Loading pages…</div>}
        {!loading && roots.length === 0 && (
          <div className="adminEditorEmptyState">
            No pages yet. Click "Create a page" to get started.
          </div>
        )}
        {roots.map((p) => {
          const kids = childrenOf(p.slug);

          return (
            <div key={p.slug} className="adminPageCard">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                  <Link to={`/admin/pages/${p.slug}`} className="adminPageCardTitle">
                    {p.title}
                  </Link>
                  <span className="adminPageSlug">/{p.slug}</span>
                  {kids.length > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--admin-text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                      }}
                    >
                      {kids.length} subpage{kids.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    to={`/admin/pages/${p.slug}`}
                    className="adminBtn adminBtnSecondary adminBtnSm"
                  >
                    Edit
                  </Link>
                  <Link
                    to={getPublicPagePath(p.slug)}
                    target="_blank"
                    className="adminBtn adminBtnGhost adminBtnSm"
                  >
                    View ↗
                  </Link>
                  <button
                    onClick={() => handleDelete(p.slug)}
                    className="adminBtn adminBtnDanger adminBtnSm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {kids.length > 0 && (
                <div className="adminChildrenList">
                  {kids.map((c) => (
                    <div key={c.slug} className="adminChildRow">
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "baseline",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ color: "var(--admin-text-dim)" }}>↳</span>
                        <Link
                          to={`/admin/pages/${c.slug}`}
                          style={{
                            color: "#a5b4fc",
                            fontSize: 14,
                            fontWeight: 500,
                            textDecoration: "none",
                          }}
                        >
                          {c.title}
                        </Link>
                        <span className="adminPageSlug" style={{ fontSize: 12 }}>
                          /{c.slug}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          to={getPublicPagePath(c.slug)}
                          target="_blank"
                          className="adminBtn adminBtnGhost adminBtnSm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(c.slug)}
                          className="adminBtn adminBtnDanger adminBtnSm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
