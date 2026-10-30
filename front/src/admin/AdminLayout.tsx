import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className={`adminShell${sidebarOpen ? "" : " adminShell--collapsed"}`}>
      <aside className={`adminSidebar${sidebarOpen ? "" : " adminSidebar--collapsed"}`}>
        <div className="adminSidebarInner">
          <button
            type="button"
            className="adminSidebarCloseBtn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ‹
          </button>

          <div className="adminBrand">
            <div className="adminBrandMark">A</div>
            <span className="adminBrandText">Admin</span>
          </div>

          <div className="adminNavSection">
          <div className="adminNavLabel">Overview</div>
          <nav className="adminNav">
            <NavLink to="/admin" end className="adminLink">
              <span className="adminLinkIcon">⌂</span>
              <span className="adminLinkLabel">Dashboard</span>
            </NavLink>
          </nav>
        </div>

        <div className="adminNavSection">
          <div className="adminNavLabel">Content</div>
          <nav className="adminNav">
            <NavLink to="/admin/pages" className="adminLink">
              <span className="adminLinkIcon">▤</span>
              <span className="adminLinkLabel">Pages</span>
            </NavLink>
            <NavLink to="/admin/site-settings" className="adminLink">
              <span className="adminLinkIcon">▥</span>
              <span className="adminLinkLabel">Site header</span>
            </NavLink>
            <NavLink to="/admin/footer" className="adminLink">
              <span className="adminLinkIcon">▦</span>
              <span className="adminLinkLabel">Footer</span>
            </NavLink>
            <NavLink to="/admin/users" className="adminLink">
              <span className="adminLinkIcon">👤</span>
              <span className="adminLinkLabel">Users</span>
            </NavLink>
          </nav>
        </div>

        <div className="adminSidebarFooter">
          <NavLink to="/admin/help" className="adminLink">
            <span className="adminLinkIcon">?</span>
            <span className="adminLinkLabel">Help</span>
          </NavLink>
          <NavLink to="/home" className="adminLink">
            <span className="adminLinkIcon">↗</span>
            <span className="adminLinkLabel">View site</span>
          </NavLink>
          <button onClick={handleLogout} className="adminLogoutBtn">
            <span>⎋</span>
            <span>Log out</span>
          </button>
        </div>
        </div>
      </aside>

      <button
        type="button"
        className={`adminSidebarOpenBtn${sidebarOpen ? " adminSidebarOpenBtn--hidden" : ""}`}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        ›
      </button>

      <main className="adminMain">
        <Outlet />
      </main>
    </div>
  );
}
