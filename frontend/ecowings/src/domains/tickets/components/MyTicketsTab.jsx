import { useState, useEffect } from 'react';
import { Plane, Calendar, Tag, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
        else setError(res.data?.message || 'Biletler yüklenemedi.');
      })
      .catch(() => setError('Biletler yüklenirken hata oluştu.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
      <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
      <span style={{ fontSize: '0.85rem', color: '#f87171' }}>{error}</span>
    </div>
  );

  if (tickets.length === 0) return (
    <div style={{ textAlign: 'center', padding: '64px 20px' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✈️</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a4d33', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Henüz Biletiniz Yok
      </h3>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }}>
        Amadeus üzerinden bir uçuş arayın ve satın alın.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', color: '#051005', fontWeight: 700, fontSize: '0.88rem', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 4px 14px rgba(34,197,94,0.3)', transition: 'filter 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        <Search size={14} /> Uçuş Ara
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plane size={15} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a4d33', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Biletlerim</h2>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>{tickets.length} bilet</p>
        </div>
      </div>

      {/* Ticket list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tickets.map(ticket => (
          <TicketCard key={ticket.ticketId} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}

function TicketCard({ ticket }) {
  const isPaid = ticket.isPaid;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${isPaid ? 'rgba(34,197,94,0.18)' : 'rgba(250,204,21,0.15)'}`,
      borderRadius: '14px',
      overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${isPaid ? 'rgba(34,197,94,0.08)' : 'rgba(250,204,21,0.06)'}` ; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top stripe */}
      <div style={{ height: '3px', background: isPaid ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#facc15,#d97706)' }} />

      <div style={{ padding: '18px 20px' }}>
        {/* Row 1: flight number + status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: '0.9rem', color: '#bbf7d0', letterSpacing: '0.06em' }}>
              {ticket.flightNumber || '—'}
            </span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', background: isPaid ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.08)', color: isPaid ? '#4ade80' : '#fde68a', border: `1px solid ${isPaid ? 'rgba(74,222,128,0.25)' : 'rgba(250,204,21,0.2)'}` }}>
            {isPaid ? <CheckCircle size={11} /> : <Clock size={11} />}
            {isPaid ? 'Ödendi' : 'Ödeme Bekleniyor'}
          </div>
        </div>

        {/* Row 2: Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22c55e', fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>
              {ticket.from || '—'}
            </div>
            {ticket.departureTime && (
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '3px' }}>
                {fmtTime(ticket.departureTime)}
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(34,197,94,0.25)' }} />
              <Plane size={13} style={{ color: '#22c55e' }} />
              <div style={{ flex: 1, height: '1px', background: 'rgba(34,197,94,0.25)' }} />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22c55e', fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>
              {ticket.to || '—'}
            </div>
            {ticket.estimatedArrivalTime && (
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '3px' }}>
                {fmtTime(ticket.estimatedArrivalTime)}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Date + Price + PNR */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {ticket.departureTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#6b7280' }}>
              <Calendar size={11} /> {fmt(ticket.departureTime)}
            </div>
          )}
          {ticket.price != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#9ca3af', marginLeft: 'auto' }}>
              <Tag size={10} />
              <span style={{ fontWeight: 700, color: '#22c55e' }}>
                {Number(ticket.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
            </div>
          )}
        </div>

        {/* PNR code — only when paid */}
        {isPaid && ticket.pnrCode && (
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(34,197,94,0.1)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>PNR</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 800, fontSize: '1rem', color: '#f0fdf4', letterSpacing: '0.12em', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '8px', padding: '4px 12px' }}>
              {ticket.pnrCode}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
