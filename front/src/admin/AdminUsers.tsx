import { useEffect, useState } from "react";
import { createUser, deleteUser, loadUsers, updateUserRole } from "./mockData";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const EMPTY_FORM = { name: "", email: "", password: "" };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await loadUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await createUser(form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(EMPTY_FORM);
    flash("Account created");
    refresh();
  }

  async function handleRoleToggle(u: User) {
    const next = u.role === "ADMIN" ? "STAFF" : "ADMIN";
    setRoleLoading(u._id);
    const result = await updateUserRole(u._id, next);
    setRoleLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    flash(next === "ADMIN" ? `${u.name} promoted to Admin` : `${u.name} set to Staff`);
    refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete account for ${name}?`)) return;
    const result = await deleteUser(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    flash("Account deleted");
    refresh();
  }

  return (
    <div>
      <div className="adminPageHeader">
        <div className="adminPageHeaderTitle">
          <span className="adminPageEyebrow">Administration</span>
          <h1>User accounts</h1>
          <p className="adminPageDescription">
            Promote staff accounts to admin so they can access the back office.
          </p>
        </div>
      </div>

      {(error || success) && (
        <div style={{ marginBottom: 20 }}>
          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--admin-danger)" }}>{error}</p>
          )}
          {success && <p className="adminStatusOk">✓ {success}</p>}
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}
      >
        {/* User list */}
        <div className="adminCard" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--admin-border)" }}>
            <h3 style={{ margin: 0 }}>All accounts</h3>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--admin-text-muted)" }}>
              Loading…
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--admin-text-muted)" }}>
              No accounts yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--admin-border)" }}>
                  {["Name", "Email", "Role", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 24px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--admin-text-dim)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    style={{
                      borderBottom: "1px solid var(--admin-border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "var(--admin-surface-hover)")
                    }
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    <td style={{ padding: "14px 24px", fontWeight: 600, fontSize: 14 }}>
                      {u.name}
                    </td>
                    <td
                      style={{
                        padding: "14px 24px",
                        fontSize: 13,
                        color: "var(--admin-text-muted)",
                      }}
                    >
                      {u.email}
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background:
                            u.role === "ADMIN" ? "rgba(124,58,237,0.18)" : "rgba(16,185,129,0.14)",
                          color: u.role === "ADMIN" ? "#c4b5fd" : "#6ee7b7",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td
                      style={{ padding: "14px 24px", fontSize: 13, color: "var(--admin-text-dim)" }}
                    >
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          className={`adminBtn adminBtnSm ${u.role === "ADMIN" ? "adminBtnSecondary" : "adminBtnSuccess"}`}
                          onClick={() => handleRoleToggle(u)}
                          disabled={roleLoading === u._id}
                          title={u.role === "ADMIN" ? "Demote to Staff" : "Promote to Admin"}
                        >
                          {roleLoading === u._id
                            ? "…"
                            : u.role === "ADMIN"
                              ? "Demote"
                              : "Make Admin"}
                        </button>
                        <button
                          className="adminBtn adminBtnDanger adminBtnSm"
                          onClick={() => handleDelete(u._id, u.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create form */}
        <div className="adminCard">
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>New staff account</h3>

          <form onSubmit={handleSubmit} className="adminFormGroup">
            <label className="adminLabel">
              <span>Full name</span>
              <input
                className="adminInput"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>

            <label className="adminLabel">
              <span>Email</span>
              <input
                className="adminInput"
                type="email"
                placeholder="jane@epitech.eu"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </label>

            <label className="adminLabel">
              <span>Password</span>
              <input
                className="adminInput"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </label>

            <button
              type="submit"
              className="adminBtn adminBtnPrimary"
              style={{ marginTop: 4 }}
              disabled={submitting}
            >
              {submitting ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
