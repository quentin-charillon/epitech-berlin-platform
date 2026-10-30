import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadPages, loadSiteSettings, savePages, saveSiteSettings } from "./mockData";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pages: 0, headerBlocks: 0 });
  const [savedMessage, setSavedMessage] = useState("");

  async function refreshStats() {
    try {
      const pages = await loadPages();
      const settings = await loadSiteSettings();
      const headerBlocks = Array.isArray(settings?.header?.blocks)
        ? settings.header.blocks.length
        : 0;
      setStats({
        pages: Array.isArray(pages) ? pages.length : 0,
        headerBlocks,
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    refreshStats();
    window.addEventListener("pages:changed", refreshStats);
    window.addEventListener("site:changed", refreshStats);
    return () => {
      window.removeEventListener("pages:changed", refreshStats);
      window.removeEventListener("site:changed", refreshStats);
    };
  }, []);

  function flashMessage(text) {
    setSavedMessage(text);
    setTimeout(() => setSavedMessage(""), 2400);
  }

  async function handleExport() {
    try {
      const data = {
        pages: await loadPages(),
        siteSettings: await loadSiteSettings(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `site-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      flashMessage("Backup downloaded");
    } catch (err) {
      console.error(err);
      alert("Unable to export data.");
    }
  }

  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.pages) savePages(data.pages);
        if (data.siteSettings) saveSiteSettings(data.siteSettings);

        flashMessage("Backup restored");
        refreshStats();
      } catch (err) {
        alert("Invalid JSON file.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  return (
    <div>
      <div className="adminPageHeader">
        <div className="adminPageHeaderTitle">
          <span className="adminPageEyebrow">Welcome back</span>
          <h1>Dashboard</h1>
          <p className="adminPageDescription">
            Manage your site's content, header and backups from this space.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="adminGrid adminGrid--3" style={{ marginBottom: 32 }}>
        <div className="adminCard">
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--admin-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                Published pages
              </div>
              <div
                style={{ fontSize: 30, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}
              >
                {stats.pages}
              </div>
            </div>
            <div className="adminQuickActionIcon" style={{ marginBottom: 0 }}>
              ▤
            </div>
          </div>
        </div>

        <div className="adminCard">
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--admin-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                Header blocks
              </div>
              <div
                style={{ fontSize: 30, fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}
              >
                {stats.headerBlocks}
              </div>
            </div>
            <div className="adminQuickActionIcon" style={{ marginBottom: 0 }}>
              ▥
            </div>
          </div>
        </div>

        <div className="adminCard">
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--admin-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                Status
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 10, color: "#6ee7b7" }}>
                ● Online
              </div>
            </div>
            <div className="adminQuickActionIcon" style={{ marginBottom: 0 }}>
              ✓
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2
        style={{
          fontSize: 16,
          marginBottom: 14,
          color: "var(--admin-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        Quick actions
      </h2>

      <div className="adminGrid adminGrid--2" style={{ marginBottom: 32 }}>
        <Link to="/admin/pages" className="adminQuickAction">
          <div className="adminQuickActionIcon">▤</div>
          <div className="adminQuickActionTitle">Manage pages</div>
          <div className="adminQuickActionDesc">
            Create, edit or delete pages, and organize the site navigation.
          </div>
        </Link>

        <Link to="/admin/site-settings" className="adminQuickAction">
          <div className="adminQuickActionIcon">▥</div>
          <div className="adminQuickActionTitle">Edit the header</div>
          <div className="adminQuickActionDesc">
            Customize the global banner displayed at the top of every page.
          </div>
        </Link>
      </div>

      {/* Backup */}
      <div className="adminCard" style={{ maxWidth: 720 }}>
        <div className="adminCardHeader">
          <div>
            <h3>Backup &amp; restore</h3>
            <p className="adminHelpText">
              Export all of your site data (pages and header) as a JSON file, or restore from a
              previous backup.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <button onClick={handleExport} className="adminBtn adminBtnPrimary">
            <span>↓</span>
            <span>Export data</span>
          </button>

          <label className="adminBtn adminBtnSecondary" style={{ cursor: "pointer" }}>
            <span>↑</span>
            <span>Import a file</span>
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </label>

          {savedMessage && <span className="adminStatusOk">✓ {savedMessage}</span>}
        </div>
      </div>
    </div>
  );
}
