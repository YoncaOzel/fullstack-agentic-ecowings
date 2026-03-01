export default function Hero() {
  return (
    <div style={{ position: "relative", width: "100%", minHeight: "380px", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <img
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&auto=format&fit=crop&q=80"
        alt="Luxury Flight"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }}
      />
      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,15,0.3), rgba(8,8,15,0.85))" }} />

      {/* Content */}
      <div className="wrapper" style={{ position: "relative", zIndex: 1, paddingTop: "60px", paddingBottom: "60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-1px", color: "#f0f0f0", lineHeight: 1.1 }}>
          Discover the World with{" "}
          <span style={{ color: "#f5a623", textShadow: "0 0 40px rgba(245,166,35,0.4)" }}>EcoWings</span>
        </h1>
        <p style={{ fontSize: "16px", color: "#9ca3af", marginTop: "12px", maxWidth: "480px" }}>
          Search and book flights to destinations worldwide — fast, simple, transparent.
        </p>
      </div>
    </div>
  );
}
