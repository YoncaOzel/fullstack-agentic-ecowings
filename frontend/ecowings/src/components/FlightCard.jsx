import { useState } from "react";
import { Info } from "lucide-react";

function FlightSegment({ segment }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Departure */}
      <div style={{ textAlign: "right", minWidth: "60px" }}>
        <p style={{ fontSize: "28px", fontWeight: 700, color: "#f0f0f0", lineHeight: 1 }}>{segment.departureTime}</p>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#f5a623", letterSpacing: "1px", marginTop: "2px" }}>{segment.departureCode}</p>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{segment.departureDate}</p>
      </div>

      {/* Flight line */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>{segment.duration}</p>
        <div style={{ width: "100%", position: "relative", height: "16px", display: "flex", alignItems: "center" }}>
          {/* Dots */}
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f5a623", flexShrink: 0 }} />
          {/* Dashed line */}
          <div style={{ flex: 1, borderTop: "1px dashed rgba(255,255,255,0.2)", position: "relative" }}>
            {segment.stops > 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "8px", height: "8px", borderRadius: "50%", background: "#6b7280", border: "2px solid #0f0f1a" }} />
            )}
          </div>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f5a623", flexShrink: 0 }} />
        </div>
        <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
          {segment.stops === 0 ? "Non-stop" : `${segment.stops} stop${segment.stops > 1 ? "s" : ""}${segment.stopCodes?.length ? " / " + segment.stopCodes.join(", ") : ""}`}
        </p>
      </div>

      {/* Arrival */}
      <div style={{ textAlign: "left", minWidth: "60px" }}>
        <p style={{ fontSize: "28px", fontWeight: 700, color: "#f0f0f0", lineHeight: 1 }}>{segment.arrivalTime}</p>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#f5a623", letterSpacing: "1px", marginTop: "2px" }}>{segment.arrivalCode}</p>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{segment.arrivalDate}</p>
      </div>
    </div>
  );
}

export default function FlightCard({ flight, tripType }) {
  const [hovered, setHovered] = useState(false);
  const [chooseHover, setChooseHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#0f0f1a", border: hovered ? "1px solid rgba(245,166,35,0.3)" : "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "12px", transition: "all 0.25s ease", boxShadow: hovered ? "0 4px 24px rgba(245,166,35,0.08)" : "none", display: "flex", flexDirection: "row" }}
    >
      {/* Left panel */}
      <div style={{ flex: 1, padding: "24px" }}>
        <FlightSegment segment={flight.outbound} />

        {tripType === "round-trip" && flight.inbound && (
          <>
            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.08)", margin: "16px 0" }} />
            <FlightSegment segment={flight.inbound} />
          </>
        )}

        {/* Badges */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
          {flight.isRecommended && (
            <span style={{ background: "rgba(245,166,35,0.1)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600 }}>
              ★ Recommended
            </span>
          )}
          {flight.seatsLeft <= 5 && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 500 }}>
              <Info size={11} />{flight.seatsLeft} Seats Left
            </span>
          )}
        </div>
      </div>

      {/* Vertical divider */}
      <div style={{ width: "1px", background: "rgba(255,255,255,0.06)", alignSelf: "stretch" }} />

      {/* Right panel */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "12px", padding: "24px", paddingLeft: "24px", minWidth: "180px" }}>
        {/* Airline */}
        <div>
          <div style={{ minHeight: "32px", display: "flex", alignItems: "center" }}>
            {flight.airline.logo
              ? <img src={flight.airline.logo} alt={flight.airline.name} style={{ height: "28px", objectFit: "contain", maxWidth: "90px", opacity: 0.7, filter: "brightness(0) invert(1)" }} onError={e => e.target.style.display = "none"} />
              : null
            }
          </div>
          <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>{flight.airline.name}</p>
          <p style={{ fontSize: "11px", color: "#6b7280", letterSpacing: "0.5px", textTransform: "uppercase", marginTop: "2px" }}>Check It</p>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          <p style={{ fontSize: "26px", fontWeight: 800, color: "#f0f0f0", letterSpacing: "-0.5px" }}>
            {flight.currency} {flight.price.toLocaleString()}
          </p>
          <button
            onClick={() => console.log("Choose flight:", flight.id)}
            onMouseEnter={() => setChooseHover(true)}
            onMouseLeave={() => setChooseHover(false)}
            style={{ fontSize: "13px", fontWeight: 600, padding: "8px 20px", borderRadius: "6px", border: chooseHover ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.2)", background: "transparent", color: chooseHover ? "#f5a623" : "#f0f0f0", cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.3px" }}
          >
            CHOOSE IT
          </button>
        </div>
      </div>
    </div>
  );
}
