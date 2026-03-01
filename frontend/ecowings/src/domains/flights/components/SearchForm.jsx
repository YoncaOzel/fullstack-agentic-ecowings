import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PlaneTakeoff, PlaneLanding, ArrowLeftRight, Calendar, Search, Users, ChevronDown } from "lucide-react";

const TRIP_TYPES = [
  { key: "one-way",     label: "ONE-WAY" },
  { key: "round-trip",  label: "ROUND-TRIP" },
  { key: "multi-city",  label: "MULTI-CITY" },
];

function FocusInput({ icon, label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", border: focused ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", boxShadow: focused ? "0 0 0 3px rgba(245,166,35,0.15)" : "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}>
        <span style={{ color: focused ? "#f5a623" : "#6b7280", flexShrink: 0, transition: "color 0.2s ease" }}>{icon}</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ background: "transparent", border: "none", outline: "none", color: "#f0f0f0", fontSize: "15px", width: "100%", fontFamily: "Inter, sans-serif" }}
        />
      </div>
    </div>
  );
}

function FocusDate({ label, selected, onChange, placeholder, minDate }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", border: focused ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", boxShadow: focused ? "0 0 0 3px rgba(245,166,35,0.15)" : "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}>
        <Calendar size={16} style={{ color: focused ? "#f5a623" : "#6b7280", flexShrink: 0, transition: "color 0.2s ease" }} />
        <DatePicker selected={selected} onChange={onChange} placeholderText={placeholder} dateFormat="MMM dd, yyyy" minDate={minDate || new Date()} onCalendarOpen={() => setFocused(true)} onCalendarClose={() => setFocused(false)} popperPlacement="bottom-start" />
      </div>
    </div>
  );
}

export default function SearchForm({ state, onTripTypeChange, onFromChange, onToChange, onSwap, onDepartureChange, onReturnChange, onTravelerChange, onCabinChange, onDirectOnlyChange, onSearch, error }) {
  const [travelerOpen, setTravelerOpen] = useState(false);
  const [cabinOpen, setCabinOpen]       = useState(false);
  const [searchHover, setSearchHover]   = useState(false);

  return (
    <div style={{ background: "rgba(15,15,26,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px 24px 24px" }} className="wrapper">

      {/* Row 1 — trip type + dropdowns */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        {/* Trip type */}
        <div style={{ display: "flex", gap: "8px" }}>
          {TRIP_TYPES.map(({ key, label }) => {
            const active = state.tripType === key;
            return (
              <button key={key} onClick={() => onTripTypeChange(key)} style={{ fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "20px", border: active ? "none" : "1.5px solid rgba(255,255,255,0.15)", background: active ? "#f5a623" : "transparent", color: active ? "#08080f" : "#9ca3af", cursor: "pointer", letterSpacing: "0.5px", transition: "all 0.2s ease" }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns */}
        <div style={{ display: "flex", gap: "8px", position: "relative" }}>
          {/* Traveller */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setTravelerOpen(!travelerOpen); setCabinOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "7px 14px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#9ca3af", cursor: "pointer" }}>
              <Users size={13} /><span>{state.travelerCount} Traveller{state.travelerCount > 1 ? "s" : ""}</span><ChevronDown size={12} />
            </button>
            {travelerOpen && (
              <div style={{ position: "absolute", top: "42px", right: 0, background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "16px", zIndex: 50, minWidth: "160px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ fontSize: "14px", color: "#f0f0f0" }}>Adults</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => onTravelerChange(Math.max(1, state.travelerCount - 1))} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.08)", color: "#f0f0f0", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f0", minWidth: "20px", textAlign: "center" }}>{state.travelerCount}</span>
                    <button onClick={() => onTravelerChange(Math.min(9, state.travelerCount + 1))} style={{ width: "28px", height: "28px", borderRadius: "50%", border: "none", background: "#f5a623", color: "#08080f", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cabin */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setCabinOpen(!cabinOpen); setTravelerOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "7px 14px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#9ca3af", cursor: "pointer" }}>
              <span>{state.cabinClass}</span><ChevronDown size={12} />
            </button>
            {cabinOpen && (
              <div style={{ position: "absolute", top: "42px", right: 0, background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden", zIndex: 50, minWidth: "140px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                {["Economy", "Business", "First Class"].map(cls => (
                  <button key={cls} onClick={() => { onCabinChange(cls); setCabinOpen(false); }} style={{ width: "100%", textAlign: "left", fontSize: "13px", padding: "10px 16px", border: "none", background: state.cabinClass === cls ? "rgba(245,166,35,0.12)" : "transparent", color: state.cabinClass === cls ? "#f5a623" : "#9ca3af", cursor: "pointer", transition: "background 0.15s" }}>
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 — inputs */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", flexWrap: "wrap" }}>
        <FocusInput icon={<PlaneTakeoff size={16} />} label="Flying From" value={state.flyingFrom} onChange={onFromChange} placeholder="City or airport" />

        <button onClick={onSwap} title="Swap cities"
          style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", background: "#f5a623", border: "none", color: "#08080f", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1px", transition: "transform 0.2s ease" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08) rotate(180deg)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}>
          <ArrowLeftRight size={15} />
        </button>

        <FocusInput icon={<PlaneLanding size={16} />} label="Flying To" value={state.flyingTo} onChange={onToChange} placeholder="City or airport" />

        <FocusDate label="Departure" selected={state.departureDate} onChange={onDepartureChange} placeholder="Select date" minDate={new Date()} />

        {state.tripType === "round-trip" && (
          <FocusDate label="Return" selected={state.returnDate} onChange={onReturnChange} placeholder="Select date" minDate={state.departureDate || new Date()} />
        )}

        {/* Search button */}
        <button onClick={onSearch} disabled={state.isLoading}
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "8px", border: "none", background: "#f5a623", color: "#08080f", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px", cursor: state.isLoading ? "not-allowed" : "pointer", opacity: state.isLoading ? 0.7 : 1, transition: "all 0.2s ease", transform: searchHover && !state.isLoading ? "scale(1.02)" : "scale(1)", filter: searchHover && !state.isLoading ? "brightness(1.1)" : "brightness(1)", marginBottom: "0" }}
          onMouseEnter={() => setSearchHover(true)} onMouseLeave={() => setSearchHover(false)}>
          <Search size={16} />
          {state.isLoading ? "Searching..." : "SEARCH"}
        </button>
      </div>

      {/* Direct flight + error */}
      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input type="checkbox" checked={state.directOnly} onChange={e => onDirectOnlyChange(e.target.checked)} style={{ accentColor: "#f5a623", width: "15px", height: "15px", cursor: "pointer" }} />
          <span style={{ fontSize: "13px", color: "#6b7280" }}>Show direct flights only</span>
        </label>
        {error && <p style={{ fontSize: "13px", color: "#f87171", fontWeight: 500 }}>⚠ {error}</p>}
      </div>
    </div>
  );
}
