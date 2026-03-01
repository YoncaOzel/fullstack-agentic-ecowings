import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import flightService from '../services/flightService';
import ticketService from '../../tickets/services/ticketService';
import { formatTime, formatDuration } from '../../../shared/utils/formatDate';
import { formatPrice } from '../../../shared/utils/formatPrice';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function LuckyFlightPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [availableFlights, setAvailableFlights] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [buyMsg, setBuyMsg] = useState('');

  useEffect(() => {
    flightService.getFlights()
      .then((res) => {
        if (res.data?.succeeded) {
          const available = (res.data.data || []).filter((f) => f.availableSeats > 0);
          setAvailableFlights(available);
          if (available.length > 0) setCurrent(available[Math.floor(Math.random() * available.length)]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pickRandom = () => {
    if (availableFlights.length === 0) return;
    setBought(false);
    setBuyMsg('');
    setVisible(false);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * availableFlights.length);
      setCurrent(availableFlights[idx]);
      setVisible(true);
    }, 300);
  };

  const handleBuy = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!current) return;
    setBuying(true);
    setBuyMsg('');
    try {
      const res = await ticketService.buyTicket({ flightId: current.id, travelClass: 'Economy' });
      if (res.data?.succeeded) {
        setBought(true);
        setBuyMsg('Biletiniz satın alındı! ✅');
      } else {
        setBuyMsg(res.data?.message || 'Satın alma başarısız.');
      }
    } catch (err) {
      setBuyMsg(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <main style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 64px)' }}><LoadingSpinner /></main>;

  const dep = current?.departureAirport || {};
  const arr = current?.arrivalAirport || {};

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', color: '#fff', marginBottom: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🍀</div>
        <h1 style={{ color: '#fff', fontSize: '2.5rem' }}>Şanslı Uçuş</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginTop: '8px' }}>
          Bugün nereye gitsek?
        </p>
      </div>

      {availableFlights.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <p>Şu an için müsait uçuş bulunamadı.</p>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '480px',
          width: '100%',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          {current && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {current.airline?.name || 'Havayolu'} · {current.flightNumber}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '20px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatTime(current.departureTime)}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.3rem' }}>{dep.code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dep.name}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                      {formatDuration(current.durationMinutes)}
                    </div>
                    <div style={{ fontSize: '1.8rem' }}>✈️</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatTime(current.arrivalTime)}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.3rem' }}>{arr.code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{arr.name}</div>
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', margin: '8px 0' }}>
                  {formatPrice(current.economyPrice)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {current.availableSeats} koltuk müsait
                </div>
              </div>

              {buyMsg && (
                <div style={{
                  background: bought ? '#f0fff4' : '#fff5f5',
                  border: `1px solid ${bought ? '#68d391' : '#fc8181'}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center',
                  color: bought ? '#276749' : '#c53030',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                }}>
                  {buyMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" onClick={pickRandom} style={{ flex: 1 }}>
                  🔀 Başka Uçuş
                </button>
                {!bought && (
                  <button className="btn btn-primary" onClick={handleBuy} disabled={buying} style={{ flex: 1 }}>
                    {buying ? 'İşleniyor...' : '🎟 Satın Al'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
