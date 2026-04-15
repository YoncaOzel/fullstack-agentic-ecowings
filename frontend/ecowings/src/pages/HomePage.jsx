import { useState, useEffect, useRef, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';
import apiClient from '../shared/services/apiClient';
import flightService from '../domains/flights/services/flightService';
import AmadeusFlightCard from '../domains/flights/components/AmadeusFlightCard';
import AirportSelect from '../domains/flights/components/AirportSelect';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import ErrorMessage from '../shared/components/ErrorMessage';

/* ── Custom input for the homepage date picker ── */
const DatePickerInput = forwardRef(({ value, onClick }, ref) => (
  <input
    ref={ref}
    value={value}
    onClick={onClick}
    placeholder="Select date"
    readOnly
    style={{
      width: '100%',
      background: 'transparent',
      border: 'none',
      padding: '0',
      color: value ? '#1c2b22' : '#6c8274',
      fontSize: '14px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
      outline: 'none',
      cursor: 'pointer',
    }}
  />
));

/* ── Shimmer skeleton shown while search is running ── */
function SearchSkeletonCard() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(77,124,95,0.13)',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(77,124,95,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <div style={{ padding: '14px 20px 20px', borderTop: '1px solid rgba(77,124,95,0.08)', background: 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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


/* ─────────────────────────────────────────────────────
   Bento Grid Destinations – static eco showcase
───────────────────────────────────────────────────── */
const ECO_DESTINATIONS = [
  {
    id: 1,
    name: 'Norwegian Fjords',
    desc: 'Fully integrated travel experience with electric ships and trains.',
    badge: '45% Less Carbon',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzGOyc7LWr18-imrPSEyosXLjze26LZkUHlPeiypA0gR5K7ZZCsu3uTIKT5sj_jcc6cGNMY8MSEKqg6RHCL_20o_ZJai9Mdw7KSdJsareunnOdRgcJ_-Jj9jSqtNGAVGeHuSVMeTA0PB_c4qE_OEZ2xKgMOC1jiMR_y1GF9SHZxHH_zmm11w-1OfHXE9RMA7oS0Pbqv766GMoNVKOBjJ_SCmbPdQGZm3ZiVQIAVy32KHTmrj3lYzaspWzCtfcM2DxZPhas0y1_gtw',
    large: true,
  },
  {
    id: 2,
    name: 'Swiss Alps',
    desc: 'Zero-emission mountain villages.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhxXbzqLOYMwC93d3vSCZWEALS2jxsItbGEAuuaajrIQZEJmfnx6IUyVC734M9v3dYYTDBK_P52y1mOvM506qz8yEEwSYDsvtLHmoCjKruweb3r_xLo0bQN_y_f22OjNDV2m52z12yl70cix0bT-GglULB8Guz2CeLY5OzYl-ELI6CZ5MXVncaXk8jNSYoD8rw6YqNyITHsW0-rhEuG-4FEXlUBn675uiA9JZ3036iilYhJnZD8PY2FBC8JvwOOOjdfoRdYeDfON4',
    large: false,
  },
  {
    id: 3,
    name: 'Iceland',
    desc: 'Cities heated by geothermal energy.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBN9j69PohT7HAgM6LUN9-NMNp96CAIRAp6yCc7SwcFAza75UONTeJr1WJPvoBMPmDTwdIUUhcB48gvJrTdRZ9dlbOcO8sZJ37k7vPgUW6pJvY1vqIEOsL_WV_naWyKcPVMSyeSBI6jTEsebz0tBZFpFlEbh8f2t0Nk7GlEiQsu0N5e0SMdg7dlhZsfFJl-NGuBVvmRyqidUfReNp0CFI8NGqUJD2PSGFn76VVmsBVwcUhEXbGQ9By1UDYlWcv-Jwd9aNN5ogZIZuE',
    large: false,
  },
];

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
  const [searchForm, setSearchForm] = useState({ from: '', to: '', departure: null, travelClass: 'Economy' });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const resultsRef = useRef(null);

  // allFlights: arama için tam liste; flights: featured 6 adet

  useEffect(() => {
    // Fetch all data in parallel
    flightService.getFlights()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAllFlights(list);
        setFlights(list.slice(0, 6));
      })
      .catch(() => setErrorFlights('Could not load flights.'))
      .finally(() => setLoadingFlights(false));

    apiClient.get('/api/Airline')
      .then((res) => {
        if (Array.isArray(res.data)) setAirlines(res.data);
        else setErrorAirlines(res.data?.message || 'Could not load airlines.');
      })
      .catch(() => setErrorAirlines('Could not load airlines.'))
      .finally(() => setLoadingAirlines(false));

    apiClient.get('/api/Airport')
      .then((res) => { if (Array.isArray(res.data)) setAirports(res.data); })
      .catch(() => {});

    apiClient.get('/api/AirlineReview')
      .then((res) => {
        if (Array.isArray(res.data)) setReviews(res.data.slice(-4));
        else setErrorReviews(res.data?.message || 'Could not load reviews.');
      })
      .catch(() => setErrorReviews('Could not load reviews.'))
      .finally(() => setLoadingReviews(false));
  }, []);

  // Scroll-reveal: watch every .fade-up element
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loadingFlights, loadingAirlines, loadingReviews]);

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
      setSearchError('Please enter a departure and arrival city / IATA code.'); return;
    }
    if (!searchForm.departure) {
      setSearchError('Please select a departure date.'); return;
    }
    setSearchError('');
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await flightService.searchFlightsApi(
        origin,
        destination,
        searchForm.departure.toISOString().split('T')[0],
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
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'An error occurred while searching for flights.';
      setSearchError(typeof msg === 'string' ? msg : 'An error occurred while searching for flights.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="ecowings-home">

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '870px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'visible',
        background: 'linear-gradient(135deg, #002d1c 0%, #00452e 100%)',
        paddingTop: '72px',
      }}>
        {/* Background video */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <video
            src="/PlaneVideo.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.5 }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, #002d1c 0%, rgba(0,45,28,0.8) 55%, transparent 100%)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '80px 24px' }}>
          <div style={{ maxWidth: '840px' }}>
            {/* Eyebrow label */}
            <span style={{
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2rem',
              textTransform: 'uppercase',
              color: '#b1f0ce',
              marginBottom: '24px',
            }}>
              Sustainable Aviation
            </span>

            {/* H1 */}
            <h1 style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              marginBottom: '28px',
            }}>
              A Green Journey<br />Begins
            </h1>

            {/* Subtext */}
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.15rem',
              color: 'rgba(177,240,206,0.85)',
              maxWidth: '560px',
              lineHeight: 1.75,
              marginBottom: '48px',
            }}>
              Fly into the future today. We create environmentally friendly routes with our smart algorithms that optimize your carbon footprint.
            </p>

            {/* ── Search Widget ── */}
            <form
              onSubmit={handleSearch}
              className="airport-dropdown-exclude hero-search-form"
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '6px',
                maxWidth: '940px',
                boxShadow: '0 20px 60px rgba(0,45,28,0.25)',
                position: 'relative',
                zIndex: 10,
                overflow: 'visible',
                boxSizing: 'border-box',
              }}
            >
              {/* Tek satır — flexbox ile tüm alanlar ve buton eşit hizada */}
              <div style={{
                display: 'flex',
                alignItems: 'stretch',
                width: '100%',
                boxSizing: 'border-box',
              }}>

                {/* Nereden */}
                <div style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  padding: '10px 14px',
                  borderRight: '1px solid #e5e7eb',
                  overflow: 'visible',
                }}>
                  <AirportSelect
                    label="From?"
                    icon="takeoff"
                    airports={airports}
                    value={searchForm.from}
                    onChange={(code) => setSearchForm((p) => ({ ...p, from: code }))}
                    placeholder="Departure airport"
                  />
                </div>

                {/* Nereye */}
                <div style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  padding: '10px 14px',
                  borderRight: '1px solid #e5e7eb',
                  overflow: 'visible',
                }}>
                  <AirportSelect
                    label="To?"
                    icon="landing"
                    airports={airports}
                    value={searchForm.to}
                    onChange={(code) => setSearchForm((p) => ({ ...p, to: code }))}
                    placeholder="Arrival airport"
                  />
                </div>

                {/* Tarih */}
                <div style={{
                  flex: '0 0 155px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '10px 14px',
                  borderRight: '1px solid #e5e7eb',
                  minWidth: 0,
                }}>
                  <span style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12rem',
                    textTransform: 'uppercase',
                    color: '#6c8274',
                    marginBottom: '5px',
                  }}>
                    Date
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: '#002d1c', flexShrink: 0, lineHeight: 1 }}
                    >
                      calendar_today
                    </span>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <DatePicker
                        selected={searchForm.departure}
                        onChange={(date) => setSearchForm((p) => ({ ...p, departure: date }))}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        customInput={<DatePickerInput />}
                        popperPlacement="bottom-start"
                        portalId="datepicker-root"
                      />
                    </div>
                  </div>
                </div>

                {/* Kabin Sınıfı */}
                <div style={{
                  flex: '0 0 145px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '10px 14px',
                  borderRight: '1px solid #e5e7eb',
                  minWidth: 0,
                }}>
                  <span style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12rem',
                    textTransform: 'uppercase',
                    color: '#6c8274',
                    marginBottom: '5px',
                  }}>
                    Cabin Class
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px', color: '#002d1c', flexShrink: 0, lineHeight: 1 }}
                    >
                      airline_seat_recline_extra
                    </span>
                    <select
                      value={searchForm.travelClass}
                      onChange={(e) => setSearchForm((p) => ({ ...p, travelClass: e.target.value }))}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        color: '#1c2b22',
                        fontSize: '13px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        width: '100%',
                      }}
                    >
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="FirstClass">First Class</option>
                    </select>
                  </div>
                </div>

                {/* Uçuş Ara butonu — flex item, form içinde kalır */}
                <div style={{ flex: '0 0 auto', padding: '6px', display: 'flex', alignItems: 'stretch' }}>
                  <button
                    type="submit"
                    disabled={searching}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: searching
                        ? '#6c8274'
                        : 'linear-gradient(135deg, #002d1c 0%, #00452e 100%)',
                      color: '#ffffff',
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: searching ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: searching ? 'none' : '0 4px 16px rgba(0,45,28,0.35)',
                      transition: 'all 0.2s ease',
                      minWidth: '120px',
                      height: '100%',
                    }}
                    onMouseEnter={e => { if (!searching) { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,45,28,0.45)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.boxShadow = searching ? 'none' : '0 4px 16px rgba(0,45,28,0.35)'; }}
                  >
                    {searching ? (
                      'Searching...'
                    ) : (
                      <>
                        <span>Search Flights</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', lineHeight: 1 }}>arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {searchError && (
                <p style={{ marginTop: '8px', marginBottom: 0, padding: '0 10px 6px', color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠</span> {searchError}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── Search Results / Skeleton ── */}
      {(searching || searchResults !== null) && (
        <section ref={resultsRef} style={{ background: '#f3f4f5', padding: '52px 0', borderTop: '1px solid rgba(77,124,95,0.12)', borderBottom: '1px solid rgba(77,124,95,0.12)' }}>
          <div className="container">
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,69,46,0.08)', border: '1px solid rgba(0,69,46,0.2)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#00452e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                <Plane size={11} /> Search Results
              </div>
              {searching ? (
                <p style={{ color: '#6c8274', fontSize: '0.9rem', marginTop: '4px' }}>Searching for flights…</p>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2, color: '#1c2b22' }}>
                    {searchResults.length} Flights Found
                  </h2>
                  <p style={{ color: '#6c8274', fontSize: '0.9rem', marginTop: '6px' }}>Results matching your search criteria</p>
                </>
              )}
            </div>

            {searching ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <SearchSkeletonCard />
                <SearchSkeletonCard />
                <SearchSkeletonCard />
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', border: '1px solid rgba(77,124,95,0.14)', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <Plane size={36} style={{ color: '#c1c8c2', marginBottom: '14px' }} />
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1c2b22', marginBottom: '6px' }}>No results found</p>
                <p style={{ color: '#6c8274', fontSize: '0.9rem' }}>Try a different date or airport.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {searchResults.map((f, i) => (
                  <AmadeusFlightCard key={f.flightNumber ? `${f.flightNumber}-${i}` : i} flight={f} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Popüler Ekolojik Rotalar (Bento Grid) ─────────────── */}
      <section className="fade-up" style={{ padding: '96px 0', background: '#f8f9fa' }}>
        <div className="container">
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{
                fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 800,
                color: '#002d1c',
                marginBottom: '12px',
                lineHeight: 1.15,
              }}>
                Popular Eco Routes
              </h2>
              <p style={{ color: '#6c8274', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', lineHeight: 1.65 }}>
                Discover destinations with the lowest carbon emissions and sustainable tourism certifications.
              </p>
            </div>
            <Link
              to="/flights"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1rem', color: '#002d1c', textDecoration: 'none' }}
            >
              <span>View All</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </Link>
          </div>

          {/* Bento Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(2, 360px)',
            gap: '20px',
          }}>
            {ECO_DESTINATIONS.map((dest, i) => {
              const isLarge = dest.large;
              return (
                <div
                  key={dest.id}
                  style={{
                    gridColumn: isLarge ? 'span 8' : 'span 4',
                    gridRow: isLarge ? 'span 2' : 'span 1',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)'; }}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 0.7s ease',
                      borderRadius: 0,
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,45,28,0.85) 0%, rgba(0,45,28,0.2) 50%, transparent 100%)',
                  }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, padding: isLarge ? '40px' : '24px' }}>
                    {isLarge && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(177,240,206,0.15)',
                        border: '1px solid rgba(177,240,206,0.35)',
                        color: '#b1f0ce',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '10px', fontWeight: 700,
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                        backdropFilter: 'blur(8px)',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>eco</span>
                        {dest.badge}
                      </span>
                    )}
                    <h3 style={{
                      fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
                      fontSize: isLarge ? '2.4rem' : '1.4rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      marginBottom: '8px',
                      lineHeight: 1.1,
                    }}>
                      {dest.name}
                    </h3>
                    <p style={{ color: 'rgba(177,240,206,0.8)', fontSize: isLarge ? '1rem' : '0.875rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {dest.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Neden EcoWings? (Editorial) ───────────────────────── */}
      <section className="fade-up" style={{ padding: '96px 0', background: '#f0f5f1', borderTop: '1px solid rgba(77,124,95,0.1)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: '64px',
            alignItems: 'center',
          }}>
            {/* Sol sütun — başlık + feature listesi */}
            <div>
              <h2 style={{
                fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: '#002d1c',
                lineHeight: 1.15,
                marginBottom: '48px',
              }}>
                Why Choose EcoWings?
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                {[
                  {
                    icon: 'auto_awesome',
                    title: 'Smart Route Optimization',
                    desc: 'We calculate flight routes based on wind currents and fuel efficiency in seconds.',
                  },
                  {
                    icon: 'forest',
                    title: 'Instant Carbon Offsetting',
                    desc: 'For every flight, we automatically donate to certified reforestation projects.',
                  },
                  {
                    icon: 'verified',
                    title: 'Green Certified Partners',
                    desc: 'We only work with airlines that meet the highest sustainability standards.',
                  },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{
                      width: '48px', height: '48px', flexShrink: 0,
                      borderRadius: '12px',
                      background: '#b1f0ce',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#002d1c' }}>{item.icon}</span>
                    </div>
                    <div>
                      <h4 style={{
                        fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#002d1c',
                        marginBottom: '8px',
                      }}>
                        {item.title}
                      </h4>
                      <p style={{ color: '#6c8274', fontSize: '0.95rem', lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ sütun — fotoğraf + stat overlay */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '24px',
                overflow: 'hidden',
                aspectRatio: '4/5',
                boxShadow: '0 32px 80px rgba(0,45,28,0.18)',
              }}>
                <img
                  src="/eco-foto.png"
                  alt="Nature Detail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 0, transition: 'filter 0s' }}
                />
              </div>
              {/* Stat kart overlay */}
              <div style={{
                position: 'absolute',
                bottom: '-24px',
                left: '-24px',
                background: '#ffffff',
                padding: '28px 32px',
                borderRadius: '16px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,45,28,0.06)',
                maxWidth: '220px',
              }}>
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  color: '#002d1c',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>
                  12.5M+
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12rem',
                  color: '#6c8274',
                  lineHeight: 1.4,
                }}>
                  Tons of CO₂ Saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Havayolu Ortaklarımız (API-driven) ───────────────── */}
      <section className="fade-up" style={{ background: '#f4f6f4', padding: '80px 0', borderTop: '1px solid rgba(77,124,95,0.08)' }}>
        <div className="container">

          {/* ── Header ── */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#002d1c', margin: '0 0 16px 0', lineHeight: 1.15 }}>
                Airline Partners
              </h2>
              <p style={{ color: '#6c8274', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
                Curated partnerships that transcend standard loyalty. We only align with carriers who mirror our commitment to discretion, precision, and sovereign service.
              </p>
            </div>
            <Link
              to="/airlines"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#3d6b52', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em', paddingBottom: '8px', borderBottom: '1px solid rgba(61,107,82,0.25)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(61,107,82,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(61,107,82,0.25)')}
            >
              View All Partnerships
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>

          {/* ── Partner Cards Grid ── */}
          {loadingAirlines ? (
            <LoadingSpinner />
          ) : errorAirlines ? (
            <ErrorMessage message={errorAirlines} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {airlines.slice(0, 4).map((a, idx) => {
                const cardIcons = ['flight_takeoff', 'travel_explore', 'diamond', 'ac_unit'];
                const cardDescriptions = [
                  'A trusted partner delivering flawless journeys with curated routes and priority boarding privileges.',
                  'Elegance meets the sky. Discover the Mediterranean through exclusive routes and premium in-flight excellence.',
                  'The pinnacle of global connectivity. Unmatched suites and personalised service across the Middle East and beyond.',
                  'Minimalist design, maximum efficiency. Sustainable travel through Northern landscapes with elite reward programmes.',
                ];
                return (
                  <div
                    key={a.id}
                    style={{
                      background: '#ffffff',
                      padding: '32px',
                      borderRadius: '16px',
                      height: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,45,28,0.07)',
                      transition: 'box-shadow 0.45s ease, transform 0.45s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 24px 64px rgba(0,0,0,0.11)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      const iconWrap = e.currentTarget.querySelector('.partner-icon-wrap');
                      if (iconWrap) iconWrap.style.filter = 'grayscale(0)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      const iconWrap = e.currentTarget.querySelector('.partner-icon-wrap');
                      if (iconWrap) iconWrap.style.filter = 'grayscale(1)';
                    }}
                  >
                    <div>
                      {/* Icon block */}
                      <div
                        className="partner-icon-wrap"
                        style={{ width: '64px', height: '64px', background: '#e8ede9', marginBottom: '28px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'grayscale(1)', transition: 'filter 0.45s ease' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#002d1c' }}>{cardIcons[idx % 4]}</span>
                      </div>

                      {/* Airline name */}
                      <h3 style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#002d1c', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                        {a.name}
                      </h3>

                      {/* Country */}
                      {a.country && (
                        <p style={{ fontSize: '0.78rem', color: '#6c8274', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 0 16px 0' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>public</span>
                          {a.country}
                        </p>
                      )}

                      {/* Description */}
                      <p style={{ fontSize: '0.84rem', lineHeight: 1.7, color: '#6c8274', margin: 0 }}>
                        {cardDescriptions[idx % 4]}
                      </p>
                    </div>

                    {/* CTA link */}
                    <a
                      href="#"
                      style={{ marginTop: '24px', color: '#3d6b52', fontWeight: 700, fontSize: '0.73rem', letterSpacing: '0.09em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                    >
                      View Benefits
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Son Yorumlar (API-driven) ─────────────────────────── */}
      <section className="fade-up" style={{ padding: '72px 0 84px', background: '#f0f5f1', borderTop: '1px solid rgba(77,124,95,0.1)' }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3d8a5c', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>
                Passenger Experiences
              </span>
              <h2 style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#002d1c', lineHeight: 1.2, margin: 0 }}>
                Recent Reviews
              </h2>
            </div>
            <Link to="/comments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '8px', border: '1px solid rgba(0,45,28,0.18)', color: '#002d1c', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none', background: 'transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              All Reviews <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(0,45,28,0.2) 0%, transparent 80%)', marginBottom: '32px' }} />

          {loadingReviews ? <LoadingSpinner /> : errorReviews ? <ErrorMessage message={errorReviews} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
              {reviews.slice(-3).map((r, idx) => {
                const isFeatured = idx === 1;
                const initials = (r.userName || '?').slice(0, 2).toUpperCase();
                const hue = (r.userName || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
                const filled = Math.max(0, Math.min(5, Math.round(r.rating)));
                return (
                  <div key={r.id} style={{
                    padding: '28px',
                    borderRadius: '14px',
                    display: 'flex', flexDirection: 'column', gap: '20px',
                    background: isFeatured ? '#002d1c' : '#ffffff',
                    boxShadow: isFeatured ? '0 16px 40px rgba(0,45,28,0.28)' : '0 1px 6px rgba(0,0,0,0.05)',
                    border: isFeatured ? 'none' : '1px solid rgba(0,45,28,0.07)',
                    transform: isFeatured ? 'translateY(-16px)' : 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
                          fill={i < filled ? (isFeatured ? '#4ade80' : '#002d1c') : 'none'}
                          stroke={i < filled ? (isFeatured ? '#4ade80' : '#002d1c') : (isFeatured ? 'rgba(255,255,255,0.25)' : '#d1d9d4')}
                          strokeWidth="2">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                    </div>

                    {/* Comment */}
                    <p style={{
                      fontSize: '0.92rem', fontWeight: 400, lineHeight: 1.75, fontStyle: 'italic',
                      color: isFeatured ? 'rgba(255,255,255,0.88)' : '#2d4438',
                      margin: 0, flex: 1,
                    }}>
                      &ldquo;{r.comment}&rdquo;
                    </p>

                    {/* Divider */}
                    <div style={{ height: '1px', background: isFeatured ? 'rgba(255,255,255,0.1)' : 'rgba(0,45,28,0.07)' }} />

                    {/* Reviewer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        background: isFeatured ? `hsl(${hue},40%,35%)` : `hsl(${hue},30%,92%)`,
                        border: isFeatured ? '1.5px solid rgba(74,222,128,0.4)' : `1px solid hsl(${hue},25%,82%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em',
                        color: isFeatured ? '#d1fae5' : `hsl(${hue},50%,28%)`,
                        userSelect: 'none',
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: isFeatured ? '#ffffff' : '#002d1c', lineHeight: 1.3 }}>
                          {r.userName}
                        </div>
                        {r.createdDate && (
                          <div style={{ fontSize: '0.7rem', marginTop: '2px', color: isFeatured ? 'rgba(255,255,255,0.45)' : '#8fa899' }}>
                            {new Date(r.createdDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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

      {/* ── Newsletter / CTA ─────────────────────────────────── */}
      <section className="fade-up" style={{ padding: '96px 0', background: '#00452e', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(177,240,206,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(177,240,206,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Let's Protect the Future Together
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.05rem',
            color: 'rgba(177,240,206,0.75)',
            marginBottom: '44px',
            lineHeight: 1.7,
          }}>
            Join our newsletter to stay informed about new eco routes and exclusive offers.
          </p>

          <form
            className="airport-dropdown-exclude"
            onSubmit={e => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'row', gap: '12px', maxWidth: '560px', margin: '0 auto', flexWrap: 'wrap' }}
          >
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: 1,
                minWidth: '200px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(177,240,206,0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                color: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#b1f0ce',
                color: '#002d1c',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'background 0.2s ease, transform 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#b1f0ce'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Subscribe
            </button>
          </form>

          {/* Alt CTA linkleri */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
            <Link to="/signup"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '10px', background: 'rgba(177,240,206,0.12)', border: '1px solid rgba(177,240,206,0.25)', color: '#b1f0ce', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(177,240,206,0.2)'; e.currentTarget.style.borderColor = 'rgba(177,240,206,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(177,240,206,0.12)'; e.currentTarget.style.borderColor = 'rgba(177,240,206,0.25)'; }}
            >
              🌱 Sign Up Free <ArrowRight size={16} />
            </Link>
            <Link to="/flights"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(177,240,206,0.2)', color: 'rgba(177,240,206,0.8)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(177,240,206,0.5)'; e.currentTarget.style.color = '#b1f0ce'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(177,240,206,0.2)'; e.currentTarget.style.color = 'rgba(177,240,206,0.8)'; }}
            >
              Explore Flights <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

/*
 * ── Endpoint Koruması Teyidi ─────────────────────────────────────
 * GET  /api/Flights           → flightService.getFlights()           ✓ KORUNDU
 * GET  /api/Airline           → apiClient.get('/api/Airline')        ✓ KORUNDU
 * GET  /api/Airport           → apiClient.get('/api/Airport')        ✓ KORUNDU
 * GET  /api/AirlineReview     → apiClient.get('/api/AirlineReview')  ✓ KORUNDU
 * GET  /api/FlightSearch/...  → flightService.searchFlightsApi(...)  ✓ KORUNDU
 *
 * Tüm request metodları, JWT Bearer header interceptor'ı ve
 * query parametreleri (origin, destination, date, adults, travelClass)
 * değiştirilmeden korunmuştur.
 * ──────────────────────────────────────────────────────────────── */
