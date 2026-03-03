import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import ticketService from '../../tickets/services/ticketService';
import { useState } from 'react';
import { Plane, Clock, ShoppingCart } from 'lucide-react';

/** Saat farkından süre hesaplar → "1s 25d" */
function calcDuration(dep, arr) {
  if (!dep || !arr) return null;
  const mins = Math.round((new Date(arr) - new Date(dep)) / 60000);
  if (isNaN(mins) || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}s ${m > 0 ? m + 'd' : ''}`.trim() : `${m}d`;
}

function fmt(dateStr) {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function FlightCard({ flight }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying]   = useState(false);
  const [bought, setBought]   = useState(false);
  const [buyError, setBuyError] = useState('');

  // Backend Flight entity field names: departure / destination / price / estimatedArrivalTime
  const dep      = flight.departure  || {};
  const arr      = flight.destination || {};
  const depTime  = fmt(flight.departureTime);
  const arrTime  = fmt(flight.estimatedArrivalTime || flight.arrivalTime);
  const depDate  = fmtDate(flight.departureTime);
  const duration = calcDuration(flight.departureTime, flight.estimatedArrivalTime || flight.arrivalTime);
  const price    = flight.price ?? flight.economyPrice;
  const airline  = flight.airline?.name || flight.carrier || null;

  const handleBuy = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBuying(true);
    setBuyError('');
    try {
      const res = await ticketService.buyTicket({ flightId: flight.id, travelClass: 'Economy' });
      if (res.data?.succeeded) setBought(true);
      else setBuyError(res.data?.message || 'Satın alma işlemi başarısız.');
    } catch (err) {
      setBuyError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0d1f0d 0%, #0a1a0e 100%)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 14px 44px rgba(34,197,94,0.13), 0 4px 16px rgba(0,0,0,0.5)';
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)';
      }}
    >
      {/* ── Left accent bar ── */}
      <div style={{ width: '4px', background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)', flexShrink: 0 }} />

      {/* ── Airline section ── */}
      <div style={{
        padding: '20px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '6px', minWidth: '88px', maxWidth: '88px', flexShrink: 0,
        borderRight: '1px solid rgba(34,197,94,0.08)',
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '11px',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 800, color: '#22c55e',
          fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em',
        }}>
          {(airline || '??').slice(0, 2).toUpperCase()}
        </div>
        {airline && (
          <div style={{ fontSize: '0.61rem', color: '#6b7280', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>
            {airline}
          </div>
        )}
        <div style={{
          fontSize: '0.67rem', fontWeight: 700, color: '#bbf7d0',
          fontFamily: "'DM Mono', monospace",
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
          borderRadius: '6px', padding: '2px 6px',
        }}>
          {flight.flightNumber || '—'}
        </div>
      </div>

      {/* ── Route ── */}
      <div style={{ flex: 1, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>

        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '76px' }}>
          {depDate && <div style={{ fontSize: '0.69rem', color: '#6b7280', fontWeight: 500, marginBottom: '3px' }}>{depDate}</div>}
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
            {depTime}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e', marginTop: '5px', letterSpacing: '0.08em' }}>
            {dep.code || (flight.departureAirportId ? `#${flight.departureAirportId}` : '—')}
          </div>
          {dep.city && <div style={{ fontSize: '0.67rem', color: '#6b7280', marginTop: '2px' }}>{dep.city}</div>}
        </div>

        {/* Route line */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#6b7280' }}>
              <Clock size={11} />{duration}
            </div>
          )}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(34,197,94,0.18)', border: '2px solid #22c55e', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.35)' }} />
            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.75) 50%, rgba(34,197,94,0.3) 100%)' }} />
            <Plane size={15} style={{ color: '#22c55e', flexShrink: 0, margin: '0 5px' }} />
            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.75) 50%, rgba(34,197,94,0.3) 100%)' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(34,197,94,0.18)', border: '2px solid #22c55e', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.35)' }} />
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'rgba(34,197,94,0.08)', color: '#4ade80',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '20px', padding: '2px 9px', fontSize: '0.66rem', fontWeight: 700,
          }}>
            <Plane size={9} />Direkt
          </div>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '76px' }}>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
            {arrTime}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e', marginTop: '5px', letterSpacing: '0.08em' }}>
            {arr.code || (flight.destinationAirportId ? `#${flight.destinationAirportId}` : '—')}
          </div>
          {arr.city && <div style={{ fontSize: '0.67rem', color: '#6b7280', marginTop: '2px' }}>{arr.city}</div>}
        </div>

      </div>

      {/* ── Price + Buy ── */}
      <div style={{
        padding: '20px 26px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '12px', minWidth: '190px',
        background: 'rgba(0,0,0,0.22)',
        borderLeft: '1px solid rgba(34,197,94,0.1)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>
            Fiyat
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {price != null
              ? `${Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
              : '—'}
          </div>
        </div>
        {bought ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '9px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            color: '#4ade80', fontWeight: 700, fontSize: '0.8rem',
          }}>
            <span>✓</span> Satın Alındı
          </div>
        ) : (
          <button
            onClick={handleBuy}
            disabled={buying}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '11px 22px', borderRadius: '9px', border: 'none',
              cursor: buying ? 'wait' : 'pointer',
              background: buying ? 'rgba(34,197,94,0.25)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: buying ? '#6b7280' : '#051005',
              fontWeight: 700, fontSize: '0.82rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.06em', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: buying ? 'none' : '0 4px 16px rgba(34,197,94,0.3)',
            }}
            onMouseEnter={e => { if (!buying) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            <ShoppingCart size={13} />
            {buying ? 'İşleniyor...' : 'SATIN AL'}
          </button>
        )}
        {buyError && <p style={{ color: '#f87171', fontSize: '0.72rem', margin: 0, textAlign: 'center' }}>{buyError}</p>}
      </div>
    </div>
  );
}
