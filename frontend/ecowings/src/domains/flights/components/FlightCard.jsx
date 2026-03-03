import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import ticketService from '../../tickets/services/ticketService';
import { useState } from 'react';
import { Plane, Clock } from 'lucide-react';

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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {airline && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>{airline}</span>
          )}
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
            {flight.flightNumber || '—'}
          </div>
        </div>
        <span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', borderRadius: '20px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
          Direkt
        </span>
      </div>

      {/* Route */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '72px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{depTime}</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            {dep.code || (flight.departureAirportId ? `#${flight.departureAirportId}` : '—')}
          </div>
          {dep.city && <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{dep.city}</div>}
          {depDate && <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>{depDate}</div>}
        </div>

        {/* Middle */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-light)' }}>
              <Clock size={11} />{duration}
            </div>
          )}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1.5px solid var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.55), rgba(34,197,94,0.25))' }} />
            <Plane size={13} style={{ color: 'var(--primary)', flexShrink: 0, margin: '0 2px' }} />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.55), rgba(34,197,94,0.25))' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1.5px solid var(--primary)', flexShrink: 0 }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Direkt</span>
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '72px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{arrTime}</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            {arr.code || (flight.destinationAirportId ? `#${flight.destinationAirportId}` : '—')}
          </div>
          {arr.city && <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{arr.city}</div>}
        </div>
      </div>

      {/* Price + Buy */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Fiyat</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            {price != null
              ? `${Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
              : '—'}
          </div>
        </div>
        {bought ? (
          <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Satın Alındı</span>
        ) : (
          <button className="btn btn-primary" onClick={handleBuy} disabled={buying}
            style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            {buying ? 'İşleniyor...' : 'Satın Al'}
          </button>
        )}
      </div>

      {buyError && <p style={{ color: '#ef5350', fontSize: '0.82rem', margin: 0 }}>{buyError}</p>}
    </div>
  );
}
