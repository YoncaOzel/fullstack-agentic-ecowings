import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import flightService from '../services/flightService';
import userService from '../../user/services/userService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function LuckyFlightPage() {
  const { isAuthenticated } = useAuth();
  const [origin, setOrigin] = useState('');
  const [userId, setUserId] = useState(0);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Kullanıcı giriş yapmışsa int ID'yi çek
  useEffect(() => {
    if (isAuthenticated) {
      userService.getProfile()
        .then((res) => {
          const id = res?.data?.id ?? res?.data?.Id ?? 0;
          setUserId(id);
        })
        .catch(() => setUserId(0));
    }
  }, [isAuthenticated]);

  const handleSearch = async () => {
    if (!origin.trim()) {
      setError('Lütfen kalkış havalimanı kodunu girin (örn: IST).');
      return;
    }
    setError('');
    setFlight(null);
    setLoading(true);
    setSearched(true);
    try {
      const res = await flightService.getLuckyFlight(origin.trim().toUpperCase(), userId);
      setFlight(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setFlight(null);
      } else {
        const raw = err.response?.data?.message ?? err.response?.data;
        setError(typeof raw === 'string' ? raw : 'Bir hata oluştu. Backend loglarını kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
    }}>
      {/* Başlık */}
      <div style={{ textAlign: 'center', color: '#fff', marginBottom: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🍀</div>
        <h1 style={{ color: '#fff', fontSize: '2.5rem' }}>Şanslı Uçuş</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginTop: '8px' }}>
          Kalkış havalimanını gir, Türkiye'de rastgele bir uçuş keşfet!
        </p>
      </div>

      {/* Arama Kutusu */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '24px 32px',
        maxWidth: '480px',
        width: '100%',
        marginBottom: '24px',
        backdropFilter: 'blur(8px)',
      }}>
        <label style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          Kalkış Havalimanı (IATA Kodu)
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="örn: IST, AYT, ESB"
            maxLength={3}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
            style={{ whiteSpace: 'nowrap', background: '#fff', color: 'var(--primary)', fontWeight: 700, border: 'none' }}
          >
            {loading ? '...' : '🎲 Şansımı Dene'}
          </button>
        </div>
        {error && (
          <p style={{ color: '#ffd700', fontSize: '0.85rem', marginTop: '8px' }}>{error}</p>
        )}
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div style={{ color: '#fff' }}><LoadingSpinner /></div>
      )}

      {/* Sonuç: bulunamadı */}
      {!loading && searched && !flight && !error && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '32px 40px',
          textAlign: 'center',
          color: '#fff',
          maxWidth: '480px',
          width: '100%',
        }}>
          <p style={{ fontSize: '1.1rem' }}>Şu an için müsait şanslı uçuş bulunamadı.</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '8px' }}>Başka bir kalkış noktası deneyin.</p>
        </div>
      )}

      {/* Sonuç: uçuş kartı */}
      {!loading && flight && (
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '36px 40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          {/* Havayolu & Uçuş No */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
              {flight.carrier || 'Havayolu'} · {flight.flightNumber}
            </span>
            {flight.date && (
              <span style={{ marginLeft: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                📅 {flight.date}
              </span>
            )}
          </div>

          {/* Kalkış – Varış */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {flight.departureTime || '--'}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.4rem' }}>{flight.departure}</div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{flight.duration}</div>
              <div style={{ fontSize: '1.6rem' }}>✈️</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {flight.arrivalTime || '--'}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.4rem' }}>{flight.arrival}</div>
            </div>
          </div>

          {/* Fiyat */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
              {flight.price} {flight.currency}
            </span>
          </div>

          {/* Karbon */}
          {flight.emissionClass && (
            <div style={{
              background: '#f0fff4',
              border: '1px solid #68d391',
              borderRadius: '8px',
              padding: '10px 14px',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#276749',
              marginBottom: '16px',
            }}>
              🌿 Karbon Emisyonu: {flight.carbonEmission?.toFixed(1)} kg · {flight.emissionClass}
            </div>
          )}

          {/* Segmentler */}
          {flight.segments?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                AKTARMALAR
              </div>
              {flight.segments.map((seg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < flight.segments.length - 1 ? '1px dashed var(--border)' : 'none',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                }}>
                  <span>{seg.departure} → {seg.arrival}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{seg.departureTime} – {seg.arrivalTime}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{seg.carrier} {seg.flightNumber}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tekrar dene */}
          <button
            className="btn btn-outline"
            onClick={handleSearch}
            style={{ width: '100%', marginTop: '20px' }}
          >
            🔀 Başka Şanslı Uçuş
          </button>
        </div>
      )}
    </main>
  );
}
