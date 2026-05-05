import { Donut } from './Charts';

export default function UsersPanel({ channels }) {
  const total = channels.reduce((s, c) => s + c.n, 0);
  return (
    <div className="admin-users-panel">
      <div className="admin-donut-wrap">
        <div className="admin-donut">
          <Donut data={channels} />
          <div className="centerv">
            <div className="n">{(total / 1000).toFixed(1)}K</div>
            <div className="l">Active users</div>
          </div>
        </div>
        <div className="admin-chan-list">
          {channels.map((c) => (
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
  );
}
