import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { formatTime, formatDuration, formatDateShort } from '../../../shared/utils/formatDate';
import { formatPrice } from '../../../shared/utils/formatPrice';
import ticketService from '../../tickets/services/ticketService';
import { useState } from 'react';

export default function FlightCard({ flight }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [buyError, setBuyError] = useState('');

  const dep = flight.departureAirport || {};
  const arr = flight.arrivalAirport || {};
  const depTime = flight.departureTime ? formatTime(flight.departureTime) : '--:--';
  const arrTime = flight.arrivalTime ? formatTime(flight.arrivalTime) : '--:--';
  const depDate = flight.departureTime ? formatDateShort(flight.departureTime) : '';
  const duration = formatDuration(flight.durationMinutes);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBuying(true);
    setBuyError('');
    try {
      const res = await ticketService.buyTicket({
        flightId: flight.id,
        travelClass: 'Economy',
      });
      if (res.data?.succeeded) {
        setBought(true);
      } else {
        setBuyError(res.data?.message || 'Satın alma işlemi başarısız.');
      }
    } catch (err) {
      setBuyError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header: airline & flight number */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>
            {flight.airline?.name || 'Havayolu'}
          </span>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
            {flight.flightNumber || '—'}
          </div>
        </div>
        <div style={{
          background: flight.availableSeats > 0 ? 'rgba(46,125,50,0.1)' : 'rgba(239,83,80,0.1)',
          color: flight.availableSeats > 0 ? 'var(--primary)' : '#ef5350',
          borderRadius: '20px',
          padding: '4px 10px',
          fontSize: '0.78rem',
          fontWeight: 600,
        }}>
          {flight.availableSeats > 0 ? `${flight.availableSeats} koltuk` : 'Dolu'}
        </div>
      </div>

      {/* Route */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{depTime}</div>
          <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{dep.code || '—'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{dep.name || ''}</div>
          {depDate && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>{depDate}</div>}
        </div>

        {/* Arrow */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{duration}</span>
          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', position: 'relative' }}>
            <span style={{ position: 'absolute', right: '-4px', top: '-5px', color: 'var(--primary)' }}>✈</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Direkt</span>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{arrTime}</div>
          <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{arr.code || '—'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{arr.name || ''}</div>
        </div>
      </div>

      {/* Price row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Ekonomi'den başlayan</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            {formatPrice(flight.economyPrice)}
          </div>
        </div>

        {bought ? (
          <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Satın Alındı</span>
        ) : (
          <button className="btn btn-primary" onClick={handleBuy} disabled={buying || flight.availableSeats === 0}
            style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            {buying ? 'İşleniyor...' : 'Satın Al'}
          </button>
        )}
      </div>

      {buyError && <p style={{ color: '#ef5350', fontSize: '0.82rem', margin: 0 }}>{buyError}</p>}
    </div>
  );
}
