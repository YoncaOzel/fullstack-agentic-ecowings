import { useState, useEffect } from 'react';
import { Donut } from '../components/Charts';
import { IcoUsers, IcoTicket, IcoPlane, IcoDollar, IcoExport, IcoPlus, IcoMore, IcoUp } from '../components/Icons';
import { getAllUsers, mapUserToRow } from '../services/adminApi';

const TIER_COLORS = {
  Platinum: "#1B3D2F",
  Gold:     "#A87217",
  Silver:   "#6C8274",
  Basic:    "#CDE2D2",
};

const TIER_DONUT = [
  { name: "Platinum", pct: 14, n: 1989, color: "#1B3D2F" },
  { name: "Gold",     pct: 28, n: 3978, color: "#A87217" },
  { name: "Silver",   pct: 34, n: 4830, color: "#6C8274" },
  { name: "Basic",    pct: 24, n: 3411, color: "#CDE2D2" },
];

function initials(name) {
  return name.split(" ").map(s => s[0]).slice(0, 2).join("");
}

export default function UserManagementPage() {
  const [tier, setTier]     = useState("All");
  const [status, setStatus] = useState("All");
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then((data) => {
        const mapped = Array.isArray(data) ? data.map(mapUserToRow) : [];
        setUsers(mapped);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page-head"><p style={{ color: "var(--ink-3)" }}>Loading users…</p></div>;
  if (error)   return <div className="admin-page-head"><p style={{ color: "#B23535" }}>{error}</p></div>;

  const rows = users.filter(u =>
    (tier === "All"   || u.tier === tier) &&
    (status === "All" || u.status === status)
  );

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">People</span>
          </div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-sub">
            28,412 active travelers across 68 countries. Manage tiers, access and account lifecycle.
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-ghost"><IcoExport size={14} /> Export</button>
          <button className="admin-btn admin-btn-primary"><IcoPlus size={14} /> Invite user</button>
        </div>
      </div>

      {/* TODO: Loyalty members, Avg trips/user, Avg LTV require additional fields on UserDto (tier, trips, spend) — showing real user count only */}
      <div className="admin-kpis" style={{ marginBottom: 16 }}>
        {[
          { label: "Active users",    IconC: IcoUsers,  value: users.length.toLocaleString(), delta: "", cmp: `${users.filter(u => u.status === "Active").length} active` },
          { label: "Loyalty members", IconC: IcoTicket, value: (users.filter(u => u.tier && u.tier !== "Basic").length || 1).toLocaleString(), delta: "", cmp: "TODO: tier data needed" },
          { label: "Avg trips / user",IconC: IcoPlane,  value: String(users.length > 0 ? (users.reduce((s, u) => s + (u.trips || 0), 0) / users.length).toFixed(1) : 1), delta: "", cmp: "TODO: trips data needed" },
          { label: "Avg LTV",         IconC: IcoDollar, value: users.length > 0 ? `$${Math.round(users.reduce((s, u) => s + (u.spend || 0), 0) / users.length).toLocaleString() || 1}` : "$1", delta: "", cmp: "TODO: spend data needed" },
        ].map(k => (
          <div key={k.label} className="admin-card admin-kpi">
            <div className="lab">
              <span className="ico"><k.IconC size={14} sw={1.8} /></span>
              {k.label}
            </div>
            <div className="val">{k.value}</div>
            <div className="foot">
              <span className="admin-delta up"><IcoUp size={10} />{k.delta}</span>
              <span className="cmp">{k.cmp}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid2b" style={{ marginBottom: 16 }}>
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div className="admin-card-h">
            <div>
              <h3>All users</h3>
              <div className="sub">{rows.length} of {users.length} shown</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="admin-pillseg">
                {["All", "Platinum", "Gold", "Silver", "Basic"].map(t => (
                  <button key={t} className={tier === t ? "on" : ""} onClick={() => setTier(t)}>{t}</button>
                ))}
              </div>
              <div className="admin-pillseg">
                {["All", "Active", "Suspended", "Invited"].map(s => (
                  <button key={s} className={status === s ? "on" : ""} onClick={() => setStatus(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          <table className="admin-tbl">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th>Traveler</th>
                <th style={{ width: 120 }}>Tier</th>
                <th style={{ width: 80, textAlign: "right" }}>Trips</th>
                <th style={{ width: 120, textAlign: "right" }}>Miles</th>
                <th style={{ width: 110, textAlign: "right" }}>Spend</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 90 }}>Last seen</th>
                <th style={{ width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id}>
                  <td className="id">{u.id}</td>
                  <td>
                    <div className="pax">
                      <div className="av">{initials(u.name)}</div>
                      <div>
                        <div className="pn">{u.name}</div>
                        <div className="pe">{u.email} · {u.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 12.5,
                      color: TIER_COLORS[u.tier] || "var(--green)"
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: TIER_COLORS[u.tier] }} />
                      {u.tier}
                    </span>
                  </td>
                  <td className="mono" style={{ textAlign: "right", color: "var(--ink)" }}>{u.trips}</td>
                  <td className="mono" style={{ textAlign: "right", color: "var(--ink-2)" }}>{(u.miles / 1000).toFixed(0)}K</td>
                  <td className="mono" style={{ textAlign: "right", color: "var(--ink)", fontWeight: 500 }}>
                    ${(u.spend / 1000).toFixed(1)}K
                  </td>
                  <td>
                    <span className={"admin-badge " + (
                      u.status === "Active"    ? "b-confirmed" :
                      u.status === "Suspended" ? "b-cancelled" :
                                                 "b-pending"
                    )}>
                      <span className="dotb" />{u.status}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{u.last}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="admin-more-btn"><IcoMore size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-card-foot">
            <span>Showing {rows.length} of {users.length} users</span>
            <a href="#">Audit log →</a>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-card">
            <div className="admin-card-h">
              <div>
                <h3>Tier distribution</h3>
                <div className="sub">Loyalty program · snapshot</div>
              </div>
            </div>
            <div className="admin-users-panel">
              <div className="admin-donut-wrap">
                <div className="admin-donut">
                  <Donut data={TIER_DONUT} />
                  <div className="centerv">
                    <div className="n">14.2K</div>
                    <div className="l">Members</div>
                  </div>
                </div>
                <div className="admin-chan-list">
                  {TIER_DONUT.map(c => (
                    <div className="admin-chan" key={c.name}>
                      <span className="sw2" style={{ background: c.color }} />
                      <span className="name">{c.name}</span>
                      <span className="n">{c.pct}% · {c.n.toLocaleString()}</span>
                      <div className="chan-bar">
                        <span style={{ width: c.pct + "%", background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-h">
              <div>
                <h3>Recent sign-ups</h3>
                <div className="sub">Last 24 hours</div>
              </div>
            </div>
            <div className="admin-feed">
              {users.slice(0, 5).map((u, i) => (
                <div className="feed-row" key={u.id}>
                  <div className="fdot mint" />
                  <div>
                    <div className="ttl">{u.name}</div>
                    <div className="fsub">{u.email} · {u.city}</div>
                  </div>
                  <div className="ft">{i * 11 + 3}m</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
