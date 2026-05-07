import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAllUsers, mapUserToRow, createUser, deleteUser } from '../services/adminApi';

/* ─── constants ─────────────────────────────────────────── */
const ROLES = [
  { label: "Customer", value: 2, desc: "Standard traveler account" },
  { label: "Admin",    value: 0, desc: "Full dashboard access" },
];

const EMPTY_FORM = {
  name: "", email: "", passwordPlain: "",
  role: 2, dateOfBirth: "", gender: "", phoneNumber: "",
};

/* ─── helpers ────────────────────────────────────────────── */
function initials(name = "") {
  return name.split(" ").filter(Boolean).map(s => s[0]).slice(0, 2).join("").toUpperCase();
}

function avatarHue(name = "") {
  const hues = [158, 175, 140, 200, 120, 190, 210, 165];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return hues[h % hues.length];
}

/* ─── styles ─────────────────────────────────────────────── */
const S = {
  page: {
    padding: "0 0 48px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  /* Header */
  header: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    padding: "36px 0 28px",
    borderBottom: "1px solid rgba(27,61,47,.10)",
    marginBottom: 32,
    gap: 24,
  },
  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#2D6A4F",
    marginBottom: 10,
  },
  dot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#2D6A4F",
    animation: "uw-pulse 2.4s ease-in-out infinite",
  },
  title: {
    fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em",
    color: "#0E1F17", lineHeight: 1.1, margin: 0,
  },
  subtitle: {
    fontSize: 13.5, color: "#6C8274", marginTop: 8, fontWeight: 400, lineHeight: 1.5,
  },
  /* Add button */
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "#06402B", color: "#fff",
    border: "none", borderRadius: 10, cursor: "pointer",
    padding: "11px 20px", fontWeight: 700, fontSize: 13.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "-0.01em",
    boxShadow: "0 4px 16px rgba(6,64,43,.28)",
    transition: "transform .15s, box-shadow .15s, background .15s",
    whiteSpace: "nowrap",
  },
  /* Stat cards */
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32,
  },
  statCard: (accent) => ({
    background: accent ? "#06402B" : "#fff",
    border: accent ? "none" : "1px solid rgba(27,61,47,.10)",
    borderRadius: 14, padding: "24px 28px",
    position: "relative", overflow: "hidden",
    boxShadow: accent
      ? "0 8px 32px rgba(6,64,43,.22)"
      : "0 1px 4px rgba(14,31,23,.04)",
  }),
  statLabel: (accent) => ({
    fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: accent ? "rgba(156,210,181,.7)" : "#6C8274",
    marginBottom: 10,
  }),
  statValue: (accent) => ({
    fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
    color: accent ? "#fff" : "#0E1F17",
  }),
  statSub: (accent) => ({
    fontSize: 12, color: accent ? "rgba(156,210,181,.6)" : "#6C8274",
    marginTop: 8, fontWeight: 500,
  }),
  /* Main layout */
  mainGrid: {
    display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start",
  },
  /* Table card */
  tableCard: {
    background: "#fff", borderRadius: 14,
    border: "1px solid rgba(27,61,47,.10)",
    boxShadow: "0 1px 4px rgba(14,31,23,.04)",
    overflow: "hidden",
  },
  tableHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px 0",
  },
  tableTitle: {
    fontSize: 15, fontWeight: 700, color: "#0E1F17", letterSpacing: "-0.02em",
  },
  /* Search */
  searchWrap: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 24px",
    borderBottom: "1px solid rgba(27,61,47,.07)",
  },
  searchInput: {
    flex: 1,
    display: "flex", alignItems: "center", gap: 10,
    background: "#F8F9FA", border: "1.5px solid rgba(27,61,47,.10)",
    borderRadius: 9, padding: "9px 14px",
    fontSize: 13.5, color: "#0E1F17",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  /* Filter tabs */
  tabs: {
    display: "flex", gap: 2,
    background: "#F1F5F2", borderRadius: 8, padding: 3,
  },
  tab: (active) => ({
    padding: "6px 14px", borderRadius: 6, fontSize: 12.5, fontWeight: 600,
    cursor: "pointer", border: "none", transition: "all .15s",
    background: active ? "#fff" : "transparent",
    color: active ? "#0E1F17" : "#6C8274",
    boxShadow: active ? "0 1px 4px rgba(14,31,23,.08)" : "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }),
  /* Table */
  table: {
    width: "100%", borderCollapse: "collapse",
  },
  th: {
    padding: "11px 16px", textAlign: "left",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "#6C8274", background: "#F8FAF8",
    borderBottom: "1px solid rgba(27,61,47,.08)",
  },
  td: {
    padding: "13px 16px",
    borderBottom: "1px solid rgba(27,61,47,.06)",
    fontSize: 13.5, color: "#0E1F17",
    verticalAlign: "middle",
  },
  /* Avatar */
  avatar: (hue) => ({
    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
    background: `hsl(${hue},35%,88%)`,
    color: `hsl(${hue},50%,28%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 800, letterSpacing: "0.02em",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }),
  /* Status badge */
  badge: (status) => {
    const map = {
      Active:    { bg: "#E8F6EE", color: "#1B7A45", dot: "#22c55e" },
      Suspended: { bg: "#FEE9E8", color: "#B23535", dot: "#ef4444" },
      default:   { bg: "#F1F5F2", color: "#6C8274", dot: "#94a3b8" },
    };
    const c = map[status] || map.default;
    return { bg: c.bg, color: c.color, dot: c.dot };
  },
  /* Footer */
  tableFoot: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 24px",
    borderTop: "1px solid rgba(27,61,47,.07)",
    fontSize: 12.5, color: "#6C8274",
  },
  /* Feed card */
  feedCard: {
    background: "#fff", borderRadius: 14,
    border: "1px solid rgba(27,61,47,.10)",
    boxShadow: "0 1px 4px rgba(14,31,23,.04)",
    overflow: "hidden",
  },
  feedHead: {
    padding: "20px 22px 14px",
    borderBottom: "1px solid rgba(27,61,47,.07)",
  },
  feedTitle: {
    fontSize: 14, fontWeight: 700, color: "#0E1F17", letterSpacing: "-0.02em",
  },
  feedSub: {
    fontSize: 12, color: "#6C8274", marginTop: 3,
  },
  feedItem: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "13px 22px",
    borderBottom: "1px solid rgba(27,61,47,.05)",
    transition: "background .15s",
  },
  feedName: { fontSize: 13.5, fontWeight: 600, color: "#0E1F17", lineHeight: 1.3 },
  feedEmail: { fontSize: 11.5, color: "#6C8274", lineHeight: 1.4, marginTop: 1 },
  feedDate: { fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace" },
};

/* ─── Add User Modal ─────────────────────────────────────── */
function AddUserModal({ onClose, onCreated }) {
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr]               = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await createUser({
        ...form,
        role: Number(form.role),
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
      });
      onCreated();
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? ex?.response?.data ?? "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(6,20,12,.6)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "uw-fadein .2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes uw-fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes uw-slide  { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
        @keyframes uw-pulse  { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
        .uw-row-hover:hover { background: #F8FAF8 !important; }
        .uw-feed-hover:hover { background: #F8FAF8 !important; }
        .uw-add-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(6,64,43,.36) !important; background: #0a5438 !important; }
        .uw-field input, .uw-field select {
          width: 100%; background: #F8F9FA; border: 1.5px solid rgba(27,61,47,.12);
          border-radius: 9px; padding: 10px 13px; font-size: 13.5px;
          font-family: 'Plus Jakarta Sans', sans-serif; color: #0E1F17;
          outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .uw-field input:focus, .uw-field select:focus {
          border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(45,106,79,.12);
        }
        .uw-field input::placeholder { color: #94a3b8; }
        .uw-role-card { cursor: pointer; transition: all .15s; }
        .uw-role-card:hover { border-color: #2D6A4F !important; }
      `}</style>

      <div style={{
        background: "#fff", borderRadius: 18,
        boxShadow: "0 32px 80px rgba(6,20,12,.28), 0 0 0 1px rgba(27,61,47,.08)",
        width: 520, maxHeight: "90vh", overflowY: "auto",
        animation: "uw-slide .25s cubic-bezier(.22,1,.36,1)",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "28px 32px 22px",
          borderBottom: "1px solid rgba(27,61,47,.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D6A4F", marginBottom: 6 }}>
              People · New Account
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0E1F17", letterSpacing: "-0.03em" }}>
              Add User
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 8, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "#F1F5F2", border: "none", cursor: "pointer",
              color: "#6C8274", fontSize: 18, lineHeight: 1, transition: "background .15s",
            }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 32px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Role selector */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#384D3E", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
              Account Role
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ROLES.map(r => (
                <label
                  key={r.value}
                  className="uw-role-card"
                  style={{
                    display: "flex", flexDirection: "column", gap: 4,
                    padding: "14px 16px", borderRadius: 11, cursor: "pointer",
                    border: `2px solid ${Number(form.role) === r.value ? "#06402B" : "rgba(27,61,47,.12)"}`,
                    background: Number(form.role) === r.value ? "#F0FAF5" : "#F8F9FA",
                  }}
                >
                  <input type="radio" name="role" value={r.value} checked={Number(form.role) === r.value} onChange={set("role")} style={{ display: "none" }} />
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: Number(form.role) === r.value ? "#06402B" : "#0E1F17" }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: "#6C8274" }}>{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ModalField label="Full Name *">
              <input required value={form.name} onChange={set("name")} placeholder="Jane Doe" />
            </ModalField>
            <ModalField label="Email *">
              <input required type="email" value={form.email} onChange={set("email")} placeholder="jane@ecowings.co" />
            </ModalField>
          </div>

          {/* Password */}
          <ModalField label="Password *">
            <input required type="password" value={form.passwordPlain} onChange={set("passwordPlain")} placeholder="Minimum 6 characters" minLength={6} />
          </ModalField>

          {/* Gender + DOB */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ModalField label="Gender">
              <select value={form.gender} onChange={set("gender")}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </ModalField>
            <ModalField label="Date of Birth">
              <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
            </ModalField>
          </div>

          {/* Phone */}
          <ModalField label="Phone Number">
            <input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+1 555 000 0000" />
          </ModalField>

          {err && (
            <div style={{ background: "#FEE9E8", border: "1px solid rgba(178,53,53,.2)", borderRadius: 8, padding: "11px 14px", color: "#B23535", fontSize: 13 }}>
              {String(err)}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button
              type="button" onClick={onClose} disabled={submitting}
              style={{
                padding: "10px 20px", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                background: "#F1F5F2", color: "#384D3E", border: "none", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >Cancel</button>
            <button
              type="submit" disabled={submitting}
              style={{
                padding: "10px 22px", borderRadius: 9, fontSize: 13.5, fontWeight: 700,
                background: "#06402B", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: submitting ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(6,64,43,.3)",
              }}
            >{submitting ? "Creating…" : "Create User"}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function ModalField({ label, children }) {
  return (
    <div className="uw-field" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#384D3E", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Delete confirm modal ───────────────────────────────── */
function DeleteConfirmModal({ user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr]           = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErr(null);
    try {
      const rawId = parseInt(user.id.replace("U-", ""), 10);
      await deleteUser(rawId);
      onDeleted();
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? ex?.response?.data ?? "Failed to delete user.");
      setDeleting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1300,
        background: "rgba(6,20,12,.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "uw-fadein .18s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 24px 64px rgba(6,20,12,.26), 0 0 0 1px rgba(27,61,47,.08)",
        width: 420, padding: "32px 32px 28px",
        animation: "uw-slide .22s cubic-bezier(.22,1,.36,1)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "#FEE9E8", display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B23535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#0E1F17", letterSpacing: "-0.03em" }}>
          Delete User
        </h2>
        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "#384D3E", lineHeight: 1.55 }}>
          You are about to permanently delete{" "}
          <b style={{ color: "#0E1F17" }}>{user.name}</b>.
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 12.5, color: "#6C8274", lineHeight: 1.5 }}>
          {user.email} · {user.id}
        </p>

        <div style={{
          background: "#FEF3F2", border: "1px solid rgba(178,53,53,.18)",
          borderRadius: 9, padding: "11px 14px", marginBottom: 24,
          fontSize: 12.5, color: "#B23535", lineHeight: 1.5,
        }}>
          This action cannot be undone. All data associated with this account will be permanently removed.
        </div>

        {err && (
          <div style={{ background: "#FEE9E8", borderRadius: 8, padding: "10px 14px", color: "#B23535", fontSize: 13, marginBottom: 16 }}>
            {String(err)}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose} disabled={deleting}
            style={{
              padding: "10px 20px", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
              background: "#F1F5F2", color: "#384D3E", border: "none", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >Cancel</button>
          <button
            onClick={handleDelete} disabled={deleting}
            style={{
              padding: "10px 22px", borderRadius: 9, fontSize: 13.5, fontWeight: 700,
              background: "#B23535", color: "#fff", border: "none",
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              opacity: deleting ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(178,53,53,.28)",
            }}
          >{deleting ? "Deleting…" : "Delete User"}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function UserManagementPage() {
  const [status, setStatus]       = useState("All");
  const [q, setQ]                 = useState("");
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    getAllUsers()
      .then((data) => {
        const mapped = Array.isArray(data) ? data.map(mapUserToRow) : [];
        setUsers(mapped);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users.");
        setLoading(false);
      });
  }, [refreshKey]);

  if (loading) return <div className="admin-page-head"><p style={{ color: "var(--ink-3)" }}>Loading users…</p></div>;
  if (error)   return <div className="admin-page-head"><p style={{ color: "#B23535" }}>{error}</p></div>;

  const activeCount    = users.filter(u => u.status === "Active").length;
  const suspendedCount = users.filter(u => u.status === "Suspended").length;

  const rows = users.filter(u => {
    const matchStatus = status === "All" || u.status === status;
    const matchQ = !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    return matchStatus && matchQ;
  });

  return (
    <>
      <style>{`
        @keyframes uw-fadein { from { opacity:0 } to { opacity:1 } }
        @keyframes uw-slide  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes uw-pulse  { 0%,100% { opacity:1 } 50% { opacity:.35 } }
        .uw-row-hover:hover  { background:#F8FAF8 !important; }
        .uw-feed-hover:hover { background:#F8FAF8 !important; }
        .uw-add-btn:hover    { transform:translateY(-1px); box-shadow:0 8px 24px rgba(6,64,43,.36) !important; background:#0a5438 !important; }
        .uw-search-inner:focus { outline:none; }
        .uw-search-wrap:focus-within { border-color:#2D6A4F !important; box-shadow:0 0 0 3px rgba(45,106,79,.1) !important; }
        .uw-del-btn {
          width:30px; height:30px; border-radius:7px;
          border:1px solid rgba(192,57,43,.22);
          background:#fff5f5; cursor:pointer;
          display:inline-flex; align-items:center; justify-content:center;
          color:#C0392B;
          transition:background .18s, border-color .18s, transform .12s, box-shadow .18s;
          box-shadow:0 1px 3px rgba(192,57,43,.08);
        }
        .uw-del-btn:hover {
          background:#fee2e2;
          border-color:rgba(192,57,43,.45);
          box-shadow:0 3px 10px rgba(192,57,43,.18);
          transform:scale(1.08);
        }
        .uw-del-btn:active { transform:scale(.95); }
      `}</style>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); refresh(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); refresh(); }}
        />
      )}

      {/* ── Header ── */}
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">People</span>
          </div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-sub">
            {users.length} accounts · {activeCount} active · {suspendedCount} suspended
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            className="uw-add-btn"
            style={S.addBtn}
            onClick={() => setShowModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="admin-kpis" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total Users", value: users.length,   sub: "all accounts",     accent: true },
          { label: "Active",      value: activeCount,    sub: "currently active", accent: false },
          { label: "Suspended",   value: suspendedCount, sub: "access revoked",   accent: false },
        ].map(k => (
          <div key={k.label} className={"admin-card admin-kpi" + (k.accent ? " accent" : "")}>
            <div className="lab">{k.label}</div>
            <div className="val" style={{ fontSize: 38, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 8 }}>
              {k.value.toLocaleString()}
            </div>
            <div className="foot" style={{ marginTop: 8 }}>
              <span className="cmp">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="admin-grid2b" style={{ alignItems: "start" }}>

        {/* Table */}
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div className="admin-card-h">
            <div>
              <h3>All Users</h3>
              <div className="sub">{rows.length} of {users.length} accounts</div>
            </div>
            <div className="admin-seg">
              {["All", "Active", "Suspended"].map(s => (
                <button key={s} className={status === s ? "on" : ""} onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="admin-inline-search" style={{ flex: 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C8274" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search by name or email…"
              />
              {q && (
                <button onClick={() => setQ("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 16, lineHeight: 1 }}>×</button>
              )}
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace" }}>
              {rows.length} results
            </span>
          </div>

          {/* Table */}
          <table className="admin-tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 20 }}>User</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last seen</th>
                <th style={{ width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--ink-3)", padding: "32px 0" }}>
                    No users found.
                  </td>
                </tr>
              ) : rows.map(u => {
                const hue = avatarHue(u.name);
                const bc  = S.badge(u.status);
                return (
                  <tr key={u.id}>
                    <td style={{ paddingLeft: 20 }}>
                      <div className="pax">
                        <div style={S.avatar(hue)}>{initials(u.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink)", lineHeight: 1.3 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: bc.bg, color: bc.color,
                        borderRadius: 20, padding: "4px 11px",
                        fontSize: 12, fontWeight: 700,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%", background: bc.dot, flexShrink: 0,
                          ...(u.status === "Active" ? { animation: "uw-pulse 2s ease-in-out infinite" } : {}),
                        }} />
                        {u.status}
                      </span>
                    </td>
                    <td className="id">{u.joined}</td>
                    <td className="id" style={{ color: "var(--ink-3)" }}>{u.last}</td>
                    <td style={{ paddingRight: 16, width: 48, textAlign: "right" }}>
                      <button
                        className="uw-del-btn"
                        onClick={() => setDeleteTarget(u)}
                        title="Delete user"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="admin-card-foot">
            <span>Showing <b style={{ color: "var(--ink)" }}>{rows.length}</b> of {users.length} users</span>
          </div>
        </div>

        {/* Recent sign-ups */}
        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Recent Sign-ups</h3>
              <div className="sub">Latest {Math.min(users.length, 5)} accounts</div>
            </div>
          </div>
          {users.slice(0, 5).map((u) => {
            const hue = avatarHue(u.name);
            return (
              <div key={u.id} className="uw-feed-hover" style={S.feedItem}>
                <div style={{ ...S.avatar(hue), width: 36, height: 36, fontSize: 12 }}>{initials(u.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.feedName}>{u.name}</div>
                  <div style={{ ...S.feedEmail, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </div>
                <div style={S.feedDate}>{u.joined}</div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div style={{ padding: "24px 22px", color: "#6C8274", fontSize: 13 }}>No users yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
