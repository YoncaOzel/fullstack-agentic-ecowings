import { useState } from 'react';
import {
  Sparkles, Download, Loader2, Calendar,
  Users, Plane, ChevronRight, Clock, ArrowRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   FROZEN — do not touch anything in this block
   ───────────────────────────────────────────────────────────────── */
const AI_SERVICE_URL = 'http://localhost:8000';

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
function TripSummaryStrip({ origin, destination, startDate, endDate, passengers }) {
  const Chip = ({ icon: Icon, label }) => (
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

/* ── Form field design tokens ────────────────────────────────────── */
const FIELD_LABEL = {
  display: 'block',
  fontSize: '0.6rem',
  fontWeight: 800,
  color: '#6c8274',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontFamily: "'Manrope', sans-serif",
  marginBottom: 8,
  marginLeft: 2,
};

const FIELD_INPUT = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  width: '100%',
  color: '#0d1f16',
  fontSize: '0.95rem',
  fontWeight: 600,
  fontFamily: "'Manrope', sans-serif",
  padding: '15px 14px 15px 44px',
  boxSizing: 'border-box',
};

const FIELD_ICON = {
  position: 'absolute',
  left: 14,
  fontSize: 18,
  color: '#003527',
  pointerEvents: 'none',
  userSelect: 'none',
  fontVariationSettings: "'FILL' 0, 'wght' 400",
  lineHeight: 1,
  flexShrink: 0,
};

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
    <div className="travel-planner-page" style={{ minHeight: '100vh', background: '#f7f9fb', paddingBottom: result ? 80 : 0 }}>

      {/* ── Scoped style overrides + animations ───────────────── */}
      <style>{`
        .travel-planner-page .tp-hero h1 {
          color: rgba(255,255,255,1) !important;
          -webkit-text-fill-color: rgba(255,255,255,1) !important;
          background: none !important;
          filter: none !important;
        }
        .travel-planner-page .tp-hero p {
          color: rgba(176,240,214,0.9) !important;
        }
        /* ── Field wrap ── */
        .travel-planner-page .tp-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: #f4f8f5;
          border-radius: 14px;
          border: 1.5px solid rgba(0, 53, 39, 0.1);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          overflow: hidden;
        }
        .travel-planner-page .tp-field-wrap:focus-within {
          border-color: #003527 !important;
          box-shadow: 0 0 0 3px rgba(0, 53, 39, 0.09) !important;
          background: #ffffff !important;
        }
        .travel-planner-page .tp-field-wrap input:not([type='checkbox']):not([type='radio']) {
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 15px 14px 15px 44px !important;
          color: #0d1f16 !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          font-family: 'Manrope', sans-serif !important;
          width: 100% !important;
        }
        .travel-planner-page .tp-field-wrap input:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .travel-planner-page .tp-field-wrap input::placeholder {
          color: #9ab4a4 !important;
          font-weight: 400 !important;
        }
        /* ── Submit button ── */
        .travel-planner-page .tp-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 20px 56px rgba(0, 53, 39, 0.42), 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .travel-planner-page .tp-submit-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }
        .travel-planner-page .tp-submit-btn:hover {
          background: #064e3b !important;
          transform: scale(1.01);
        }
        .travel-planner-page .tp-feat-img {
          transition: transform 0.7s ease;
        }
        .travel-planner-page .tp-feat-card:hover .tp-feat-img {
          transform: scale(1.05);
        }
        .travel-planner-page .tp-concierge-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #003527;
          font-weight: 700;
          font-family: 'Manrope', sans-serif;
          cursor: default;
          text-decoration: none;
        }
        .travel-planner-page .tp-concierge-link::after { display: none !important; }
        @keyframes tp-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes tp-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          1. HERO — uses <div> (not <section>) to avoid global
             section:first-of-type background override
          ══════════════════════════════════════════════════════════ */}
      <div
        className="tp-hero"
        style={{
          minHeight: 921,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '96px 24px 60px',
        }}
      >
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCko4LfKLgrpM-uTk9ZuEBt2h4IoTzIqxu0ZjayaKHvsCkV_HKGrK4EX44oNCQXmBpzGrJLMqFSv9yY-xmg34auQuB1GrHVjcWNFMTpcqqbfAk8-YU9V9FDGftzIFaI-SF-XnJL6AOkoFGuSekmcf4qWjuR6J3njQfWyYq5u0Sx9jI6L1JSirBfNnBl0N_KKHR3U7L8lNxtfuzuHi0OfUpVc7MNyOFNyn6qfBVQM2WbY38UlOhdo5SU1RrT8bw-6VjdWTK0Oyp7ezSr"
            alt="Luxury tropical beach resort"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, display: 'block' }}
          />
          {/* Dark gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(0,53,39,0.95) 0%, rgba(6,78,59,0.7) 100%)',
          }} />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 960, width: '100%', textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 32,
          }}>
            Plan your perfect trip
          </h1>

          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto 64px',
            opacity: 0.9,
          }}>
            Our AI agents research flights, hotels, and activities — and deliver a personalised itinerary in seconds.
          </p>

          {/* ══ Form Card — Premium Redesign ══ */}
          <div style={{
            maxWidth: 920,
            margin: '0 auto',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 48px 120px rgba(0,16,10,0.38), 0 12px 40px rgba(0,0,0,0.14)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>

            {/* ── Card header bar ── */}
            <div style={{
              background: 'linear-gradient(135deg, #001a0f 0%, #002d1c 55%, #004228 100%)',
              padding: '16px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plane size={14} color="#6ecfa3" strokeWidth={2.5} />
                <span style={{
                  color: '#c2edd8',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}>
                  AI Travel Planner
                </span>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(110,207,163,0.12)',
                border: '1px solid rgba(110,207,163,0.28)',
                borderRadius: 999,
                padding: '4px 12px',
                color: '#6ecfa3',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                <Sparkles size={9} />
                Powered by AI
              </span>
            </div>

            {/* ── Form body ── */}
            <div style={{ background: '#ffffff', padding: 'clamp(28px, 4vw, 48px)' }}>
              <form
                className="airport-dropdown-exclude"
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
              >

                {/* ─ Section divider: Route ─ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#003527', flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.2em',
                    color: '#6c8274', fontFamily: "'Manrope', sans-serif", textTransform: 'uppercase',
                  }}>Route</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0,53,39,0.08)' }} />
                </div>

                {/* Row 1 — From | swap | To */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 44px 1fr',
                  gap: 12,
                  alignItems: 'flex-end',
                }}>
                  {/* FROM */}
                  <div>
                    <label style={FIELD_LABEL}>From</label>
                    <div className="tp-field-wrap">
                      <span className="material-symbols-outlined" style={FIELD_ICON}>flight_takeoff</span>
                      <input
                        style={FIELD_INPUT}
                        type="text"
                        name="origin"
                        value={form.origin}
                        onChange={handleChange}
                        placeholder="Departure city"
                        required
                      />
                    </div>
                  </div>

                  {/* Swap icon — decorative */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 1 }}>
                    <div style={{
                      width: 34, height: 34,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #002d1c, #005238)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0,53,39,0.32)',
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: 15, lineHeight: 1 }}>
                        swap_horiz
                      </span>
                    </div>
                  </div>

                  {/* TO */}
                  <div>
                    <label style={FIELD_LABEL}>To</label>
                    <div className="tp-field-wrap">
                      <span className="material-symbols-outlined" style={FIELD_ICON}>flight_land</span>
                      <input
                        style={FIELD_INPUT}
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

                {/* ─ Section divider: Travel Details ─ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#003527', flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.2em',
                    color: '#6c8274', fontFamily: "'Manrope', sans-serif", textTransform: 'uppercase',
                  }}>Travel Details</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0,53,39,0.08)' }} />
                </div>

                {/* Row 2 — Departure / Return / Passengers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={FIELD_LABEL}>Departure</label>
                    <div className="tp-field-wrap">
                      <span className="material-symbols-outlined" style={FIELD_ICON}>calendar_today</span>
                      <input
                        style={FIELD_INPUT}
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={FIELD_LABEL}>Return</label>
                    <div className="tp-field-wrap">
                      <span className="material-symbols-outlined" style={FIELD_ICON}>event_repeat</span>
                      <input
                        style={FIELD_INPUT}
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={FIELD_LABEL}>Passengers</label>
                    <div className="tp-field-wrap">
                      <span className="material-symbols-outlined" style={FIELD_ICON}>group</span>
                      <input
                        style={FIELD_INPUT}
                        type="number"
                        name="passengers"
                        value={form.passengers}
                        onChange={handleChange}
                        min={1}
                        max={20}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3 — Budget (centered) */}
                <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
                  <label style={{ ...FIELD_LABEL, textAlign: 'center', marginLeft: 0 }}>
                    Budget{' '}
                    <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem', color: '#9ab4a4' }}>
                      (optional)
                    </span>
                  </label>
                  <div className="tp-field-wrap">
                    <span className="material-symbols-outlined" style={FIELD_ICON}>account_balance_wallet</span>
                    <input
                      style={{ ...FIELD_INPUT, textAlign: 'center', paddingLeft: 44 }}
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
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    fontFamily: "'Manrope', sans-serif",
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="tp-submit-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 11,
                    width: '100%',
                    marginTop: 8,
                    padding: '19px 24px',
                    background: loading
                      ? 'rgba(0,53,39,0.42)'
                      : 'linear-gradient(135deg, #001a0f 0%, #003527 45%, #005238 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 14,
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                    boxShadow: loading
                      ? 'none'
                      : '0 8px 32px rgba(0,53,39,0.34), 0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} style={{ animation: 'tp-spin 1s linear infinite' }} />
                      Planning your trip…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{
                        fontSize: 18, color: '#6ecfa3',
                        fontVariationSettings: "'FILL' 1",
                        lineHeight: 1,
                      }}>auto_awesome</span>
                      Create My Travel Plan
                      <span className="material-symbols-outlined" style={{
                        fontSize: 16, color: '#6ecfa3', lineHeight: 1,
                      }}>arrow_forward</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. FEATURES BENTO GRID — uses <div> not <section>
          ══════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '120px 48px' }}>
        {/* Section header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          marginBottom: 64,
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <div style={{ maxWidth: 560 }}>
              <span style={{
                display: 'block',
                color: '#006c4b',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                marginBottom: 16,
              }}>
                The Digital Concierge
              </span>
              <h2 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 700,
                color: '#191c1e',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: 0,
              }}>
                Curated travel, powered by intelligence.
              </h2>
            </div>
            <p style={{
              maxWidth: 340,
              fontSize: '1.1rem',
              lineHeight: 1.65,
              color: '#404944',
              fontFamily: "'Manrope', sans-serif",
              margin: 0,
            }}>
              We bridge the gap between luxury travel agencies and modern convenience through our bespoke AI models.
            </p>
          </div>
        </div>

        {/* Bento grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(2, 380px)',
          gap: 32,
        }}>

          {/* Card 1 — Autonomous Research (7 cols) */}
          <div
            className="tp-feat-card"
            style={{
              gridColumn: 'span 7',
              background: 'rgba(255,255,255,1)',
              borderRadius: 40,
              padding: 48,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: '#191c1e',
                marginBottom: 20,
              }}>
                Autonomous Research
              </h3>
              <p style={{
                color: '#404944',
                fontSize: '1.05rem',
                lineHeight: 1.65,
                maxWidth: 360,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Our agents scan 500+ sources to find hidden villas and off-market excursions that standard search engines miss.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1 }}>
              <span style={{
                background: '#b0f0d6', padding: '6px 16px', borderRadius: 999,
                color: '#0b513d', fontSize: '0.7rem', fontWeight: 700,
                fontFamily: "'Manrope', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Verified</span>
              <span style={{
                background: '#d8e5e2', padding: '6px 16px', borderRadius: 999,
                color: '#3d4947', fontSize: '0.7rem', fontWeight: 700,
                fontFamily: "'Manrope', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Real-time</span>
            </div>
            <img
              className="tp-feat-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFwbdPKA5i6cxSPZMnZlSroBhl05Mtetat-bDOiJ8KokElsNlg6xWH70H45qGE4Ucm-zeBuDZaPJ9Up1Odl0kqhjVkmHQG3O4JhlgPY_Zv_7cmwlp1u-92CBadE2_VwwapeMnDdsnFbOkP_uiDHjYfSaMxHlVLJkLwUKXhVPir9afg-p-c6HMN6IFAlC9sJk2_rxU7zmAZwTG0kSGMR3gHOse-y4HVQASNMLeKVcjV8caQtBuNBcDOaGxqwlGRq2W0IwhavW9-kw5j"
              alt="Modern architectural interior"
              style={{
                position: 'absolute', right: '-10%', bottom: '-10%',
                width: '70%', opacity: 0.4, borderRadius: 16,
              }}
            />
          </div>

          {/* Card 2 — Precision Itineraries (5 cols, dark primary) */}
          <div style={{
            gridColumn: 'span 5',
            background: '#003527',
            borderRadius: 40,
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 48, left: 48 }}>
              <Sparkles size={56} color="#95d3ba" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,1)',
                marginBottom: 16,
              }}>
                Precision Itineraries
              </h3>
              <p style={{
                color: 'rgba(176,240,214,0.7)',
                fontSize: '1.05rem',
                lineHeight: 1.55,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Every minute of your journey is crafted around your unique preferences and past travel patterns.
              </p>
            </div>
          </div>

          {/* Card 3 — Concierge Support (5 cols) */}
          <div style={{
            gridColumn: 'span 5',
            background: '#f2f4f6',
            borderRadius: 40,
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#191c1e',
                marginBottom: 16,
              }}>
                Concierge Support
              </h3>
              <p style={{
                color: '#404944',
                fontSize: '1.05rem',
                lineHeight: 1.55,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Access human-level AI assistance 24/7 for mid-trip adjustments and local recommendations.
              </p>
            </div>
            <span className="tp-concierge-link">
              Learn about Concierge
              <ArrowRight size={16} />
            </span>
          </div>

          {/* Card 4 — Global Connectivity (7 cols) */}
          <div style={{
            gridColumn: 'span 7',
            background: '#64f9bc',
            borderRadius: 40,
            padding: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 340 }}>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#191c1e',
                marginBottom: 16,
              }}>
                Global Connectivity
              </h3>
              <p style={{
                color: '#005137',
                fontSize: '1.05rem',
                lineHeight: 1.55,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Seamlessly integrated bookings for flights, boutique hotels, and private transfers worldwide.
              </p>
            </div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxMMC5_wwujiOrES2Ixkp07rE9OUkOId0myiIWjsPUBtN5vGveol6prorypvdFyA91-73xrmD5vZaLkue-Jh3UgLPSIQiFbx-CY-GJz2c7GgpJ184F8ZbCFpoD_vispmXAskGP9wgwCBVYPeaNDHw_ZQQpeAeNKZ0QvuAf-hAt15klScP9Pq9SJuSCdjbvA5kFK0-iVMZEu-S_a4T5cnywMMWtVZYnbB7lV43wmpwmU7koqQKFT74NenFegkQtnmJ6IGanUmAl2xfH"
              alt="Jet turbine engine"
              style={{
                position: 'absolute', right: '-5%',
                width: '45%', opacity: 0.2,
                transform: 'rotate(-12deg)',
                borderRadius: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. NEWSLETTER — uses <div> not <section>
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#022c1a',
        color: 'rgba(255,255,255,1)',
        padding: '120px 48px',
        borderRadius: '64px 64px 0 0',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            color: 'rgba(255,255,255,1)',
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}>
            The Travel Journal
          </h2>
          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(187,247,208,0.7)',
            maxWidth: 560,
            margin: '0 auto 48px',
            lineHeight: 1.65,
            fontFamily: "'Manrope', sans-serif",
          }}>
            Subscribe to receive monthly deep-dives into the world's most exclusive destinations and travel technology insights.
          </p>
          <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', gap: 16 }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1,
                background: 'rgba(6,78,59,0.5)',
                border: '1px solid rgba(6,78,59,0.8)',
                borderRadius: 16,
                padding: '16px 24px',
                color: 'rgba(255,255,255,1)',
                fontSize: '1rem',
                fontFamily: "'Manrope', sans-serif",
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                background: '#b0f0d6',
                color: '#002117',
                border: 'none',
                borderRadius: 16,
                padding: '16px 28px',
                fontWeight: 700,
                fontSize: '0.95rem',
                fontFamily: "'Manrope', sans-serif",
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          4–6. LOADING / RESULT / DOWNLOAD — identical to original
          ══════════════════════════════════════════════════════════ */}

      {/* Loading indicator */}
      {loading && (
        <div style={{ maxWidth: 1040, margin: '64px auto 0', padding: '0 24px' }}>
          <div style={{
            textAlign: 'center', padding: '48px 32px',
            background: 'rgba(255,255,255,1)',
            borderRadius: 32,
            boxShadow: '0 8px 40px rgba(0,53,39,0.07)',
            border: '1px solid rgba(0,53,39,0.07)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {[0, 0.2, 0.4].map((delay, idx) => (
                <div key={idx} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#003527',
                  animation: `tp-bounce 1.2s ease-in-out ${delay}s infinite`,
                }} />
              ))}
            </div>
            <div style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.6rem', fontWeight: 700, color: '#006c4b',
              letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              L'Atelier Voyage AI
            </div>
            <p style={{ color: '#003527', fontWeight: 700, fontSize: '1rem', fontFamily: "'Manrope', sans-serif", margin: '0 0 6px' }}>
              Researching flights, hotels and activities…
            </p>
            <p style={{ color: '#404944', fontSize: '0.88rem', fontFamily: "'Manrope', sans-serif", margin: 0, opacity: 0.7 }}>
              This may take 30–60 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div style={{ maxWidth: 1040, margin: '64px auto 0', padding: '0 24px' }}>
          <div style={{
            background: 'rgba(255,255,255,1)',
            borderRadius: 32,
            boxShadow: '0 24px 80px rgba(0,53,39,0.10), 0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,53,39,0.07)',
            overflow: 'hidden',
            marginBottom: 96,
          }}>
            {/* ── Card header: label + READY badge ── */}
            <div style={{
              padding: '24px 36px 20px',
              borderBottom: '1px solid rgba(0,53,39,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              background: 'rgba(255,255,255,1)',
            }}>
              {/* Left: icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#003527',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Sparkles size={18} color="#b0f0d6" />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.58rem', fontWeight: 700, color: '#006c4b',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    fontFamily: "'Manrope', sans-serif", marginBottom: 2,
                  }}>
                    L'Atelier Voyage
                  </div>
                  <div style={{
                    color: '#003527', fontWeight: 800, fontSize: '1.05rem',
                    fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em',
                  }}>
                    Your Travel Plan
                  </div>
                </div>
              </div>

              {/* Right: READY badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 100,
                background: '#b0f0d6',
                color: '#003527', fontSize: '0.62rem', fontWeight: 800,
                fontFamily: "'Manrope', sans-serif", letterSpacing: '0.12em',
                whiteSpace: 'nowrap',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#006c4b' }} />
                READY
              </div>
            </div>

            {/* ── Trip summary ── */}
            <TripSummaryStrip
              origin={form.origin}
              destination={form.destination}
              startDate={form.start_date}
              endDate={form.end_date}
              passengers={Number(form.passengers)}
            />

            {/* ── Plan body ── */}
            <div style={{ padding: '32px 36px 40px', maxHeight: '72vh', overflowY: 'auto' }}>
              {renderPlanText(result.plan_text)}
            </div>
          </div>
        </div>
      )}

      {/* Sticky download bar */}
      {result && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 100,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0,53,39,0.1)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{
            fontSize: '0.82rem', color: '#404944',
            fontFamily: "'Manrope', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Sparkles size={13} color="#006c4b" />
            Your itinerary is ready
          </div>
          <button
            onClick={handleDownload}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 24px',
              background: '#003527',
              color: 'rgba(255,255,255,1)', border: 'none', borderRadius: 14,
              fontSize: '0.88rem', fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,53,39,0.28)',
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
 * POST http://localhost:8000/plan
 *   method:  POST
 *   headers: { 'Content-Type': 'application/json' }
 *   body:    { origin, destination, start_date, end_date, passengers, budget }
 *
 * GET  http://localhost:8000/pdf/{pdf_id}
 *   method:  GET  (via window.open)
 *
 * Both calls are preserved verbatim from the original component.
 * ─────────────────────────────────────────────────────────────────
 */
