import { useState, useEffect } from 'react';
import KpiCard from '../components/KpiCard';
import OrdersTable from '../components/OrdersTable';
import UsersPanel from '../components/UsersPanel';
import RoutesPanel from '../components/RoutesPanel';
import Feed from '../components/Feed';
import { RevenueChart } from '../components/Charts';
import {
  IcoDollar, IcoUsers, IcoPlane, IcoLeaf,
  IcoCalendar, IcoExport, IcoPlus, IcoFilter, IcoMore
} from '../components/Icons';
import {
  // TODO: connect to analytics endpoint — no aggregate stats endpoint exists yet
  SPARK_USERS, SPARK_CARBON,
  // TODO: connect to channel analytics endpoint — no channel breakdown endpoint exists yet
  CHANNELS,
  // TODO: connect to real-time activity feed — no live-feed endpoint exists yet
  FEED
} from '../data/mockData';
import {
  getAllTickets, mapTicketToOrder,
  deriveRevenueMonthly, deriveRevenueSparkline, deriveFlightsSparkline, deriveTopRoutes,
} from '../services/adminApi';

export default function DashboardPage() {
  const [range, setRange] = useState("12M");
  const [filter, setFilter] = useState("All");
  const [orders, setOrders]         = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [sparkRevenue, setSparkRevenue]     = useState([0, 0]);
  const [sparkFlights, setSparkFlights]     = useState([0, 0]);
  const [routesTop, setRoutesTop]           = useState([]);

  useEffect(() => {
    setOrdersLoading(true);
    getAllTickets()
      .then((data) => {
        const tickets = Array.isArray(data) ? data : [];
        setOrders(tickets.map(mapTicketToOrder));
        setRevenueMonthly(deriveRevenueMonthly(tickets));
        setSparkRevenue(deriveRevenueSparkline(tickets));
        setSparkFlights(deriveFlightsSparkline(tickets));
        setRoutesTop(deriveTopRoutes(tickets));
      })
      .catch(() => { /* silently keep empty state; charts will render with zeros */ })
      .finally(() => setOrdersLoading(false));
  }, []);

  const filtered = filter === "All"
    ? orders.slice(0, 8)
    : orders.filter(o => o.status === filter).slice(0, 8);

  const counts = {
    All:       orders.length,
    Confirmed: orders.filter(o => o.status === "Confirmed").length,
    Pending:   orders.filter(o => o.status === "Pending").length,
    Cancelled: orders.filter(o => o.status === "Cancelled").length,
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="admin-eyebrow">Operations · Apr 19, 2026</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>Last sync 14s ago</span>
          </div>
          <h1 className="admin-page-title">Good morning, Batur.</h1>
          <p className="admin-page-sub">
            Here's the EcoWings network at a glance — 342 flights in the air right now across 68 routes.
          </p>
        </div>
        <div className="admin-page-actions">
          <div className="admin-seg">
            {["24H", "7D", "30D", "12M"].map(r => (
              <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
          <button className="admin-btn admin-btn-ghost">
            <IcoCalendar size={14} /> Apr 19, 2026
          </button>
          <button className="admin-btn admin-btn-ghost">
            <IcoExport size={14} /> Export
          </button>
          <button className="admin-btn admin-btn-primary">
            <IcoPlus size={14} /> New order
          </button>
        </div>
      </div>

      <div className="admin-kpis">
        <KpiCard label="Total revenue"        value="$4.82M" delta={12.4} cmp="vs. $4.29M last month"   spark={sparkRevenue} sparkColor="#1B3D2F" IconC={IcoDollar} accent />
        <KpiCard label="Active users"         value="28,412" delta={8.1}  cmp="5,134 new this week"     spark={SPARK_USERS}   sparkColor="#2D6A4F" IconC={IcoUsers} />
        <KpiCard label="Flights booked today" value="1,284"  delta={3.6}  cmp="342 currently in-flight" spark={sparkFlights} sparkColor="#2D6A4F" IconC={IcoPlane} />
        <KpiCard label="Carbon saved"         value="184,296" unit=" kg CO₂" delta={18.9} cmp="≈ 8,104 trees / month" spark={SPARK_CARBON} sparkColor="#2D6A4F" IconC={IcoLeaf} />
      </div>

      <div className="admin-grid2">
        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Revenue · rolling 12 months</h3>
              <div className="sub">Stacked by cabin family — Eco tiers vs. Standard tiers</div>
            </div>
            <div className="admin-chart-legend">
              <span className="k"><span className="sw" style={{ background: "#1B3D2F" }} />Eco &amp; Premium Eco</span>
              <span className="k"><span className="sw" style={{ background: "#7AAA8A" }} />Economy &amp; Business</span>
            </div>
          </div>
          <div className="admin-chart-wrap">
            {!ordersLoading && revenueMonthly.length > 0 && (
              <RevenueChart data={revenueMonthly} />
            )}
          </div>
          <div className="admin-card-foot">
            <span>
              <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>$6.92M</b>
              {" "}YTD — up 22.7% YoY
            </span>
            <a href="#">View forecast →</a>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Active users by channel</h3>
              <div className="sub">Last 30 days · authenticated sessions</div>
            </div>
            <button className="admin-more-btn"><IcoMore size={16} /></button>
          </div>
          <UsersPanel channels={CHANNELS} />
          <div className="admin-card-foot">
            <span>Mobile leads again — +4.2 pp MoM</span>
            <a href="#">Breakdown →</a>
          </div>
        </div>
      </div>

      <div className="admin-grid2b">
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div className="admin-card-h">
            <div>
              <h3>Recent orders</h3>
              <div className="sub">Latest 8 bookings across the network · live</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="admin-btn admin-btn-ghost" style={{ padding: "7px 10px" }}>
                <IcoFilter size={14} /> Filter
              </button>
              <button className="admin-btn admin-btn-ghost" style={{ padding: "7px 10px" }}>
                <IcoExport size={14} /> CSV
              </button>
            </div>
          </div>
          <div className="admin-filters">
            {["All", "Confirmed", "Pending", "Cancelled"].map(f => (
              <button key={f} className={"admin-chip " + (filter === f ? "on" : "")} onClick={() => setFilter(f)}>
                {f}<span className="c">{counts[f]}</span>
              </button>
            ))}
          </div>
          <OrdersTable rows={filtered} />
          <div className="admin-card-foot">
            <span>{ordersLoading ? "Loading orders…" : `Showing ${filtered.length} of ${orders.length} orders`}</span>
            <a href="#">Open flight orders →</a>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-card">
            <div className="admin-card-h">
              <div>
                <h3>Top routes this week</h3>
                <div className="sub">By booking volume · Apr 13 – Apr 19</div>
              </div>
              <button className="admin-more-btn"><IcoMore size={16} /></button>
            </div>
            <RoutesPanel rows={routesTop} />
          </div>

          <div className="admin-card">
            <div className="admin-card-h">
              <div>
                <h3>Live activity</h3>
                <div className="sub">Auto-refreshes every 30 seconds</div>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 11,
                color: "var(--green)"
              }}>
                <span className="admin-live-dot" />Live
              </span>
            </div>
            <Feed rows={FEED} />
          </div>
        </div>
      </div>

      <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center", marginTop: 24 }}>
        EcoWings · Internal tooling · v4.19 · All amounts in USD · Data refreshed 14s ago
      </div>
    </>
  );
}
