import { useMemo } from 'react';

// =========================================================
// Sparkline - simple line w/ area + end dot
// =========================================================
export function Sparkline({ data, w = 96, h = 32, stroke = "#2D6A4F", fill = "rgba(45,106,79,.14)" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = h - 2 - ((v - min) / range) * (h - 6);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const end = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: "visible" }}>
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={end[0]} cy={end[1]} r="2.4" fill={stroke} />
      <circle cx={end[0]} cy={end[1]} r="4.6" fill="none" stroke={stroke} strokeOpacity=".35" strokeWidth="1" />
    </svg>
  );
}

// =========================================================
// Revenue area chart - stacked (eco on top of standard)
// =========================================================
export function RevenueChart({ data }) {
  const W = 760, H = 280;
  const padL = 44, padR = 16, padT = 18, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxV = Math.ceil(Math.max(...data.map(d => d.total)) / 100) * 100;
  const yTicks = 5;

  const x = (i) => padL + (i / (data.length - 1)) * plotW;
  const y = (v) => padT + plotH - (v / maxV) * plotH;

  const pathFor = (key) =>
    data.map((d, i) => {
      const v = key === "standard" ? d.standard : d.standard + d.eco;
      return (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(v).toFixed(1);
    }).join(" ");

  const areaFor = (key) => {
    const top = pathFor(key);
    return `${top} L ${x(data.length - 1)} ${padT + plotH} L ${x(0)} ${padT + plotH} Z`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gStd" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7AAA8A" stopOpacity=".55"/>
          <stop offset="100%" stopColor="#7AAA8A" stopOpacity=".05"/>
        </linearGradient>
        <linearGradient id="gEco" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1B3D2F" stopOpacity=".32"/>
          <stop offset="100%" stopColor="#1B3D2F" stopOpacity=".02"/>
        </linearGradient>
      </defs>

      <g className="svg-grid">
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const yy = padT + (plotH * i) / yTicks;
          return <line key={i} x1={padL} x2={W - padR} y1={yy} y2={yy} />;
        })}
      </g>

      <g className="svg-axis">
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = maxV - (maxV * i) / yTicks;
          const yy = padT + (plotH * i) / yTicks;
          return <text key={i} x={padL - 8} y={yy + 3} textAnchor="end">${v}K</text>;
        })}
      </g>

      <path d={areaFor("eco_stacked")} fill="url(#gEco)" />
      <path d={areaFor("standard")} fill="url(#gStd)" />

      <path d={pathFor("eco_stacked")} fill="none" stroke="#1B3D2F" strokeWidth="1.8" />
      <path d={pathFor("standard")} fill="none" stroke="#2D6A4F" strokeWidth="1.4" opacity=".85"/>

      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.standard + d.eco)} r="3" fill="#fff" stroke="#1B3D2F" strokeWidth="1.6"/>
      ))}

      {(() => {
        const i = data.length - 1;
        const cy = y(data[i].standard + data[i].eco);
        return (
          <g>
            <line x1={x(i)} x2={x(i)} y1={padT} y2={padT + plotH} stroke="#1B3D2F" strokeWidth="1" strokeDasharray="3 3" opacity=".35"/>
            <g transform={`translate(${x(i)}, ${cy})`}>
              <rect x="-46" y="-34" width="92" height="24" rx="6" fill="#0E1F17"/>
              <text x="0" y="-18" textAnchor="middle" fill="#9CD2B5" fontFamily="DM Mono" fontSize="10">APR · TOTAL</text>
              <text x="0" y="-6" textAnchor="middle" fill="#fff" fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="12">$758K</text>
            </g>
          </g>
        );
      })()}

      <g className="svg-axis">
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle">{d.m.toUpperCase()}</text>
        ))}
      </g>
    </svg>
  );
}

