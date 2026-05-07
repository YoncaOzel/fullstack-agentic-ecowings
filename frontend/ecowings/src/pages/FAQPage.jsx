import { useState, useRef, useEffect } from 'react';

/* ── backend (preserved) ── */
const FAQ_SERVICE_URL = import.meta.env.VITE_FAQ_SERVICE_URL
  || import.meta.env.VITE_AI_SERVICE_URL
  || 'http://localhost:8001';
const FALLBACK = `I can't respond right now, sorry!\n\nPlease try again later:\n• support@ecowings.com`;

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

function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} style={{ color: '#0F3D2E', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </span>
    );
  });
}

/* ── data ── */
const TOPICS = [
  {
    key: 'flights', label: 'Flights', sub: 'Bookings & cancellations', count: 12,
    svg: <><path d="M2 12 22 4l-4 18-5-7-7-3Z"/></>,
  },
  {
    key: 'account', label: 'Account', sub: 'Security & preferences', count: 8,
    svg: <><path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
  },
  {
    key: 'baggage', label: 'Baggage', sub: 'Allowances & tracking', count: 6,
    svg: <><rect x="5" y="7" width="14" height="14" rx="2"/><path d="M9 7V4h6v3M9 12h6"/></>,
  },
  {
    key: 'eco', label: 'Eco-Points', sub: 'Rewards & sustainability', count: 9,
    svg: <><path d="M11 20C5 20 3 15 3 12c0-3 2-7 8-9 0 6 3 8 6 9-1 5-3 8-6 8Z"/></>,
  },
  {
    key: 'payment', label: 'Payments', sub: 'Refunds & receipts', count: 7,
    svg: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  },
];


const FAQ_DATA = {
  flights: {
    label: 'Flights', count: 12,
    items: [
      {
        q: 'How do I change or cancel a flight?',
        a: '<p>You can change or cancel any booking from <strong>My Trips</strong> up to 2 hours before departure. Standard fares are refundable to original payment within 7 business days; Light fares are refundable to EcoWings credit, valid for 12 months.</p><p>If you booked through a partner airline, fees follow the operating carrier\'s policy — we\'ll show the exact figure before you confirm.</p>',
      },
      {
        q: 'What does the eco-route badge actually mean?',
        a: '<p>The badge marks the lowest-impact option for your search, weighted across three factors: aircraft generation (newer = more efficient), routing (fewer detours, optimal cruise altitude), and load factor at booking time.</p><ul><li><strong>Eco-recommended</strong> — top 25% of options, lowest emissions per passenger-km.</li><li><strong>Fast &amp; efficient</strong> — direct route, mid-tier emissions.</li><li><strong>Standard</strong> — every other valid option.</li></ul>',
      },
      {
        q: 'Can I rebook to another date for free?',
        a: '<p>Yes — within 24 hours of booking, all changes are free. After that, fee depends on fare type and how close to departure you are. Eco-recommended fares come with a 50% reduced change fee, our way of nudging the greener choice.</p>',
      },
      {
        q: 'What happens if my flight is delayed or cancelled?',
        a: '<p>We re-route you automatically and send the new itinerary by SMS, email, and inside the app. If the delay exceeds 3 hours on a covered route, you\'re entitled to compensation per the operating airline\'s terms — we file the claim on your behalf, no paperwork required.</p>',
      },
      {
        q: 'Do you support multi-city or open-jaw bookings?',
        a: '<p>Yes. Add up to 6 segments in one search using the <em>Multi-city</em> tab. We score the entire itinerary\'s carbon footprint together, not segment by segment, so the eco-recommendations actually optimize for the whole trip.</p>',
      },
    ],
  },
  account: {
    label: 'Account', count: 8,
    items: [
      {
        q: 'How do I enable two-factor authentication?',
        a: '<p>Open <strong>Settings → Security</strong> and tap <em>Add 2FA</em>. We recommend an authenticator app over SMS for stronger protection. Recovery codes are generated immediately — store them somewhere safe.</p>',
      },
      {
        q: 'Can I have multiple travelers on one account?',
        a: '<p>Yes. Add up to 8 travelers (family or colleagues) under <strong>Profile → Travelers</strong>. Their documents and preferences are stored separately, but bookings show up under one calendar.</p>',
      },
      {
        q: 'How do I export my booking history?',
        a: '<p>From <strong>Settings → Data</strong>, request an export. You\'ll receive a CSV (and optional PDF) with every booking, payment, and impact metric within 24 hours.</p>',
      },
      {
        q: "What's the difference between profiles and travelers?",
        a: '<p>Your <em>profile</em> is the account holder — login, billing, preferences. <em>Travelers</em> are anyone you book for: their passport details, frequent flyer numbers, and meal preferences live there.</p>',
      },
    ],
  },
  baggage: {
    label: 'Baggage', count: 6,
    items: [
      {
        q: "What's included in my fare?",
        a: '<p>Every fare includes one personal item (under-seat). Carry-on (8 kg) is included on Standard and above; checked bags depend on route and fare. The exact allowance is shown above the fare summary, never hidden in the fine print.</p>',
      },
      {
        q: 'Can I track my checked bag in real time?',
        a: '<p>Yes — once your bag is tagged at the airport, it appears in <strong>My Trips → Live tracking</strong> with each scan event. Alerts fire if it\'s flagged for re-routing.</p>',
      },
      {
        q: 'What if my bag is lost or damaged?',
        a: '<p>File a Property Irregularity Report (PIR) at the airport within 7 days of arrival, then submit it through the app. Most claims resolve within 21 days; we\'ll keep you posted at every step.</p>',
      },
    ],
  },
  eco: {
    label: 'Eco-Points', count: 9,
    items: [
      {
        q: 'How are Eco-Points earned?',
        a: '<p>You earn 1 point per kg of CO₂ avoided versus the highest-emission option for the same route. Picking the eco-recommended flight, flying direct, or choosing newer aircraft all earn more.</p><p>Points stack in your wallet and never expire while your account is active.</p>',
      },
      {
        q: 'What can I redeem Eco-Points for?',
        a: '<p>Three things, in this order of impact: discounts on future bookings, donations to verified reforestation partners, or sustainable aviation fuel (SAF) contributions logged transparently to your impact dashboard.</p>',
      },
      {
        q: 'Are Eco-Points the same as carbon offsets?',
        a: '<p>No. Offsets are bought from a market; Eco-Points are <em>earned</em> by the choices you make at booking time. We\'re skeptical of offset-only models — points reward avoidance first, mitigation second.</p>',
      },
      {
        q: 'Can I share my Eco-Points with family?',
        a: '<p>Yes — pool them with up to 4 family members under one Eco-Wallet. Useful when planning a household trip together.</p>',
      },
    ],
  },
  payment: {
    label: 'Payments', count: 7,
    items: [
      {
        q: 'Which payment methods do you accept?',
        a: '<p>Visa, Mastercard, Amex, Apple Pay, Google Pay, and SEPA bank transfer in supported regions. We don\'t add card surcharges.</p>',
      },
      {
        q: 'When am I actually charged?',
        a: '<p>At booking confirmation, never before. If a fare changes between search and checkout, we re-quote and ask you to re-confirm — no silent price jumps.</p>',
      },
      {
        q: 'How do refunds work?',
        a: '<p>Refunds return to your original payment method within 5–10 business days for cards, 1–3 for SEPA. EcoWings credit refunds are instant.</p>',
      },
    ],
  },
};

