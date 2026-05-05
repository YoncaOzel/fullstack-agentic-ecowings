export default function Feed({ rows }) {
  return (
    <div className="admin-feed">
      {rows.map((r, i) => (
        <div className="feed-row" key={i}>
          <div className={"fdot " + r.tone} />
          <div>
            <div className="ttl">{r.title}</div>
            <div className="fsub">{r.sub}</div>
          </div>
          <div className="ft">{r.t}</div>
        </div>
      ))}
    </div>
  );
}
