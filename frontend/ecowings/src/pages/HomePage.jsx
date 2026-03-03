import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Star, MapPin, ArrowRight, CheckCircle2, Calendar, Search, ChevronDown } from 'lucide-react';
import apiClient from '../shared/services/apiClient';
import flightService from '../domains/flights/services/flightService';
import FlightCard from '../domains/flights/components/FlightCard';
import AmadeusFlightCard from '../domains/flights/components/AmadeusFlightCard';
import AirportSelect from '../domains/flights/components/AirportSelect';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import ErrorMessage from '../shared/components/ErrorMessage';

/* ── Shimmer skeleton shown while search is running ── */
function SearchSkeletonCard() {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #111c11 0%, #0e1a0e 100%)',
      border: '1px solid rgba(34,197,94,0.12)',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(34,197,94,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '10px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ width: '70px', height: '10px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '50px', height: '14px', borderRadius: '4px' }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '20px' }} />
      </div>
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '82px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '70px', height: '34px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '44px', height: '16px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '36px', height: '10px', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div className="skeleton" style={{ width: '50px', height: '10px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100%', height: '1px' }} />
          <div className="skeleton" style={{ width: '40px', height: '10px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '82px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '70px', height: '34px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '44px', height: '16px', borderRadius: '4px' }} />
        </div>
      </div>
      <div style={{ padding: '14px 20px 20px', borderTop: '1px solid rgba(34,197,94,0.08)', background: 'rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ width: '36px', height: '10px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100px', height: '26px', borderRadius: '6px' }} />
          </div>
          <div className="skeleton" style={{ width: '60px', height: '30px', borderRadius: '6px' }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: '10px' }} />
      </div>
    </div>
  );
}

/* ── Airline initial badge when logoUrl is missing ── */
function AirlineMonogram({ name }) {
  const letters = (name || '??').slice(0, 2).toUpperCase();
  const hue = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: '72px', height: '72px',
      borderRadius: '16px',
      background: `linear-gradient(135deg, hsla(${hue},55%,22%,1) 0%, hsla(${hue},45%,15%,1) 100%)`,
      border: `1px solid hsla(${hue},55%,35%,0.4)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.1rem', fontWeight: 800,
      color: `hsl(${hue},70%,70%)`,
      letterSpacing: '0.05em',
      fontFamily: "'DM Mono', monospace",
      flexShrink: 0,
    }}>{letters}</div>
  );
}

export default function HomePage() {
  const [flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [loadingAirlines, setLoadingAirlines] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorFlights, setErrorFlights] = useState('');
  const [errorAirlines, setErrorAirlines] = useState('');
  const [errorReviews, setErrorReviews] = useState('');

  // Airports for dropdowns
  const [airports, setAirports] = useState([]);

  // Search form state
  const [searchForm, setSearchForm] = useState({ from: '', to: '', departure: '', travelClass: 'Economy' });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // allFlights: arama için tam liste; flights: featured 6 adet

  useEffect(() => {
    // Fetch all data in parallel
    flightService.getFlights()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAllFlights(list);
        setFlights(list.slice(0, 6));
      })
      .catch(() => setErrorFlights('Uçuşlar yüklenemedi.'))
      .finally(() => setLoadingFlights(false));

    apiClient.get('/api/Airline')
      .then((res) => {
        if (Array.isArray(res.data)) setAirlines(res.data);
        else setErrorAirlines(res.data?.message || 'Havayolları yüklenemedi.');
      })
      .catch(() => setErrorAirlines('Havayolları yüklenemedi.'))
      .finally(() => setLoadingAirlines(false));

    apiClient.get('/api/Airport')
      .then((res) => { if (Array.isArray(res.data)) setAirports(res.data); })
      .catch(() => {});

    apiClient.get('/api/AirlineReview')
      .then((res) => {
        if (Array.isArray(res.data)) setReviews(res.data.slice(-4));
        else setErrorReviews(res.data?.message || 'Yorumlar yüklenemedi.');
      })
      .catch(() => setErrorReviews('Yorumlar yüklenemedi.'))
      .finally(() => setLoadingReviews(false));
  }, []);

  // travelClass değerini API enum'una çevirir
  const toApiTravelClass = (cls) => {
    if (cls === 'Business') return 'BUSINESS';
    if (cls === 'FirstClass') return 'FIRST';
    return 'ECONOMY';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const origin = searchForm.from.trim();
    const destination = searchForm.to.trim();
    if (!origin || !destination) {
      setSearchError('Kalkış ve varış şehri / IATA kodunu girin.'); return;
    }
    if (!searchForm.departure) {
      setSearchError('Lütfen kalkış tarihini seçin.'); return;
    }
    setSearchError('');
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await flightService.searchFlightsApi(
        origin,
        destination,
        searchForm.departure,
        1,
        toApiTravelClass(searchForm.travelClass)
      );
      const list = Array.isArray(res.data) ? res.data : [];

      // Amadeus test ortamı bazen farklı kalkış/varışlı uçuşlar döndürebilir.
      // Seçilen IATA kodlarıyla eşleşmeyenleri frontend'de de filtrele.
      const filtered = list.filter((f) => {
        const matchOrigin = f.departure?.toUpperCase() === origin.toUpperCase();
        const matchDest   = f.arrival?.toUpperCase()   === destination.toUpperCase();
        return matchOrigin && matchDest;
      });

      setSearchResults(filtered);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Uçuş arama sırasında bir hata oluştu.';
      setSearchError(typeof msg === 'string' ? msg : 'Uçuş arama sırasında bir hata oluştu.');
      setSearchResults([]);
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
            background: 'rgba(5,18,10,0.78)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            padding: '28px 28px 24px',
            maxWidth: '860px',
            margin: '0 auto',
            border: '1px solid rgba(34,197,94,0.18)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(34,197,94,0.08)',
            position: 'relative',
            zIndex: 10,
          }}>
            {/* Row 1: airport selects */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <AirportSelect
                label="Nereden?"
                icon="takeoff"
                airports={airports}
                value={searchForm.from}
                onChange={(code) => setSearchForm((p) => ({ ...p, from: code }))}
                placeholder="Kalkış havalimanı"
              />
              <AirportSelect
                label="Nereye?"
                icon="landing"
                airports={airports}
                value={searchForm.to}
                onChange={(code) => setSearchForm((p) => ({ ...p, to: code }))}
                placeholder="Varış havalimanı"
              />
            </div>

            {/* Row 2: date + cabin + button */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              {/* Date field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Tarih</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Calendar size={15} style={{ position: 'absolute', left: '14px', color: 'rgba(34,197,94,0.6)', pointerEvents: 'none', flexShrink: 0 }} />
                  <input
                    type="date"
                    value={searchForm.departure}
                    onChange={(e) => setSearchForm((p) => ({ ...p, departure: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: '10px',
                      padding: '12px 14px 12px 40px',
                      color: searchForm.departure ? '#f0fdf4' : 'rgba(156,163,175,0.7)',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      colorScheme: 'dark',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(34,197,94,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Cabin class field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Kabin Sınıfı</span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={searchForm.travelClass}
                    onChange={(e) => setSearchForm((p) => ({ ...p, travelClass: e.target.value }))}
                    style={{
                      width: '100%',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: '10px',
                      padding: '12px 40px 12px 14px',
                      color: '#f0fdf4',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(34,197,94,0.2)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="Economy" style={{ background: '#0a1a0a' }}>Ekonomi</option>
                    <option value="Business" style={{ background: '#0a1a0a' }}>Business</option>
                    <option value="FirstClass" style={{ background: '#0a1a0a' }}>First Class</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(34,197,94,0.6)', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Search button */}
              <button
                type="submit"
                disabled={searching}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 28px',
                  borderRadius: '10px',
                  border: 'none',
                  background: searching ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#051005',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.4px',
                  cursor: searching ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: searching ? 'none' : '0 4px 20px rgba(34,197,94,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!searching) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,197,94,0.4)'; e.currentTarget.style.filter = 'brightness(1.08)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = searching ? 'none' : '0 4px 20px rgba(34,197,94,0.3)'; e.currentTarget.style.filter = 'brightness(1)'; }}
              >
                <Search size={15} />
                {searching ? 'Aranıyor...' : 'Uçuş Ara'}
              </button>
            </div>

            {searchError && (
              <p style={{ marginTop: '12px', marginBottom: 0, color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>⚠</span> {searchError}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ── Search Results / Skeleton ── */}
      {(searching || searchResults !== null) && (
        <section style={{ background: 'var(--bg-section-alt)', padding: '52px 0' }}>
          <div className="container">
            {/* Section heading */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                <Plane size={11} /> Arama Sonuçları
              </div>
              {searching ? (
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>Uçuşlar aranıyor…</p>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
                    {searchResults.length} Uçuş Bulundu
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '6px' }}>Arama kriterlerinize uyan sonuçlar</p>
                </>
              )}
            </div>

            {searching ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                <SearchSkeletonCard />
                <SearchSkeletonCard />
                <SearchSkeletonCard />
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.08)', borderRadius: '16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✈️</div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f0fdf4', marginBottom: '6px' }}>Sonuç bulunamadı</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Farklı tarih veya havalimanı deneyin.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {searchResults.map((f, i) => (
                  <AmadeusFlightCard key={f.flightNumber ? `${f.flightNumber}-${i}` : i} flight={f} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Öne Çıkan Uçuşlar ── */}
      <section style={{ padding: '72px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative radial glow */}
        <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
              ✦ Seçili Rotalar
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.15, margin: 0, background: 'linear-gradient(135deg, #f0fdf4 30%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Öne Çıkan Uçuşlar
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '8px' }}>En popüler rotalardan editörce seçilmiş uçuşlar</p>
              </div>
              <Link to="/flights" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', background: 'rgba(34,197,94,0.05)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
                Tüm Uçuşlar <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ marginTop: '20px', height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0.1) 60%, transparent 100%)' }} />
          </div>

          {loadingFlights ? <LoadingSpinner /> : errorFlights ? <ErrorMessage message={errorFlights} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {flights.map((f, idx) => (
                <div key={f.id} style={{ position: 'relative' }}>
                  {idx < 2 && (
                    <div style={{ position: 'absolute', top: '-1px', left: '20px', zIndex: 2, background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: '0 0 8px 8px', padding: '3px 12px', fontSize: '0.65rem', fontWeight: 800, color: '#080e08', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      Popüler
                    </div>
                  )}
                  <div style={idx < 2 ? { boxShadow: '0 0 0 1px rgba(34,197,94,0.35)', borderRadius: '14px' } : {}}>
                    <FlightCard flight={f} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Havayolu Ortaklarımız ── */}
      <section style={{ padding: '72px 0', background: 'var(--bg-surface, #0e1a0e)' }}>
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
              ✈ Güvenilir Ortaklar
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.15, margin: 0, background: 'linear-gradient(135deg, #f0fdf4 30%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Havayolu Ortaklarımız
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '8px' }}>Seçkin havayolu şirketleriyle güvenli ve konforlu seyahat edin</p>
            <div style={{ marginTop: '20px', height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0.1) 60%, transparent 100%)' }} />
          </div>

          {loadingAirlines ? <LoadingSpinner /> : errorAirlines ? <ErrorMessage message={errorAirlines} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {airlines.slice(0, 8).map((a) => (
                <div key={a.id} style={{
                  background: 'linear-gradient(160deg, #111c11 0%, #0e1a0e 100%)',
                  border: '1px solid rgba(34,197,94,0.13)',
                  borderRadius: '16px',
                  padding: '28px 20px 22px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
                  cursor: 'default',
                  position: 'relative',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.12), 0 4px 12px rgba(0,0,0,0.4)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.32)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.35)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.13)';
                  }}
                >
                  {/* Partner badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '20px', padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.05em' }}>
                    <CheckCircle2 size={9} /> Sertifikalı
                  </div>

                  {/* Logo or monogram */}
                  {a.logoUrl ? (
                    <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={a.logoUrl} alt={a.name} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <AirlineMonogram name={a.name} />
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {a.name}
                    </h3>
                    {a.country && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280' }}>
                        <MapPin size={10} />{a.country}
                      </div>
                    )}
                  </div>

                  {a.averageRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '20px', padding: '4px 12px' }}>
                      <Star size={11} style={{ color: '#22c55e', fill: '#22c55e' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>{a.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Son Yorumlar ── */}
      <section style={{ padding: '72px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
              <Star size={10} /> Yolcu Deneyimleri
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.15, margin: 0, background: 'linear-gradient(135deg, #f0fdf4 30%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Son Yorumlar
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '8px' }}>Gerçek yolculardan gerçek deneyimler</p>
              </div>
              <Link to="/comments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', background: 'rgba(34,197,94,0.05)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
                Tüm Yorumlar <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ marginTop: '20px', height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0.1) 60%, transparent 100%)' }} />
          </div>

          {loadingReviews ? <LoadingSpinner /> : errorReviews ? <ErrorMessage message={errorReviews} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {reviews.map((r) => {
                const initials = (r.userName || '?').slice(0, 1).toUpperCase();
                const hue = (r.userName || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
                const filled = Math.max(0, Math.min(5, Math.round(r.rating)));
                return (
                  <div key={r.id} style={{
                    background: 'linear-gradient(160deg, #111c11 0%, #0e1a0e 100%)',
                    border: '1px solid rgba(34,197,94,0.12)',
                    borderLeft: '4px solid rgba(34,197,94,0.5)',
                    borderRadius: '16px',
                    padding: '28px 24px 22px',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.1), 0 4px 12px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)';
                    }}
                  >
                    {/* Decorative giant quote */}
                    <div style={{ position: 'absolute', top: '8px', right: '16px', fontSize: '5rem', lineHeight: 1, color: 'rgba(34,197,94,0.07)', fontFamily: 'Georgia, serif', fontWeight: 900, pointerEvents: 'none', userSelect: 'none' }}>&ldquo;</div>

                    {/* Star rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < filled ? '#22c55e' : 'none'} stroke={i < filled ? '#22c55e' : '#374151'} strokeWidth="2">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', marginLeft: '4px' }}>{filled}/5</span>
                    </div>

                    {/* Comment */}
                    <p style={{ color: '#bbf7d0', fontSize: '0.93rem', lineHeight: 1.7, fontStyle: 'italic', margin: 0, position: 'relative', zIndex: 1 }}>
                      &ldquo;{r.comment}&rdquo;
                    </p>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(34,197,94,0.1)' }} />

                    {/* Footer: avatar + name + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: `linear-gradient(135deg, hsl(${hue},55%,22%) 0%, hsl(${hue},45%,15%) 100%)`,
                        border: `1.5px solid hsl(${hue},55%,35%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800, color: `hsl(${hue},70%,70%)`,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        flexShrink: 0,
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f0fdf4' }}>{r.userName}</div>
                        {r.createdDate && (
                          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '1px' }}>
                            {new Date(r.createdDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