/* ── inline SVG helpers ── */
const Svg = ({ size = 18, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

export default function FAQPage() {
  /* ── existing chat state ── */
  const [messages, setMessages] = useState([{
    id: 0, role: 'ai', done: true,
    text: "Hi — I'm your EcoWings Assistant. I can help you manage bookings, check flight statuses, or explain our latest sustainability initiatives. How can I guide you today?",
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef  = useRef(null);
  const inputRef = useRef(null);

  /* ── new UI state ── */
  const [activeTopic, setActiveTopic]   = useState('flights');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [votes, setVotes]               = useState({});
  const [searchValue, setSearchValue]   = useState('');
  const faqRef = useRef(null);

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  /* ── typewriter (preserved) ── */
  const typewriter = (fullText, msgId) => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, text: fullText.slice(0, i), done: i >= fullText.length } : m
      ));
      if (i >= fullText.length) clearInterval(iv);
    }, 18);
  };

  /* ── handleSend (preserved) ── */
  const handleSend = async (override) => {
    const trimmed = (override ?? input).trim();
    if (!trimmed || loading) return;
    const uid = Date.now(), aid = uid + 1;
    setMessages(p => [...p, { id: uid, role: 'user', text: trimmed, done: true }]);
    setInput('');
    setLoading(true);
    const answer = await fetchResponse(trimmed);
    setLoading(false);
    setMessages(p => [...p, { id: aid, role: 'ai', text: '', done: false }]);
    setTimeout(() => typewriter(answer, aid), 60);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTopicClick = (key) => {
    setActiveTopic(key);
    setOpenFaqIndex(0);
    setTimeout(() => faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleAskAssistant = () => {
    if (searchValue.trim()) {
      handleSend(searchValue);
      setSearchValue('');
    }
    inputRef.current?.focus();
  };

  const currentTopic = FAQ_DATA[activeTopic];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .fw-root {
          --forest-900:#0B2E22; --forest-800:#0F3D2E; --forest-700:#164A38;
          --forest-600:#1F6B4A; --forest-500:#2E8B5F;
          --sage-200:#D6E4DA; --sage-100:#E8F0EA; --sage-50:#F1F6F2;
          --cream:#FAFAF7; --ink:#1A1A1A; --ink-60:#5A5F5C; --ink-40:#8A8E8B;
          --line:#E5E7E3;
          --shadow-sm: 0 1px 2px rgba(15,61,46,.04), 0 2px 8px rgba(15,61,46,.04);
          --shadow-md: 0 4px 12px rgba(15,61,46,.06), 0 16px 40px rgba(15,61,46,.08);
          font-family: "Plus Jakarta Sans", system-ui, sans-serif;
          color: var(--ink);
          background: var(--cream);
          -webkit-font-smoothing: antialiased;
          line-height: 1.5;
          min-height: 100vh;
        }
        .fw-root * { box-sizing: border-box; }

        /* ── HERO ── */
        .fw-hero {
          background:
            radial-gradient(800px 360px at 80% 0%, rgba(46,139,95,.10), transparent 60%),
            radial-gradient(600px 280px at 0% 100%, rgba(46,139,95,.08), transparent 60%),
            var(--cream);
          border-bottom: 1px solid var(--line);
          padding: 88px 32px 56px;
        }
        .fw-hero-inner { max-width: 1240px; margin: 0 auto; }
        .fw-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          color: var(--forest-700); font-size: 12px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
        }
        .fw-eyebrow::before { content: ""; width: 24px; height: 1px; background: var(--forest-700); }
        .fw-hero h1 {
          font-family: "Plus Jakarta Sans", sans-serif;
          margin-top: 18px;
          font-size: clamp(40px, 5.4vw, 72px);
          font-weight: 700; max-width: 18ch;
          letter-spacing: -0.02em; line-height: 1.05;
        }
        .fw-hero h1 em {
          font-family: "Instrument Serif", serif;
          font-style: italic; font-weight: 400;
          color: var(--forest-700);
        }
        .fw-hero p {
          margin-top: 18px; max-width: 60ch;
          color: var(--ink-60); font-size: 17px; line-height: 1.65;
        }

        /* ── LAYOUT ── */
        .fw-wrap { max-width: 1240px; margin: 0 auto; padding: 56px 32px 96px; }
        .fw-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 40px;
          align-items: flex-start;
        }

        /* ── SIDEBAR ── */
        .fw-side { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 24px; }
        .fw-side-card {
          background: #fff; border: 1px solid var(--line);
          border-radius: 24px; padding: 24px;
        }
        .fw-side-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--ink-40); margin-bottom: 16px;
        }

        /* Topics */
        .fw-topics { display: flex; flex-direction: column; gap: 6px; }
        .fw-topic {
          all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 14px;
          padding: 14px; border-radius: 14px;
          border: 1px solid transparent; background: transparent;
          text-align: left; cursor: pointer; width: 100%;
          transition: all .2s ease;
        }
        .fw-topic:hover { background: var(--sage-50); }
        .fw-topic.active {
          background: var(--sage-50);
          border-color: rgba(46,139,95,0.25);
          box-shadow: var(--shadow-sm);
        }
        .fw-topic-ico {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--sage-100); color: var(--forest-700);
          display: grid; place-items: center; flex-shrink: 0;
          transition: all .2s ease;
        }
        .fw-topic.active .fw-topic-ico,
        .fw-topic:hover .fw-topic-ico { background: var(--forest-800); color: #fff; }
        .fw-topic-text { flex: 1; min-width: 0; }
        .fw-topic-text .fw-ttl { font-weight: 700; font-size: 14.5px; color: var(--ink); }
        .fw-topic-text .fw-sub { font-size: 12.5px; color: var(--ink-40); margin-top: 2px; display: block; }
        .fw-topic-arrow { color: var(--ink-40); transition: transform .2s ease; flex-shrink: 0; }
        .fw-topic:hover .fw-topic-arrow { transform: translateX(3px); color: var(--forest-700); }
        .fw-topic-count {
          margin-left: auto; font-size: 11.5px; font-weight: 600;
          color: var(--ink-40); background: var(--cream);
          border: 1px solid var(--line); border-radius: 999px; padding: 2px 8px;
        }
        .fw-topic.active .fw-topic-count { background: #fff; color: var(--forest-700); border-color: rgba(46,139,95,0.3); }

        /* Stats */
        .fw-stats { display: flex; flex-direction: column; gap: 18px; }
        .fw-stat { padding-bottom: 18px; border-bottom: 1px solid var(--line); }
        .fw-stat:last-child { border-bottom: none; padding-bottom: 0; }
        .fw-stat .fw-num {
          font-size: 30px; font-weight: 700; letter-spacing: -0.02em; line-height: 1;
          color: var(--ink);
        }
        .fw-stat .fw-num em {
          font-family: "Instrument Serif", serif; font-style: italic;
          font-weight: 400; color: var(--forest-700);
        }
        .fw-stat .fw-lbl { margin-top: 8px; font-size: 13px; color: var(--ink-60); line-height: 1.45; }

        /* Contact card */
        .fw-contact-card {
          background: var(--forest-900); color: #fff;
          border-radius: 24px; padding: 24px;
          position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .fw-contact-card::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(400px 200px at 100% 0%, rgba(46,139,95,.30), transparent 60%);
          pointer-events: none;
        }
        .fw-contact-card > * { position: relative; }
        .fw-contact-card .fw-ttl { font-size: 16px; font-weight: 700; }
        .fw-contact-card .fw-sub { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 6px; line-height: 1.5; }
        .fw-contact-row {
          display: flex; align-items: center; gap: 12px;
          margin-top: 16px; padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          color: #fff; text-decoration: none; transition: background .2s ease;
          cursor: pointer;
        }
        .fw-contact-row:hover { background: rgba(255,255,255,0.08); }
        .fw-contact-ic {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(46,139,95,0.25); color: #BFE3CC;
          display: grid; place-items: center; flex-shrink: 0;
        }
        .fw-contact-nm { font-size: 13.5px; font-weight: 600; }
        .fw-contact-ds { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 1px; }

        /* ── MAIN ── */
        .fw-main { display: flex; flex-direction: column; gap: 24px; }

        /* Search */
        .fw-search-card {
          background: #fff; border: 1px solid var(--line); border-radius: 20px;
          padding: 8px 8px 8px 20px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: var(--shadow-sm); transition: all .2s ease;
        }
        .fw-search-card:focus-within {
          border-color: var(--forest-600);
          box-shadow: 0 0 0 4px rgba(46,139,95,.10);
        }
        .fw-search-input {
          flex: 1; border: none; outline: none; background: transparent;
          font: inherit; font-size: 16px; padding: 14px 0; color: var(--ink);
        }
        .fw-search-input::placeholder { color: var(--ink-40); }
        .fw-search-key {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; color: var(--ink-40);
          background: var(--cream); border: 1px solid var(--line);
          border-radius: 6px; padding: 4px 7px; white-space: nowrap;
        }
        .fw-ask-btn {
          all: unset; padding: 12px 20px; border-radius: 14px;
          background: var(--forest-800); color: #fff;
          font-weight: 600; font-size: 14px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: all .2s ease; white-space: nowrap;
        }
        .fw-ask-btn:hover { background: var(--forest-700); transform: translateY(-1px); box-shadow: var(--shadow-md); }

        /* Chat panel */
        .fw-chat {
          background: #fff; border: 1px solid var(--line);
          border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-md);
        }
        .fw-chat-head {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 22px; border-bottom: 1px solid var(--line);
          background: linear-gradient(180deg, #fff, var(--cream));
        }
        .fw-assistant-av {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(160deg, var(--forest-700), var(--forest-900));
          display: grid; place-items: center; color: #BFE3CC;
          flex-shrink: 0; box-shadow: 0 6px 14px rgba(15,61,46,.18);
        }
        .fw-chat-meta { flex: 1; min-width: 0; }
        .fw-chat-nm { font-weight: 700; font-size: 15px; }
        .fw-chat-st {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 2px; font-size: 12.5px; color: var(--forest-700); font-weight: 500;
        }
        .fw-pulse {
          width: 7px; height: 7px; border-radius: 50%; background: var(--forest-500);
          box-shadow: 0 0 0 0 rgba(46,139,95,.6);
          animation: fwPulse 1.6s ease-out infinite;
        }
        @keyframes fwPulse {
          0%  { box-shadow: 0 0 0 0 rgba(46,139,95,.5); }
          100%{ box-shadow: 0 0 0 10px rgba(46,139,95,0); }
        }
        .fw-enc-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--forest-700);
          background: var(--sage-50); border: 1px solid rgba(46,139,95,0.2);
          border-radius: 999px; padding: 6px 12px;
        }

        /* Chat body */
        .fw-chat-body {
          padding: 24px 22px;
          display: flex; flex-direction: column; gap: 18px;
          min-height: 380px; max-height: 520px;
          overflow-y: auto;
          background: radial-gradient(400px 200px at 100% 0%, rgba(46,139,95,.05), transparent 60%);
        }
        .fw-chat-body::-webkit-scrollbar { width: 6px; }
        .fw-chat-body::-webkit-scrollbar-thumb { background: var(--sage-200); border-radius: 999px; }

        .fw-msg { display: flex; gap: 12px; max-width: 90%; animation: fwMsgIn .3s ease both; }
        .fw-msg.fw-bot { align-self: flex-start; }
        .fw-msg.fw-user { align-self: flex-end; flex-direction: row-reverse; }
        @keyframes fwMsgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

        .fw-msg-av {
          width: 32px; height: 32px; border-radius: 10px;
          flex-shrink: 0; display: grid; place-items: center;
          font-size: 11px; font-weight: 700;
        }
        .fw-msg.fw-bot .fw-msg-av {
          background: linear-gradient(160deg, var(--forest-700), var(--forest-900));
          color: #BFE3CC;
        }
        .fw-msg.fw-user .fw-msg-av { background: var(--sage-100); color: var(--forest-800); }

        .fw-bubble { border-radius: 16px; padding: 14px 16px; font-size: 14.5px; line-height: 1.6; }
        .fw-msg.fw-bot .fw-bubble {
          background: var(--sage-50); border: 1px solid rgba(46,139,95,0.12);
          color: var(--ink); border-top-left-radius: 6px;
        }
        .fw-msg.fw-user .fw-bubble {
          background: var(--forest-800); color: #fff;
          border-top-right-radius: 6px;
        }
        .fw-cursor {
          display: inline-block; width: 2px; height: .85em;
          background: var(--ink-40); margin-left: 2px; vertical-align: -1px;
          animation: fwBlink .9s steps(2) infinite;
        }
        @keyframes fwBlink { 50% { opacity: 0; } }

        .fw-typing { display: inline-flex; gap: 4px; padding: 4px 0; }
        .fw-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--forest-600);
          animation: fwBounce 1.2s ease-in-out infinite;
        }
        .fw-typing span:nth-child(2) { animation-delay: .15s; }
        .fw-typing span:nth-child(3) { animation-delay: .3s; }
        @keyframes fwBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        /* Suggested chips */
        .fw-suggested button {
          all: unset; background: #fff; border: 1px solid var(--line);
          color: var(--ink); border-radius: 999px; padding: 8px 14px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all .2s ease; display: inline-flex; align-items: center; gap: 8px;
        }
        .fw-suggested button:hover {
          border-color: var(--forest-600); color: var(--forest-700);
          background: var(--sage-50); transform: translateY(-1px);
        }
        .fw-chip-arrow { color: var(--ink-40); transition: all .2s ease; }
        .fw-suggested button:hover .fw-chip-arrow { color: var(--forest-700); transform: translateX(2px); }

        /* Composer */
        .fw-composer-wrap { padding: 12px 14px 14px; border-top: 1px solid var(--line); background: var(--cream); }
        .fw-composer {
          background: #fff; border: 1px solid var(--line); border-radius: 16px;
          padding: 10px 10px 10px 18px;
          display: flex; align-items: center; gap: 10px; transition: all .2s ease;
        }
        .fw-composer:focus-within {
          border-color: var(--forest-600);
          box-shadow: 0 0 0 4px rgba(46,139,95,.10);
        }
        .fw-composer-input {
          flex: 1; border: none; outline: none; background: transparent;
          font: inherit; font-size: 15px; padding: 10px 0; color: var(--ink);
          resize: none; max-height: 160px; scrollbar-width: thin;
        }
        .fw-composer-input::placeholder { color: var(--ink-40); }
        .fw-icobtn {
          all: unset; border: none; background: transparent;
          width: 36px; height: 36px; border-radius: 10px;
          display: grid; place-items: center;
          color: var(--ink-40); cursor: pointer; transition: all .15s ease;
        }
        .fw-icobtn:hover { color: var(--forest-700); background: var(--sage-50); }
        .fw-send-btn {
          all: unset; width: 40px; height: 40px; border-radius: 12px;
          background: var(--forest-800); color: #fff;
          display: grid; place-items: center; cursor: pointer;
          transition: all .2s ease; flex-shrink: 0;
        }
        .fw-send-btn:hover { background: var(--forest-700); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .fw-send-btn:disabled { background: var(--sage-200); cursor: not-allowed; transform: none; }
        .fw-composer-foot {
          display: flex; align-items: center; justify-content: center; gap: 14px;
          margin-top: 10px; font-size: 12px; color: var(--ink-40);
        }
        .fw-dot-sep {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--ink-40); display: inline-block;
        }

        /* ── FAQ block ── */
        .fw-faq-block {
          background: #fff; border: 1px solid var(--line);
          border-radius: 24px; padding: 28px 28px 8px;
        }
        .fw-faq-head {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
          padding-bottom: 20px; border-bottom: 1px solid var(--line); margin-bottom: 8px;
        }
        .fw-faq-head h2 {
          font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05;
        }
        .fw-faq-head h2 em {
          font-family: "Instrument Serif", serif; font-style: italic;
          font-weight: 400; color: var(--forest-700);
        }
        .fw-faq-head p { margin: 6px 0 0; color: var(--ink-60); font-size: 14.5px; }
        .fw-faq-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; color: var(--forest-700);
          background: var(--sage-50); border: 1px solid rgba(46,139,95,0.2);
          border-radius: 999px; padding: 8px 14px; flex-shrink: 0; white-space: nowrap;
        }
        .fw-faq-tag b { color: var(--ink); }

        /* Accordion */
        .fw-qa { border-bottom: 1px solid var(--line); transition: background .2s ease; }
        .fw-qa:last-child { border-bottom: none; }
        .fw-qa-q {
          all: unset; width: 100%; padding: 22px 4px;
          text-align: left; cursor: pointer;
          display: flex; align-items: center; gap: 16px; color: var(--ink);
          font: inherit; transition: color .15s ease;
        }
        .fw-qa-q:hover { color: var(--forest-700); }
        .fw-qnum {
          font-family: "Instrument Serif", serif; font-style: italic;
          color: var(--forest-700); font-size: 16px; width: 28px; flex-shrink: 0;
        }
        .fw-qttl { flex: 1; font-size: 16.5px; font-weight: 600; letter-spacing: -0.005em; }
        .fw-plus {
          width: 32px; height: 32px; border-radius: 10px;
          background: var(--cream); border: 1px solid var(--line);
          color: var(--ink-60); display: grid; place-items: center; flex-shrink: 0;
          transition: all .25s ease;
        }
        .fw-qa.fw-open .fw-plus {
          background: var(--forest-800); color: #fff; border-color: var(--forest-800);
          transform: rotate(45deg);
        }
        .fw-qa-a {
          max-height: 0; overflow: hidden;
          transition: max-height .35s cubic-bezier(.2,.7,.2,1);
        }
        .fw-qa-a-inner {
          padding: 0 4px 22px 48px;
          color: var(--ink-60); font-size: 15px; line-height: 1.7;
        }
        .fw-qa-a-inner p { margin: 0; }
        .fw-qa-a-inner p + p { margin-top: 10px; }
        .fw-qa-a-inner ul { margin: 8px 0 0; padding-left: 18px; }
        .fw-qa-a-inner li { margin-top: 4px; }
        .fw-qa-foot {
          margin-top: 14px; padding-top: 14px;
          border-top: 1px dashed var(--line);
          display: flex; align-items: center; gap: 14px;
          font-size: 12.5px; color: var(--ink-40);
        }
        .fw-vote-btn {
          all: unset; border: 1px solid var(--line); background: #fff;
          border-radius: 999px; padding: 6px 12px;
          font-size: 12px; font-weight: 600; color: var(--ink-60);
          cursor: pointer; transition: all .15s ease;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .fw-vote-btn:hover { border-color: var(--forest-600); color: var(--forest-700); }
        .fw-vote-btn.fw-active { background: var(--sage-50); color: var(--forest-700); border-color: rgba(46,139,95,0.3); }
        .fw-qa-reviewed { margin-left: auto; font-size: 12.5px; }

        /* ── Bottom CTA ── */
        .fw-cta {
          margin-top: 8px;
          background: var(--forest-900); color: #fff;
          border-radius: 24px; padding: 36px;
          display: flex; align-items: center; gap: 24px;
          justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .fw-cta::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(500px 250px at 90% 0%, rgba(46,139,95,.35), transparent 60%);
        }
        .fw-cta > * { position: relative; }
        .fw-cta h3 {
          font-size: 24px; font-weight: 700; letter-spacing: -0.02em;
        }
        .fw-cta h3 em {
          font-family: "Instrument Serif", serif; font-style: italic;
          font-weight: 400; color: #BFE3CC;
        }
        .fw-cta p { margin: 6px 0 0; color: rgba(255,255,255,0.7); font-size: 14.5px; max-width: 50ch; }
        .fw-cta-actions { display: flex; gap: 10px; flex-shrink: 0; }
        .fw-cta-btn {
          all: unset; display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 18px; border-radius: 999px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          border: 1px solid transparent; transition: all .2s ease;
        }
        .fw-cta-btn.fw-primary { background: #fff; color: var(--forest-800); }
        .fw-cta-btn.fw-primary:hover { background: var(--sage-100); transform: translateY(-1px); }
        .fw-cta-btn.fw-ghost { background: transparent; color: #fff; border-color: rgba(255,255,255,0.2); }
        .fw-cta-btn.fw-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.05); }

        /* ── Responsive ── */
        @media (max-width: 980px) {
          .fw-grid { grid-template-columns: 1fr; gap: 32px; }
          .fw-side { position: static; }
          .fw-hero { padding: 64px 24px 40px; }
          .fw-wrap { padding: 40px 24px 72px; }
          .fw-cta { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 560px) {
          .fw-hero { padding: 48px 20px 32px; }
          .fw-wrap { padding: 32px 20px 56px; }
          .fw-faq-block { padding: 20px 18px 4px; }
          .fw-chat-body { padding: 18px 14px; }
          .fw-chat-head { padding: 14px 16px; }
          .fw-composer-wrap { padding: 10px; }
          .fw-faq-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="fw-root">

        {/* ── HERO ── */}
        <section className="fw-hero">
          <div className="fw-hero-inner">
            <span className="fw-eyebrow">Help Center · v2026.04</span>
            <h1>How can we <em>help</em> you fly today?</h1>
            <p>Ask our assistant, browse by topic, or jump straight to the questions our travelers ask most. Honest answers, sourced data, and a real human one click away.</p>
          </div>
        </section>

        <div className="fw-wrap">
          <div className="fw-grid">

            {/* ── SIDEBAR ── */}
            <aside className="fw-side">

              {/* Topics */}
              <div className="fw-side-card">
                <div className="fw-side-label">Browse by topic</div>
                <div className="fw-topics">
                  {TOPICS.map(t => (
                    <button
                      key={t.key}
                      className={`fw-topic${activeTopic === t.key ? ' active' : ''}`}
                      onClick={() => handleTopicClick(t.key)}
                    >
                      <div className="fw-topic-ico">
                        <Svg size={18}>{t.svg}</Svg>
                      </div>
                      <div className="fw-topic-text">
                        <div className="fw-ttl">{t.label}</div>
                        <span className="fw-sub">{t.sub}</span>
                      </div>
                      <span className="fw-topic-count">{t.count}</span>
                      <span className="fw-topic-arrow">
                        <Svg size={16}><path d="M9 18l6-6-6-6"/></Svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="fw-side-card">
                <div className="fw-side-label">Support stats</div>
                <div className="fw-stats">
                  <div className="fw-stat">
                    <div className="fw-num">98<em>%</em></div>
                    <div className="fw-lbl">Questions resolved without agent support.</div>
                  </div>
                  <div className="fw-stat">
                    <div className="fw-num">24/7</div>
                    <div className="fw-lbl">Human agents available in 14 languages.</div>
                  </div>
                  <div className="fw-stat">
                    <div className="fw-num">2.1M<em>+</em></div>
                    <div className="fw-lbl">Passengers helped annually.</div>
                  </div>
                </div>
              </div>

              {/* Contact card */}
              <div className="fw-contact-card">
                <div className="fw-ttl">Still need a human?</div>
                <p className="fw-sub">Median response: under 4 minutes during peak hours.</p>
                <div className="fw-contact-row">
                  <span className="fw-contact-ic">
                    <Svg size={16}>
                      <path d="M21 15v3a3 3 0 0 1-3 3 17 17 0 0 1-15-15 3 3 0 0 1 3-3h3l2 5-2 2a13 13 0 0 0 6 6l2-2 5 2Z"/>
                    </Svg>
                  </span>
                  <span>
                    <div className="fw-contact-nm">+1 (415) 555-WING</div>
                    <div className="fw-contact-ds">Toll-free · 24/7</div>
                  </span>
                </div>
                <div className="fw-contact-row">
                  <span className="fw-contact-ic">
                    <Svg size={16}>
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </Svg>
                  </span>
                  <span>
                    <div className="fw-contact-nm">support@ecowings.com</div>
                    <div className="fw-contact-ds">Email · replies within 2 h</div>
                  </span>
                </div>
              </div>

            </aside>

            {/* ── MAIN COLUMN ── */}
            <div className="fw-main">


              {/* Chat panel */}
              <div className="fw-chat">

                {/* Chat header */}
                <div className="fw-chat-head">
                  <div className="fw-assistant-av">
                    <Svg size={18}>
                      <path d="M12 22c5-3 8-7 8-13a8 8 0 1 0-16 0c0 6 3 10 8 13Z"/>
                      <path d="M12 22V8"/>
                    </Svg>
                  </div>
                  <div className="fw-chat-meta">
                    <div className="fw-chat-nm">EcoWings Assistant</div>
                    <div className="fw-chat-st">
                      <span className="fw-pulse" />
                      Always online · Trained on verified support docs
                    </div>
                  </div>
                  <span className="fw-enc-chip">
                    <Svg size={12} style={{ strokeWidth: 2 }}>
                      <rect x="4" y="11" width="16" height="10" rx="2"/>
                      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                    </Svg>
                    Encrypted
                  </span>
                </div>

                {/* Messages */}
                <div className="fw-chat-body" ref={msgsRef}>
                  {messages.map(msg =>
                    msg.role === 'user' ? (
                      <div key={msg.id} className="fw-msg fw-user">
                        <div className="fw-msg-av">YOU</div>
                        <div className="fw-bubble">{msg.text}</div>
                      </div>
                    ) : (
                      <div key={msg.id} className="fw-msg fw-bot">
                        <div className="fw-msg-av">
                          <Svg size={14}>
                            <path d="M12 22c5-3 8-7 8-13a8 8 0 1 0-16 0c0 6 3 10 8 13Z"/>
                            <path d="M12 22V8"/>
                          </Svg>
                        </div>
                        <div className="fw-bubble">
                          {renderText(msg.text)}
                          {!msg.done && <span className="fw-cursor" />}
                        </div>
                      </div>
                    )
                  )}
                  {loading && (
                    <div className="fw-msg fw-bot">
                      <div className="fw-msg-av">
                        <Svg size={14}>
                          <path d="M12 22c5-3 8-7 8-13a8 8 0 1 0-16 0c0 6 3 10 8 13Z"/>
                          <path d="M12 22V8"/>
                        </Svg>
                      </div>
                      <div className="fw-bubble">
                        <div className="fw-typing">
                          <span/><span/><span/>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* Composer */}
                <div className="fw-composer-wrap">
                  <div className="fw-composer">
                    <textarea
                      ref={inputRef}
                      className="fw-composer-input"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message EcoWings…"
                      rows={1}
                      disabled={loading}
                      maxLength={2000}
                      onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                      }}
                    />
                    <button className="fw-icobtn" title="Attach" type="button">
                      <Svg size={18}>
                        <path d="m21 12-9 9a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-2-2l8-8"/>
                      </Svg>
                    </button>
                    <button className="fw-icobtn" title="Voice" type="button">
                      <Svg size={18}>
                        <rect x="9" y="3" width="6" height="12" rx="3"/>
                        <path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
                      </Svg>
                    </button>
                    <button
                      className="fw-send-btn"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      title="Send"
                    >
                      <Svg size={16} style={{ strokeWidth: 2.2 }}>
                        <path d="M5 12h14M13 5l7 7-7 7"/>
                      </Svg>
                    </button>
                  </div>
                  <div className="fw-composer-foot">
                    <span>EcoWings AI</span>
                    <span className="fw-dot-sep"/>
                    <span>Verified flight data</span>
                    <span className="fw-dot-sep"/>
                    <span>Human agents 24/7</span>
                  </div>
                </div>

              </div>

              {/* ── FAQ accordion ── */}
              <div className="fw-faq-block" ref={faqRef}>
                <div className="fw-faq-head">
                  <div>
                    <h2>Frequently <em>asked.</em></h2>
                    <p>Answers our travelers reach for most. Updated weekly.</p>
                  </div>
                  <span className="fw-faq-tag">
                    Showing <b style={{ marginLeft: 4, marginRight: 4 }}>{currentTopic.label}</b> · {currentTopic.count} articles
                  </span>
                </div>

                {currentTopic.items.map((item, i) => {
                  const isOpen = openFaqIndex === i;
                  const voteKey = `${activeTopic}-${i}`;
                  return (
                    <div key={`${activeTopic}-${i}`} className={`fw-qa${isOpen ? ' fw-open' : ''}`}>
                      <button
                        className="fw-qa-q"
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      >
                        <span className="fw-qnum">{String(i + 1).padStart(2, '0')}.</span>
                        <span className="fw-qttl">{item.q}</span>
                        <span className="fw-plus">
                          <Svg size={14} style={{ strokeWidth: 2.2 }}>
                            <path d="M12 5v14M5 12h14"/>
                          </Svg>
                        </span>
                      </button>
                      <div
                        className="fw-qa-a"
                        style={{ maxHeight: isOpen ? '600px' : '0' }}
                      >
                        <div className="fw-qa-a-inner">
                          <div dangerouslySetInnerHTML={{ __html: item.a }} />
                          <div className="fw-qa-foot">
                            <span>Was this helpful?</span>
                            <button
                              className={`fw-vote-btn${votes[voteKey] === 'up' ? ' fw-active' : ''}`}
                              onClick={() => setVotes(prev => ({ ...prev, [voteKey]: 'up' }))}
                            >
                              <Svg size={13}>
                                <path d="M7 10v11M14 4l-1 6h7l-2 9c-.2.7-.8 1-1.5 1H7V10l5-7c.6 0 2 0 2 1Z"/>
                              </Svg>
                              Yes
                            </button>
                            <button
                              className={`fw-vote-btn${votes[voteKey] === 'down' ? ' fw-active' : ''}`}
                              onClick={() => setVotes(prev => ({ ...prev, [voteKey]: 'down' }))}
                            >
                              <Svg size={13}>
                                <path d="M17 14V3M10 20l1-6H4l2-9c.2-.7.8-1 1.5-1H17v10l-5 7c-.6 0-2 0-2-1Z"/>
                              </Svg>
                              No
                            </button>
                            <span className="fw-qa-reviewed">Last reviewed · April 2026</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Bottom CTA ── */}
              <div className="fw-cta">
                <div>
                  <h3>Couldn't find your <em>answer?</em></h3>
                  <p>Send us a note. A real human — not a bot — will write back, usually within two hours.</p>
                </div>
                <div className="fw-cta-actions">
                  <button className="fw-cta-btn fw-primary">
                    Contact support
                    <Svg size={14} style={{ strokeWidth: 2.2 }}>
                      <path d="M5 12h14M13 5l7 7-7 7"/>
                    </Svg>
                  </button>
                  <button className="fw-cta-btn fw-ghost">Browse all topics</button>
                </div>
              </div>

            </div>{/* end fw-main */}
          </div>
        </div>

      </div>
    </>
  );
}