// =========================================================
// Donut - distribution
// =========================================================
export function Donut({ data, size = 140, thickness = 16 }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.pct, 0) || 1;
  let offset = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F2" strokeWidth={thickness}/>
      {data.map((d, i) => {
        const len = (d.pct / total) * C;
        const el = (
          <circle key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={d.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

// =========================================================
// Bar chart (vertical columns)
// =========================================================
export function BarChart({ data, W = 620, H = 180, color = "#2D6A4F" }) {
  const padL = 36, padR = 12, padT = 12, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data);
  const bw = plotW / data.length - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <g className="svg-grid">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={W - padR} y1={padT + plotH * t} y2={padT + plotH * t}/>
        ))}
      </g>
      <g className="svg-axis">
        {[0, 0.5, 1].map((t, i) => {
          const v = Math.round(max * (1 - t));
          return <text key={i} x={padL - 8} y={padT + plotH * t + 3} textAnchor="end">{v}</text>;
        })}
      </g>
      {data.map((v, i) => {
        const h = (v / max) * plotH;
        const bx = padL + i * (plotW / data.length) + 3;
        const by = padT + plotH - h;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={h} rx="2" fill={color} opacity={i === data.length - 1 ? 1 : 0.85}/>
            <text x={bx + bw / 2} y={H - 6} textAnchor="middle" fontFamily="DM Mono" fontSize="9" fill="#6C8274">W{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// =========================================================
// Bookings vs cancellations - grouped bars
// =========================================================
export function BookingsCancelChart({ bookings, cancels }) {
  const W = 640, H = 200;
  const padL = 40, padR = 12, padT = 14, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...bookings);
  const n = bookings.length;
  const bw = (plotW / n) * 0.36;
  const gap = (plotW / n) * 0.07;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <g className="svg-grid">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={W - padR} y1={padT + plotH * t} y2={padT + plotH * t}/>
        ))}
      </g>
      <g className="svg-axis">
        {[0, 0.5, 1].map((t, i) => (
          <text key={i} x={padL - 8} y={padT + plotH * t + 3} textAnchor="end">{Math.round(max * (1 - t))}</text>
        ))}
      </g>
      {bookings.map((bv, i) => {
        const slotW = plotW / n;
        const slotX = padL + i * slotW;
        const bh = (bv / max) * plotH;
        const ch = (cancels[i] / max) * plotH;
        return (
          <g key={i}>
            <rect x={slotX + gap} y={padT + plotH - bh} width={bw} height={bh} rx="2" fill="#1B3D2F" opacity={i === n - 1 ? 1 : 0.85}/>
            <rect x={slotX + gap + bw + 3} y={padT + plotH - ch} width={bw} height={ch} rx="2" fill="#B23535" opacity="0.65"/>
            <text x={slotX + slotW / 2} y={H - 6} textAnchor="middle" fontFamily="DM Mono" fontSize="9" fill="#6C8274">W{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// =========================================================
// Horizontal bars
// =========================================================
export function HBars({ rows }) {
  const mx = Math.max(...rows.map(r => r.pct));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 20px 18px" }}>
      {rows.map(r => (
        <div key={r.region || r.name} style={{ display: "grid", gridTemplateColumns: "150px 1fr 80px", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{r.region || r.name}</span>
          <div style={{ height: 6, background: "#F1F5F2", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(r.pct / mx) * 100}%`, background: "linear-gradient(90deg,#2D6A4F,#4D7C5F)", borderRadius: 4 }}/>
          </div>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "var(--ink-2)", textAlign: "right" }}>{r.pct}% · {(r.n || 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// =========================================================
// Funnel
// =========================================================
export function Funnel({ rows }) {
  const mx = rows[0].n;
  return (
    <div style={{ padding: "4px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r, i) => {
        const pct = (r.n / mx) * 100;
        const convPct = i > 0 ? ((r.n / rows[i - 1].n) * 100).toFixed(1) : null;
        return (
          <div key={r.stage} style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 12, alignItems: "center" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{r.stage}</span>
            <div style={{ height: 28, background: "#F1F5F2", borderRadius: 6, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, width: `${pct}%`,
                background: `linear-gradient(90deg, rgba(27,61,47,${0.95 - i * 0.15}), rgba(45,106,79,${0.85 - i * 0.12}))`,
                borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px"
              }}>
                <span style={{ fontFamily: "DM Mono, monospace", color: "#fff", fontSize: 11.5, fontWeight: 500 }}>{r.n.toLocaleString()}</span>
              </div>
            </div>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: i === 0 ? "transparent" : "var(--ink-3)", whiteSpace: "nowrap" }}>
              {convPct ? `↳ ${convPct}%` : "--"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// =========================================================
// Sentiment distribution bar chart — 5 buckets (scores 2,4,6,8,10)
// data: [{ score: 2, count: N }, ...]
// =========================================================
export function SentimentDistChart({ data }) {
  const W = 640, H = 200;
  const padL = 44, padR = 16, padT = 20, padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data.map(d => d.count), 1);
  const labels = { 2: "Very Poor", 4: "Poor", 6: "Neutral", 8: "Good", 10: "Excellent" };
  const colors = { 2: "#B23535", 4: "#D97706", 6: "#92827A", 8: "#4A7C59", 10: "#1B3D2F" };
  const n = data.length;
  const slotW = plotW / n;
  const bw = slotW * 0.52;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <g className="svg-grid">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={W - padR} y1={padT + plotH * t} y2={padT + plotH * t} />
        ))}
      </g>
      <g className="svg-axis">
        {[0, 0.5, 1].map((t, i) => (
          <text key={i} x={padL - 8} y={padT + plotH * t + 3} textAnchor="end">
            {Math.round(max * (1 - t))}
          </text>
        ))}
      </g>
      {data.map((d, i) => {
        const bh = (d.count / max) * plotH;
        const bx = padL + i * slotW + (slotW - bw) / 2;
        const by = padT + plotH - bh;
        return (
          <g key={d.score}>
            <rect x={bx} y={by} width={bw} height={Math.max(bh, 2)} rx="4" fill={colors[d.score] ?? "#92827A"} opacity="0.9" />
            {d.count > 0 && (
              <text x={bx + bw / 2} y={by - 5} textAnchor="middle" fontFamily="DM Mono" fontSize="11" fill={colors[d.score] ?? "#92827A"} fontWeight="700">
                {d.count}
              </text>
            )}
            <text x={bx + bw / 2} y={H - 20} textAnchor="middle" fontFamily="DM Mono" fontSize="9" fill="#6C8274">
              {d.score}/10
            </text>
            <text x={bx + bw / 2} y={H - 8} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#6C8274">
              {labels[d.score] ?? ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// =========================================================
// Carbon line chart
// =========================================================
export function CarbonChart({ data }) {
  const W = 640, H = 160;
  const padL = 44, padR = 16, padT = 12, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data);
  const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];

  const x = (i) => padL + (i / (data.length - 1)) * plotW;
  const y = (v) => padT + plotH - (v / max) * plotH;

  const path = data.map((v, i) => (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const area = `${path} L ${x(data.length - 1)} ${padT + plotH} L ${x(0)} ${padT + plotH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="gCarbon" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2D6A4F" stopOpacity=".3"/>
          <stop offset="100%" stopColor="#2D6A4F" stopOpacity=".02"/>
        </linearGradient>
      </defs>
      <g className="svg-grid">
        {[0, 0.5, 1].map((t, i) => (
          <line key={i} x1={padL} x2={W - padR} y1={padT + plotH * t} y2={padT + plotH * t}/>
        ))}
      </g>
      <g className="svg-axis">
        {[0, 0.5, 1].map((t, i) => (
          <text key={i} x={padL - 8} y={padT + plotH * t + 3} textAnchor="end">{Math.round(max * (1 - t))}K</text>
        ))}
      </g>
      <path d={area} fill="url(#gCarbon)"/>
      <path d={path} fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#fff" stroke="#2D6A4F" strokeWidth="1.6"/>
      ))}
      <g className="svg-axis">
        {data.map((_, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle">{months[i]}</text>
        ))}
      </g>
    </svg>
  );
}
