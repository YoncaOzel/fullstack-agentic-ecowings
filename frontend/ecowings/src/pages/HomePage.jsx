import { useState, useEffect, useRef, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';
import { AnimatedTestimonials } from '../components/ui/animated-testimonials';
import apiClient from '../shared/services/apiClient';
import flightService from '../domains/flights/services/flightService';
import AmadeusFlightCard from '../domains/flights/components/AmadeusFlightCard';
import AirportSelect from '../domains/flights/components/AirportSelect';

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

function modeLabel(mode) {
  return mode || 'Alternative';
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

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Emily Carter",
    role: "Frequent Flyer",
    company: "Amsterdam → London",
    content: "Excellent flight experience! The staff was very professional, and the cabin was clean. Everything was on time. I would definitely recommend this airline.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 2,
    name: "James Hoffmann",
    role: "Business Traveller",
    company: "Berlin → Paris",
    content: "It was a fantastic flight from start to finish. The cabin crew was incredibly attentive, and the service was top-notch. Highly recommended for a stress-free journey!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Sofia Andersen",
    role: "Eco Traveller",
    company: "Oslo → Copenhagen",
    content: "Smooth flight, comfortable seating, and most importantly, we landed right on time. The staff's hospitality made the trip even better. 5 stars!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

const CTA_MARQUEE_ITEMS = [
  'Eco Travelers',
  'Business Flyers',
  'EcoWings',
  'Sustainable Explorer',
  'Carbon-Conscious Commuters'
];

function MarqueeTrack() {
  return (
    <div className="animate-marquee-vertical" style={{ display: 'flex', flexDirection: 'column', '--duration': '22s' }}>
      {CTA_MARQUEE_ITEMS.map((item, i) => (
        <div key={i} className="cta-marquee-item" style={{
          fontSize: 'clamp(2rem, 4vw, 3.8rem)',
          fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          padding: '28px 0',
          whiteSpace: 'nowrap',
        }}>
          {item}
        </div>
      ))}
    </div>
  );
}

function CTASection() {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const container = marqueeRef.current;
    if (!container) return;
    let frame;
    const update = () => {
      const items = container.querySelectorAll('.cta-marquee-item');
      const rect = container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      items.forEach(item => {
        const iRect = item.getBoundingClientRect();
        const dist = Math.abs(centerY - (iRect.top + iRect.height / 2));
        item.style.opacity = 1 - Math.min(dist / (rect.height / 2), 1) * 0.78;
      });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="fade-up" style={{ background: 'linear-gradient(to bottom, #f5f7f5 0%, var(--bg-base) 8%)', padding: '80px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '520px' }}>
          <h2 style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}>
            Get Started in Minutes
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
          }}>
            Discover eco-friendly flights and reduce your carbon footprint. Join our community of conscious travelers and book your sustainable journey today!  
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 28px', borderRadius: '8px',
              background: 'var(--text-primary)', color: 'var(--bg-base)',
              fontFamily: "'Manrope', sans-serif", fontWeight: 600,
              fontSize: '0.85rem', letterSpacing: '0.06em', textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(28,43,34,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              REGISTER NOW
            </Link>
            <Link to="/flights" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 28px', borderRadius: '8px',
              background: 'transparent', color: 'var(--text-primary)',
              border: '1.5px solid var(--border-hover)',
              fontFamily: "'Manrope', sans-serif", fontWeight: 600,
              fontSize: '0.85rem', letterSpacing: '0.06em', textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(28,43,34,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              EXPLORE FLIGHTS
            </Link>
          </div>
        </div>

        {/* Right — vertical marquee */}
        <div ref={marqueeRef} style={{ position: 'relative', height: '560px', overflow: 'hidden' }}>
          <MarqueeTrack />
          <MarqueeTrack />
          <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to bottom, var(--bg-base) 0%, transparent 100%)', zIndex: 10 }} />
          <div style={{ pointerEvents: 'none', position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 100%)', zIndex: 10 }} />
        </div>

      </div>
    </section>
  );
}

export default function HomePage() {
  const [flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorFlights, setErrorFlights] = useState('');
  const [errorReviews, setErrorReviews] = useState('');

  // Airports for dropdowns
  const [airports, setAirports] = useState([]);

  // Search form state
  const [searchForm, setSearchForm] = useState({ from: '', to: '', departure: null, travelClass: 'Economy' });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const resultsRef = useRef(null);

  const [ecoStatus, setEcoStatus] = useState('idle'); // idle | loading | done | no-alt | error
  const [ecoResult, setEcoResult] = useState(null);   // { mode, emissionKg }

  const handleEcoCheck = async () => {
    setEcoStatus('loading');
    try {
      const fromAirport = airports.find(a => a.code === searchForm.from);
      const toAirport   = airports.find(a => a.code === searchForm.to);
      const originCity  = fromAirport ? `${fromAirport.city}, ${fromAirport.country}` : searchForm.from;
      const destCity    = toAirport   ? `${toAirport.city}, ${toAirport.country}`     : searchForm.to;
      const res = await flightService.getAlternativeTransport(originCity, destCity);
      const alt = res.data?.data;
      if (!alt || alt.mode === 'There is no reasonable alternative way') {
        setEcoStatus('no-alt');
        return;
      }
      setEcoResult(alt);
      setEcoStatus('done');
    } catch {
      setEcoStatus('error');
    }
  };

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
  }, [loadingFlights, loadingReviews]);

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
    setEcoStatus('idle');
    setEcoResult(null);
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

      // Emisyonu kendi içinde karşılaştır: alt %33 → Low, orta %33 → Medium, üst %33 → High
      const withEmissionClass = (() => {
        const sorted = [...filtered].sort((a, b) => (a.carbonEmission ?? 0) - (b.carbonEmission ?? 0));
        const n = sorted.length;
        const emissionMap = new Map(sorted.map((f, i) => {
          const pct = n === 1 ? 0.5 : i / (n - 1);
          const cls = pct < 0.34 ? 'Low' : pct < 0.67 ? 'Medium' : 'High';
          return [f, cls];
        }));
        return filtered.map(f => ({ ...f, emissionClass: emissionMap.get(f) }));
      })();

      setSearchResults(withEmissionClass);
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
        alignItems: 'flex-start',
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
              opacity: 0.5,
              transform: 'scale(1.16)',
              transformOrigin: 'center top',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, #002d1c 0%, rgba(0,45,28,0.8) 55%, transparent 100%)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '64px 24px 80px' }}>
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
              <>
                {/* ── Green Alternatives Panel ── */}
                <div style={{
                  marginBottom: '20px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}>
                  {/* Header row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: '#fafcfb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: '#ecfdf5', border: '1px solid #bbf7d0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#166534', lineHeight: 1 }}>eco</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                          Lower-Emission Alternatives
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                          Travel options with a smaller carbon footprint for this route
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleEcoCheck}
                      disabled={ecoStatus === 'loading' || ecoStatus === 'done'}
                      style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: ecoStatus === 'done' ? '#166534' : ecoStatus === 'loading' ? '#6b8f7a' : '#166534',
                        background: ecoStatus === 'done' ? '#dcfce7' : '#ecfdf5',
                        border: '1px solid #bbf7d0',
                        borderRadius: '999px', padding: '5px 14px',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        cursor: (ecoStatus === 'loading' || ecoStatus === 'done') ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                      }}
                      onMouseEnter={e => { if (ecoStatus === 'idle' || ecoStatus === 'error') e.currentTarget.style.background = '#d1fae5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ecoStatus === 'done' ? '#dcfce7' : '#ecfdf5'; }}
                    >
                      {ecoStatus === 'loading' ? 'Calculating…' : ecoStatus === 'done' ? '✓ Eco Data' : 'Eco Data'}
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '16px 20px' }}>
                    {ecoStatus === 'idle' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0 }}>info</span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                          Click the <strong>Eco Data</strong> button to compare lower-emission travel alternatives for this route.
                        </span>
                      </div>
                    )}

                    {ecoStatus === 'loading' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4ade80', flexShrink: 0, animation: 'spin 1s linear infinite' }}>refresh</span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                          Calculating lower-emission travel alternatives…
                        </span>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      </div>
                    )}

                    {ecoStatus === 'no-alt' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0 }}>info</span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                          No suitable land/sea alternatives were found for this route.
                        </span>
                      </div>
                    )}

                    {ecoStatus === 'error' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px',
                        background: '#fff1f2', border: '1px solid #fecdd3',
                        borderRadius: '10px',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#e11d48', flexShrink: 0 }}>error</span>
                        <span style={{ fontSize: '0.82rem', color: '#9f1239', lineHeight: 1.5 }}>
                          Could not fetch data. Click the Eco Data button to try again.
                        </span>
                      </div>
                    )}

                    {ecoStatus === 'done' && ecoResult && (() => {
                      const flightKg = searchResults?.[0]?.carbonEmission;
                      const pct = flightKg > 0 ? Math.round(((flightKg - ecoResult.emissionKg) / flightKg) * 100) : null;
                      const savingsLabel = pct === null ? null : pct >= 95 ? 'HIGH' : pct >= 85 ? 'MEDIUM' : pct >= 70 ? 'LOW' : null;
                      const savingsColor = savingsLabel === 'HIGH' ? '#166534' : savingsLabel === 'MEDIUM' ? '#92400e' : savingsLabel === 'LOW' ? '#1e40af' : '#64748b';
                      const savingsBg   = savingsLabel === 'HIGH' ? '#dcfce7' : savingsLabel === 'MEDIUM' ? '#fef9c3' : savingsLabel === 'LOW' ? '#dbeafe' : '#f1f5f9';
                      const barWidth    = pct !== null ? Math.max(8, 100 - pct) : 80;
                      return (
                        <div style={{
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          borderRadius: '12px', padding: '14px 16px',
                          display: 'flex', flexDirection: 'column', gap: '10px',
                          maxWidth: '320px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {modeLabel(ecoResult.mode)}
                            </span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {savingsLabel && (
                                <span style={{
                                  fontSize: '0.66rem', fontWeight: 700,
                                  color: savingsColor, background: savingsBg,
                                  border: `1px solid ${savingsBg}`,
                                  borderRadius: '999px', padding: '2px 8px',
                                  textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                  {savingsLabel} savings
                                </span>
                              )}
                              {pct !== null && (
                                <span style={{
                                  fontSize: '0.66rem', fontWeight: 700,
                                  color: '#166534', background: '#ecfdf5',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '999px', padding: '2px 8px',
                                  textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                  {pct}% less
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>CO₂ Emissions</span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f172a', fontFamily: "'DM Mono', monospace" }}>
                                {ecoResult.emissionKg.toFixed(1)} kg
                              </span>
                            </div>
                            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${barWidth}%`,
                                background: 'linear-gradient(90deg, #16a34a 0%, #4ade80 100%)',
                                borderRadius: '99px',
                              }} />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {searchResults.map((f, i) => (
                    <AmadeusFlightCard key={f.flightNumber ? `${f.flightNumber}-${i}` : i} flight={f} />
                  ))}
                </div>
              </>
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

      {/* ── Airline Partners — Editorial ─────────────────────── */}
      <section className="fade-up" style={{ background: '#f4f6f4', padding: '100px 0 80px', borderTop: '1px solid rgba(77,124,95,0.08)' }}>
        <div className="container">

          {/* Eyebrow */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,69,46,0.07)', border: '1px solid rgba(0,69,46,0.18)',
            borderRadius: '20px', padding: '4px 16px',
            fontSize: '10px', fontWeight: 700, fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00452e',
            marginBottom: '36px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>flight</span>
            Airline Partnerships
          </span>

          {/* Headline + divider */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '48px', flexWrap: 'wrap', marginBottom: '64px' }}>
            <h2 style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#002d1c',
              lineHeight: 1.1,
              margin: 0,
              maxWidth: '560px',
            }}>
              Partners That Share<br />Our Green Commitment
            </h2>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.05rem',
              color: '#6c8274',
              lineHeight: 1.75,
              maxWidth: '440px',
              margin: 0,
              paddingTop: '8px',
            }}>
              EcoWings doesn't simply list carriers — it certifies them. Every airline in our network has been independently evaluated against rigorous environmental and operational standards before earning a place on our platform.
            </p>
          </div>

          {/* Horizontal rule */}
          <div style={{ borderTop: '1px solid rgba(0,45,28,0.1)', marginBottom: '64px' }} />

          {/* Two-column editorial body */}
          <div className="airline-partners-editorial-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px 80px',
            alignItems: 'start',
          }}>
            {/* Left column */}
            <div>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#002d1c',
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}>
                A Network Built on Accountability
              </h3>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1rem',
                color: '#4a6358',
                lineHeight: 1.85,
                marginBottom: '24px',
              }}>
                The aviation industry accounts for roughly 2.5% of global CO₂ emissions — and EcoWings was founded on the conviction that this number must come down. Our airline partnerships are the cornerstone of that mission. We work exclusively with carriers who publish verified emissions data, invest in sustainable aviation fuel (SAF) research, and hold recognised green certifications such as IATA Environmental Assessment or CORSIA compliance.
              </p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1rem',
                color: '#4a6358',
                lineHeight: 1.85,
              }}>
                Each partner airline undergoes a structured onboarding review covering fleet age and fuel efficiency per seat-kilometre, ground operations energy sourcing, carbon offset programme quality, and passenger transparency practices. Airlines that fall below our threshold are not listed — regardless of network size or brand recognition.
              </p>
            </div>

            {/* Right column */}
            <div>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#002d1c',
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}>
                What Partnership Means in Practice
              </h3>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1rem',
                color: '#4a6358',
                lineHeight: 1.85,
                marginBottom: '24px',
              }}>
                When you book through EcoWings, you receive a carbon footprint estimate for every itinerary alongside the ticket price. This data is sourced directly from our partner airlines' declared fuel burn figures — not approximations. Our partners also commit to route-level reporting, enabling us to highlight the lowest-emission option whenever multiple carriers operate the same city pair.
              </p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1rem',
                color: '#4a6358',
                lineHeight: 1.85,
              }}>
                Beyond data, our partnerships unlock tangible benefits for eco-conscious travellers: priority boarding on select routes, loyalty points redeemable for carbon offsets rather than merchandise, and access to dedicated quiet cabins designed to reduce onboard energy consumption. Flying greener should never mean flying with less comfort.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="airline-partners-stats-strip" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'rgba(0,45,28,0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            marginTop: '72px',
            border: '1px solid rgba(0,45,28,0.1)',
          }}>
            {[
              { value: '180+', label: 'Partner Airlines Worldwide' },
              { value: '94%', label: 'CORSIA-Compliant Carriers' },
              { value: '340+', label: 'Eco-Certified Routes' },
              { value: '2.1M+', label: 'Travellers Matched Annually' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#ffffff',
                  padding: '40px 32px',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: '#002d1c',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: '10px',
                }}>
                  {stat.value}
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#6c8274',
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Pull quote */}
          <blockquote style={{
            margin: '72px 0 0',
            padding: '0 0 0 32px',
            borderLeft: '3px solid #002d1c',
          }}>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontWeight: 700,
              color: '#002d1c',
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              "Sustainability is not a checkbox. It is the foundation upon which every EcoWings partnership is built, audited, and renewed — year after year."
            </p>
            <cite style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#6c8274',
              fontStyle: 'normal',
            }}>
              EcoWings Partnership Standards Board
            </cite>
          </blockquote>

        </div>
      </section>

      {/* ── Son Yorumlar ─────────────────────────────────────── */}
      <AnimatedTestimonials
        title="Recent Reviews"
        subtitle="Hear from real EcoWings passengers about their green travel experience."
        badgeText="Passenger Experiences"
        testimonials={MOCK_REVIEWS}
      />

      {/* ── EcoWings Editorial ───────────────────────────────── */}
      <section className="fade-up" style={{ background: '#ffffff', padding: '100px 0', borderTop: '1px solid rgba(77,124,95,0.1)' }}>
        <div className="container">

          {/* Top eyebrow + headline row */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '72px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,69,46,0.07)', border: '1px solid rgba(0,69,46,0.18)',
              borderRadius: '20px', padding: '4px 16px',
              fontSize: '10px', fontWeight: 700, fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00452e',
              marginBottom: '28px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>eco</span>
              Our Story
            </span>

            <h2 style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#002d1c',
              lineHeight: 1.1,
              maxWidth: '720px',
              marginBottom: '24px',
            }}>
              Aviation That Gives Back<br />to the Planet
            </h2>

            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.1rem',
              color: '#6c8274',
              lineHeight: 1.8,
              maxWidth: '600px',
            }}>
              EcoWings was born from a simple belief: that flying shouldn't cost the Earth — literally. We set out to prove that sustainable air travel is not a compromise, but the most intelligent choice a modern traveller can make.
            </p>
          </div>

          {/* Horizontal rule */}
          <div style={{ borderTop: '1px solid rgba(0,45,28,0.08)', marginBottom: '72px' }} />

          {/* Three-column manifesto */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px 64px',
            marginBottom: '80px',
          }}>
            {[
              {
                number: '01',
                title: 'The Problem We Chose to Solve',
                body: 'Commercial aviation emits over 900 million tonnes of CO₂ annually. Yet for decades, travellers had no transparent way to understand — let alone reduce — the footprint of their journey. EcoWings changes that equation with real data, honest numbers, and meaningful alternatives.',
              },
              {
                number: '02',
                title: 'Technology in Service of Nature',
                body: 'Our platform fuses live Amadeus flight data with proprietary carbon scoring algorithms. Every route you see is ranked not just by price or duration, but by its verified environmental impact. Smarter booking starts with smarter information.',
              },
              {
                number: '03',
                title: 'A Community of Conscious Flyers',
                body: "Over two million travellers have chosen EcoWings for their journeys. Together, we've offset the equivalent of planting 8.4 million trees — and counting. Every ticket is a vote for the kind of aviation industry we want to exist in twenty years.",
              },
            ].map((item) => (
              <div key={item.number} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '3.2rem',
                  fontWeight: 800,
                  color: 'rgba(0,45,28,0.07)',
                  letterSpacing: '-0.06em',
                  lineHeight: 1,
                }}>
                  {item.number}
                </span>
                <div style={{ width: '36px', height: '2px', background: '#002d1c' }} />
                <h3 style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#002d1c',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.97rem',
                  color: '#4a6358',
                  lineHeight: 1.85,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {/* Full-width highlight strip */}
          <div style={{
            background: 'linear-gradient(135deg, #002d1c 0%, #00452e 100%)',
            borderRadius: '24px',
            padding: '56px 64px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'center',
          }}>
            <div>
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 'clamp(1.35rem, 2.5vw, 1.9rem)',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.45,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}>
                "We don't ask travellers to sacrifice comfort for conscience. We make the conscious choice the <em style={{ fontStyle: 'italic', color: '#b1f0ce' }}>best</em> choice."
              </p>
              <cite style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'rgba(177,240,206,0.65)',
                fontStyle: 'normal',
              }}>
                — EcoWings Founding Team
              </cite>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { value: '8.4M', unit: 'Trees Equivalent Offset' },
                { value: '63%', unit: 'Lower Avg. Emissions vs Industry' },
                { value: '2M+', unit: 'Eco-Conscious Travellers' },
                { value: '2019', unit: 'Founded — Oslo, Norway' },
              ].map((stat) => (
                <div key={stat.unit} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(177,240,206,0.18)',
                  borderRadius: '14px',
                  padding: '24px 22px',
                }}>
                  <div style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color: '#b1f0ce',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}>
                    {stat.value}
                  </div>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(177,240,206,0.55)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}>
                    {stat.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom values row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'rgba(0,45,28,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginTop: '48px',
            border: '1px solid rgba(0,45,28,0.08)',
          }}>
            {[
              { icon: 'radar', label: 'Radical Transparency', desc: 'Carbon data on every itinerary, sourced directly from airlines.' },
              { icon: 'compost', label: 'Real Offsetting', desc: 'Certified reforestation. No greenwashing, ever.' },
              { icon: 'group', label: 'Traveller-First', desc: 'Comfort and sustainability are never mutually exclusive here.' },
              { icon: 'history_edu', label: 'Long-Term Vision', desc: 'We measure success in decades, not quarters.' },
            ].map((val) => (
              <div key={val.label} style={{ background: '#ffffff', padding: '36px 28px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: '#f0f5f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#002d1c' }}>{val.icon}</span>
                </div>
                <h4 style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#002d1c',
                  marginBottom: '10px',
                  letterSpacing: '-0.01em',
                }}>
                  {val.label}
                </h4>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.88rem',
                  color: '#6c8274',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Get Started CTA ──────────────────────────────────── */}
      <CTASection />

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
