export default function RoutesPanel({ rows }) {
  return (
    <div className="admin-strip">
      {rows.map((r) => (
        <div className="admin-route-row" key={r.pair}>
          <span className="pair">{r.pair}</span>
          <div className="rbar">
            <span style={{ width: r.pct + "%" }} />
          </div>
          <span className="rval">{r.n} bk</span>
        </div>
      ))}
    </div>
  );
}
