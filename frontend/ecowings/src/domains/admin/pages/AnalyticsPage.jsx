import { useState, useEffect, useMemo } from 'react';
import { BookingsCancelChart, RevenueChart, SentimentDistChart } from '../components/Charts';
import { IcoDollar, IcoOrders, IcoUp } from '../components/Icons';
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

function fmtMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("12W");
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [bookingsByWeek, setBookingsByWeek] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

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
        setTotalRevenue(tickets.filter(t => t.isPaid).reduce((s, t) => s + Number(t.price ?? 0), 0));
        setTotalBookings(tickets.length);
      })
      .catch(() => {})
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

  const zeros = bookingsByWeek.map(() => 0);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">Insights</span>
          </div>
          <h1 className="admin-page-title">Analytics &amp; Reports</h1>
          <p className="admin-page-sub">
            Bookings, revenue and sentiment analysis from live data.
          </p>
        </div>
        <div className="admin-page-actions">
          <div className="admin-seg">
            {["4W", "12W", "YTD", "12M"].map(r => (
              <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-kpis">
        {[
          { label: "Revenue",  IconC: IcoDollar, value: fmtMoney(totalRevenue), cmp: "from paid bookings", accent: true },
          { label: "Bookings", IconC: IcoOrders, value: totalBookings.toLocaleString(), cmp: "total tickets" },
        ].map(k => (
          <div key={k.label} className={"admin-card admin-kpi" + (k.accent ? " accent" : "")}>
            <div className="lab">
              <span className="ico"><k.IconC size={14} sw={1.8} /></span>
              {k.label}
            </div>
            <div className="val">{k.value}</div>
            <div className="foot">
              <span className="admin-delta up"><IcoUp size={10} /></span>
              <span className="cmp">{k.cmp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings by week */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-h">
          <div>
            <h3>Bookings · last 12 weeks</h3>
            <div className="sub">Weekly confirmed booking count</div>
          </div>
          <div className="admin-chart-legend">
            <span className="k"><span className="sw" style={{ background: "#1B3D2F" }} />Bookings</span>
          </div>
        </div>
        <div className="admin-chart-wrap">
          {!analyticsLoading && bookingsByWeek.length > 0 && (
            <BookingsCancelChart bookings={bookingsByWeek} cancels={zeros} />
          )}
        </div>
        <div className="admin-card-foot">
          <span>
            Peak week:{" "}
            <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>
              {bookingsByWeek.length > 0 ? Math.max(...bookingsByWeek) : "—"} bookings
            </b>
          </span>
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
            Total:{" "}
            <b style={{ color: "var(--ink)", fontFamily: "'Plus Jakarta Sans'", fontWeight: 700 }}>{fmtMoney(totalRevenue)}</b>
          </span>
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
