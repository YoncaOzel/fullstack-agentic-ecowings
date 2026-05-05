import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { jsPDF } from 'jspdf';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function MyTicketsTab() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ticketService.getMyTickets()
      .then(res => {
        if (Array.isArray(res.data)) setTickets(res.data);
        else setError(res.data?.message || 'Failed to load tickets.');
      })
      .catch(() => setError('An error occurred while loading tickets.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      background: 'rgba(159,64,61,0.06)', border: '1px solid rgba(159,64,61,0.15)',
      borderRadius: '12px', padding: '16px 20px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <ErrorIcon />
      <span style={{ fontSize: '14px', color: '#9f403d' }}>{error}</span>
    </div>
  );

  if (tickets.length === 0) return (
    <div style={{ textAlign: 'center', padding: '72px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.35 }}>✈️</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2b3437', margin: '0 0 10px' }}>No Tickets Yet</h3>
      <p style={{ fontSize: '0.875rem', color: '#586064', marginBottom: '28px', lineHeight: 1.6 }}>
        Search for a flight and make a booking.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '12px 28px', borderRadius: '100px', border: 'none',
          background: '#1b6d24', color: '#e5ffdd',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Search Flights
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .mt-ticket-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(43,52,55,0.06);
          transition: box-shadow 0.5s ease;
        }

        .mt-ticket-card:hover {
          box-shadow: 0 30px 60px -15px rgba(43,52,55,0.10);
        }

        @media (min-width: 640px) {
          .mt-ticket-card { flex-direction: row; }
        }

        .mt-content {
          flex: 1;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
        }

        .mt-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px 24px;
        }

        @media (min-width: 640px) {
          .mt-meta-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .mt-perf-line {
          display: none;
        }

        @media (min-width: 640px) {
          .mt-perf-line {
            display: block;
            width: 1px;
            border-left: 2px dashed #f1f4f6;
            position: relative;
            flex-shrink: 0;
          }
          .mt-perf-line::before,
          .mt-perf-line::after {
            content: '';
            position: absolute;
            width: 24px;
            height: 24px;
            background: #f8f9fa;
            border-radius: 50%;
            left: -13px;
          }
          .mt-perf-line::before { top: -12px; }
          .mt-perf-line::after { bottom: -12px; }
        }

        .mt-stub {
          width: 100%;
          background: #fbfcfd;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-top: 1px solid rgba(171,179,183,0.10);
        }

        @media (min-width: 640px) {
          .mt-stub {
            width: 172px;
            border-top: none;
            border-left: 1px solid rgba(171,179,183,0.10);
          }
        }

        .mt-qr-box {
          background: #ffffff;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(43,52,55,0.06);
          margin-bottom: 14px;
        }

        .mt-qr-placeholder {
          width: 80px;
          height: 80px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          padding: 6px;
          background: #fff;
          border-radius: 4px;
        }

        .mt-qr-cell {
          border-radius: 1px;
        }

        .mt-download-btn {
          width: 100%;
          padding: 10px 0;
          border-radius: 100px;
          border: none;
          background: #1b6d24;
          color: #e5ffdd;
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s ease;
          letter-spacing: 0.01em;
        }

        .mt-download-btn:hover {
          background: #076019;
        }

        .mt-aside {
          padding-top: 40px;
          margin-top: 40px;
          border-top: 1px solid rgba(171,179,183,0.10);
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 640px) {
          .mt-aside { grid-template-columns: 1fr 2fr; }
        }

        .mt-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 500px) {
          .mt-info-grid { grid-template-columns: 1fr 1fr; }
        }

        .mt-info-card {
          padding: 20px;
          background: #f1f4f6;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
      `}</style>

      {/* Ticket list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#737c7f', fontSize: '14px' }}>
            No tickets found.
          </div>
        ) : (
          tickets.map(ticket => <TicketCard key={ticket.ticketId} ticket={ticket} />)
        )}
      </div>

      {/* Aside info block */}
      <aside className="mt-aside">
        <div>
          <h3 style={{
            fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.2em',
            color: '#abb3b7', marginBottom: '16px', margin: '0 0 16px',
          }}>
            About
          </h3>
          <p style={{ fontSize: '13px', color: '#586064', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
            Your tickets can be modified or cancelled up until the event time.
            You can use your digital tickets at the gate by scanning your QR code.
          </p>
        </div>
        <div className="mt-info-grid">
          <div className="mt-info-card">
            <HelpIcon />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#2b3437', margin: '0 0 6px' }}>
                Need help?
              </h4>
              <p style={{ fontSize: '12px', color: '#586064', lineHeight: 1.6, margin: 0 }}>
                Our support team is here for all your questions about ticket refunds or transfers.
              </p>
            </div>
          </div>
          <div className="mt-info-card">
            <CalendarIcon />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#2b3437', margin: '0 0 6px' }}>
                Add to Calendar
              </h4>
              <p style={{ fontSize: '12px', color: '#586064', lineHeight: 1.6, margin: 0 }}>
                Sync all your events to Apple or Google Calendar with a single tap.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function downloadTicketPDF(ticket) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const GREEN  = [27, 109, 36];
  const DGREEN = [7, 96, 25];
  const WHITE  = [255, 255, 255];
  const OFF    = [248, 249, 250];
  const GRAY   = [171, 179, 183];
  const DARK   = [43, 52, 55];
  const MID    = [88, 96, 100];

  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const fmtT = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // ── Background ──────────────────────────────────────────────
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, 'F');

  // ── Header band ─────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 28, 'F');

  // Diagonal accent on header right
  doc.setFillColor(...DGREEN);
  doc.triangle(W - 40, 0, W, 0, W, 28, 'F');

  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...WHITE);
  doc.text('ECO', 10, 11);
  doc.setFont('helvetica', 'normal');
  doc.text('WINGS', 22.5, 11);

  // Tagline
  doc.setFontSize(6);
  doc.setTextColor(229, 255, 221);
  doc.text('BOARDING PASS', 10, 16.5);

  // Status badge
  const isPaid = ticket.isPaid;
  const statusText = isPaid ? 'CONFIRMED' : 'PENDING PAYMENT';
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(statusText, W - 10, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(229, 255, 221);
  doc.text('TICKET STATUS', W - 10, 16.5, { align: 'right' });

  // ── Route section ───────────────────────────────────────────
  const fromCode = (ticket.from || '???').substring(0, 3).toUpperCase();
  const toCode   = (ticket.to   || '???').substring(0, 3).toUpperCase();

  // From city code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...DARK);
  doc.text(fromCode, 10, 52);

  // From city name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MID);
  doc.text((ticket.from || '').toUpperCase(), 10, 57);

  // Arrow / flight line
  const midX = W / 2 - 14;
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(46, 45, midX - 4, 45);
  // plane symbol (SVG-like using text)
  doc.setFont('zapfdingbats', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GREEN);
  doc.text('H', midX, 46.5);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(...GRAY);
  doc.line(midX + 6, 45, midX + 22, 45);

  // To city code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...DARK);
  doc.text(toCode, midX + 26, 52);

  // To city name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MID);
  doc.text((ticket.to || '').toUpperCase(), midX + 26, 57);

  // ── Info grid (left block) ───────────────────────────────────
  const fields = [
    ['DATE',      fmt(ticket.departureTime)],
    ['TIME',      fmtT(ticket.departureTime)],
    ['FLIGHT',    ticket.flightNumber || '—'],
    ['CLASS',     (ticket.flightClass || ticket.cabinClass || 'Economy').toUpperCase()],
    ['PNR',       ticket.pnrCode || '—'],
    ['PRICE',     ticket.price != null
      ? Number(ticket.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' ₺'
      : '—'],
  ];

  const col1X = 10;
  const col2X = 60;
  const col3X = 110;
  let rowY = 68;
  const rowH = 13;

  fields.forEach(([label, value], i) => {
    const colOffset = [col1X, col2X, col3X];
    const colIdx    = Math.floor(i / 2);
    const rowIdx    = i % 2;
    const cx = colOffset[colIdx];
    const cy = rowY + rowIdx * rowH;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...GRAY);
    doc.text(label, cx, cy);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(String(value), cx, cy + 5);
  });

  // ── Perforation line ─────────────────────────────────────────
  const perfX = W - 52;
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(perfX, 32, perfX, H - 8);
  doc.setLineDashPattern([], 0);

  // Notch circles
  doc.setFillColor(...OFF);
  doc.circle(perfX, 32, 3, 'F');
  doc.circle(perfX, H - 8, 3, 'F');

  // ── Stub (right section) ─────────────────────────────────────
  doc.setFillColor(...OFF);
  doc.roundedRect(perfX + 4, 30, W - perfX - 8, H - 38, 3, 3, 'F');

  const stubCX = perfX + 4 + (W - perfX - 8) / 2;

  // QR code placeholder (grid of squares)
  const qrX = stubCX - 14;
  const qrY = 34;
  const qrSize = 28;
  const cell = qrSize / 7;
  doc.setFillColor(...WHITE);
  doc.rect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 'F');

  const qrPattern = [
    1,1,1,0,1,1,1,
    1,0,1,0,1,0,1,
    1,1,1,0,1,1,1,
    0,0,0,1,0,1,0,
    1,1,0,1,0,1,1,
    0,1,0,0,1,0,1,
    1,0,1,1,0,0,1,
  ];
  qrPattern.forEach((filled, idx) => {
    if (!filled) return;
    const r = Math.floor(idx / 7);
    const c = idx % 7;
    doc.setFillColor(...GREEN);
    doc.rect(qrX + c * cell, qrY + r * cell, cell - 0.5, cell - 0.5, 'F');
  });

  // PNR under QR
  if (ticket.pnrCode) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...MID);
    doc.text(`#${ticket.pnrCode}`, stubCX, qrY + qrSize + 6, { align: 'center' });
  }

  // Seat / gate placeholders
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...GRAY);
  doc.text('GATE', stubCX - 8, qrY + qrSize + 14, { align: 'center' });
  doc.text('SEAT', stubCX + 8, qrY + qrSize + 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('—', stubCX - 8, qrY + qrSize + 19, { align: 'center' });
  doc.text('—', stubCX + 8, qrY + qrSize + 19, { align: 'center' });

  // ── Footer bar ───────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, H - 8, perfX, 8, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(229, 255, 221);
  doc.text('Thank you for choosing EcoWings. Have a pleasant flight.', 10, H - 3.5);

  // Issue date
  doc.setTextColor(229, 255, 221);
  const issued = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(`Issued: ${issued}`, perfX - 10, H - 3.5, { align: 'right' });

  const filename = `ecowings-${(ticket.pnrCode || ticket.ticketId || 'ticket').toLowerCase()}.pdf`;
  doc.save(filename);
}

