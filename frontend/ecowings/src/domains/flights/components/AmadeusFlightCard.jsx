import { Plane, Clock, Leaf, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

/**
 * Amadeus API'den dönen FlightDto nesnesi için YATAY uçuş kartı.
 * Props: flight (FlightDto)
 */
export default function AmadeusFlightCard({ flight }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
  const arrDate = flight.arrivalTime
    ? new Date(flight.arrivalTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : '';

  const emissionColor =
    flight.emissionClass === 'Low'    ? '#4ade80'
    : flight.emissionClass === 'Medium' ? '#facc15'
    : '#f87171';

  const handleBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/checkout', { state: { flight, type: 'amadeus' } });
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
      <div style={{
        width: '4px',
        background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
        flexShrink: 0,
      }} />

      {/* ── Carrier section ── */}
      <div style={{
        padding: '20px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '6px', minWidth: '88px', maxWidth: '88px', flexShrink: 0,
        borderRight: '1px solid rgba(34,197,94,0.08)',
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '11px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(22,163,74,0.1) 100%)',
          border: '1px solid rgba(34,197,94,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 800, color: '#22c55e',
          fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em',
        }}>
          {(flight.carrier || 'XX').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ fontSize: '0.61rem', color: '#6b7280', fontWeight: 500, textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>
          {flight.carrier || '—'}
        </div>
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
          {depDate && (
            <div style={{ fontSize: '0.69rem', color: '#6b7280', fontWeight: 500, marginBottom: '3px' }}>{depDate}</div>
          )}
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
            {depTime}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e', marginTop: '5px', letterSpacing: '0.08em' }}>
            {flight.departure || '—'}
          </div>
        </div>

        {/* Route line */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#6b7280' }}>
            <Clock size={11} /><span>{flight.duration || '—'}</span>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(34,197,94,0.18)', border: '2px solid #22c55e', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.35)' }} />
            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.75) 50%, rgba(34,197,94,0.3) 100%)' }} />
            <Plane size={15} style={{ color: '#22c55e', flexShrink: 0, margin: '0 5px' }} />
            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.75) 50%, rgba(34,197,94,0.3) 100%)' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'rgba(34,197,94,0.18)', border: '2px solid #22c55e', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.35)' }} />
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: stopCount === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(250,204,21,0.08)',
            color: stopCount === 0 ? '#4ade80' : '#facc15',
            border: `1px solid ${stopCount === 0 ? 'rgba(74,222,128,0.2)' : 'rgba(250,204,21,0.2)'}`,
            borderRadius: '20px', padding: '2px 9px', fontSize: '0.66rem', fontWeight: 700,
          }}>
            <Plane size={9} />{stopLabel}
          </div>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '76px' }}>
          {(arrDate || depDate) && (
            <div style={{ fontSize: '0.69rem', color: '#6b7280', fontWeight: 500, marginBottom: '3px' }}>{arrDate || depDate}</div>
          )}
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f0fdf4', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
            {arrTime}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e', marginTop: '5px', letterSpacing: '0.08em' }}>
            {flight.arrival || '—'}
          </div>
        </div>
      </div>

      {/* ── Segments (aktarmalı) ── */}
      {stopCount > 0 && flight.segments && (
        <div style={{
          alignSelf: 'center', padding: '10px 14px',
          background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.12)',
          borderRadius: '10px', marginRight: '16px',
          display: 'flex', flexDirection: 'column', gap: '5px',
          maxWidth: '200px', flexShrink: 0,
        }}>
          {flight.segments.map((seg, i) => (
            <div key={i} style={{ fontSize: '0.67rem', color: '#6b7280', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#fde68a' }}>
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

      {/* ── Emission badge ── */}
      {flight.carbonEmission != null && (
        <div style={{
          alignSelf: 'center', padding: '0 20px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          borderLeft: '1px solid rgba(34,197,94,0.08)',
          borderRight: '1px solid rgba(34,197,94,0.08)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: `${emissionColor}18`, border: `1px solid ${emissionColor}45`,
            borderRadius: '20px', padding: '4px 10px',
            fontSize: '0.67rem', fontWeight: 700, color: emissionColor, whiteSpace: 'nowrap',
          }}>
            <Leaf size={10} />
            {flight.emissionClass === 'Low' ? 'Düşük' : flight.emissionClass === 'Medium' ? 'Orta' : 'Yüksek'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
            {flight.carbonEmission.toFixed(1)} kg CO₂
          </div>
        </div>
      )}

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
            {flight.price
              ? `${parseFloat(flight.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${flight.currency || ''}`
              : '—'}
          </div>
        </div>

        <button
            onClick={handleBuy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '11px 22px', borderRadius: '9px', border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#051005',
              fontWeight: 700, fontSize: '0.82rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.06em', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            <ShoppingCart size={13} />
            SATIN AL
          </button>
      </div>
    </div>
  );
}
