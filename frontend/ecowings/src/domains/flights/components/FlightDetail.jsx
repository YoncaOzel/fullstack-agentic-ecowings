import { formatTime, formatDateShort, formatDuration } from '../../../shared/utils/formatDate';
import { formatPrice } from '../../../shared/utils/formatPrice';

export default function FlightDetail({ flight }) {
  if (!flight) return null;

  const dep = flight.departureAirport || {};
  const arr = flight.arrivalAirport || {};

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Uçuş Numarası</span>
          <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>{flight.flightNumber || '—'}</h3>
        </div>
        <div style={{
          background: flight.availableSeats > 0 ? 'rgba(46,125,50,0.1)' : 'rgba(239,83,80,0.1)',
          color: flight.availableSeats > 0 ? 'var(--primary)' : '#ef5350',
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>
          {flight.availableSeats > 0
            ? `${flight.availableSeats} / ${flight.totalSeats || '?'} koltuk`
            : 'Koltuk yok'}
        </div>
      </div>

      {/* Route */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatTime(flight.departureTime)}</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{dep.code}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{dep.name}</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '2px' }}>
            {formatDateShort(flight.departureTime)}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>
            {formatDuration(flight.durationMinutes)}
          </div>
          <div style={{ fontSize: '1.5rem' }}>✈️</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '4px' }}>Direkt</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatTime(flight.arrivalTime)}</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{arr.code}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{arr.name}</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '2px' }}>
            {formatDateShort(flight.arrivalTime)}
          </div>
        </div>
      </div>

      {/* Price table */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Fiyatlar</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Ekonomi', price: flight.economyPrice },
            { label: 'Business', price: flight.businessPrice },
            { label: 'First Class', price: flight.firstClassPrice },
          ].map((c) => (
            <div key={c.label} style={{
              background: 'var(--bg-section-alt)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{c.label}</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem' }}>
                {c.price ? formatPrice(c.price) : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
