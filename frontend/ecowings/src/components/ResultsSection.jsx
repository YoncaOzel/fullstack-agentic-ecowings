import { useState } from "react";
import { Star, DollarSign, Zap, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import FlightCard from "./FlightCard";

const SORT_OPTIONS = [
  { key: "recommended", label: "Recommended", icon: <Star size={12} /> },
  { key: "cheapest",    label: "Cheapest",    icon: <DollarSign size={12} /> },
  { key: "fastest",     label: "Fastest",     icon: <Zap size={12} /> },
];

function SkeletonCard() {
  return (
    <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px", marginBottom: "12px", display: "flex", gap: "24px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="skeleton" style={{ width: "60px", height: "32px" }} />
          <div className="skeleton" style={{ flex: 1, height: "2px" }} />
          <div className="skeleton" style={{ width: "60px", height: "32px" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="skeleton" style={{ width: "60px", height: "32px" }} />
          <div className="skeleton" style={{ flex: 1, height: "2px" }} />
          <div className="skeleton" style={{ width: "60px", height: "32px" }} />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div className="skeleton" style={{ width: "100px", height: "22px", borderRadius: "20px" }} />
          <div className="skeleton" style={{ width: "88px",  height: "22px", borderRadius: "20px" }} />
        </div>
      </div>
      <div style={{ width: "1px", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ minWidth: "180px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="skeleton" style={{ width: "80px", height: "20px" }} />
        <div className="skeleton" style={{ width: "100px", height: "32px" }} />
        <div className="skeleton" style={{ width: "120px", height: "36px", borderRadius: "6px" }} />
      </div>
    </div>
  );
}

export default function ResultsSection({ flights, isLoading, error, sortBy, onSortChange, onRefresh, tripType }) {
  if (!isLoading && !error && flights.length === 0) return null;

  const parseDuration = d => { const h = parseInt(d?.match(/(\d+)h/)?.[1] || 0); const m = parseInt(d?.match(/(\d+)m/)?.[1] || 0); return h * 60 + m; };
  const sorted = [...flights].sort((a, b) => {
    if (sortBy === "cheapest") return a.price - b.price;
    if (sortBy === "fastest") return parseDuration(a.outbound.duration) - parseDuration(b.outbound.duration);
    return (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0);
  });

  return (
    <section style={{ paddingBottom: "60px", paddingTop: "24px" }} className="wrapper">
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "20px", padding: "12px 16px", background: "#0f0f1a", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#6b7280" }}>
          <SlidersHorizontal size={13} /><span>Filters</span>
        </div>
        <button onClick={onRefresh} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "5px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6b7280", cursor: "pointer", marginLeft: "4px" }}>
          <X size={11} />Clear all
        </button>
        <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
        {SORT_OPTIONS.map(opt => {
          const active = sortBy === opt.key;
          return (
            <button key={opt.key} onClick={() => onSortChange(opt.key)} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: active ? 600 : 400, letterSpacing: "0.2px", padding: "5px 12px", borderRadius: "6px", border: "none", background: active ? "rgba(245,166,35,0.1)" : "transparent", color: active ? "#f5a623" : "#9ca3af", cursor: "pointer", borderBottom: active ? "2px solid #f5a623" : "2px solid transparent", transition: "all 0.15s ease" }}>
              {opt.icon}{opt.label}
            </button>
          );
        })}
        <button onClick={onRefresh} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "5px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6b7280", cursor: "pointer", marginLeft: "auto" }}>
          <RefreshCw size={11} />Refresh
        </button>
      </div>

      {isLoading && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}

      {!isLoading && error && (
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>✈️</p>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#f87171", marginBottom: "6px" }}>Something went wrong</p>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>{error}</p>
          <button onClick={onRefresh} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#f5a623", color: "#08080f", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Try Again</button>
        </div>
      )}

      {!isLoading && !error && sorted.length > 0 && (
        <>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>{sorted.length} flight{sorted.length > 1 ? "s" : ""} found</p>
          {sorted.map(flight => <FlightCard key={flight.id} flight={flight} tripType={tripType} />)}
        </>
      )}
    </section>
  );
}
