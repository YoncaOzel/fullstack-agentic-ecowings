import { Plane, Clock, Leaf } from 'lucide-react';

/**
 * Amadeus API'den dönen FlightDto nesnesi için uçuş kartı.
 * Props: flight (FlightDto)
 */
export default function AmadeusFlightCard({ flight }) {
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
    flight.emissionClass === 'Low'
      ? '#4ade80'
      : flight.emissionClass === 'Medium'
      ? '#facc15'
      : '#f87171';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header: carrier & flight number */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 500 }}>
            {flight.carrier || 'Havayolu'}
          </span>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
            {flight.flightNumber || '—'}
          </div>
        </div>
        <span
          style={{
            background: 'rgba(74,222,128,0.1)',
            color: '#4ade80',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          {stopLabel}
        </span>
      </div>

      {/* Route */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '72px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{depTime}</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            {flight.departure || '—'}
          </div>
          {depDate && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>{depDate}</div>
          )}
        </div>

        {/* Middle */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-light)' }}>
            <Clock size={11} />
            {flight.duration || '—'}
          </div>
          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', position: 'relative' }}>
            <Plane
              size={13}
              style={{
                position: 'absolute',
                right: '-4px',
                top: '-7px',
                color: 'var(--primary)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{stopLabel}</span>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '72px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{arrTime}</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            {flight.arrival || '—'}
          </div>
        </div>
      </div>

      {/* Segments (aktarmalı uçuşlar) */}
      {stopCount > 0 && flight.segments && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {flight.segments.map((seg, i) => (
            <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                {seg.departure} → {seg.arrival}
              </span>
              <span>{seg.carrier} {seg.flightNumber}</span>
              <span>· {seg.duration}</span>
            </div>
          ))}
        </div>
      )}

      {/* Price + carbon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Fiyat</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
            {flight.price
              ? `${parseFloat(flight.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${flight.currency || ''}`
              : '—'}
          </div>
        </div>

        {flight.carbonEmission != null && (
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: emissionColor,
                fontWeight: 600,
                justifyContent: 'flex-end',
              }}
            >
              <Leaf size={12} />
              {flight.emissionClass || 'CO₂'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
              {flight.carbonEmission.toFixed(1)} kg CO₂
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
