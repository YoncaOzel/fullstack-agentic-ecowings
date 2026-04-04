import { useState } from 'react';
import { Sparkles, Download, Loader2, MapPin, Calendar, Users, Wallet, Send } from 'lucide-react';

const AI_SERVICE_URL = 'http://localhost:8000';

const FIELD_STYLE = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1.5px solid rgba(34,197,94,0.22)',
  background: 'var(--bg-card, #fff)',
  color: 'var(--text-main, #1a1a1a)',
  fontSize: '0.95rem',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--green-primary, #2d6a4f)',
  marginBottom: '6px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

function InputGroup({ label, icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={LABEL_STYLE}>
        {Icon && <Icon size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />}
        {label}
      </label>
      {children}
    </div>
  );
}

function parseInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: '#1a4d33' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderSectionContent(lines) {
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '---' || trimmed === '***') return null;

    if (trimmed.startsWith('### ')) {
      return (
        <p key={i} style={{
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: '#40916c',
          margin: '14px 0 6px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {trimmed.replace(/^###\s*/, '')}
        </p>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const content = trimmed.replace(/^[-•*]\s/, '');
      return (
        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'flex-start' }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#40916c', flexShrink: 0, marginTop: '9px',
          }} />
          <span style={{ fontSize: '0.9rem', lineHeight: 1.68, color: 'var(--text-main, #2a2a2a)', flex: 1 }}>
            {parseInline(content)}
          </span>
        </div>
      );
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numberedMatch) {
      return (
        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'flex-start' }}>
          <span style={{
            minWidth: '20px', height: '20px', borderRadius: '50%',
            background: 'rgba(45,106,79,0.1)', color: '#2d6a4f',
            fontSize: '0.72rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: '2px',
          }}>
            {numberedMatch[1]}
          </span>
          <span style={{ fontSize: '0.9rem', lineHeight: 1.68, color: 'var(--text-main, #2a2a2a)', flex: 1 }}>
            {parseInline(numberedMatch[2])}
          </span>
        </div>
      );
    }

    return (
      <p key={i} style={{
        margin: '0 0 6px', fontSize: '0.9rem', lineHeight: 1.78,
        color: 'var(--text-main, #2a2a2a)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {parseInline(trimmed)}
      </p>
    );
  });
}