function TicketCard({ ticket }) {
  const isPaid = ticket.isPaid;
  const typeLabel = ticket.flightClass || ticket.cabinClass || 'Economy';

  return (
    <article className="mt-ticket-card">
      {/* Center content */}
      <div className="mt-content">
        <div>
          <span style={{
            display: 'block',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#abb3b7',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: '8px',
          }}>
            {isPaid ? 'Confirmed Ticket' : 'Awaiting Payment'}
          </span>

          {/* Route headline */}
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            fontWeight: 300,
            color: '#2b3437',
            letterSpacing: '-0.02em',
            margin: '0',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.2,
          }}>
            {ticket.from || '—'} → {ticket.to || '—'}
          </h2>
        </div>

        {/* Meta grid */}
        <div className="mt-meta-grid">
          <MetaField label="Date" value={fmt(ticket.departureTime)} />
          <MetaField label="Time" value={fmtTime(ticket.departureTime) || '—'} />
          <MetaField label="From" value={ticket.from || '—'} />
          <MetaField label="To" value={ticket.to || '—'} />
          {ticket.pnrCode && (
            <MetaField label="PNR" value={ticket.pnrCode} mono />
          )}
          {ticket.price != null && (
            <MetaField
              label="Price"
              value={Number(ticket.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' ₺'}
            />
          )}
          {typeLabel && <MetaField label="Cabin" value={typeLabel} />}
          {ticket.flightNumber && <MetaField label="Flight No" value={ticket.flightNumber} mono />}
        </div>
      </div>

      {/* Perforation */}
      <div className="mt-perf-line" />

      {/* Right stub */}
      <div className="mt-stub">
        <div className="mt-qr-box">
          <QRPlaceholder />
        </div>
        {ticket.pnrCode && (
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
            color: '#abb3b7',
            marginBottom: '16px',
            display: 'block',
            textAlign: 'center',
          }}>
            #{ticket.pnrCode}
          </span>
        )}
        <button className="mt-download-btn" onClick={() => downloadTicketPDF(ticket)}>
          Download Ticket
        </button>
      </div>
    </article>
  );
}

function MetaField({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{
        fontSize: '10px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: '#abb3b7',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 400,
      }}>
        {label}
      </span>
      <p style={{
        fontSize: '14px',
        fontWeight: 500,
        color: '#2b3437',
        margin: 0,
        fontFamily: mono ? 'monospace' : "'DM Sans', sans-serif",
        letterSpacing: mono ? '0.06em' : 'normal',
      }}>
        {value}
      </p>
    </div>
  );
}

function QRPlaceholder() {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7);
    const c = i % 7;
    const isCorner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
    const filled = isCorner || Math.random() > 0.5;
    return filled;
  });

  return (
    <div style={{
      width: '80px',
      height: '80px',
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1.5px',
      padding: '4px',
    }}>
      {cells.map((filled, i) => (
        <div
          key={i}
          style={{
            background: filled ? '#1b6d24' : 'transparent',
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  );
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b6d24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b6d24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9f403d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
