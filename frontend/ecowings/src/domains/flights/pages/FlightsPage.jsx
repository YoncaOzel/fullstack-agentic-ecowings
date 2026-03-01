import { useState, useEffect } from 'react';
import flightService from '../services/flightService';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function FlightsPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');

  useEffect(() => {
    flightService.getFlights()
      .then((res) => {
        // Backend doğrudan dizi döndürür: [...]
        if (Array.isArray(res.data)) setFlights(res.data);
        else setError(res.data?.message || 'Uçuşlar yüklenemedi.');
      })
      .catch(() => setError('Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = flights
    .filter((f) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        f.flightNumber?.toLowerCase().includes(q) ||
        f.departureAirport?.name?.toLowerCase().includes(q) ||
        f.departureAirport?.code?.toLowerCase().includes(q) ||
        f.arrivalAirport?.name?.toLowerCase().includes(q) ||
        f.arrivalAirport?.code?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.economyPrice || 0) - (b.economyPrice || 0);
      if (sortBy === 'price-desc') return (b.economyPrice || 0) - (a.economyPrice || 0);
      if (sortBy === 'duration') return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      return 0;
    });

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>✈️ Tüm Uçuşlar</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            {flights.length > 0 ? `${flights.length} uçuş listeleniyor` : 'Uçuşlar yükleniyor...'}
          </p>
        </div>
      </div>

      <div className="container section">
        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
          <input
            className="form-input"
            placeholder="Uçuş no, şehir veya havalimanı..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '320px' }}
          />
          <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ maxWidth: '200px' }}>
            <option value="default">Sırala: Varsayılan</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="duration">Süre: Kısa</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
          <>
            <p className="subtitle" style={{ marginBottom: '20px' }}>{filtered.length} sonuç</p>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                Sonuç bulunamadı.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filtered.map((f) => <FlightCard key={f.id} flight={f} />)}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
