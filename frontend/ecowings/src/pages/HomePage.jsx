import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../shared/services/apiClient';
import flightService from '../domains/flights/services/flightService';
import FlightCard from '../domains/flights/components/FlightCard';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import ErrorMessage from '../shared/components/ErrorMessage';

export default function HomePage() {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [loadingAirlines, setLoadingAirlines] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorFlights, setErrorFlights] = useState('');
  const [errorAirlines, setErrorAirlines] = useState('');
  const [errorReviews, setErrorReviews] = useState('');

  // Search form state
  const [searchForm, setSearchForm] = useState({ from: '', to: '', departure: '', travelClass: 'Economy' });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    // Fetch all data in parallel
    flightService.getFlights()
      .then((res) => {
        if (res.data?.succeeded) setFlights(res.data.data?.slice(0, 6) || []);
        else setErrorFlights(res.data?.message || 'Uçuşlar yüklenemedi.');
      })
      .catch(() => setErrorFlights('Uçuşlar yüklenemedi.'))
      .finally(() => setLoadingFlights(false));

    apiClient.get('/api/Airline')
      .then((res) => {
        if (res.data?.succeeded) setAirlines(res.data.data || []);
        else setErrorAirlines(res.data?.message || 'Havayolları yüklenemedi.');
      })
      .catch(() => setErrorAirlines('Havayolları yüklenemedi.'))
      .finally(() => setLoadingAirlines(false));

    apiClient.get('/api/AirlineReview')
      .then((res) => {
        if (res.data?.succeeded) setReviews(res.data.data?.slice(-4) || []);
        else setErrorReviews(res.data?.message || 'Yorumlar yüklenemedi.');
      })
      .catch(() => setErrorReviews('Yorumlar yüklenemedi.'))
      .finally(() => setLoadingReviews(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.from.trim() || !searchForm.to.trim()) {
      setSearchError('Kalkış ve varış şehri gerekli.'); return;
    }
    setSearchError('');
    setSearching(true);
    try {
      const res = await flightService.searchFlights(searchForm);
      if (res.data?.succeeded) {
        setSearchResults(res.data.data || []);
      } else {
        setSearchError(res.data?.message || 'Arama başarısız.');
      }
    } catch {
      setSearchError('Arama sırasında bir hata oluştu.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
        color: '#fff',
        padding: '80px 0',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '16px' }}>
            🌿 Yeşil Bir Yolculuk Başlıyor
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Sürdürülebilir seyahat için en uygun uçuşları bulun, karbon ayak izinizi azaltın.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '800px',
            margin: '0 auto',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <input className="form-input" placeholder="Nereden?" value={searchForm.from}
                onChange={(e) => setSearchForm((p) => ({ ...p, from: e.target.value }))}
                style={{ background: 'rgba(255,255,255,0.9)' }} />
              <input className="form-input" placeholder="Nereye?" value={searchForm.to}
                onChange={(e) => setSearchForm((p) => ({ ...p, to: e.target.value }))}
                style={{ background: 'rgba(255,255,255,0.9)' }} />
              <input type="date" className="form-input" value={searchForm.departure}
                onChange={(e) => setSearchForm((p) => ({ ...p, departure: e.target.value }))}
                style={{ background: 'rgba(255,255,255,0.9)' }} />
              <select className="form-input" value={searchForm.travelClass}
                onChange={(e) => setSearchForm((p) => ({ ...p, travelClass: e.target.value }))}
                style={{ background: 'rgba(255,255,255,0.9)' }}>
                <option value="Economy">Ekonomi</option>
                <option value="Business">Business</option>
                <option value="FirstClass">First Class</option>
              </select>
            </div>
            {searchError && <p style={{ color: '#ffcdd2', fontSize: '0.875rem', marginBottom: '8px' }}>{searchError}</p>}
            <button type="submit" className="btn" disabled={searching}
              style={{ background: '#fff', color: 'var(--primary)', padding: '12px 36px', fontWeight: 700 }}>
              {searching ? 'Aranıyor...' : '🔍 Uçuş Ara'}
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {searchResults !== null && (
        <section className="section" style={{ background: 'var(--bg-section-alt)' }}>
          <div className="container">
            <h2 style={{ marginBottom: '8px' }}>Arama Sonuçları</h2>
            <p className="subtitle" style={{ marginBottom: '28px' }}>{searchResults.length} uçuş bulundu</p>
            {searchResults.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Kriterlere uygun uçuş bulunamadı.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {searchResults.map((f) => <FlightCard key={f.id} flight={f} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Flights */}
      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: '8px' }}>Öne Çıkan Uçuşlar</h2>
          <p className="subtitle" style={{ marginBottom: '28px' }}>En popüler rotalardan seçtiğimiz uçuşlar</p>
          {loadingFlights ? <LoadingSpinner /> : errorFlights ? <ErrorMessage message={errorFlights} /> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                {flights.map((f) => <FlightCard key={f.id} flight={f} />)}
              </div>
              <div style={{ textAlign: 'center' }}>
                <Link to="/flights" className="btn btn-secondary">Tüm Uçuşları Gör</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Airlines */}
      <section className="section section-alt">
        <div className="container">
          <h2 style={{ marginBottom: '8px' }}>Havayolu Ortaklarımız</h2>
          <p className="subtitle" style={{ marginBottom: '28px' }}>Güvenilir havayolu şirketleriyle uçun</p>
          {loadingAirlines ? <LoadingSpinner /> : errorAirlines ? <ErrorMessage message={errorAirlines} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {airlines.map((a) => (
                <div key={a.id} className="card" style={{ textAlign: 'center' }}>
                  {a.logoUrl ? (
                    <img src={a.logoUrl} alt={a.name} style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
                  ) : (
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✈️</div>
                  )}
                  <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{a.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{a.country}</p>
                  {a.averageRating && (
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginTop: '6px' }}>
                      ★ {a.averageRating?.toFixed(1)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: '8px' }}>Son Yorumlar</h2>
          <p className="subtitle" style={{ marginBottom: '28px' }}>Yolcularımızın deneyimleri</p>
          {loadingReviews ? <LoadingSpinner /> : errorReviews ? <ErrorMessage message={errorReviews} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {reviews.map((r) => (
                <div key={r.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.userName}</span>
                    <span style={{ color: '#ffc107', fontWeight: 700 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '8px' }}>
                    "{r.comment}"
                  </p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    {r.createdDate ? new Date(r.createdDate).toLocaleDateString('tr-TR') : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link to="/comments" className="btn btn-secondary">Tüm Yorumları Gör</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
