import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Subtle dot grid background
const DotGrid = () => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.5" fill="#d1e8da" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

// Floating stat pill
const StatPill = ({ value, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      background: "#fff",
      border: "1px solid #e4ede8",
      borderRadius: "12px",
      padding: "12px 20px",
      boxShadow: "0 2px 8px rgba(77,124,95,0.07)",
    }}
  >
    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4d7c5f", lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {value}
    </span>
    <span style={{ fontSize: "0.7rem", color: "#8aab96", fontWeight: 500, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </span>
  </motion.div>
);

export function ScrollFlyIn({ children, imageUrl, imageAlt = "Animated image", style, className, stats }) {
  const containerRef = React.useRef(null);
  const [screenW, setScreenW] = React.useState(1440);

  React.useEffect(() => {
    setScreenW(window.innerWidth);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0.1, 0.4, 0.6, 0.8],
    [`-${screenW * 1.3}px`, "0px", "0px", `${screenW * 1.3}px`]
  );

  const planeOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.15, 0.65, 0.8],
    [0, 1, 1, 0]
  );

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", height: "200vh", ...style }}
      className={className}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7fbf8",
          overflow: "hidden",
        }}
      >
        {/* Dot grid */}
        <DotGrid />

        {/* Radial green glow center */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(77,124,95,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top faint arc decoration */}
        <div style={{
          position: "absolute",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(77,124,95,0.08)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "680px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(77,124,95,0.05)",
          pointerEvents: "none",
        }} />

        {/* Main text content */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 16px", width: "100%" }}>
          {children}
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            gap: "12px",
            marginTop: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {stats.map((s, i) => (
              <StatPill key={i} value={s.value} label={s.label} delay={0.1 + i * 0.1} />
            ))}
          </div>
        )}

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: "0.65rem", color: "#a3bfac", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Scroll
          </span>
          <div style={{
            width: "22px",
            height: "36px",
            borderRadius: "11px",
            border: "1.5px solid #b8d4c0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "5px",
          }}>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{
                width: "4px",
                height: "8px",
                borderRadius: "2px",
                background: "#4d7c5f",
              }}
            />
          </div>
        </motion.div>

        {/* Plane */}
        <motion.div
          style={{
            x,
            opacity: planeOpacity,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{ width: "auto", height: "auto", maxWidth: "none" }}
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/1200x800/cccccc/333333?text=Image+Error";
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default ScrollFlyIn;
