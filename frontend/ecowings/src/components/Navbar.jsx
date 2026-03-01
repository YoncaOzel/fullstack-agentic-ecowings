import { useState } from "react";
import { Plane, Phone, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Services", href: "#" },
  { label: "Our Fleet", href: "#" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: "rgba(8,8,15,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 100, width: "100%" }}>
      <div className="wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, textDecoration: "none" }}>
          <span style={{ background: "#f5a623", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane size={17} color="#08080f" strokeWidth={2.5} />
          </span>
          <span style={{ fontWeight: 800, fontSize: "18px", lineHeight: 1, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#f5a623" }}>Eco</span>
            <span style={{ color: "#f0f0f0" }}>Wings</span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul style={{ display: "flex", alignItems: "center", gap: "40px", listStyle: "none", position: "absolute", left: "50%", transform: "translateX(-50%)" }} className="nav-desktop">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="nav-link" style={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af", letterSpacing: "0.3px", transition: "color 0.2s ease" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f0f0f0"}
                onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
          <a href="tel:+351917184407" className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
            <Phone size={13} /><span>(+351) 917 184 407</span>
          </a>
          <a href="#" className="nav-desktop your-flights-btn" style={{ fontSize: "13px", fontWeight: 600, padding: "8px 20px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.3)", color: "#f0f0f0", transition: "border-color 0.2s ease" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#ffffff"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}>
            Your Flights
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="nav-mobile" style={{ background: "transparent", border: "none", color: "#f0f0f0", cursor: "pointer", padding: "4px", display: "none" }} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: "#08080f", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px 20px" }}>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
            {NAV_LINKS.map((l) => (
              <li key={l.label}><a href={l.href} style={{ fontSize: "14px", color: "#9ca3af" }} onClick={() => setMenuOpen(false)}>{l.label}</a></li>
            ))}
          </ul>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <a href="tel:+351917184407" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}><Phone size={13} /><span>(+351) 917 184 407</span></a>
            <a href="#" style={{ fontSize: "13px", fontWeight: 600, padding: "8px 20px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.3)", color: "#f0f0f0", textAlign: "center" }}>Your Flights</a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
