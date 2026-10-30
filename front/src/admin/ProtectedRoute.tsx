import { Navigate } from "react-router-dom";

function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/admin/login" replace />;

  const payload = decodeToken(token);
  const isExpired = !payload || payload.exp * 1000 < Date.now();
  const isAdmin = payload?.role === "ADMIN";

  if (isExpired || !isAdmin) {
    localStorage.removeItem("token");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
