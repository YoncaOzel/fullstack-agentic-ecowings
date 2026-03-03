import { Plane, Clock, Leaf, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import ticketService from '../../tickets/services/ticketService';

/**
 * Amadeus API'den dönen FlightDto nesnesi için uçuş kartı.
 * Props: flight (FlightDto)
 */
export default function AmadeusFlightCard({ flight }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [buyError, setBuyError] = useState('');
  const stopCount = (flight.segments?.length ?? 1) - 1;
  const stopLabel = stopCount === 0 ? 'Direkt' : `${stopCount} Aktarma`;

  const depTime = flight.departureTime
    ? new Date(flight.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const arrTime = flight.arrivalTime
    ? new Date(flight.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const depDate = flight.departureTime
    ? new Date(flight.departureTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : '';

  const emissionColor =
    flight.emissionClass === 'Low'    ? '#4ade80'
    : flight.emissionClass === 'Medium' ? '#facc15'
    : '#f87171';

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
        background: 'linear-gradient(160deg, #111c11 0%, #0e1a0e 100%)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        boxShadow: '0 4px 28px rgba(0,0,0,0.45)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.14), 0 4px 16px rgba(0,0,0,0.5)';
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.38)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 28px rgba(0,0,0,0.45)';
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)';
      }}
    >
      {/* ── Header: carrier monogram + flight number + stop badge ── */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(34,197,94,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(22,163,74,0.12) 100%)',
            border: '1px solid rgba(34,197,94,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 800, color: '#22c55e', letterSpacing: '0.05em',
            fontFamily: "'DM Mono', monospace",
          }}>
            {(flight.carrier || 'XX').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 500, lineHeight: 1 }}>
              {flight.carrier || 'Havayolu'}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0fdf4', fontFamily: "'DM Mono', monospace", marginTop: '3px' }}>
              {flight.flightNumber || '—'}
            </div>
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: stopCount === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.1)',
          color: stopCount === 0 ? '#4ade80' : '#facc15',
          border: `1px solid ${stopCount === 0 ? 'rgba(74,222,128,0.2)' : 'rgba(250,204,21,0.2)'}`,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '0.72rem', fontWeight: 700,
        }}>
          <Plane size={10} />{stopLabel}
        </div>
      </div>

      {/* ── Route: departure → arrival ── */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '82px' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {depTime}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e', marginTop: '5px', letterSpacing: '0.06em' }}>
            {flight.departure || '—'}
          </div>
          {depDate && (
            <div style={{ fontSize: '0.69rem', color: '#6b7280', marginTop: '3px' }}>{depDate}</div>
          )}
        </div>

        {/* Route line with duration + dots + plane icon */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.69rem', color: '#6b7280' }}>
            <Clock size={10} /><span>{flight.duration || '—'}</span>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(34,197,94,0.25)', border: '1.5px solid #22c55e', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.55), rgba(34,197,94,0.25))' }} />
            <Plane size={13} style={{ color: '#22c55e', flexShrink: 0, margin: '0 2px' }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.55), rgba(34,197,94,0.25))' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(34,197,94,0.25)', border: '1.5px solid #22c55e', flexShrink: 0 }} />
          </div>
          <span style={{ fontSize: '0.67rem', color: '#6b7280', letterSpacing: '0.03em' }}>{stopLabel}</span>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '82px' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {arrTime}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e', marginTop: '5px', letterSpacing: '0.06em' }}>
            {flight.arrival || '—'}
          </div>
        </div>
      </div>

      {/* ── Segments (aktarmalı uçuşlar) ── */}
      {stopCount > 0 && flight.segments && (
        <div style={{
          margin: '0 20px 16px',
          background: 'rgba(34,197,94,0.04)',
          border: '1px solid rgba(34,197,94,0.08)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          {flight.segments.map((seg, i) => (
            <div key={i} style={{ fontSize: '0.72rem', color: '#6b7280', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#bbf7d0' }}>
                {seg.departure} → {seg.arrival}
              </span>
              <span style={{ color: '#374151' }}>·</span>
              <span>{seg.carrier} {seg.flightNumber}</span>
              <span style={{ color: '#374151' }}>·</span>
              <span>{seg.duration}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer: price + carbon emission + buy button ── */}
      <div style={{
        marginTop: 'auto',
        padding: '14px 20px 20px',
        borderTop: '1px solid rgba(34,197,94,0.08)',
        background: 'rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#6b7280', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              FIYAT
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#22c55e', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {flight.price
                ? `${parseFloat(flight.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${flight.currency || ''}`
                : '—'}
            </div>
          </div>
          {flight.carbonEmission != null && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${emissionColor}18`, border: `1px solid ${emissionColor}40`, borderRadius: '20px', padding: '3px 9px', fontSize: '0.68rem', fontWeight: 700, color: emissionColor }}>
                <Leaf size={10} />
                {flight.emissionClass === 'Low' ? 'Düşük (Low)' : flight.emissionClass === 'Medium' ? 'Orta (Moderate)' : 'Yüksek (High)'}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#6b7280' }}>
                {flight.carbonEmission.toFixed(1)} kg CO₂
              </div>
            </div>
          )}
        </div>

        {bought ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            color: '#4ade80', fontWeight: 700, fontSize: '0.875rem',
          }}>
            <span>✓</span> Satın Alındı
          </div>
        ) : (
          <button
            onClick={handleBuy}
            disabled={buying}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '13px 20px', borderRadius: '10px',
              border: 'none', cursor: buying ? 'wait' : 'pointer',
              background: buying
                ? 'rgba(34,197,94,0.25)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: buying ? '#6b7280' : '#080e08',
              fontWeight: 700, fontSize: '0.9rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
              boxShadow: buying ? 'none' : '0 4px 18px rgba(34,197,94,0.3)',
            }}
          >
            <ShoppingCart size={15} />
            {buying ? 'İşleniyor...' : 'Satın Al'}
          </button>
        )}

        {buyError && (
          <p style={{ color: '#f87171', fontSize: '0.78rem', margin: 0, textAlign: 'center' }}>{buyError}</p>
        )}
      </div>
    </div>
  );
}