function renderPlanText(text) {
  const rawSections = text.split(/\n(?=##\s)/);

  return rawSections.map((section, sIdx) => {
    const lines = section.split('\n');
    const firstLine = lines[0].trim();
    const isSection = firstLine.startsWith('## ') || /^day\s+\d+/i.test(firstLine);

    if (isSection) {
      const title = firstLine.replace(/^##\s*/, '');
      const contentLines = lines.slice(1);
      return (
        <div key={sIdx} style={{
          background: 'var(--bg-main, #f8faf9)',
          borderRadius: '14px',
          border: '1px solid rgba(45,106,79,0.10)',
          padding: '18px 20px',
          marginBottom: '10px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '13px',
            paddingBottom: '11px',
            borderBottom: '1px solid rgba(45,106,79,0.10)',
          }}>
            <div style={{
              width: '3px', minHeight: '20px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, #2d6a4f, #52b788)',
              alignSelf: 'stretch',
            }} />
            <h3 style={{
              margin: 0, fontSize: '0.97rem', fontWeight: 800,
              color: '#1a4d33', letterSpacing: '-0.01em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {parseInline(title)}
            </h3>
          </div>
          <div>{renderSectionContent(contentLines)}</div>
        </div>
      );
    }

    const intro = lines.filter(l => l.trim());
    if (!intro.length) return null;
    return (
      <div key={sIdx} style={{
        padding: '4px 2px',
        marginBottom: '12px',
      }}>
        {renderSectionContent(lines)}
      </div>
    );
  });
}

export default function TravelPlannerPage() {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingBottom: '60px' }}>
      {/* Hero */}
      <section style={{ padding: '64px 20px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
          color: 'var(--green-primary, #2d6a4f)', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <Sparkles size={12} />
          AI TRAVEL PLANNER
        </div>

        <h1 style={{
          fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 800,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.15, letterSpacing: '-0.03em',
          color: '#1a4d33', margin: '0 0 14px',
        }}>
          Plan your perfect trip
        </h1>
        <p style={{
          color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7,
          maxWidth: '480px', margin: '0 auto',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Our AI agents research flights, hotels, and activities — and deliver a personalized itinerary in seconds.
        </p>
      </section>

      {/* Main content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px' }}>
        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-card, #fff)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1px solid rgba(34,197,94,0.12)',
            marginBottom: '28px',
          }}
        >
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.1rem', fontWeight: 700,
            color: '#1a4d33', margin: '0 0 24px',
          }}>
            Trip Details
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            marginBottom: '18px',
          }}>
            <InputGroup label="From" icon={MapPin}>
              <input
                style={FIELD_STYLE}
                type="text"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="e.g. Istanbul"
                required
              />
            </InputGroup>

            <InputGroup label="To" icon={MapPin}>
              <input
                style={FIELD_STYLE}
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g. Paris"
                required
              />
            </InputGroup>

            <InputGroup label="Departure Date" icon={Calendar}>
              <input
                style={FIELD_STYLE}
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <InputGroup label="Return Date" icon={Calendar}>
              <input
                style={FIELD_STYLE}
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <InputGroup label="Passengers" icon={Users}>
              <input
                style={FIELD_STYLE}
                type="number"
                name="passengers"
                value={form.passengers}
                onChange={handleChange}
                min={1}
                max={20}
                required
              />
            </InputGroup>

            <InputGroup label="Budget (optional)" icon={Wallet}>
              <input
                style={FIELD_STYLE}
                type="text"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 1500 USD"
              />
            </InputGroup>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#b91c1c', fontSize: '0.88rem', marginBottom: '16px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '13px 24px',
              background: loading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '0.97rem', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Planning...</>
            ) : (
              <><Send size={16} /> Create My Travel Plan</>
            )}
          </button>
        </form>

        {/* Loading message */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: '28px 20px',
            background: 'rgba(45,106,79,0.05)', borderRadius: '16px',
            border: '1px solid rgba(45,106,79,0.12)', marginBottom: '28px',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px',
            }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#2d6a4f',
                  animation: `bounce 1.2s ease-in-out ${delay}s infinite`,
                }} />
              ))}
            </div>
            <p style={{
              color: '#2d6a4f', fontWeight: 600, fontSize: '0.95rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0,
            }}>
              Our AI agents are researching flights, hotels and activities...
            </p>
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              This may take 30–60 seconds.
            </p>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div style={{
            background: 'var(--bg-card, #fff)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(45,106,79,0.10)',
            border: '1px solid rgba(34,197,94,0.13)',
            overflow: 'hidden',
          }}>
            {/* Result header */}
            <div style={{
              padding: '22px 28px 18px',
              background: 'linear-gradient(135deg, rgba(45,106,79,0.06) 0%, rgba(82,183,136,0.04) 100%)',
              borderBottom: '1px solid rgba(45,106,79,0.10)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Sparkles size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 800, fontSize: '1.05rem', color: '#1a4d33',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: '-0.02em',
                    }}>
                      Your Travel Plan
                    </div>
                    <div style={{
                      fontSize: '0.82rem', color: 'var(--text-muted)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      marginTop: '2px',
                      fontWeight: 500,
                    }}>
                      AI-generated itinerary — review before booking
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 18px',
                    background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontSize: '0.85rem', fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: 'pointer', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(45,106,79,0.25)',
                  }}
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>

              {/* Trip meta badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {[
                  { label: `${form.origin} → ${form.destination}` },
                  { label: `${form.start_date} – ${form.end_date}` },
                  { label: `${form.passengers} passenger${form.passengers > 1 ? 's' : ''}` },
                  ...(form.budget ? [{ label: `Budget: ${form.budget}` }] : []),
                ].map((badge, i) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    background: 'rgba(45,106,79,0.08)',
                    border: '1px solid rgba(45,106,79,0.14)',
                    color: '#2d6a4f',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Result body */}
            <div style={{
              padding: '24px 28px',
              maxHeight: '72vh',
              overflowY: 'auto',
            }}>
              {renderPlanText(result.plan_text)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
