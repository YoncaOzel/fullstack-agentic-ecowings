import { useState, useEffect, useMemo } from 'react';
import { BookingsCancelChart, HBars, Funnel, CarbonChart, Donut, RevenueChart, SentimentDistChart } from '../components/Charts';
import {
  IcoDollar, IcoOrders, IcoLeaf, IcoGlobe,
  IcoExport, IcoPlus, IcoUp
} from '../components/Icons';
import {
  // TODO: replace with GET api/Analytics/cancellations-weekly when available — Ticket has no cancelled status field
  CANCEL_BY_WEEK,
  // TODO: replace with GET api/Analytics/cabin-mix when available — Ticket has no cabin/fare-class field
  CABIN_MIX,
  // TODO: replace with GET api/Analytics/geo-distribution when available — requires IATA→region mapping table
  GEO,
  // TODO: replace with GET api/Analytics/carbon-monthly when available
  CARBON_MONTHLY,
  // TODO: replace with GET api/Analytics/conversion-funnel when available
  DEVICE_FUNNEL
} from '../data/mockData';
import {
  getAllTickets,
  deriveRevenueMonthly,
  deriveBookingsByWeek,
  getReviews,
  predictSentiment,
} from '../services/adminApi';

function scoreColor(score) {
  const map = { 2: "#B23535", 4: "#D97706", 6: "#92827A", 8: "#4A7C59", 10: "#1B3D2F" };
  return map[score] ?? "#92827A";
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("12W");
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [bookingsByWeek, setBookingsByWeek] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [sentimentData, setSentimentData] = useState([]);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [sentimentError, setSentimentError] = useState(null);

  useEffect(() => {
    setAnalyticsLoading(true);
    getAllTickets()
      .then((data) => {
        const tickets = Array.isArray(data) ? data : [];
        setRevenueMonthly(deriveRevenueMonthly(tickets));
        setBookingsByWeek(deriveBookingsByWeek(tickets));
      })
      .catch(() => { /* silently keep empty state; charts will render with zeros */ })
      .finally(() => setAnalyticsLoading(false));
  }, []);

  useEffect(() => {
    setSentimentLoading(true);
    getReviews()
      .then((reviews) => {
        const arr = Array.isArray(reviews) ? reviews : [];
        return Promise.allSettled(
          arr.map((r) =>
            predictSentiment(r.comment).then((res) => ({
              ...r,
              predictedRating: res.predictedRating,
            }))
          )
        );
      })
      .then((results) => {
        const enriched = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);
        setSentimentData(enriched);
      })
      .catch(() => setSentimentError("ML servisi şu an erişilemiyor."))
      .finally(() => setSentimentLoading(false));
  }, []);

  const sentimentDist = useMemo(() => {
    const buckets = { 2: 0, 4: 0, 6: 0, 8: 0, 10: 0 };
    sentimentData.forEach((r) => {
      const s = r.predictedRating;
      if (buckets[s] !== undefined) buckets[s]++;
    });
    return Object.entries(buckets).map(([score, count]) => ({
      score: Number(score),
      count,
    }));
  }, [sentimentData]);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">Insights · Apr 19, 2026</span>
          </div>
          <h1 className="admin-page-title">Analytics &amp; Reports</h1>
          <p className="admin-page-sub">
            The full shape of EcoWings — bookings, revenue, network mix and sustainability impact.
          </p>
        </div>
        <div className="admin-page-actions">
          <div className="admin-seg">
            {["4W", "12W", "YTD", "12M"].map(r => (
              <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
          <button className="admin-btn admin-btn-ghost"><IcoExport size={14} /> Report PDF</button>
          <button className="admin-btn admin-btn-primary"><IcoPlus size={14} /> New report</button>
        </div>
      </div>

      <div className="admin-kpis" style={{ marginBottom: 16 }}>
        {[
          { label: "Revenue",       IconC: IcoDollar, value: "$4.82M", delta: "+12.4%", cmp: "vs. prior period", accent: true },
          { label: "Bookings",      IconC: IcoOrders, value: "4,812",  delta: "+9.2%",  cmp: "Avg 412 / week" },
          { label: "Carbon saved",  IconC: IcoLeaf,   value: "2.14M",  unit: " kg",     delta: "+18.9%", cmp: "≈ 94K trees / year" },
          { label: "Network reach", IconC: IcoGlobe,  value: "68",     delta: "+4",     cmp: "routes · 42 countries" },
        ].map(k => (
          <div key={k.label} className={"admin-card admin-kpi" + (k.accent ? " accent" : "")}>
            <div className="lab">
              <span className="ico"><k.IconC size={14} sw={1.8} /></span>
              {k.label}
            </div>
            <div className="val">{k.value}{k.unit && <span className="unit">{k.unit}</span>}</div>
            <div className="foot">
              <span className="admin-delta up"><IcoUp size={10} />{k.delta}</span>
              <span className="cmp">{k.cmp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings vs Cancellations */}
      <div className="admin-grid2" style={{ marginBottom: 16 }}>
        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Bookings vs cancellations · last 12 weeks</h3>
              <div className="sub">Weekly trend — confirmed bookings and refund volume</div>
            </div>
            <div className="admin-chart-legend">
              <span className="k"><span className="sw" style={{ background: "#1B3D2F" }} />Confirmed</span>
              <span className="k"><span className="sw" style={{ background: "#B23535", opacity: 0.7 }} />Cancelled</span>
            </div>
          </div>
          <div className="admin-chart-wrap">
            {!analyticsLoading && bookingsByWeek.length > 0 && (
              <BookingsCancelChart bookings={bookingsByWeek} cancels={CANCEL_BY_WEEK} />
            )}
          </div>
          <div className="admin-card-foot">
            <span>Peak week: <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>548 bookings</b> · W12</span>
            <a href="#">Full breakdown →</a>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Cabin mix</h3>
              <div className="sub">Booking distribution by fare class</div>
            </div>
          </div>
          <div className="admin-users-panel">
            <div className="admin-donut-wrap">
              <div className="admin-donut">
                <Donut data={CABIN_MIX} />
                <div className="centerv">
                  <div className="n">4.8K</div>
                  <div className="l">Bookings</div>
                </div>
              </div>
              <div className="admin-chan-list">
                {CABIN_MIX.map(c => (
                  <div className="admin-chan" key={c.name}>
                    <span className="sw2" style={{ background: c.color }} />
                    <span className="name">{c.name}</span>
                    <span className="n">{c.pct}%</span>
                    <div className="chan-bar">
                      <span style={{ width: c.pct + "%", background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="admin-card-foot">
            <span>Economy steady · Business +2.1 pp MoM</span>
            <a href="#">Revenue breakdown →</a>
          </div>
        </div>
      </div>

      {/* Revenue rolling 12M */}
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
          {!analyticsLoading && revenueMonthly.length > 0 && (
            <RevenueChart data={revenueMonthly} />
          )}
        </div>
        <div className="admin-card-foot">
          <span>
            <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>$6.92M</b>{" "}
            YTD — up 22.7% YoY
          </span>
          <a href="#">View forecast →</a>
        </div>
      </div>

      <div className="admin-grid2" style={{ marginBottom: 16 }}>
        {/* Geographic distribution */}
        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Geographic distribution</h3>
              <div className="sub">Bookings by region · last 30 days</div>
            </div>
          </div>
          <HBars rows={GEO} />
          <div className="admin-card-foot">
            <span>Europe leads · APAC growing fastest (+14% MoM)</span>
            <a href="#">Region detail →</a>
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="admin-card">
          <div className="admin-card-h">
            <div>
              <h3>Conversion funnel</h3>
              <div className="sub">Search to flight · last 30 days</div>
            </div>
          </div>
          <Funnel rows={DEVICE_FUNNEL} />
          <div className="admin-card-foot">
            <span>Overall conversion: <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>5.8%</b></span>
            <a href="#">Funnel detail →</a>
          </div>
        </div>
      </div>

      {/* Carbon trend */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-h">
          <div>
            <h3>Carbon savings · rolling 12 months</h3>
            <div className="sub">Thousand kg CO₂ saved vs. conventional aviation</div>
          </div>
          <span className="admin-eyebrow">Sustainability</span>
        </div>
        <div className="admin-chart-wrap">
          <CarbonChart data={CARBON_MONTHLY} />
        </div>
        <div className="admin-card-foot">
          <span>
            <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>1.63M kg</b>{" "}
            saved YTD · +18.9% YoY
          </span>
          <a href="#">Carbon report →</a>
        </div>
      </div>

      {/* ML Sentiment Analysis */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-h">
          <div>
            <h3>User Review Sentiment · ML Analysis</h3>
            <div className="sub">Predicted rating for each user comment — scored by BERT-based ONNX model</div>
          </div>
          <span className="admin-eyebrow">AI · {sentimentData.length} reviews</span>
        </div>

        <div className="admin-chart-wrap">
          {sentimentLoading && (
            <p style={{ color: "var(--ink-3)", padding: 24 }}>Running ML predictions…</p>
          )}
          {!sentimentLoading && !sentimentError && (
            <SentimentDistChart data={sentimentDist} />
          )}
          {sentimentError && (
            <p style={{ color: "#B23535", padding: 24 }}>{sentimentError}</p>
          )}
        </div>

        {!sentimentLoading && !sentimentError && sentimentData.length > 0 && (
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th>Airline</th>
                  <th>Comment</th>
                  <th>User Rating</th>
                  <th>ML Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sentimentData.map((r) => (
                  <tr key={r.id}>
                    <td>{r.airlineCode ?? "—"}</td>
                    <td style={{ maxWidth: 340, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.comment}
                    </td>
                    <td>
                      {"★".repeat(r.rating ?? 0)}{"☆".repeat(5 - (r.rating ?? 0))}
                    </td>
                    <td>
                      <span style={{
                        background: scoreColor(r.predictedRating),
                        color: "#fff",
                        borderRadius: 6,
                        padding: "2px 10px",
                        fontWeight: 700,
                        fontSize: 13,
                        display: "inline-block",
                      }}>
                        {r.predictedRating} / 10
                      </span>
                    </td>
                    <td>
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-card-foot">
          <span>
            Avg ML score:{" "}
            <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>
              {sentimentData.length
                ? (sentimentData.reduce((s, r) => s + r.predictedRating, 0) / sentimentData.length).toFixed(1)
                : "—"}
              {" "}/ 10
            </b>
          </span>
          <span>Model: BERT ONNX · scores: 2 / 4 / 6 / 8 / 10</span>
        </div>
      </div>
    </>
  );
}
