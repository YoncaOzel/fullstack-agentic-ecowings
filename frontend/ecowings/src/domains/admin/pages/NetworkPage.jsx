import { useState, useEffect, useMemo } from 'react';
import { IcoPlane, IcoGlobe, IcoNetwork, IcoExport, IcoUp, IcoSearch } from '../components/Icons';
import { getAllAirlines, getAllAirports } from '../services/adminApi';

const PAGE_SIZE = 15;

function initials(name) {
  return name.split(/[\s-]/).map(s => s[0]).slice(0, 2).join("").toUpperCase();
}

const AIRLINE_COLORS = [
  "#1B3D2F", "#2D6A4F", "#4A7C59", "#7AAA8A",
  "#A87217", "#D97706", "#6C8274", "#92827A",
];

function airlineColor(code) {
  let h = 0;
  for (let i = 0; i < (code?.length ?? 0); i++) h = (h * 31 + code.charCodeAt(i)) & 0xffff;
  return AIRLINE_COLORS[h % AIRLINE_COLORS.length];
}

function Pager({ page, total, onPrev, onNext }) {
  const pages = Math.ceil(total / PAGE_SIZE) || 1;
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="admin-btn admin-btn-ghost" style={{ padding: "6px 10px" }} onClick={onPrev} disabled={page === 1}>Prev</button>
      <button className="admin-btn admin-btn-ghost" style={{ padding: "6px 10px" }} onClick={onNext} disabled={page >= pages}>Next</button>
    </div>
  );
}

