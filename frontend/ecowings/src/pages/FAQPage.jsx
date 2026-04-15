import { useState, useRef, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────
   FAQ SERVICE
───────────────────────────────────────────────────────────────── */
const FAQ_SERVICE_URL = 'http://localhost:8000';

const FALLBACK =
  `I can't respond right now, sorry! 🙏\n\nPlease try again later or contact us via our support line:\n• 📧 support@ecowings.com`;

async function fetchResponse(text) {
  try {
    const res = await fetch(`${FAQ_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    return data.answer;
  } catch {
    return FALLBACK;
  }
}

/* ─────────────────────────────────────────────────────────────────
   SUGGESTED CHIPS
───────────────────────────────────────────────────────────────── */
const CHIPS = [
  { label: '✈️ How do I search for flights?', query: 'How do I search for flights on EcoWings?' },
  { label: '🔑 I forgot my password', query: ' I forgot my password. What should I do?' },
  { label: '🧳 What are the baggage rules?', query: 'What is the cabin baggage weight limit?' },
  { label: '🌿 Why is it called EcoWings?', query: 'Why is it called EcoWings?' }
];

/* ─────────────────────────────────────────────────────────────────
   RENDER HELPERS — Bold markdown (**text**) support
───────────────────────────────────────────────────────────────── */
function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} style={{ color: '#1a4d33', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </span>
    );
  });
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function FAQPage() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'ai',
      text: 'Hello! I\'m your EcoWings digital assistant. I can help you manage your bookings, check flight statuses, or explain our latest sustainability initiatives. How can I guide you today?',
      done: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  /* Scroll to bottom inside the chat box */
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  /* ── Typewriter effect ── */
  const typewriterEffect = (fullText, msgId) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, text: fullText.slice(0, i), done: i >= fullText.length }
            : m
        )
      );
      if (i >= fullText.length) clearInterval(interval);
    }, 18);
  };

  /* ── Send handler (accepts optional overrideText for hero search bar) ── */
  const handleSend = async (overrideText) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || loading) return;

    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;

    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: trimmed, done: true }]);
    setInput('');
    setLoading(true);

    const answer = await fetchResponse(trimmed);

    setLoading(false);
    setMessages((prev) => [...prev, { id: aiMsgId, role: 'ai', text: '', done: false }]);
    setTimeout(() => typewriterEffect(answer, aiMsgId), 60);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (query) => {
    if (loading) return;
    setInput(query);
    inputRef.current?.focus();
  };

  /* ── Hero search handler ── */
  const handleHeroSearch = () => {
    if (!searchInput.trim() || loading) return;
    handleSend(searchInput);
    setSearchInput('');
  };

  const handleHeroKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleHeroSearch();
    }
  };

  /* ── Fade-up intersection observer for hero elements ── */
  useEffect(() => {
    const els = document.querySelectorAll('.faq-fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '80px' }}>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{
        paddingTop: '80px',
        paddingBottom: '56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '340px',
          background: 'radial-gradient(ellipse, rgba(77,124,95,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulseOrb 6s ease-in-out infinite',
        }} />

        <div className="faq-fade-up fade-up">
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            fontFamily: "'Manrope', sans-serif",
            letterSpacing: '-0.03em',
            color: '#1a4d33',
            margin: '0 0 32px',
            lineHeight: 1.1,
          }}>
            How can we help?
          </h1>

          {/* Glassmorphic search bar */}
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: '-4px',
              background: 'rgba(77,124,95,0.06)',
              borderRadius: '9999px',
              filter: 'blur(8px)',
            }} />
            <div style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 12px 12px 24px',
              boxShadow: '0 4px 24px rgba(77,124,95,0.10)',
              border: '1px solid rgba(77,124,95,0.15)',
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-secondary)', marginRight: '14px', fontSize: '22px' }}>search</span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleHeroKeyDown}
                placeholder="Search for flights, booking issues, or Eco-Points..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <button
                onClick={handleHeroSearch}
                disabled={loading}
                style={{
                  background: '#1a4d33',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'opacity 0.2s ease',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TWO-COLUMN BODY ═══════════════════════════════ */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '48px',
          alignItems: 'start',
        }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Popular Categories */}
            <section>
              <h2 style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                marginBottom: '20px',
                paddingLeft: '4px',
                fontFamily: "'Inter', sans-serif",
              }}>
                Popular Categories
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: 'flight_takeoff', label: 'Flights', sub: 'Bookings & Cancellations', bg: 'rgba(34,197,94,0.12)', iconColor: '#1a4d33', chip: CHIPS[0] },
                  { icon: 'account_balance_wallet', label: 'Account', sub: 'Security & Preferences', bg: 'rgba(34,197,94,0.18)', iconColor: '#2f5e42', chip: CHIPS[1] },
                  { icon: 'luggage', label: 'Baggage', sub: 'Allowances & Tracking', bg: 'rgba(77,124,95,0.15)', iconColor: '#384d3e', chip: CHIPS[2] },
                  { icon: 'eco', label: 'Eco-Points', sub: 'Rewards & Sustainability', bg: 'rgba(34,197,94,0.22)', iconColor: '#2f5e42', chip: CHIPS[3] },
                ].map((cat) => (
                  <CategoryCard
                    key={cat.label}
                    icon={cat.icon}
                    label={cat.label}
                    sub={cat.sub}
                    iconBg={cat.bg}
                    iconColor={cat.iconColor}
                    onClick={() => handleChip(cat.chip.query)}
                    disabled={loading}
                  />
                ))}
              </div>
            </section>

            {/* Forest Image Card */}
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '1 / 1',
              cursor: 'pointer',
              boxShadow: '0 20px 60px rgba(26,77,51,0.20)',
            }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9wADNEPIvqP3VxM9TyW2CXi0Fk8FnU6TAp_SatMAwwFHfsHWtVPBdzh_8zUGWGeJviip2sXScjS_0nc5OEi-PmFasKkRy4pUmQvt_Tk4p0x5G7jNE2OPuBRyofzDIyu1ihv6zgxeTgI_gtXa7iaBNX6H3uTpNCUMny4eABjsxSxwT1cbhWlFevVBqlkphDCDjYmHAr_wmh_1jzET6gMlDZ0HAPsCj32_5z9cdI2xww376a1x-WzhQjqdSwUAJ3DgLkM3TRJ4DBZyF"
                alt="Lush green misty forest canopy"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.7s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(26,77,51,0.92) 0%, rgba(26,77,51,0.40) 50%, transparent 100%)',
              }} />
              <div style={{ position: 'absolute', bottom: 0, padding: '32px', color: '#ffffff' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(188,238,207,0.25)',
                  color: '#bceecf',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '16px',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Sustainability Report
                </span>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif",
                  lineHeight: 1.3,
                  margin: '0 0 8px',
                }}>
                  Our commitment to 2030 Carbon Neutrality.
                </h4>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'rgba(188,238,207,0.80)',
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Read how your flights contribute to reforestation.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — CHAT ── */}
          <div style={{ gridColumn: 'span 8' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '28px',
              boxShadow: '0 24px 80px rgba(26,77,51,0.08)',
              border: '1px solid rgba(77,124,95,0.10)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '750px',
            }}>

              {/* Chat header */}
              <div style={{
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                borderBottom: '1px solid rgba(77,124,95,0.08)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(77,124,95,0.30), rgba(26,77,51,0.20))',
                      border: '1px solid rgba(77,124,95,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#1a4d33',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>spa</span>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: '14px', height: '14px',
                      background: '#10b981',
                      border: '2px solid #ffffff',
                      borderRadius: '50%',
                    }} />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      color: '#1a4d33',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.95rem',
                    }}>
                      EcoWings Assistant
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      <span style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'inline-block',
                      }} />
                      Always online to help
                    </div>
                  </div>
                </div>
                <button style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  padding: 0,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(77,124,95,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_horiz</span>
                </button>
              </div>

              {/* Messages area */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px',
                  background: 'rgba(245,247,245,0.40)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(77,124,95,0.25) transparent',
                }}
              >
                {messages.map((msg) =>
                  msg.role === 'user'
                    ? <UserMessage key={msg.id} text={msg.text} />
                    : <AiMessage key={msg.id} text={msg.text} done={msg.done} />
                )}

                {/* Loading dots */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', animation: 'msgSlideIn 0.25s ease both' }}>
                    <AiAvatar />
                    <div style={{
                      padding: '14px 18px',
                      background: '#ffffff',
                      borderRadius: '20px 20px 20px 4px',
                      border: '1px solid rgba(77,124,95,0.06)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{
                          width: '7px', height: '7px',
                          borderRadius: '50%',
                          background: 'var(--green-primary)',
                          display: 'inline-block',
                          opacity: 0.8,
                          animation: `dotBounce 1.2s ease-in-out infinite ${i * 0.18}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div style={{
                padding: '20px 28px 24px',
                background: '#ffffff',
                borderTop: '1px solid rgba(77,124,95,0.08)',
                flexShrink: 0,
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Type your message here..."
                    rows={1}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'rgba(77,124,95,0.05)',
                      border: `1.5px solid ${inputFocused ? 'rgba(77,124,95,0.40)' : 'transparent'}`,
                      borderRadius: '16px',
                      padding: '14px 120px 14px 20px',
                      color: 'var(--text-primary)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      resize: 'none',
                      outline: 'none',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      caretColor: '#1a4d33',
                      opacity: loading ? 0.5 : 1,
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: inputFocused ? '0 0 0 3px rgba(77,124,95,0.08)' : 'none',
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <div style={{
                    position: 'absolute', right: '8px',
                    display: 'flex', alignItems: 'center', gap: '2px',
                  }}>
                    <button style={{
                      width: '36px', height: '36px',
                      background: 'transparent', border: 'none',
                      borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      transition: 'background 0.2s ease',
                      padding: 0,
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(77,124,95,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>attach_file</span>
                    </button>
                    <button style={{
                      width: '36px', height: '36px',
                      background: 'transparent', border: 'none',
                      borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      transition: 'background 0.2s ease',
                      padding: 0,
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(77,124,95,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mood</span>
                    </button>
                    <SendButton onClick={handleSend} disabled={!input.trim() || loading} />
                  </div>
                </div>
                <p style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.65rem',
                  margin: '12px 0 0',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 500,
                }}>
                  EcoWings AI uses verified flight data · Human agents available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BROWSE KNOWLEDGE BASE ════════════════════════ */}
        <section style={{ marginTop: '80px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                fontFamily: "'Manrope', sans-serif",
                color: '#1a4d33',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}>
                Browse Knowledge Base
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
              }}>
                Find detailed guides curated by our travel experts.
              </p>
            </div>
            <button style={{
              background: 'transparent',
              border: 'none',
              color: '#1a4d33',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: 0,
              transition: 'gap 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.gap = '14px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.gap = '8px'; }}
            >
              View all documentation
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: 'verified_user',
                title: 'Booking Protection',
                desc: 'Understand how our comprehensive travel protection works for delayed or cancelled flights.',
                bullets: ['Claims process', 'Eligibility rules'],
              },
              {
                icon: 'public',
                title: 'Sustainable Travel',
                desc: 'Learn about SAF (Sustainable Aviation Fuel) and how to redeem points for climate projects.',
                bullets: ['SAF contributions', 'Reward partners'],
              },
              {
                icon: 'credit_card',
                title: 'Payments & Refunds',
                desc: 'Information on accepted payment methods, currency conversion, and refund timelines.',
                bullets: ['Refund status', 'Card security'],
              },
            ].map((card) => (
              <KnowledgeCard key={card.title} {...card} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SUB COMPONENTS
───────────────────────────────────────────────────────────────── */

function CategoryCard({ icon, label, sub, iconBg, iconColor, onClick, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '18px 20px',
        borderRadius: '18px',
        background: hovered ? '#ffffff' : 'rgba(255,255,255,0.60)',
        border: `1px solid ${hovered ? 'rgba(77,124,95,0.20)' : 'transparent'}`,
        boxShadow: hovered ? '0 4px 20px rgba(26,77,51,0.08)' : '0 2px 8px rgba(26,77,51,0.04)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        gap: '14px',
      }}
    >
      <div style={{
        width: '48px', height: '48px',
        borderRadius: '14px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}>
        <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '22px' }}>{icon}</span>
      </div>
      <div>
        <div style={{
          fontWeight: 600,
          color: '#1a4d33',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.9rem',
          marginBottom: '3px',
        }}>
          {label}
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          fontFamily: "'Inter', sans-serif",
        }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      gap: '12px',
      animation: 'msgSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <div style={{
        width: '32px', height: '32px',
        borderRadius: '50%',
        background: 'rgba(34,197,94,0.18)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '2px',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2f5e42' }}>person</span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          maxWidth: '380px',
          background: '#1a4d33',
          color: '#ffffff',
          borderRadius: '20px 20px 4px 20px',
          padding: '14px 18px',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 6px 24px rgba(26,77,51,0.25)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textAlign: 'left',
        }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function AiAvatar() {
  return (
    <div style={{
      width: '32px', height: '32px',
      borderRadius: '50%',
      background: 'rgba(77,124,95,0.20)',
      border: '1px solid rgba(77,124,95,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#1a4d33',
      flexShrink: 0,
      marginTop: '2px',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>spa</span>
    </div>
  );
}

function AiMessage({ text, done }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      animation: 'msgSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <AiAvatar />
      <div>
        <div style={{
          background: '#ffffff',
          borderRadius: '4px 20px 20px 20px',
          padding: '14px 18px',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          fontFamily: "'Inter', sans-serif",
          color: 'var(--text-primary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid rgba(77,124,95,0.06)',
          maxWidth: '480px',
          wordBreak: 'break-word',
        }}>
          {renderText(text)}
          {!done && (
            <span style={{
              display: 'inline-block',
              width: '2px', height: '14px',
              background: '#1a4d33',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'cursorBlink 0.9s step-end infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

function SendButton({ onClick, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '40px', height: '40px',
        borderRadius: '12px',
        border: 'none',
        background: disabled
          ? 'rgba(77,124,95,0.15)'
          : hovered
          ? 'linear-gradient(135deg, #2f5e42, #1a4d33)'
          : 'linear-gradient(135deg, #1a4d33, #2f5e42)',
        color: disabled ? 'rgba(77,124,95,0.40)' : '#ffffff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.18s ease',
        transform: hovered && !disabled ? 'scale(1.06)' : 'scale(1)',
        boxShadow: !disabled ? '0 4px 16px rgba(26,77,51,0.30)' : 'none',
        padding: 0,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
    </button>
  );
}

function KnowledgeCard({ icon, title, desc, bullets }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '32px',
        borderRadius: '24px',
        background: hovered ? 'rgba(77,124,95,0.06)' : 'rgba(77,124,95,0.04)',
        border: `1px solid ${hovered ? 'rgba(77,124,95,0.15)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <span className="material-symbols-outlined" style={{
        fontSize: '32px',
        color: 'rgba(47,94,66,0.60)',
        display: 'block',
        marginBottom: '16px',
      }}>
        {icon}
      </span>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#1a4d33',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        margin: '0 0 10px',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        margin: '0 0 20px',
        fontFamily: "'Inter', sans-serif",
      }}>
        {desc}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bullets.map((b) => (
          <li key={b} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(26,77,51,0.70)',
            fontFamily: "'Inter', sans-serif",
          }}>
            <span style={{
              width: '5px', height: '5px',
              borderRadius: '50%',
              background: '#1a4d33',
              flexShrink: 0,
            }} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
