import { Plane, Phone } from "lucide-react";

const CERTS = [
  
];

const NAV_LINKS = [
  { label: "Home",     href: "#" },
  { label: "About Us", href: "#" },
  { label: "Services", href: "#" },
  { label: "Our Fleet",href: "#" },
];

export default function Footer() {
  return (
    <footer>
      {/* Upper — accreditation */}
      

      {/* Lower — dark */}
      <div style={{ background: "#08080f", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0" }}>
        <div className="wrapper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: "#f5a623", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plane size={15} color="#08080f" strokeWidth={2.5} />
            </span>
            <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.5px" }}>
              <span style={{ color: "#f5a623" }}>Eco</span><span style={{ color: "#f0f0f0" }}>Wings</span>
            </span>
          </a>

          <ul style={{ display: "flex", gap: "28px", listStyle: "none", flexWrap: "wrap" }}>
            {NAV_LINKS.map(l => (
              <li key={l.label}>
                <a href={l.href} style={{ fontSize: "13px", color: "#6b7280", transition: "color 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f0f0f0"}
                  onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>{l.label}</a>
              </li>
            ))}
          </ul>

          <a href="tel:+351917184407" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
            <Phone size={13} /><span>(+351) 917 184 407</span>
          </a>
        </div>

        <div className="wrapper" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "12px", color: "#374151", textAlign: "center" }}>© {new Date().getFullYear()} EcoWings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
