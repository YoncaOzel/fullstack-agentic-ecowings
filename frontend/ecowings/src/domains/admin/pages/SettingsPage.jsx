import { useState } from 'react';
import { Donut } from '../components/Charts';
import { IcoMore, IcoSliders, IcoExport, IcoPlus } from '../components/Icons';
// TODO: connect to user/roles endpoint — no dedicated roles endpoint exists yet.
// ROLES donut data is mock. When a roles summary endpoint is available (e.g. GET api/User/roles-summary),
// replace this import with an API call via adminApi.js.
// TODO: connect active admins table — GET api/User filtered by role (Admin/SuperAdmin) is possible
// but the UserDto does not expose a "last active" timestamp; keep mock until backend adds it.
// TODO: connect audit log — no audit log endpoint exists yet; keep mock inline data.
import { ROLES } from '../data/mockData';

const TABS = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "notify", label: "Notifications" },
  { id: "team", label: "Team" },
  { id: "billing", label: "Billing" },
  { id: "integr", label: "Integrations" },
];

function Toggle({ on, set }) {
  return (
    <button
      className={"admin-toggle " + (on ? "on" : "off")}
      onClick={() => set(!on)}
      aria-pressed={on}
    />
  );
}

function Field({ label, hint, value, children }) {
  return (
    <div className="admin-field">
      <div>
        <div className="field-label">{label}</div>
        {hint && <div className="field-hint">{hint}</div>}
      </div>
      <div>
        {children || (value && (
          <span className="mono" style={{ fontSize: 13, color: "var(--ink-2)" }}>{value}</span>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  maxWidth: 360,
  padding: "8px 12px",
  border: "1px solid var(--hair-strong)",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 13,
  color: "var(--ink)",
  background: "#fff",
  outline: "none",
};

export default function SettingsPage() {
  const [tab, setTab]             = useState("general");
  const [twoFA, setTwoFA]         = useState(true);
  const [sso, setSso]             = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSlack, setNotifSlack] = useState(true);
  const [notifSMS, setNotifSMS]   = useState(false);

  const totalAdmins = ROLES.reduce((s, r) => s + r.n, 0);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">Configuration</span>
          </div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-sub">
            Manage portal configuration, team access, security and external integrations.
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-ghost"><IcoExport size={14} /> Export config</button>
          <button className="admin-btn admin-btn-primary"><IcoPlus size={14} /> Add member</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="admin-settings-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={"admin-settings-tab " + (tab === t.id ? "on" : "")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ======= GENERAL ======= */}
        {tab === "general" && (
          <>
            <div className="admin-card">
              <div className="admin-card-h">
                <div><h3>Organization</h3><div className="sub">Basic info about your EcoWings portal</div></div>
              </div>
              <Field label="Organization name">
                <input style={inputStyle} defaultValue="EcoWings Airlines" />
              </Field>
              <Field label="Admin email">
                <input style={inputStyle} defaultValue="admin@ecowings.co" />
              </Field>
              <Field label="Support email">
                <input style={inputStyle} defaultValue="support@ecowings.co" />
              </Field>
              <Field label="Default timezone" value="UTC+3 · Istanbul" />
              <Field label="Default currency" value="USD ($)" />
              <Field label="Portal version" value="v4.19.2 · stable" />
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="admin-btn admin-btn-ghost">Discard</button>
                <button className="admin-btn admin-btn-primary">Save changes</button>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-h">
                <div><h3>Branding</h3><div className="sub">Customize the portal appearance</div></div>
              </div>
              <Field label="Logo" hint="Used in portal header and emails">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 80, height: 40, borderRadius: 8,
                    background: "var(--forest)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, color: "var(--green-hi)",
                    fontSize: 13
                  }}>EcoWings</div>
                  <button className="admin-btn admin-btn-ghost">Upload new</button>
                </div>
              </Field>
              <Field label="Accent color" hint="Primary brand color">
                <div style={{ display: "flex", gap: 8 }}>
                  {["#06402B", "#04372B", "#2F5E42", "#012A20"].map(col => (
                    <div key={col} style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: col, cursor: "pointer",
                      border: col === "#06402B" ? "2px solid var(--ink)" : "2px solid transparent"
                    }} />
                  ))}
                </div>
              </Field>
            </div>
          </>
        )}

        {/* ======= SECURITY ======= */}
        {tab === "security" && (
          <>
            <div className="admin-card">
              <div className="admin-card-h">
                <div><h3>Authentication</h3><div className="sub">How admins sign in</div></div>
              </div>
              <Field label="Two-factor auth" hint="Required for Super Admin and Ops Manager roles">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ color: twoFA ? "var(--green)" : "var(--ink-3)", fontSize: 12 }}>
                    {twoFA ? "Enforced" : "Optional"}
                  </span>
                  <Toggle on={twoFA} set={setTwoFA} />
                </div>
              </Field>
              <Field label="SSO (SAML 2.0)" hint="Okta connection · last synced 4 minutes ago">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ color: sso ? "var(--green)" : "var(--ink-3)", fontSize: 12 }}>
                    {sso ? "Connected" : "Off"}
                  </span>
                  <Toggle on={sso} set={setSso} />
                </div>
              </Field>
              <Field label="Session timeout" hint="Auto sign-out after inactivity">
                <div className="admin-pillseg">
                  <button>15m</button>
                  <button className="on">30m</button>
                  <button>1h</button>
                  <button>4h</button>
                </div>
              </Field>
              <Field label="Password policy" value="Min 12 chars · uppercase + number + symbol · rotate 90 days" />
            </div>

            <div className="admin-card">
              <div className="admin-card-h">
                <div><h3>Audit log</h3><div className="sub">Last 5 admin actions</div></div>
              </div>
              <div className="admin-feed">
                {[
                  { t: "12m ago", title: "Role changed · U-00837",     sub: "Selin Yıldız demoted from Ops Manager → Analyst by Batur D." },
                  { t: "1h ago",  title: "API key rotated",             sub: "Partner · TK-Turkish-Airlines · new key issued" },
                  { t: "3h ago",  title: "Login from new device",       sub: "Batur D. · Chrome 128 · Istanbul · verified" },
                  { t: "6h ago",  title: "SSO config updated",          sub: "Okta IdP · SCIM provisioning enabled" },
                  { t: "1d ago",  title: "Access revoked",              sub: "Former contractor · 2 sessions terminated" },
                ].map((r, i) => (
                  <div className="feed-row" key={i}>
                    <div className="fdot green" />
                    <div>
                      <div className="ttl">{r.title}</div>
                      <div className="fsub">{r.sub}</div>
                    </div>
                    <div className="ft">{r.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======= NOTIFICATIONS ======= */}
        {tab === "notify" && (
          <div className="admin-card">
            <div className="admin-card-h">
              <div><h3>Notifications</h3><div className="sub">How we reach the ops team when something needs attention</div></div>
            </div>
            <Field label="Email digest" hint="ops@ecowings.co · every 2 hours">
              <Toggle on={notifEmail} set={setNotifEmail} />
            </Field>
            <Field label="Slack · #ops-alerts" hint="Incidents and pending approvals only">
              <Toggle on={notifSlack} set={setNotifSlack} />
            </Field>
            <Field label="SMS (on-call)" hint="Severe incidents only · pager rotation">
              <Toggle on={notifSMS} set={setNotifSMS} />
            </Field>
            <Field label="Severity threshold">
              <div className="admin-pillseg">
                <button>All</button>
                <button className="on">Medium+</button>
                <button>High only</button>
              </div>
            </Field>
            <Field label="Quiet hours" hint="No SMS between these hours">
              <input style={inputStyle} defaultValue="23:00 – 07:00 UTC+3" />
            </Field>
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-primary">Save preferences</button>
            </div>
          </div>
        )}

        {/* ======= TEAM ======= */}
        {tab === "team" && (
          <>
            <div className="admin-card">
              <div className="admin-card-h">
                <div><h3>Roles</h3><div className="sub">{totalAdmins} admin accounts across four roles</div></div>
              </div>
              <div className="admin-users-panel">
                <div className="admin-donut-wrap">
                  <div className="admin-donut">
                    <Donut data={ROLES.map(r => ({ pct: (r.n / totalAdmins) * 100, color: r.color }))} />
                    <div className="centerv">
                      <div className="n">{totalAdmins}</div>
                      <div className="l">Admins</div>
                    </div>
                  </div>
                  <div className="admin-chan-list">
                    {ROLES.map(r => (
                      <div className="admin-chan" key={r.role}>
                        <span className="sw2" style={{ background: r.color }} />
                        <span className="name">{r.role}</span>
                        <span className="n">{r.n}</span>
                        <div className="chan-bar">
                          <span style={{ width: (r.n / totalAdmins * 100) + "%", background: r.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ overflow: "hidden" }}>
              <div className="admin-card-h">
                <div><h3>Active admins</h3><div className="sub">Team members with portal access</div></div>
              </div>
              <table className="admin-tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Last active</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: "Batur Dinçer",   r: "Super Admin", l: "Just now" },
                    { n: "Zeynep Arslan",  r: "Super Admin", l: "12m ago" },
                    { n: "Kenji Watanabe", r: "Ops Manager",  l: "1h ago" },
                    { n: "Sofia Müller",   r: "Ops Manager",  l: "2h ago" },
                    { n: "Ivan Petrov",    r: "Support",      l: "4h ago" },
                    { n: "Aisha Karimi",   r: "Analyst",      l: "1d ago" },
                  ].map(u => (
                    <tr key={u.n}>
                      <td>
                        <div className="pax">
                          <div className="av">{u.n.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
                          <div>
                            <div className="pn">{u.n}</div>
                            <div className="pe">{u.n.split(" ")[0].toLowerCase()}@ecowings.co</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 12.5, color: "var(--ink-2)" }}>
                          {u.r}
                        </span>
                      </td>
                      <td className="mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>{u.l}</td>
                      <td>
                        <button className="admin-more-btn"><IcoMore size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ======= BILLING ======= */}
        {tab === "billing" && (
          <div className="admin-card">
            <div className="admin-card-h">
              <div><h3>Billing</h3><div className="sub">Enterprise plan · billed annually in USD</div></div>
            </div>
            <Field label="Plan"             value="EcoWings Enterprise · Unlimited seats" />
            <Field label="Next invoice"     value="$42,000 · May 1, 2026" />
            <Field label="Payment method"   value="Visa ···4421 · expires 08/28" />
            <Field label="Billing email">
              <input style={inputStyle} defaultValue="finance@ecowings.co" />
            </Field>
            <Field label="Tax ID"           value="TR-4582-901-623" />
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="admin-btn admin-btn-ghost">Download invoices</button>
              <button className="admin-btn admin-btn-primary">Update plan</button>
            </div>
          </div>
        )}

        {/* ======= INTEGRATIONS ======= */}
        {tab === "integr" && (
          <div className="admin-card">
            <div className="admin-card-h">
              <div><h3>Integrations</h3><div className="sub">Connected partners and downstream systems</div></div>
            </div>
            <div className="admin-integ-grid">
              {[
                { n: "Amadeus GDS", s: "Connected", d: "Inventory + PNR sync · last OK 42s ago" },
                { n: "Stripe",      s: "Connected", d: "Payments · 7 currencies" },
                { n: "Sabre",       s: "Connected", d: "Codeshare with TK, LH, AF" },
                { n: "Salesforce",  s: "Connected", d: "Support tickets · 2-way" },
                { n: "Segment",     s: "Warning",   d: "Event volume down 18% · investigate" },
                { n: "Twilio",      s: "Off",       d: "SMS notifications · not configured" },
              ].map(it => (
                <div key={it.n} className="admin-integ-card">
                  <div className="admin-integ-icon">
                    <IcoSliders size={18} sw={1.6} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="admin-integ-name">{it.n}</span>
                      <span className={"admin-badge " + (
                        it.s === "Connected" ? "b-confirmed" :
                        it.s === "Warning"   ? "b-pending" :
                                               "b-cancelled"
                      )}>
                        <span className="dotb" />{it.s}
                      </span>
                    </div>
                    <div className="admin-integ-desc">{it.d}</div>
                  </div>
                  <button className="admin-more-btn"><IcoMore size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
