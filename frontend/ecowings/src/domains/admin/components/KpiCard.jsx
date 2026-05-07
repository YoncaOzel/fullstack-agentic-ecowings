import { IcoUp, IcoDown } from './Icons';
import { Sparkline } from './Charts';

export default function KpiCard({ label, value, unit, delta, cmp, spark, sparkColor, IconC, accent }) {
  const hasDelta = delta != null;
  const up = delta >= 0;
  return (
    <div className={"admin-card admin-kpi" + (accent ? " accent" : "")}>
      <div className="lab">
        <span className="ico">
          <IconC size={14} sw={1.8} />
        </span>
        {label}
      </div>
      <div className="spark">
        <Sparkline
          data={spark}
          stroke={sparkColor || "#2D6A4F"}
          fill={accent ? "rgba(156,210,181,.18)" : "rgba(45,106,79,.12)"}
        />
      </div>
      <div className="val">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="foot">
        {hasDelta && (
          <span className={"admin-delta " + (up ? "up" : "down")}>
            {up ? <IcoUp size={10} /> : <IcoDown size={10} />}
            {up ? "+" : ""}{delta}%
          </span>
        )}
        <span className="cmp">{cmp}</span>
      </div>
    </div>
  );
}
