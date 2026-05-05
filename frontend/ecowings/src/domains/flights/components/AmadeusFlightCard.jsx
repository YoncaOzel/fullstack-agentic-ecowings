import { Plane, Clock, Leaf, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import EcoCheckButton from './EcoCheckButton';

function getEmissionClass(kg) {
  if (kg == null) return null;
  if (kg < 100) return 'Low';
  if (kg < 250) return 'Medium';
  return 'High';
}

/**
 * Amadeus API'den dönen FlightDto nesnesi için YATAY uçuş kartı.
 * Props: flight (FlightDto)
 */
export default function AmadeusFlightCard({ flight }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const stopCount = (flight.segments?.length ?? 1) - 1;
  const stopLabel = stopCount === 0 ? 'Direct' : `${stopCount} Stop${stopCount > 1 ? 's' : ''}`;

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

  const emissionClass = flight.emissionClass ?? getEmissionClass(flight.carbonEmission);
  const emissionColor =
    emissionClass === 'Low'    ? '#4ade80'
    : emissionClass === 'Medium' ? '#facc15'
    : '#f87171';
  const emissionTone =
    emissionClass === 'Low'
      ? { bg: '#ecfdf3', border: '#bbf7d0', text: '#166534' }
      : emissionClass === 'Medium'
        ? { bg: '#fffbeb', border: '#fde68a', text: '#92400e' }
        : { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' };

  const handleBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/checkout', { state: { flight: { ...flight, emissionClass }, type: 'amadeus' } });
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 14px 36px rgba(15, 23, 42, 0.12)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(15, 23, 42, 0.08)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* ── Carrier section ── */}
      <div style={{
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '8px', minWidth: '104px', maxWidth: '104px', flexShrink: 0,
        borderRight: '1px solid #f1f5f9',
        background: '#f8fafc',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: '#0f766e',
          border: '1px solid rgba(15,118,110,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 800, color: '#ffffff',
          fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em',
        }}>
          {(flight.carrier || 'XX').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textAlign: 'center', lineHeight: 1.35, wordBreak: 'break-word' }}>
          {flight.carrier || '—'}
        </div>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, color: '#0f766e',
          fontFamily: "'DM Mono', monospace",
          background: '#ffffff', border: '1px solid #dbeafe',
          borderRadius: '999px', padding: '4px 10px',
          letterSpacing: '0.04em',
        }}>
          {flight.flightNumber || '—'}
        </div>
      </div>

      {/* ── Route ── */}
      <div style={{ flex: 1, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>

        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '76px' }}>
          {depDate && (
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em' }}>{depDate}</div>
          )}
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
            {depTime}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f766e', marginTop: '8px', letterSpacing: '0.12em' }}>
            {flight.departure || '—'}
          </div>
        </div>

        {/* Route line */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            <Clock size={11} /><span>{flight.duration || '—'}</span>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffffff', border: '2px solid #0f766e', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
            <Plane size={15} style={{ color: '#0f766e', flexShrink: 0, margin: '0 10px', transform: 'rotate(8deg)' }} />
            <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffffff', border: '2px solid #0f766e', flexShrink: 0 }} />
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '999px', padding: '5px 12px', fontSize: '0.68rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <Plane size={9} />{stopLabel}
          </div>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '76px' }}>
          {(arrDate || depDate) && (
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em' }}>{arrDate || depDate}</div>
          )}
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
            {arrTime}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f766e', marginTop: '8px', letterSpacing: '0.12em' }}>
            {flight.arrival || '—'}
          </div>
        </div>
      </div>

      {/* ── Segments (aktarmalı) ── */}
      {stopCount > 0 && flight.segments && (
        <div style={{
          alignSelf: 'center', padding: '14px 16px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '12px', marginRight: '16px',
          display: 'flex', flexDirection: 'column', gap: '5px',
          maxWidth: '220px', flexShrink: 0,
        }}>
          {flight.segments.map((seg, i) => (
            <div key={i} style={{ fontSize: '0.68rem', color: '#475569', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', lineHeight: 1.5 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: '#0f766e' }}>
                {seg.departure} → {seg.arrival}
              </span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span>{seg.carrier} {seg.flightNumber}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span>{seg.duration}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Emission badge ── */}
      {flight.carbonEmission != null && (
        <div style={{
          alignSelf: 'center', padding: '0 22px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          borderLeft: '1px dashed #e2e8f0',
          borderRight: '1px dashed #e2e8f0',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: emissionTone.bg,
            border: `1px solid ${emissionTone.border}`,
            borderRadius: '999px', padding: '6px 12px',
            fontSize: '0.66rem', fontWeight: 700, color: emissionTone.text, whiteSpace: 'nowrap',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <Leaf size={10} style={{ color: emissionTone.text }} />
            {emissionClass === 'Low' ? 'Low' : emissionClass === 'Medium' ? 'Medium' : 'High'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {flight.carbonEmission.toFixed(1)} kg CO₂
          </div>
          <EcoCheckButton
            origin={flight.departure}
            destination={flight.arrival}
            carbonEmissionKg={flight.carbonEmission}
            theme="light"
          />
        </div>
      )}

      {/* ── Price + Buy ── */}
      <div style={{
        padding: '22px 24px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '12px', minWidth: '196px',
        background: '#fcfdff',
        borderLeft: '1px solid #f1f5f9',
      }}>
        {(() => {
          const rate = emissionClass === 'Low' ? 20 : emissionClass === 'Medium' ? 10 : 0;
          const discounted = rate > 0 && flight.price ? parseFloat(flight.price) * (1 - rate / 100) : null;
          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>
                Price
              </div>
              {discounted ? (
                <>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through', lineHeight: 1.3 }}>
                    {parseFloat(flight.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {flight.currency || ''}
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
                    {discounted.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {flight.currency || ''}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 700, marginTop: '4px' }}>%{rate} Eko İndirim</div>
                </>
              ) : (
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
                  {flight.price
                    ? `${parseFloat(flight.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${flight.currency || ''}`
                    : '—'}
                </div>
              )}
            </div>
          );
        })()}

        <button
            onClick={handleBuy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '11px 20px', borderRadius: '10px', border: '1px solid rgba(15,118,110,0.2)',
              cursor: 'pointer',
              background: '#0f766e',
              color: '#ffffff',
              fontWeight: 700, fontSize: '0.8rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.08em', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 20px rgba(15,118,110,0.22)',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#0d6b63'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#0f766e'; }}
          >
            <ShoppingCart size={13} />
            BUY
          </button>
      </div>
    </div>
  );
}