export default function NetworkPage() {
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [tab, setTab]           = useState("airlines");
  const [airlineQ, setAirlineQ] = useState("");
  const [airportQ, setAirportQ] = useState("");
  const [airlinePage, setAirlinePage] = useState(1);
  const [airportPage, setAirportPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getAllAirlines(), getAllAirports()])
      .then(([aRes, apRes]) => {
        if (aRes.status  === "fulfilled") setAirlines(Array.isArray(aRes.value)  ? aRes.value  : []);
        if (apRes.status === "fulfilled") setAirports(Array.isArray(apRes.value) ? apRes.value : []);
      })
      .catch(() => setError("Failed to load network data."))
      .finally(() => setLoading(false));
  }, []);

  const filteredAirlines = useMemo(() => {
    const q = airlineQ.toLowerCase();
    return !q ? airlines : airlines.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.airlineCode?.toLowerCase().includes(q) ||
      a.country?.toLowerCase().includes(q)
    );
  }, [airlines, airlineQ]);

  const filteredAirports = useMemo(() => {
    const q = airportQ.toLowerCase();
    return !q ? airports : airports.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.code?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q) ||
      a.country?.toLowerCase().includes(q)
    );
  }, [airports, airportQ]);

  // Reset to page 1 when search changes
  const handleAirlineQ = (v) => { setAirlineQ(v); setAirlinePage(1); };
  const handleAirportQ = (v) => { setAirportQ(v); setAirportPage(1); };

  const airlineRows = filteredAirlines.slice((airlinePage - 1) * PAGE_SIZE, airlinePage * PAGE_SIZE);
  const airportRows = filteredAirports.slice((airportPage - 1) * PAGE_SIZE, airportPage * PAGE_SIZE);

  const totalCountries = new Set([
    ...airlines.map(a => a.country),
    ...airports.map(a => a.country),
  ].filter(Boolean)).size;

  if (loading) return <div className="admin-page-head"><p style={{ color: "var(--ink-3)" }}>Loading network data…</p></div>;
  if (error)   return <div className="admin-page-head"><p style={{ color: "#B23535" }}>{error}</p></div>;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="admin-eyebrow">Network</span>
          </div>
          <h1 className="admin-page-title">Airlines &amp; Airports</h1>
          <p className="admin-page-sub">
            {airlines.length} airlines · {airports.length} airports · {totalCountries} countries in the EcoWings network.
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-ghost"><IcoExport size={14} /> Export</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="admin-kpis" style={{ marginBottom: 16 }}>
        {[
          { label: "Airlines",          IconC: IcoPlane,   value: airlines.length, cmp: `${new Set(airlines.map(a => a.country).filter(Boolean)).size} countries` },
          { label: "Airports",          IconC: IcoNetwork, value: airports.length, cmp: `${new Set(airports.map(a => a.country).filter(Boolean)).size} countries` },
          { label: "Countries covered", IconC: IcoGlobe,   value: totalCountries,  cmp: "combined reach" },
          { label: "Timezones",         IconC: IcoGlobe,   value: new Set(airports.map(a => a.timeZone).filter(Boolean)).size || "—", cmp: "across airport network" },
        ].map(k => (
          <div key={k.label} className="admin-card admin-kpi">
            <div className="lab"><span className="ico"><k.IconC size={14} sw={1.8} /></span>{k.label}</div>
            <div className="val">{k.value}</div>
            <div className="foot">
              <span className="admin-delta up"><IcoUp size={10} /></span>
              <span className="cmp">{k.cmp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabbed table card */}
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <div className="admin-card-h">
          <div className="admin-seg">
            <button className={tab === "airlines" ? "on" : ""} onClick={() => setTab("airlines")}>
              Airlines <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 11 }}>{airlines.length}</span>
            </button>
            <button className={tab === "airports" ? "on" : ""} onClick={() => setTab("airports")}>
              Airports <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 11 }}>{airports.length}</span>
            </button>
          </div>

          {tab === "airlines" ? (
            <div className="admin-inline-search">
              <IcoSearch sw={1.8} size={15} style={{ color: "var(--ink-3)" }} />
              <input
                placeholder="Search name, code or country"
                value={airlineQ}
                onChange={e => handleAirlineQ(e.target.value)}
              />
            </div>
          ) : (
            <div className="admin-inline-search">
              <IcoSearch sw={1.8} size={15} style={{ color: "var(--ink-3)" }} />
              <input
                placeholder="Search code, city, name or country"
                value={airportQ}
                onChange={e => handleAirportQ(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Airlines tab */}
        {tab === "airlines" && (
          <>
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Code</th>
                  <th>Airline</th>
                  <th style={{ width: 200 }}>Country</th>
                </tr>
              </thead>
              <tbody>
                {airlineRows.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--ink-3)", padding: "24px 0" }}>No airlines found.</td></tr>
                )}
                {airlineRows.map(a => {
                  const color = airlineColor(a.airlineCode);
                  return (
                    <tr key={a.id}>
                      <td>
                        <span style={{
                          display: "inline-block", background: color, color: "#fff",
                          borderRadius: 6, padding: "2px 8px",
                          fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em",
                        }}>
                          {a.airlineCode}
                        </span>
                      </td>
                      <td>
                        <div className="pax">
                          <div className="av" style={{ background: color, fontSize: 10 }}>{initials(a.name ?? "")}</div>
                          <div className="pn">{a.name}</div>
                        </div>
                      </td>
                      <td style={{ color: "var(--ink-2)", fontFamily: "DM Mono, monospace", fontSize: 12.5 }}>
                        {a.country ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="admin-card-foot">
              <span>
                Page {airlinePage} of {Math.ceil(filteredAirlines.length / PAGE_SIZE) || 1} · {filteredAirlines.length} airlines
              </span>
              <Pager
                page={airlinePage}
                total={filteredAirlines.length}
                onPrev={() => setAirlinePage(p => p - 1)}
                onNext={() => setAirlinePage(p => p + 1)}
              />
            </div>
          </>
        )}

        {/* Airports tab */}
        {tab === "airports" && (
          <>
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>IATA</th>
                  <th>Airport</th>
                  <th style={{ width: 140 }}>City</th>
                  <th style={{ width: 150 }}>Country</th>
                  <th style={{ width: 150 }}>Timezone</th>
                </tr>
              </thead>
              <tbody>
                {airportRows.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--ink-3)", padding: "24px 0" }}>No airports found.</td></tr>
                )}
                {airportRows.map(a => (
                  <tr key={a.id}>
                    <td>
                      <span style={{
                        display: "inline-block", background: "#EDF4EF", color: "#1B3D2F",
                        borderRadius: 6, padding: "2px 8px",
                        fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em",
                      }}>
                        {a.code}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, fontSize: 13.5, color: "var(--ink)" }}>
                      {a.name}
                    </td>
                    <td style={{ color: "var(--ink-2)", fontSize: 13 }}>{a.city ?? "—"}</td>
                    <td style={{ color: "var(--ink-2)", fontFamily: "DM Mono, monospace", fontSize: 12.5 }}>{a.country ?? "—"}</td>
                    <td style={{ color: "var(--ink-3)", fontFamily: "DM Mono, monospace", fontSize: 11.5 }}>{a.timeZone ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-card-foot">
              <span>
                Page {airportPage} of {Math.ceil(filteredAirports.length / PAGE_SIZE) || 1} · {filteredAirports.length} airports
              </span>
              <Pager
                page={airportPage}
                total={filteredAirports.length}
                onPrev={() => setAirportPage(p => p - 1)}
                onNext={() => setAirportPage(p => p + 1)}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
