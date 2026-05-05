import { IcoMore } from './Icons';

function cabinClass(c) {
  const k = c.toLowerCase();
  if (k.includes("business")) return "business";
  if (k.includes("first"))    return "first";
  if (k.includes("premium"))  return "premium";
  return "";
}

function initials(name) {
  return name.split(" ").map(s => s[0]).slice(0, 2).join("");
}

export default function OrdersTable({ rows }) {
  return (
    <table className="admin-tbl">
      <thead>
        <tr>
          <th style={{ width: 160 }}>Order ID</th>
          <th>Passenger</th>
          <th style={{ width: 200 }}>Route</th>
          <th style={{ width: 140 }}>Departure</th>
          <th style={{ width: 140 }}>Cabin</th>
          <th style={{ width: 100 }}>Amount</th>
          <th style={{ width: 130 }}>Status</th>
          <th style={{ width: 36 }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="id">{r.id}</td>
            <td>
              <div className="pax">
                <div className="av">{initials(r.pax)}</div>
                <div>
                  <div className="pn">{r.pax}</div>
                  <div className="pe">{r.email}</div>
                </div>
              </div>
            </td>
            <td>
              <div className="admin-route">
                <span>{r.from}</span>
                <span className="arrow">→</span>
                <span>{r.to}</span>
                <span className="city">{r.fromC.split("—")[1]?.trim()}</span>
              </div>
            </td>
            <td>
              <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 12.5, color: "var(--ink)" }}>
                {r.date.split(",")[0]}
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>
                {r.time} · UTC+3
              </div>
            </td>
            <td>
              <span className={"admin-cabin " + cabinClass(r.cabin)}>
                <span className="tick" />
                {r.cabin}
              </span>
            </td>
            <td className="mono" style={{ color: "var(--ink)", fontWeight: 500 }}>
              ${r.amount.toLocaleString()}
            </td>
            <td>
              <span className={"admin-badge " + (
                r.status === "Confirmed" ? "b-confirmed" :
                r.status === "Pending"   ? "b-pending" :
                                           "b-cancelled"
              )}>
                <span className="dotb" />{r.status}
              </span>
            </td>
            <td style={{ textAlign: "right" }}>
              <button className="admin-more-btn">
                <IcoMore size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
