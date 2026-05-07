import { useState, useEffect } from 'react';
import KpiCard from '../components/KpiCard';
import OrdersTable from '../components/OrdersTable';
import RoutesPanel from '../components/RoutesPanel';
import { RevenueChart } from '../components/Charts';
import { IcoDollar, IcoPlane } from '../components/Icons';
import {
  getAllTickets, mapTicketToOrder,
  deriveRevenueMonthly, deriveRevenueSparkline, deriveFlightsSparkline, deriveTopRoutes,
} from '../services/adminApi';

function fmtMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

export default function DashboardPage() {
  const [range, setRange] = useState("12M");
  const [filter, setFilter] = useState("All");
  const [orders, setOrders]         = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [sparkRevenue, setSparkRevenue]     = useState([0, 0]);
  const [sparkFlights, setSparkFlights]     = useState([0, 0]);
  const [routesTop, setRoutesTop]           = useState([]);
  const [totalRevenue, setTotalRevenue]     = useState(0);

  useEffect(() => {
    setOrdersLoading(true);
    getAllTickets()
      .then((data) => {
        const tickets = Array.isArray(data) ? data : [];
        const mapped = tickets.map(mapTicketToOrder);
        setOrders(mapped);
        setRevenueMonthly(deriveRevenueMonthly(tickets));
        setSparkRevenue(deriveRevenueSparkline(tickets));
        setSparkFlights(deriveFlightsSparkline(tickets));
        setRoutesTop(deriveTopRoutes(tickets));
        setTotalRevenue(mapped.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.amount, 0));
      })
      .catch(() => {})
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

  const confirmedCount = orders.filter(o => o.status === "Confirmed").length;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="admin-eyebrow">Operations</span>
          </div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">
            {ordersLoading ? "Loading…" : `${orders.length} total bookings · ${counts.Confirmed} confirmed · ${counts.Pending} pending`}
          </p>
        </div>
        <div className="admin-page-actions">
          <div className="admin-seg">
            {["24H", "7D", "30D", "12M"].map(r => (
              <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-kpis">
        <KpiCard label="Total revenue"        value={fmtMoney(totalRevenue)} delta={null} cmp={`${confirmedCount} confirmed bookings`} spark={sparkRevenue} sparkColor="#1B3D2F" IconC={IcoDollar} accent />
        <KpiCard label="Flights booked" value={String(orders.length)} delta={null} cmp={`${counts.Pending} pending`} spark={sparkFlights} sparkColor="#2D6A4F" IconC={IcoPlane} />
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
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
            <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>{fmtMoney(totalRevenue)}</b>
            {" "}total revenue
          </span>
        </div>
      </div>

      <div className="admin-grid2b">
        <div className="admin-card" style={{ overflow: "hidden" }}>
          <div className="admin-card-h">
            <div>
              <h3>Recent orders</h3>
              <div className="sub">Latest 8 bookings across the network · live</div>
            </div>
          </div>
          <div className="admin-filters">
            {["All", "Confirmed", "Pending"].map(f => (
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

        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Top routes</h3>
              <div className="sub">By booking volume</div>
            </div>
          </div>
          <RoutesPanel rows={routesTop} />
        </div>
      </div>
    </>
  );
}
