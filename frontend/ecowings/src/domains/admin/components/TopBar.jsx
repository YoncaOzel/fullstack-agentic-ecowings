import { IcoSearch, IcoBell, IcoMsg, IcoHelp, IcoChevron } from './Icons';

const LABELS = {
  dashboard: "Dashboard",
  orders:    "Flight Orders",
  users:     "User Management",
  analytics: "Analytics & Reports",
  settings:  "Settings",
};

export default function TopBar({ active, onAvatarClick }) {
  return (
    <div className="admin-topbar">
      <div className="crumbs">
        <span>EcoWings</span>
        <IcoChevron size={13} sw={2} style={{ transform: "rotate(-90deg)", opacity: 0.5 }} />
        <b>{LABELS[active] || "Dashboard"}</b>
      </div>

      <div className="admin-search">
        <IcoSearch sw={1.8} size={16} style={{ color: "var(--ink-3)" }} />
        <input placeholder="Search orders, passengers, routes or airports" />
        <span className="kbd">⌘K</span>
      </div>

      <div className="rail">
        <button className="admin-icon-btn" title="Notifications">
          <IcoBell />
          <span className="dot" />
        </button>
        <button className="admin-icon-btn" title="Messages">
          <IcoMsg />
        </button>
        <button className="admin-icon-btn" title="Help">
          <IcoHelp />
        </button>

        <div className="admin-divider-v" />

        <button className="admin-who" onClick={onAvatarClick} title="Profile">
          <div className="who-avatar">BD</div>
          <div>
            <div className="who-name">Batur Dinçer</div>
            <div className="who-role">Admin · Istanbul HQ</div>
          </div>
          <IcoChevron size={14} style={{ color: "var(--ink-3)" }} />
        </button>
      </div>
    </div>
  );
}
