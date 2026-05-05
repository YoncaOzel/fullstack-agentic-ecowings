import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  IcoDashboard, IcoOrders, IcoUsers, IcoChart, IcoSettings, IcoLeafBrand, IcoNetwork
} from './Icons';

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard",           Icon: IcoDashboard, count: null,  section: "overview" },
  { key: "orders",    label: "Flight Orders",       Icon: IcoOrders,    count: 128,   section: "operations" },
  { key: "users",     label: "User Management",     Icon: IcoUsers,     count: 42,    section: "operations" },
  { key: "network",   label: "Airlines & Airports", Icon: IcoNetwork,   count: null,  section: "operations" },
  { key: "analytics", label: "Analytics & Reports", Icon: IcoChart,     count: null,  section: "insights" },
  { key: "settings",  label: "Settings",            Icon: IcoSettings,  count: null,  section: "insights" },
];

export default function Sidebar({ active, onNav }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const sections = ["overview", "operations", "insights"];
  const sectionLabels = { overview: "Overview", operations: "Operations", insights: "Insights" };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <IcoLeafBrand />
        </div>
        <div>
          <div className="admin-brand-name">EcoWings</div>
          <div className="admin-brand-sub">Admin Portal</div>
        </div>
      </div>

      {sections.map(sec => {
        const items = NAV_ITEMS.filter(it => it.section === sec);
        return (
          <div key={sec}>
            <div className="admin-nav-section">{sectionLabels[sec]}</div>
            {items.map(it => (
              <button
                key={it.key}
                className={"admin-nav-item" + (active === it.key ? " active" : "")}
                onClick={() => onNav(it.key)}
              >
                <it.Icon sw={1.6} />
                {it.label}
                {it.count != null && (
                  <span className="nav-count">{it.count}</span>
                )}
              </button>
            ))}
          </div>
        );
      })}

      <div style={{ padding: '0 12px 8px' }}>
        <button
          className="admin-nav-item"
          onClick={handleLogout}
          style={{ color: '#e05252', width: '100%' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>

      <div className="admin-side-card">
        <div className="sc-title">Apr carbon goal</div>
        <div className="sc-desc">
          On track to save 4.6M kg CO₂ this month — 72% toward the Q2 milestone.
        </div>
        <div className="sc-bar"><span /></div>
        <div className="sc-meta">
          <span>3.32M kg</span>
          <span>4.60M kg</span>
        </div>
      </div>
    </aside>
  );
}
