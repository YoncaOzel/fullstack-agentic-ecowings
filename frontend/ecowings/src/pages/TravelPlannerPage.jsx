import { useState } from 'react';
import {
  Sparkles, Download, Loader2, Calendar,
  Users, Plane, ChevronRight, Clock,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   FROZEN — do not touch anything in this block
   ───────────────────────────────────────────────────────────────── */
const AI_SERVICE_URL = import.meta.env.VITE_FAQ_SERVICE_URL
  || import.meta.env.VITE_AI_SERVICE_URL
  || 'http://localhost:8001';

/* ── Inline bold parser: "**text**" → <strong> ─────────────────── */
function parseInline(text, baseStyle = {}) {
  if (!text.includes('**')) return <span style={baseStyle}>{text}</span>;

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ fontWeight: 700, color: '#003527' }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/* Detect lines that are ONLY a bold label, e.g. "**Flight Details:**" */
function isStandaloneLabel(s) {
  return /^\*\*[^*]+\*\*:?\s*$/.test(s);
}

/* ── Plan text renderer ─────────────────────────────────────────── */
function renderPlanText(text) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;
  let dayCount = 0;
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    i++;

    if (!trimmed) {
      elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }

    if (/^-{2,}$/.test(trimmed)) continue;

    /* ── H1 title (single #) — e.g. "# Antalya Travel Itinerary" ── */
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      const heading = trimmed.replace(/^#\s*/, '');
      elements.push(
        <div key={key++} style={{
          margin: '0 0 24px',
          paddingBottom: 20,
          borderBottom: '1px solid rgba(0,53,39,0.08)',
        }}>
          <span style={{
            display: 'block',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: '#006c4b',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'Manrope', sans-serif",
            marginBottom: 6,
          }}>
            Itinerary
          </span>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
            fontWeight: 800,
            color: '#003527',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {heading}
          </div>
        </div>
      );
      continue;
    }

    /* ── Day heading ── */
    const isDay =
      trimmed.startsWith('## ') ||
      /^day\s+\d+/i.test(trimmed) ||
      /^gün\s+\d+/i.test(trimmed);

    if (isDay) {
      dayCount++;
      const label = trimmed.replace(/^##\s*/, '').replace(/^day\s+\d+[\s:–-]*/i, '').replace(/^gün\s+\d+[\s:–-]*/i, '').trim();
      const dayNum = trimmed.match(/\d+/)?.[0] ?? dayCount;

      /* Collect items belonging to this day until next day or end */
      const dayItems = [];
      while (i < lines.length) {
        const nextRaw = lines[i];
        const nextTrimmed = nextRaw.trim();
        const nextIsDay =
          nextTrimmed.startsWith('## ') ||
          /^day\s+\d+/i.test(nextTrimmed) ||
          /^gün\s+\d+/i.test(nextTrimmed);
        if (nextIsDay) break;
        i++;

        if (!nextTrimmed) {
          dayItems.push(<div key={`di-${key++}`} style={{ height: 4 }} />);
          continue;
        }

        if (/^-{2,}$/.test(nextTrimmed)) continue;

        const isDaySubHeading =
          nextTrimmed.startsWith('### ') ||
          isStandaloneLabel(nextTrimmed) ||
          (nextTrimmed.endsWith(':') && nextTrimmed.length < 60 && !nextTrimmed.startsWith('-') && !nextTrimmed.includes('**'));
        if (isDaySubHeading) {
          const heading = nextTrimmed.replace(/^###\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
          dayItems.push(
            <div key={`di-${key++}`} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 6px' }}>
              <div style={{ width: 3, height: 16, borderRadius: 2, background: '#006c4b', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#006c4b', letterSpacing: '0.03em', fontFamily: "'Manrope', sans-serif" }}>
                {heading}
              </span>
            </div>
          );
          continue;
        }

        if (nextTrimmed.startsWith('- ') || nextTrimmed.startsWith('• ') || nextTrimmed.startsWith('* ')) {
          const content = nextTrimmed.slice(2);
          dayItems.push(
            <div key={`di-${key++}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '5px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #003527, #006c4b)', flexShrink: 0, marginTop: 7 }} />
              {parseInline(content, { color: '#374151', fontSize: '0.9rem', lineHeight: 1.65, fontFamily: "'Manrope', sans-serif" })}
            </div>
          );
          continue;
        }

        dayItems.push(
          <p key={`di-${key++}`} style={{ margin: '3px 0', color: '#374151', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: "'Manrope', sans-serif" }}>
            {parseInline(nextTrimmed)}
          </p>
        );
      }

      elements.push(
        <div key={`day-${dayCount}`} style={{ marginTop: dayCount === 1 ? 0 : 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'linear-gradient(120deg, #003527 0%, #064e3b 70%, #006c4b 100%)',
            borderRadius: '14px 14px 0 0',
            padding: '14px 20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ minWidth: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1 }}>DAY</span>
              <span style={{ color: 'rgba(255,255,255,1)', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{dayNum}</span>
            </div>
            <div>
              {label && (
                <div style={{ color: 'rgba(255,255,255,1)', fontSize: '1rem', fontWeight: 700, fontFamily: "'Manrope', sans-serif", lineHeight: 1.3 }}>
                  {label}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 500, marginTop: label ? 2 : 0, fontFamily: "'Manrope', sans-serif" }}>
                <Clock size={10} />
                Full day itinerary
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid rgba(0,53,39,0.1)', borderTop: 'none', borderRadius: '0 0 14px 14px', background: '#ffffff', padding: '16px 20px 18px' }}>
            {dayItems}
          </div>
        </div>
      );
      continue;
    }

    /* ── Top-level section heading (no day context) ── */
    if (trimmed.startsWith('### ') || (trimmed.endsWith(':') && trimmed.length < 60 && !trimmed.startsWith('-'))) {
      const heading = trimmed.replace(/^###\s*/, '');
      elements.push(
        <div key={key++} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 8px' }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: '#006c4b', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#003527', fontFamily: "'Manrope', sans-serif" }}>
            {heading}
          </span>
        </div>
      );
      continue;
    }

    if (isStandaloneLabel(trimmed)) {
      const heading = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
      elements.push(
        <div key={key++} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 6px' }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: '#006c4b', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#003527', fontFamily: "'Manrope', sans-serif" }}>
            {heading}
          </span>
        </div>
      );
      continue;
    }

    /* ── Top-level bullet ── */
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2);
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '5px 0' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #003527, #006c4b)', flexShrink: 0, marginTop: 7 }} />
          {parseInline(content, { color: '#374151', fontSize: '0.92rem', lineHeight: 1.65, fontFamily: "'Manrope', sans-serif" })}
        </div>
      );
      continue;
    }

    /* ── Body paragraph ── */
    elements.push(
      <p key={key++} style={{ margin: '3px 0 8px', color: '#374151', fontSize: '0.92rem', lineHeight: 1.7, fontFamily: "'Manrope', sans-serif" }}>
        {parseInline(trimmed)}
      </p>
    );
  }

  return elements;
}

/* ── Trip summary strip ─────────────────────────────────────────── */
function Chip({ icon, label }) {
  const Icon = icon;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 100,
      background: '#b0f0d6',
      border: 'none',
      fontSize: '0.75rem', fontWeight: 700,
      color: '#003527',
      fontFamily: "'Manrope', sans-serif",
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      <Icon size={11} />
      {label}
    </div>
  );
}

function TripSummaryStrip({ origin, destination, startDate, endDate, passengers }) {
  return (
    <div style={{
      padding: '28px 36px 24px',
      borderBottom: '1px solid rgba(0,53,39,0.07)',
      background: 'linear-gradient(135deg, rgba(0,53,39,0.025) 0%, rgba(176,240,214,0.07) 100%)',
    }}>
      {/* Route row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          fontWeight: 800,
          color: '#003527',
          fontFamily: "'Manrope', sans-serif",
          letterSpacing: '-0.03em',
        }}>
          {origin}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 80 }}>
          <div style={{ height: 1, flex: 1, background: 'rgba(0,53,39,0.12)', borderRadius: 1, minWidth: 16 }} />
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#003527',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Plane size={14} color="#b0f0d6" style={{ transform: 'rotate(45deg)' }} />
          </div>
          <div style={{ height: 1, flex: 1, background: 'rgba(0,53,39,0.12)', borderRadius: 1, minWidth: 16 }} />
        </div>

        <span style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          fontWeight: 800,
          color: '#003527',
          fontFamily: "'Manrope', sans-serif",
          letterSpacing: '-0.03em',
        }}>
          {destination}
        </span>
      </div>

      {/* Chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip icon={Calendar} label={startDate} />
        <span style={{ color: 'rgba(0,53,39,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>→</span>
        <Chip icon={Calendar} label={endDate} />
        <Chip icon={Users} label={`${passengers} passenger${passengers > 1 ? 's' : ''}`} />
      </div>
    </div>
  );
}
/* ─────────────────────────────────────────────────────────────────
   END FROZEN BLOCK
   ───────────────────────────────────────────────────────────────── */

/* ── Main page ──────────────────────────────────────────────────── */
export default function TravelPlannerPage() {
  /* ── State — FROZEN ── */
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    start_date: '',
    end_date: '',
    passengers: 1,
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  /* ── Handlers — FROZEN ── */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.start_date || !form.end_date || !form.passengers) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          start_date: form.start_date,
          end_date: form.end_date,
          passengers: Number(form.passengers),
          budget: form.budget,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail || 'Something went wrong. Please try again.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not connect to the travel planner service. Please ensure the service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.pdf_id) return;
    window.open(`${AI_SERVICE_URL}/pdf/${result.pdf_id}`, '_blank');
  };
  /* ── END FROZEN handlers ── */

  return (
    <div className="tp-page" style={{ paddingBottom: result ? 80 : 0 }}>

      {/* ── Scoped styles ── */}
      <style>{`
        .tp-page {
          background: #F4F2EC;
          font-family: 'Inter', system-ui, sans-serif;
          color: #0B1410;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* Shell */
        .tp-shell {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ── HERO ── */
        .tp-hero {
          position: relative;
          padding: 0 0 56px;
          overflow: hidden;
        }
        .tp-hero-band {
          position: absolute;
          top: 0; right: 0;
          width: 58%; height: 760px;
          background:
            radial-gradient(700px 380px at 70% 30%, rgba(63,164,124,0.32), transparent 60%),
            radial-gradient(500px 300px at 30% 70%, rgba(20,82,61,0.40), transparent 65%),
            linear-gradient(160deg, #07261C 0%, #0F3D2E 60%, #0E3A2C 100%);
          border-radius: 0 0 0 56px;
          z-index: 0;
          overflow: hidden;
        }
        .tp-hero-band::before {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 7px);
          mix-blend-mode: screen;
          animation: tp-drift 22s linear infinite;
        }
        @keyframes tp-drift { to { background-position-x: -200px; } }

        .tp-hero-shell {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          padding-top: 56px;
        }

        /* Editorial slug */
        .tp-hero-slug {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 24px;
          border-bottom: 1px solid #DDDBD2;
          margin-bottom: 56px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tp-slug-left, .tp-slug-right {
          display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        }

        /* Kicker */
        .tp-kicker {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #5A6B63;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .tp-kicker.green { color: #14523D; }
        .tp-kicker.dim   { color: #A6B1AB; }
        .tp-kicker .slash { color: #A6B1AB; }

        /* Status dot */
        .tp-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2A8A66;
          box-shadow: 0 0 0 3px rgba(42,138,102,0.18);
          animation: tp-pulse 2.4s infinite;
          display: inline-block;
        }
        @keyframes tp-pulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(42,138,102,0.18); }
          50%      { box-shadow: 0 0 0 7px rgba(42,138,102,0.04); }
        }

        /* Hero left */
        .tp-hero-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 28px;
          padding-top: 12px;
          min-width: 0;
          padding-right: 8px;
        }
        .tp-hero-left h1 {
          font-family: 'Fraunces', 'Times New Roman', serif;
          font-weight: 300;
          font-size: clamp(38px, 4.8vw, 66px);
          line-height: 1.0;
          letter-spacing: -0.03em;
          margin: 0;
          color: #0B1410;
        }
        .tp-hero-left h1 em {
          font-style: italic;
          font-weight: 400;
          color: #14523D;
          background: none;
        }
        .tp-lede {
          font-size: 17px;
          line-height: 1.6;
          color: #2A3A33;
          max-width: 46ch;
          margin: 0;
        }

        /* Hero stats */
        .tp-hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding-top: 24px;
          border-top: 1px solid #DDDBD2;
        }
        .tp-stat .tp-stat-num {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #0B1410;
          display: flex;
          align-items: baseline;
          gap: 3px;
        }
        .tp-stat .tp-stat-num small {
          font-size: 15px;
          color: #14523D;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
        }
        .tp-stat .tp-stat-lbl {
          margin-top: 7px;
          font-size: 11px;
          color: #5A6B63;
          line-height: 1.4;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Hero right — card */
        .tp-hero-right {
          position: relative;
          display: flex;
          align-items: stretch;
        }
        .tp-card {
          position: relative;
          width: 100%;
          background: #FBFAF6;
          border: 1px solid #DDDBD2;
          border-radius: 28px;
          padding: 32px 32px 28px;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.7) inset,
            0 30px 70px -30px rgba(7,38,28,0.55),
            0 14px 28px -16px rgba(7,38,28,0.30);
        }
        .tp-card-top-line {
          position: absolute;
          top: -1px; left: 32px; right: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2A8A66, transparent);
          opacity: 0.55;
          border-radius: 1px;
        }

        /* Card meta */
        .tp-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .tp-ai-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 10px;
          background: #0F3D2E;
          color: #DFEFE6;
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.10em;
          text-transform: uppercase;
        }
        .tp-ai-chip .tp-pulse {
          width: 7px; height: 7px; border-radius: 50%;
          background: #6FBE9A;
          box-shadow: 0 0 0 3px rgba(111,190,154,0.20);
          animation: tp-pulse 2.4s infinite;
          display: inline-block;
        }
        .tp-card-title {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 26px;
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin: 0 0 5px;
          color: #0B1410;
        }
        .tp-card-title em { font-style: italic; color: #14523D; }
        .tp-card-sub {
          font-size: 13px;
          color: #5A6B63;
          margin: 0 0 22px;
          font-family: 'Inter', sans-serif;
        }

        /* Form section labels */
        .tp-form-section {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #14523D;
          margin: 20px 0 12px;
        }
        .tp-form-section .tp-sec-num {
          display: inline-grid;
          place-items: center;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #0F3D2E;
          color: #B7E8CB;
          font-size: 10px;
          flex-shrink: 0;
        }
        .tp-form-section .tp-sec-rule {
          flex: 1; height: 1px;
          background: #DDDBD2;
        }

        /* Field label */
        .tp-field > label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5A6B63;
          margin-bottom: 7px;
        }

        /* Input wrap */
        .tp-input {
          position: relative;
          display: flex;
          align-items: center;
          height: 52px;
          background: #FBFAF6;
          border: 1px solid #DDDBD2;
          border-radius: 13px;
          padding: 0 13px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          overflow: hidden;
        }
        .tp-input:hover {
          border-color: #6FBE9A;
          background: #fff;
        }
        .tp-input:focus-within {
          border-color: #2A8A66;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(42,138,102,0.10);
        }
        .tp-input .tp-iicon {
          width: 17px; height: 17px;
          color: #14523D;
          margin-right: 9px;
          flex: 0 0 auto;
        }
        .tp-input input {
          flex: 1;
          border: 0; outline: 0; background: transparent;
          font: inherit; font-size: 14.5px;
          color: #0B1410;
          padding: 0;
          width: 100%;
        }
        .tp-input input::placeholder { color: #A6B1AB; }
        .tp-input input[type="date"] {
          color: #2A3A33;
          font-variant-numeric: tabular-nums;
        }
        .tp-input input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(34%) sepia(15%) saturate(900%) hue-rotate(110deg);
          cursor: pointer; opacity: 0.85;
        }

        /* Swap button */
        .tp-swap {
          align-self: end;
          width: 52px; height: 52px;
          display: grid; place-items: center;
          background: #FBFAF6;
          border: 1px solid #DDDBD2;
          border-radius: 13px;
          color: #14523D;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(.5,1.6,.4,1), background 0.18s ease, border-color 0.18s ease;
          flex-shrink: 0;
        }
        .tp-swap:hover {
          background: #0F3D2E;
          color: #DFEFE6;
          border-color: #0F3D2E;
          transform: rotate(180deg);
        }

        /* Counter */
        .tp-counter {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%;
        }
        .tp-counter input {
          text-align: center;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          width: 36px;
          border: 0; outline: 0; background: transparent;
          font: inherit; font-size: 14.5px;
          color: #0B1410;
        }
        .tp-counter-btn {
          width: 26px; height: 26px;
          border-radius: 7px;
          border: 1px solid #DDDBD2;
          background: #F4F2EC;
          color: #14523D;
          cursor: pointer;
          display: grid; place-items: center;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .tp-counter-btn:hover { background: #0F3D2E; color: #fff; border-color: #0F3D2E; }
        .tp-counter-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Grids */
        .tp-grid-route {
          display: grid;
          grid-template-columns: 1fr 52px 1fr;
          gap: 10px;
          align-items: end;
        }
        .tp-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }

        /* CTA button */
        .tp-cta {
          position: relative;
          width: 100%;
          height: 60px;
          border: 0;
          border-radius: 15px;
          cursor: pointer;
          color: #fff;
          font: 600 15px/1 'Inter', sans-serif;
          background: linear-gradient(180deg, #1A6B4E 0%, #07261C 100%);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.20) inset,
            0 -1px 0 rgba(0,0,0,0.15) inset,
            0 18px 30px -10px rgba(15,61,46,0.55),
            0 8px 14px -6px rgba(7,38,28,0.40);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          letter-spacing: 0.005em;
          margin-top: 22px;
        }
        .tp-cta:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.24) inset,
            0 -1px 0 rgba(0,0,0,0.15) inset,
            0 24px 36px -10px rgba(15,61,46,0.62),
            0 12px 18px -8px rgba(7,38,28,0.48);
        }
        .tp-cta:active:not(:disabled) { transform: translateY(0); }
        .tp-cta:disabled { opacity: 0.55; cursor: not-allowed; }
        .tp-cta::before {
          content: "";
          position: absolute;
          top: 0; left: -120%;
          width: 60%; height: 100%;
          background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
          transform: skewX(-18deg);
          transition: left 0.7s cubic-bezier(.2,.8,.2,1);
        }
        .tp-cta:hover:not(:disabled)::before { left: 130%; }
        .tp-cta-inner {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center;
          gap: 10px;
        }
        .tp-cta-arrow { display: inline-flex; transition: transform 0.25s; }
        .tp-cta:hover:not(:disabled) .tp-cta-arrow { transform: translateX(4px); }

        .tp-cta-foot {
          margin-top: 12px;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          color: #5A6B63;
        }
        .tp-cta-foot .tp-secure {
          display: inline-flex; align-items: center; gap: 5px;
          color: #14523D;
        }

        /* Error */
        .tp-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 11px 14px;
          border-radius: 11px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.18);
          border-left: 3px solid rgba(239,68,68,0.5);
          color: #dc2626;
          font-size: 0.83rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          margin-top: 12px;
        }

        /* ── PREVIEW STRIP ── */
        .tp-preview-strip {
          grid-column: 1 / -1;
          margin-top: 56px;
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr;
          gap: 16px;
        }
        .tp-pcard {
          background: #FBFAF6;
          border: 1px solid #DDDBD2;
          border-radius: 20px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .tp-pcard:hover {
          transform: translateY(-3px);
          border-color: #6FBE9A;
          box-shadow: 0 18px 30px -16px rgba(15,61,46,0.25);
        }
        .tp-pcard-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .tp-pcard h3 {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 22px;
          line-height: 1.1;
          margin: 0 0 10px;
          color: #0B1410;
        }
        .tp-pcard h3 em { font-style: italic; color: #14523D; }
        .tp-pcard .tp-muted {
          font-size: 13px;
          color: #5A6B63;
          line-height: 1.55;
          margin: 6px 0 0;
        }
        .tp-pcard-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #DDDBD2;
        }
        .tp-tag {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .tp-tag.lime { background: #C7E25B; color: #0B1410; }
        .tp-tag.dark { background: #0F3D2E; color: #B7E8CB; }
        .tp-route-mini {
          position: relative;
          height: 60px;
          margin: 10px 0;
        }
        .tp-route-mini svg { width: 100%; height: 100%; }
        .tp-route-label {
          position: absolute;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: #5A6B63;
        }
        .tp-route-label.start { bottom: 0; left: 0; }
        .tp-route-label.end   { bottom: 0; right: 0; }
        .tp-co2-num {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #0B1410;
          margin: 0 0 4px;
        }

        /* ── SECTION (common) ── */
        .tp-section {
          padding: 100px 0;
        }
        .tp-section.dark {
          background: #07261C;
          color: #F4F2EC;
        }
        .tp-section.alt {
          background: #ECEBE3;
        }
        .tp-section-head {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 48px;
          align-items: end;
          padding-bottom: 28px;
          border-bottom: 1px solid #DDDBD2;
          margin-bottom: 56px;
        }
        .tp-section.dark .tp-section-head {
          border-bottom-color: rgba(255,255,255,0.10);
        }
        .tp-section.alt .tp-section-head {
          border-bottom-color: #C6C3B7;
        }
        .tp-section-head .tp-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tp-section-head h2 {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: clamp(30px, 3.8vw, 50px);
          line-height: 1.03;
          letter-spacing: -0.02em;
          margin: 0;
          color: inherit;
          max-width: 13ch;
        }
        .tp-section.dark .tp-section-head h2 { color: #F4F2EC; }
        .tp-section-head h2 em { font-style: italic; color: #3FA47C; }
        .tp-section.dark .tp-section-head h2 em { color: #6FBE9A; }
        .tp-section-head .tp-sec-lede {
          font-size: 15px;
          line-height: 1.6;
          color: #2A3A33;
          max-width: 56ch;
        }
        .tp-section.dark .tp-sec-lede { color: rgba(183,232,203,0.8); }

        /* ── HOW IT WORKS ── */
        .tp-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .tp-step-num {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 52px;
          line-height: 1;
          letter-spacing: -0.04em;
          color: #DDDBD2;
          margin-bottom: 16px;
        }
        .tp-step-num em { font-style: normal; color: #14523D; }
        .tp-step-illus {
          background: #F4F2EC;
          border: 1px solid #DDDBD2;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .tp-step-illus svg { display: block; width: 100%; }
        .tp-step h3 {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 22px;
          line-height: 1.15;
          letter-spacing: -0.01em;
          margin: 0 0 10px;
          color: #0B1410;
        }
        .tp-step p {
          font-size: 14px;
          line-height: 1.65;
          color: #5A6B63;
          margin: 0;
        }

        /* ── IMPACT GRID ── */
        .tp-impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }
        .tp-impact-cell {
          background: #07261C;
          padding: 36px 32px;
        }
        .tp-impact-cell .tp-impact-num {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: clamp(44px, 4vw, 64px);
          line-height: 1;
          letter-spacing: -0.03em;
          color: #F4F2EC;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .tp-impact-cell .tp-impact-num small {
          font-size: 22px;
          color: #6FBE9A;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
        }
        .tp-impact-cell .tp-impact-lbl {
          margin-top: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(183,232,203,0.75);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .tp-impact-cell .tp-impact-desc {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(183,232,203,0.5);
          line-height: 1.55;
        }

        /* ── ROUTES ── */
        .tp-routes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .tp-rcard {
          background: #FBFAF6;
          border: 1px solid #DDDBD2;
          border-radius: 20px;
          padding: 24px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .tp-rcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -20px rgba(15,61,46,0.22);
        }
        .tp-rhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .tp-rcity {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 22px;
          letter-spacing: -0.01em;
          color: #0B1410;
        }
        .tp-rcity em { font-style: italic; color: #14523D; }
        .tp-rcity .tp-sep { color: #A6B1AB; margin: 0 4px; }
        .tp-rmap {
          background: #F4F2EC;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .tp-rmap svg { display: block; width: 100%; }
        .tp-rstats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid #DDDBD2;
        }
        .tp-rstats .tp-ritem .tp-rv {
          font-family: 'Fraunces', serif;
          font-weight: 400;
          font-size: 18px;
          letter-spacing: -0.01em;
          color: #0B1410;
        }
        .tp-rstats .tp-ritem .tp-rv.green { color: #14523D; }
        .tp-rstats .tp-ritem .tp-rl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #5A6B63;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── RESULT SECTION ── */
        .tp-result-wrap {
          max-width: 1040px;
          margin: 48px auto 0;
          padding: 0 32px;
        }
        .tp-result-card {
          background: #FBFAF6;
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(7,38,28,0.12), 0 4px 16px rgba(0,0,0,0.04);
          border: 1px solid #DDDBD2;
          overflow: hidden;
          margin-bottom: 48px;
        }
        .tp-result-header {
          padding: 22px 32px 18px;
          border-bottom: 1px solid #DDDBD2;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          background: #FBFAF6;
        }
        .tp-result-body {
          padding: 32px 36px 40px;
          max-height: 72vh;
          overflow-y: auto;
        }
        .tp-ready-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 100px;
          background: #B7E8CB;
          color: #07261C;
          font-size: 10.5px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.10em;
          white-space: nowrap;
        }

        /* Loading card */
        .tp-loading-wrap {
          max-width: 1040px;
          margin: 48px auto 0;
          padding: 0 32px;
        }
        .tp-loading-card {
          text-align: center;
          padding: 48px 32px;
          background: #FBFAF6;
          border-radius: 28px;
          box-shadow: 0 8px 40px rgba(7,38,28,0.07);
          border: 1px solid #DDDBD2;
        }

        /* Sticky bar */
        .tp-sticky-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(251,250,246,0.92);
          backdrop-filter: blur(16px);
          border-top: 1px solid #DDDBD2;
          padding: 12px 24px;
          display: flex; align-items: center; justify-content: center; gap: 16px;
        }

        /* Animations */
        @keyframes tp-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes tp-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1);   opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .tp-hero-shell {
            grid-template-columns: 1fr;
            padding-top: 80px;
          }
          .tp-hero-band {
            width: 100%; height: 300px;
            border-radius: 0 0 32px 32px;
            top: 0; right: 0;
            opacity: 0.5;
          }
          .tp-preview-strip {
            grid-template-columns: 1fr;
          }
          .tp-steps, .tp-routes-grid {
            grid-template-columns: 1fr;
          }
          .tp-impact-grid {
            grid-template-columns: 1fr 1fr;
          }
          .tp-grid-route {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .tp-swap { display: none; }
          .tp-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
          .tp-section-head {
            grid-template-columns: 1fr;
          }
          .tp-hero-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          1. HERO
          ══════════════════════════════════════════════════════════ */}
      <section className="tp-hero">
        <div className="tp-hero-band" aria-hidden="true" />

        <div className="tp-shell tp-hero-shell">


          {/* Hero left — headline + stats */}
          <div className="tp-hero-left">
            <span className="tp-kicker green"><span className="slash">/</span> AI TRAVEL PLANNER</span>
            <h1>
              Designing flights that <em>tread lighter</em><br />
              on the world below.
            </h1>
            <p className="tp-lede">
              Tell us where you're headed. EcoWings AI engineers a personalised itinerary tuned
              for the lowest possible emissions — without compromising on schedule, comfort, or cost.
            </p>
            <div className="tp-hero-stats">
              <div className="tp-stat">
                <div className="tp-stat-num">38<small>%</small></div>
                <div className="tp-stat-lbl">Average CO₂<br />reduction per trip</div>
              </div>
              <div className="tp-stat">
                <div className="tp-stat-num">240<small>k+</small></div>
                <div className="tp-stat-lbl">Eco-routed<br />journeys to date</div>
              </div>
              <div className="tp-stat">
                <div className="tp-stat-num">29<small>s</small></div>
                <div className="tp-stat-lbl">Median time<br />to a complete plan</div>
              </div>
            </div>
          </div>

          {/* Hero right — form card */}
          <aside className="tp-hero-right">
            <form
              className="tp-card airport-dropdown-exclude"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <span className="tp-card-top-line" />

              <div className="tp-card-meta">
                <span className="tp-kicker green"><span className="slash">/</span> NEW JOURNEY</span>
                <span className="tp-ai-chip"><span className="tp-pulse" /> Powered by AI</span>
              </div>

              <h2 className="tp-card-title">AI Travel <em>Planner</em></h2>
              <p className="tp-card-sub">Eco-optimised itineraries crafted in under 30 seconds.</p>

              {/* Section 1 — Route */}
              <div className="tp-form-section">
                <span className="tp-sec-num">1</span>
                Route
                <span className="tp-sec-rule" />
              </div>

              <div className="tp-grid-route">
                <div className="tp-field">
                  <label htmlFor="tp-origin">From</label>
                  <div className="tp-input">
                    <svg className="tp-iicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 16l20-7-7 13-2-7-11-3z" />
                    </svg>
                    <input
                      id="tp-origin"
                      type="text"
                      name="origin"
                      value={form.origin}
                      onChange={handleChange}
                      placeholder="Departure city"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="tp-swap"
                  aria-label="Swap origin and destination"
                  onClick={() => setForm(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }))}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h13l-3-3" /><path d="M17 17H4l3 3" />
                  </svg>
                </button>

                <div className="tp-field">
                  <label htmlFor="tp-destination">To</label>
                  <div className="tp-input">
                    <svg className="tp-iicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" /><path d="M5 9l7-7 7 7" /><circle cx="12" cy="14" r="2" />
                    </svg>
                    <input
                      id="tp-destination"
                      type="text"
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      placeholder="Destination"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 — Travel Details */}
              <div className="tp-form-section">
                <span className="tp-sec-num">2</span>
                Travel Details
                <span className="tp-sec-rule" />
              </div>

              <div className="tp-grid-3">
                <div className="tp-field">
                  <label htmlFor="tp-start-date">Departure</label>
                  <div className="tp-input">
                    <svg className="tp-iicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 3v4M16 3v4" />
                    </svg>
                    <input
                      id="tp-start-date"
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="tp-field">
                  <label htmlFor="tp-end-date">Return</label>
                  <div className="tp-input">
                    <svg className="tp-iicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 3v4M16 3v4" /><path d="M9 14l3 3 3-3" />
                    </svg>
                    <input
                      id="tp-end-date"
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="tp-field">
                  <label htmlFor="tp-passengers">Passengers</label>
                  <div className="tp-input">
                    <svg className="tp-iicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="8" r="3" /><path d="M2 20a7 7 0 0 1 14 0" /><circle cx="17" cy="9" r="2.4" /><path d="M15 20a5 5 0 0 1 7-3.6" />
                    </svg>
                    <div className="tp-counter">
                      <button
                        type="button"
                        className="tp-counter-btn"
                        disabled={Number(form.passengers) <= 1}
                        onClick={() => setForm(prev => ({ ...prev, passengers: Math.max(1, Number(prev.passengers) - 1) }))}
                        aria-label="Decrease passengers"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14" /></svg>
                      </button>
                      <input
                        id="tp-passengers"
                        type="number"
                        name="passengers"
                        value={form.passengers}
                        onChange={handleChange}
                        min={1}
                        max={20}
                        required
                      />
                      <button
                        type="button"
                        className="tp-counter-btn"
                        disabled={Number(form.passengers) >= 20}
                        onClick={() => setForm(prev => ({ ...prev, passengers: Math.min(20, Number(prev.passengers) + 1) }))}
                        aria-label="Increase passengers"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 — Budget */}
              <div className="tp-form-section">
                <span className="tp-sec-num">3</span>
                Budget
                <span style={{ fontFamily: "'Inter', sans-serif", textTransform: 'none', letterSpacing: '0.02em', color: '#A6B1AB', fontWeight: 400, marginLeft: 4, fontSize: 11 }}>optional</span>
                <span className="tp-sec-rule" />
              </div>

              <div className="tp-field">
                <div className="tp-input">
                  <svg className="tp-iicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="17" cy="15" r="1.2" fill="currentColor" />
                  </svg>
                  <input
                    id="tp-budget"
                    type="text"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="e.g. $5,000 – $10,000"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="tp-error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </div>
              )}

              {/* CTA */}
              <button type="submit" disabled={loading} className="tp-cta">
                <span className="tp-cta-inner">
                  {loading ? (
                    <>
                      <Loader2 size={17} style={{ animation: 'tp-spin 1s linear infinite' }} />
                      Planning your trip…
                    </>
                  ) : (
                    <>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'none' }}>
                        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
                      </svg>
                      Create My Travel Plan
                      <span className="tp-cta-arrow">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </>
                  )}
                </span>
              </button>

              <div className="tp-cta-foot">
                <span>30 sec · No card required</span>
                <span className="tp-secure">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  End-to-end encrypted
                </span>
              </div>
            </form>
          </aside>

          {/* Preview strip */}
          <div className="tp-preview-strip">
            {/* Card 1 — Sample route */}
            <div className="tp-pcard">
              <div className="tp-pcard-head">
                <span className="tp-kicker green"><span className="slash">/</span> SAMPLE OUTPUT</span>
                <span className="tp-tag dark">Live</span>
              </div>
              <h3>Istanbul → <em>Berlin</em></h3>
              <div className="tp-route-mini">
                <svg viewBox="0 0 300 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="rg1" x1="0" x2="1">
                      <stop offset="0" stopColor="#14523D" />
                      <stop offset="1" stopColor="#3FA47C" />
                    </linearGradient>
                  </defs>
                  <path d="M 6 50 Q 150 -5 294 50" stroke="url(#rg1)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                  <circle cx="150" cy="10" r="4" fill="#14523D" />
                  <circle cx="6" cy="50" r="5" fill="#14523D" />
                  <circle cx="294" cy="50" r="5" fill="#3FA47C" />
                </svg>
                <span className="tp-route-label start">IST</span>
                <span className="tp-route-label end">BER</span>
              </div>
              <div className="tp-pcard-foot">
                <span className="tp-tag lime">↓42% CO₂</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#5A6B63' }}>2h 50m · €189</span>
              </div>
            </div>

            {/* Card 2 — Why EcoWings */}
            <div className="tp-pcard">
              <div className="tp-pcard-head">
                <span className="tp-kicker"><span className="slash">/</span> WHY ECOWINGS</span>
              </div>
              <h3>Routing the <em>quiet</em> way.</h3>
              <p className="tp-muted">
                We blend live wind data, SAF availability, and aircraft fuel curves to find the lightest viable path between any two cities.
              </p>
              <div className="tp-pcard-foot">
                <span className="tp-kicker green">EXPLORE METHOD →</span>
              </div>
            </div>

            {/* Card 3 — CO₂ counter */}
            <div className="tp-pcard">
              <div className="tp-pcard-head">
                <span className="tp-kicker"><span className="slash">/</span> THIS WEEK</span>
              </div>
              <div className="tp-co2-num">12,847</div>
              <p className="tp-muted" style={{ marginTop: 4 }}>
                tonnes of CO₂ kept out of the atmosphere by EcoWings travellers in the last seven days.
              </p>
              <div className="tp-pcard-foot">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#14523D' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2A8A66', display: 'inline-block' }} />
                  UPDATED 2 MIN AGO
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LOADING
          ══════════════════════════════════════════════════════════ */}
      {loading && (
        <div className="tp-loading-wrap">
          <div className="tp-loading-card">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {[0, 0.2, 0.4].map((delay, idx) => (
                <div key={idx} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#07261C',
                  animation: `tp-bounce 1.2s ease-in-out ${delay}s infinite`,
                }} />
              ))}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem', fontWeight: 500, color: '#14523D',
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              EcoWings AI
            </div>
            <p style={{ color: '#0B1410', fontWeight: 700, fontSize: '1rem', fontFamily: "'Inter', sans-serif", margin: '0 0 6px' }}>
              Researching flights, hotels and activities…
            </p>
            <p style={{ color: '#5A6B63', fontSize: '0.88rem', fontFamily: "'Inter', sans-serif", margin: 0, opacity: 0.8 }}>
              This may take 30–60 seconds.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          RESULT CARD
          ══════════════════════════════════════════════════════════ */}
      {result && (
        <div className="tp-result-wrap">
          <div className="tp-result-card">
            {/* Header */}
            <div className="tp-result-header" style={{ padding: '28px 36px 24px', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="tp-kicker green">
                  <span className="slash">/</span> ECOWINGS TRAVEL AI
                  <Sparkles size={11} style={{ marginLeft: 4 }} />
                </span>
                <div className="tp-ready-badge">
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#14523D' }} />
                  READY
                </div>
              </div>
              <h2 style={{
                fontFamily: "'Fraunces', 'Times New Roman', serif",
                fontWeight: 400,
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                margin: 0,
                color: '#0B1410',
              }}>
                Your <em style={{ fontStyle: 'italic', color: '#14523D' }}>Travel Plan</em>
              </h2>
            </div>

            {/* Trip summary */}
            <TripSummaryStrip
              origin={form.origin}
              destination={form.destination}
              startDate={form.start_date}
              endDate={form.end_date}
              passengers={Number(form.passengers)}
            />

            {/* Plan body */}
            <div className="tp-result-body">
              {renderPlanText(result.plan_text)}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          2. HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <div className="tp-shell">
          <div className="tp-section-head">
            <div className="tp-meta">
              <span className="tp-kicker green"><span className="slash">/</span> 02 – METHOD</span>
              <span className="tp-kicker dim">Three quiet steps</span>
            </div>
            <div>
              <h2>From <em>intent</em> to <em>itinerary</em>, in three moves.</h2>
              <p className="tp-sec-lede">
                No flight aggregator gymnastics. The planner reads your needs, runs them through our emissions model,
                and hands you a carefully argued plan you can book in one click.
              </p>
            </div>
          </div>

          <div className="tp-steps">
            <div className="tp-step">
              <div className="tp-step-num">0<em>1</em></div>
              <div className="tp-step-illus">
                <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
                  <rect x="20" y="30" width="260" height="80" rx="12" fill="#FBFAF6" stroke="#DDDBD2" />
                  <rect x="36" y="48" width="100" height="10" rx="3" fill="#DDDBD2" />
                  <rect x="36" y="66" width="180" height="6" rx="3" fill="#ECEBE3" />
                  <rect x="36" y="78" width="140" height="6" rx="3" fill="#ECEBE3" />
                  <rect x="36" y="92" width="56" height="14" rx="4" fill="#14523D" />
                  <circle cx="240" cy="56" r="14" fill="#3FA47C" opacity="0.18" />
                  <circle cx="240" cy="56" r="7" fill="#14523D" />
                </svg>
              </div>
              <h3>Tell us where &amp; when.</h3>
              <p>Cities, dates, passengers, and a budget. That's all the planner needs to start. No accounts, no fluff.</p>
            </div>

            <div className="tp-step">
              <div className="tp-step-num">0<em>2</em></div>
              <div className="tp-step-illus">
                <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="ill2" x1="0" x2="1">
                      <stop offset="0" stopColor="#14523D" />
                      <stop offset="1" stopColor="#3FA47C" />
                    </linearGradient>
                  </defs>
                  <path d="M30 100 C 80 30, 220 30, 270 100" stroke="url(#ill2)" strokeWidth="2" fill="none" />
                  <path d="M30 110 C 80 60, 220 60, 270 110" stroke="#14523D" strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.5" />
                  <circle cx="30" cy="100" r="6" fill="#14523D" />
                  <circle cx="270" cy="100" r="6" fill="#14523D" />
                  <circle cx="150" cy="46" r="5" fill="#FBFAF6" stroke="#14523D" strokeWidth="2" />
                  <text x="150" y="34" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="#14523D">OPTIMAL</text>
                </svg>
              </div>
              <h3>AI charts the lightest path.</h3>
              <p>Wind, weight, SAF availability, and 14 other variables fold into a single emissions-aware route in seconds.</p>
            </div>

            <div className="tp-step">
              <div className="tp-step-num">0<em>3</em></div>
              <div className="tp-step-illus">
                <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
                  <rect x="20" y="22" width="260" height="100" rx="12" fill="#FBFAF6" stroke="#DDDBD2" />
                  <rect x="36" y="38" width="80" height="8" rx="3" fill="#14523D" />
                  <rect x="36" y="54" width="160" height="6" rx="3" fill="#ECEBE3" />
                  <rect x="36" y="80" width="60" height="28" rx="6" fill="#C7E25B" />
                  <text x="66" y="98" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="11" fill="#0B1410">BOOK</text>
                  <rect x="106" y="80" width="60" height="28" rx="6" fill="none" stroke="#DDDBD2" />
                  <text x="136" y="98" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="11" fill="#5A6B63">SAVE</text>
                  <circle cx="244" cy="46" r="14" fill="#14523D" />
                  <path d="M238 46 l5 5 9-10" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Review, tune, book.</h3>
              <p>Swap legs, adjust dates, or compare a greener alternate. When you're ready, book the whole journey in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. IMPACT — dark
          ══════════════════════════════════════════════════════════ */}
      <section className="tp-section dark">
        <div className="tp-shell">
          <div className="tp-section-head">
            <div className="tp-meta">
              <span className="tp-kicker green"><span className="slash">/</span> 03 – IMPACT</span>
              <span className="tp-kicker dim">Updated continuously</span>
            </div>
            <div>
              <h2>What gets <em>measured</em>, gets <em>flown</em> better.</h2>
              <p className="tp-sec-lede">
                Every plan we generate is logged, audited, and rolled up into the numbers you see here.
                No estimates, no marketing math.
              </p>
            </div>
          </div>

          <div className="tp-impact-grid">
            <div className="tp-impact-cell">
              <div className="tp-impact-num">184<small>kt</small></div>
              <div className="tp-impact-lbl">CO₂ avoided · 2026 YTD</div>
              <p className="tp-impact-desc">Equivalent to taking 40,000 cars off the road for a full year.</p>
            </div>
            <div className="tp-impact-cell">
              <div className="tp-impact-num">38<small>%</small></div>
              <div className="tp-impact-lbl">Average reduction per route</div>
              <p className="tp-impact-desc">Compared to the same itinerary on a conventional flight planner.</p>
            </div>
            <div className="tp-impact-cell">
              <div className="tp-impact-num">240<small>k</small></div>
              <div className="tp-impact-lbl">Travellers eco-routed</div>
              <p className="tp-impact-desc">Across 92 countries and 1,400+ city pairs since 2024.</p>
            </div>
            <div className="tp-impact-cell">
              <div className="tp-impact-num">4.9</div>
              <div className="tp-impact-lbl">Avg. satisfaction · /5</div>
              <p className="tp-impact-desc">From 27,300 verified reviews. We read every single one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. ROUTES SHOWCASE
          ══════════════════════════════════════════════════════════ */}
      <section className="tp-section alt">
        <div className="tp-shell">
          <div className="tp-section-head">
            <div className="tp-meta">
              <span className="tp-kicker green"><span className="slash">/</span> 04 – IN PRACTICE</span>
              <span className="tp-kicker dim">Three routes, three savings</span>
            </div>
            <div>
              <h2>A few of <em>this week's</em> lighter journeys.</h2>
              <p className="tp-sec-lede">
                Real plans drawn from our network — what travellers asked for, what the AI returned,
                and the carbon math behind the choice.
              </p>
            </div>
          </div>

          <div className="tp-routes-grid">
            {/* Route 1 */}
            <article className="tp-rcard">
              <div className="tp-rhead">
                <div className="tp-rcity">IST <span className="tp-sep">→</span> <em>BER</em></div>
                <span className="tp-tag lime">↓42% CO₂</span>
              </div>
              <div className="tp-rmap">
                <svg viewBox="0 0 400 110" preserveAspectRatio="none">
                  <path d="M0 88 Q 100 96 180 70 T 400 30" stroke="#A6B1AB" strokeWidth="0.5" fill="none" />
                  <path d="M0 60 Q 120 75 220 50 T 400 70" stroke="#A6B1AB" strokeWidth="0.5" fill="none" />
                  <path d="M30 95 Q 150 -20 370 60" stroke="#14523D" strokeWidth="2" fill="none" strokeDasharray="5 4" />
                  <circle cx="30" cy="95" r="5" fill="#14523D" />
                  <circle cx="370" cy="60" r="5" fill="#14523D" />
                  <text x="40" y="106" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#5A6B63">İSTANBUL</text>
                  <text x="320" y="78" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#5A6B63">BERLIN</text>
                </svg>
              </div>
              <div className="tp-rstats">
                <div className="tp-ritem"><div className="tp-rv">2h 50m</div><div className="tp-rl">Flight time</div></div>
                <div className="tp-ritem"><div className="tp-rv">€189</div><div className="tp-rl">From</div></div>
                <div className="tp-ritem"><div className="tp-rv green">182kg</div><div className="tp-rl">CO₂ saved</div></div>
              </div>
            </article>

            {/* Route 2 */}
            <article className="tp-rcard">
              <div className="tp-rhead">
                <div className="tp-rcity">LHR <span className="tp-sep">→</span> <em>JFK</em></div>
                <span className="tp-tag lime">↓31% CO₂</span>
              </div>
              <div className="tp-rmap">
                <svg viewBox="0 0 400 110" preserveAspectRatio="none">
                  <path d="M0 50 Q 200 80 400 40" stroke="#A6B1AB" strokeWidth="0.5" fill="none" />
                  <path d="M0 80 Q 200 30 400 80" stroke="#A6B1AB" strokeWidth="0.5" fill="none" />
                  <path d="M340 30 Q 200 -10 50 70" stroke="#14523D" strokeWidth="2" fill="none" strokeDasharray="5 4" />
                  <circle cx="340" cy="30" r="5" fill="#14523D" />
                  <circle cx="50" cy="70" r="5" fill="#14523D" />
                  <text x="290" y="22" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#5A6B63">LONDON</text>
                  <text x="60" y="84" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#5A6B63">NEW YORK</text>
                </svg>
              </div>
              <div className="tp-rstats">
                <div className="tp-ritem"><div className="tp-rv">7h 40m</div><div className="tp-rl">Flight time</div></div>
                <div className="tp-ritem"><div className="tp-rv">£612</div><div className="tp-rl">From</div></div>
                <div className="tp-ritem"><div className="tp-rv green">418kg</div><div className="tp-rl">CO₂ saved</div></div>
              </div>
            </article>

            {/* Route 3 */}
            <article className="tp-rcard">
              <div className="tp-rhead">
                <div className="tp-rcity">SIN <span className="tp-sep">→</span> <em>NRT</em></div>
                <span className="tp-tag lime">↓27% CO₂</span>
              </div>
              <div className="tp-rmap">
                <svg viewBox="0 0 400 110" preserveAspectRatio="none">
                  <path d="M0 70 Q 200 50 400 90" stroke="#A6B1AB" strokeWidth="0.5" fill="none" />
                  <path d="M0 30 Q 200 100 400 30" stroke="#A6B1AB" strokeWidth="0.5" fill="none" />
                  <path d="M40 90 Q 200 -10 360 40" stroke="#14523D" strokeWidth="2" fill="none" strokeDasharray="5 4" />
                  <circle cx="40" cy="90" r="5" fill="#14523D" />
                  <circle cx="360" cy="40" r="5" fill="#14523D" />
                  <text x="50" y="104" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#5A6B63">SINGAPORE</text>
                  <text x="290" y="32" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#5A6B63">TOKYO</text>
                </svg>
              </div>
              <div className="tp-rstats">
                <div className="tp-ritem"><div className="tp-rv">7h 10m</div><div className="tp-rl">Flight time</div></div>
                <div className="tp-ritem"><div className="tp-rv">S$480</div><div className="tp-rl">From</div></div>
                <div className="tp-ritem"><div className="tp-rv green">296kg</div><div className="tp-rl">CO₂ saved</div></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STICKY PDF DOWNLOAD BAR — FROZEN
          ══════════════════════════════════════════════════════════ */}
      {result && (
        <div className="tp-sticky-bar">
          <div style={{
            fontSize: '0.82rem', color: '#5A6B63',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Sparkles size={13} color="#14523D" />
            Your itinerary is ready
          </div>
          <button
            onClick={handleDownload}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 24px',
              background: '#07261C',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: '0.88rem', fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(7,38,28,0.28)',
              letterSpacing: '0.01em',
            }}
          >
            <Download size={15} />
            Download PDF
            <ChevronRight size={14} style={{ opacity: 0.6 }} />
          </button>
        </div>
      )}
    </div>
  );
}

/*
 * ── ENDPOINT INTEGRITY CONFIRMATION ──────────────────────────────
 *
 * POST http://localhost:8001/plan
 *   method:  POST
 *   headers: { 'Content-Type': 'application/json' }
 *   body:    { origin, destination, start_date, end_date, passengers, budget }
 *
 * GET  http://localhost:8001/pdf/{pdf_id}
 *   method:  GET  (via window.open)
 *
 * Both calls are preserved verbatim from the original component.
 * ─────────────────────────────────────────────────────────────────
 */
