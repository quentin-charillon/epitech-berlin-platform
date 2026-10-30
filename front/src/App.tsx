import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPagesList from "./admin/AdminPagesList";
import AdminPageEditor from "./admin/Page editor/AdminPageEditor";
import AdminSiteSettings from "./admin/AdminSiteSettings";
import AdminFooterEditor from "./admin/AdminFooterEditor";
import AdminUsers from "./admin/AdminUsers";
import AdminHelp from "./admin/AdminHelp";
import AdminLogin from "./admin/AdminLogin";
import ProtectedRoute from "./admin/ProtectedRoute";

import CMSPage from "./pages/CMSPage";

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* LOGIN ADMIN (pas protégé) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN (protégé avec toutes les routes enfants) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="pages" element={<AdminPagesList />} />
            <Route path="pages/*" element={<AdminPageEditor />} />
            <Route path="footer" element={<AdminFooterEditor />} />
            <Route path="site-settings" element={<AdminSiteSettings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="help" element={<AdminHelp />} />
          </Route>

          {/* SITE PUBLIC */}
          <Route path="/" element={<CMSPage fallbackSlug="home" />} />
          <Route path="/*" element={<CMSPage />} />

          {/* 404 */}
          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
      </main>
      {!isAdminRoute && <SiteFooter />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
