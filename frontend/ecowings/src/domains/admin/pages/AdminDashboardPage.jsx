import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DashboardPage from './DashboardPage';
import FlightOrdersPage from './FlightOrdersPage';
import UserManagementPage from './UserManagementPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import NetworkPage from './NetworkPage';
import '../styles/admin.css';

const PAGES = {
  dashboard: <DashboardPage />,
  orders:    <FlightOrdersPage />,
  users:     <UserManagementPage />,
  network:   <NetworkPage />,
  analytics: <AnalyticsPage />,
  settings:  <SettingsPage />,
};

export default function AdminDashboardPage() {
  const [active, setActive] = useState(() => {
    try { return localStorage.getItem("ew_admin_page") || "dashboard"; }
    catch { return "dashboard"; }
  });

  useEffect(() => {
    try { localStorage.setItem("ew_admin_page", active); }
    catch {}
    window.scrollTo(0, 0);
  }, [active]);

  const handleNav = (page) => {
    setActive(page);
  };

  return (
    <div className="admin-root">
      <div className="admin-app">
        <Sidebar active={active} onNav={handleNav} />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar active={active} />
          <div className="admin-page" key={active}>
            {PAGES[active] || PAGES.dashboard}
          </div>
        </div>
      </div>
    </div>
  );
}
