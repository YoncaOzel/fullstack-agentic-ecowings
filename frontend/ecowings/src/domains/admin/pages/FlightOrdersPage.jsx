import { useState, useEffect } from 'react';
import OrdersTable from '../components/OrdersTable';
import { IcoOrders, IcoDollar, IcoTicket, IcoPlane, IcoFilter, IcoExport, IcoPlus, IcoSearch, IcoUp, IcoDown } from '../components/Icons';
import { getAllTickets, mapTicketToOrder } from '../services/adminApi';

function MiniKpi({ label, IconC, value, delta, up, cmp }) {
  return (
    <div className="admin-card admin-kpi">
      <div className="lab">
        <span className="ico"><IconC size={14} sw={1.8} /></span>
        {label}
      </div>
      <div className="val">{value}</div>
      <div className="foot">
        <span className={"admin-delta " + (up ? "up" : "down")}>
          {up ? <IcoUp size={10} /> : <IcoDown size={10} />}
          {delta}
        </span>
        <span className="cmp">{cmp}</span>
      </div>
    </div>
  );
}

export default function FlightOrdersPage() {
  const [filter, setFilter]   = useState("All");
  const [cabin, setCabin]     = useState("All");
  const [q, setQ]             = useState("");
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllTickets()
      .then((data) => {
        const rows = Array.isArray(data) ? data.map(mapTicketToOrder) : [];
        setOrders(rows);
      })
      .catch(() => setError("Failed to load flight orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page-head"><p style={{ color: "var(--ink-3)" }}>Loading orders…</p></div>;
  if (error)   return <div className="admin-page-head"><p style={{ color: "#B23535" }}>{error}</p></div>;

  const filtered = orders.filter(o => {
    if (filter !== "All" && o.status !== filter) return false;
    if (cabin === "Economy"   && !o.cabin.toLowerCase().includes("economy"))  return false;
    if (cabin === "Premium"   && !o.cabin.toLowerCase().includes("premium"))  return false;
    if (cabin === "Business"  && !o.cabin.toLowerCase().includes("business")) return false;
    if (cabin === "First"     && !o.cabin.toLowerCase().includes("first"))    return false;
    if (q && !(
      o.pax.toLowerCase().includes(q.toLowerCase()) ||
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      o.fromC.toLowerCase().includes(q.toLowerCase())
    )) return false;
    return true;
  });

  const counts = {
    All:       orders.length,
    Confirmed: orders.filter(o => o.status === "Confirmed").length,
    Pending:   orders.filter(o => o.status === "Pending").length,
    Cancelled: orders.filter(o => o.status === "Cancelled").length,
  };

  const totalRev = filtered.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.amount, 0);

  const today = new Date().toDateString();
  const ordersToday = orders.filter(o => new Date(o.date).toDateString() === today || o.date === "").length;
  const paidOrders  = orders.filter(o => o.status === "Confirmed");
  const grossTotal  = paidOrders.reduce((s, o) => s + o.amount, 0);
  const avgPerBooking = paidOrders.length > 0 ? Math.round(grossTotal / paidOrders.length) : 0;
  const pendingCount  = orders.filter(o => o.status === "Pending").length;

  const fmtMoney = (n) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">Operations</span>
          </div>
          <h1 className="admin-page-title">Flight Orders</h1>
          <p className="admin-page-sub">
            Every booking flowing through the EcoWings network. {orders.length} total · {pendingCount} pending.
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-ghost"><IcoFilter size={14} /> Advanced</button>
          <button className="admin-btn admin-btn-ghost"><IcoExport size={14} /> Export CSV</button>
          <button className="admin-btn admin-btn-primary"><IcoPlus size={14} /> New order</button>
        </div>
      </div>

      <div className="admin-kpis" style={{ marginBottom: 16 }}>
        <MiniKpi label="Total orders"      IconC={IcoOrders} value={orders.length.toLocaleString()} delta="" up cmp={`${pendingCount} pending`} />
        <MiniKpi label="Gross value"       IconC={IcoDollar} value={fmtMoney(grossTotal)} delta="" up cmp={`Avg ${fmtMoney(avgPerBooking)} / booking`} />
        <MiniKpi label="Pending review"    IconC={IcoTicket} value={pendingCount.toString()} delta="" up={false} cmp="Awaiting payment" />
        {/* TODO: Cancellation rate requires a cancelled status field on Ticket — currently not available */}
        <MiniKpi label="Confirmed orders"  IconC={IcoPlane}  value={paidOrders.length.toLocaleString()} delta="" up cmp={`of ${orders.length} total`} />
      </div>

      <div className="admin-card" style={{ overflow: "hidden" }}>
        <div className="admin-card-h">
          <div>
            <h3>All orders</h3>
            <div className="sub">
              Filtered view · {filtered.length} of {orders.length} · ${totalRev.toLocaleString()} net
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="admin-inline-search">
              <IcoSearch sw={1.8} size={15} style={{ color: "var(--ink-3)" }} />
              <input
                placeholder="Search by ID, passenger or route"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <div className="admin-pillseg">
              {["All", "Economy", "Premium", "Business", "First"].map(c => (
                <button key={c} className={cabin === c ? "on" : ""} onClick={() => setCabin(c)}>{c}</button>
              ))}
            </div>
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
          <span>Page 1 of {Math.ceil(orders.length / 15) || 1} · {orders.length} orders total</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="admin-btn admin-btn-ghost" style={{ padding: "6px 10px" }}>Prev</button>
            <button className="admin-btn admin-btn-ghost" style={{ padding: "6px 10px" }}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
