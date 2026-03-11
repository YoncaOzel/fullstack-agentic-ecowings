import { useState, useEffect, useRef } from 'react';
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

/* ─────────────────────────────────────────────────────
   Popular Destinations – static showcase section
───────────────────────────────────────────────────── */
const DESTINATIONS = [
  {
    id: 1,
    from: 'Istanbul',
    to: 'Dubai',
    date: '12 Mar, 2026',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
    label: 'Trending',
  },
  {
    id: 2,
    from: 'Ankara',
    to: 'London',
    date: '18 Mar, 2026',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
    label: 'Popular',
  },
  {
    id: 3,
    from: 'Istanbul',
    to: 'Tokyo',
    date: '22 Mar, 2026',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
    label: null,
  },
  {
    id: 4,
    from: 'Izmir',
    to: 'Paris',
    date: '29 Mar, 2026',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
    label: null,
  },
  {
    id: 5,
    from: 'Istanbul',
    to: 'Singapore',
    date: '04 Apr, 2026',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=900&q=80',
    label: null,
  },
  {
    id: 6,
    from: 'Ankara',
    to: 'New York',
    date: '10 Apr, 2026',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80',
    label: null,
  },
];

function DestinationCard({ dest }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        aspectRatio: '16 / 10',
        boxShadow: hovered
          ? '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.35)'
          : '0 6px 24px rgba(0,0,0,0.45)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'transform 0.35s ease, box-shadow 0.35s ease',
      }}>
        {/* Photo */}
        <img
          src={dest.image}
          alt={`${dest.from} to ${dest.to}`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.45s ease',
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top-left label badge */}
        {dest.label && (
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            color: '#030c03',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '20px',
          }}>
            {dest.label}
          </div>
        )}

        {/* Bottom content */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          {/* Destination */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
            lineHeight: 1.2,
          }}>
            <MapPin size={13} style={{ color: '#4ade80', flexShrink: 0 }} />
            {dest.to}
          </div>

        </div>
      </div>
    </div>
  );
}

function PopularDestinations() {
  return (
    <section className="fade-up" style={{ padding: '80px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '420px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Section header */}
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
            ✦ Keşfet
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.15, margin: 0, color: '#1a4d33' }}>
                Popular Destinations
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '8px' }}>
                Dünyanın en gözde destinasyonlarına kanat açın
              </p>
            </div>
            <Link
              to="/flights"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', background: 'rgba(34,197,94,0.05)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
            >
              Tüm Destinasyonlar <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ marginTop: '20px', height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0.1) 60%, transparent 100%)' }} />
        </div>

        {/* Card grid — responsive: 3 cols on desktop, 2 on tablet, 1 on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {DESTINATIONS.map(dest => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>
      </div>
    </section>
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
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
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
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg,#060c06 0%,#0a180a 50%,#0d2010 100%)',
        padding: '100px 0 90px', minHeight: '62vh',
        display: 'flex', alignItems: 'center',
      }}>
        {/* Ambient orbs */}
        <div style={{ position:'absolute', top:'-80px', left:'10%', width:'540px', height:'540px', borderRadius:'50%', background:'radial-gradient(circle,rgba(34,197,94,0.13) 0%,transparent 65%)', animation:'pulseOrb 6s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-100px', right:'8%', width:'620px', height:'620px', borderRadius:'50%', background:'radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 65%)', animation:'pulseOrb 8s ease-in-out infinite 2s', pointerEvents:'none' }} />
        {/* Grid overlay */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(34,197,94,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.03) 1px,transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />

        <div className="container" style={{ textAlign:'center', position:'relative', zIndex:2 }}>
          {/* Floating plane */}
          <div style={{ marginBottom: '28px', display: 'inline-block', animation: 'heroFloat 5s ease-in-out infinite' }}>
            <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto' }}>
              {/* Outer glow ring */}
              <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
              {/* Circle backdrop */}
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: 'linear-gradient(145deg, #1a3a1a 0%, #0e2010 100%)',
                border: '1.5px solid rgba(34,197,94,0.35)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,197,94,0.12), inset 0 1px 0 rgba(34,197,94,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 8px rgba(34,197,94,0.5))' }}>
                  <defs>
                    <linearGradient id="planeBody" x1="4" y1="14" x2="50" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#86efac" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="planeWing" x1="0" y1="28" x2="36" y2="44" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#15803d" />
                    </linearGradient>
                    <linearGradient id="planeTail" x1="4" y1="36" x2="18" y2="50" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#166534" />
                    </linearGradient>
                    <linearGradient id="planeWindow" x1="30" y1="16" x2="38" y2="22" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#bfdbfe" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                  {/* Fuselage */}
                  <path d="M8 27 C8 22 12 17 18 16 L44 14 C47 14 50 16 50 19 C50 22 47 24 44 24 L26 25 L26 29 L44 30 C47 30 50 32 50 35 C50 38 47 40 44 40 L18 38 C12 37 8 32 8 27Z" fill="url(#planeBody)" />
                  {/* Main wing */}
                  <path d="M22 25 L4 38 L10 39 L28 29Z" fill="url(#planeWing)" opacity="0.95"/>
                  {/* Tail wing */}
                  <path d="M10 37 L4 46 L8 46 L14 39Z" fill="url(#planeTail)" opacity="0.9"/>
                  {/* Window row */}
                  <ellipse cx="34" cy="19" rx="3.5" ry="2.5" fill="url(#planeWindow)" opacity="0.9"/>
                  <ellipse cx="40" cy="18.5" rx="2.5" ry="2" fill="url(#planeWindow)" opacity="0.7"/>
                  {/* Highlight stripe */}
                  <path d="M18 17 C22 16.5 32 15.5 42 15 C44.5 14.8 46.5 15.5 46.5 16.8" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
            </div>
          </div>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'100px', padding:'5px 16px', fontSize:'0.72rem', fontWeight:700, color:'#22c55e', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'20px', animation:'fadeIn 0.8s ease both' }}>🌿 Sürdürülebilir Seyahat</div>
          <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'clamp(2.4rem,5vw,4rem)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, margin:'0 auto 20px', color:'#1a4d33', animation:'fadeUp 0.7s 0.1s cubic-bezier(0.4,0,0.2,1) both' }}>
            Yeşil Bir Yolculuk<br />Başlıyor
          </h1>
          <p style={{ color:'rgba(187,247,208,0.75)', fontSize:'clamp(1rem,2vw,1.15rem)', maxWidth:'560px', margin:'0 auto 44px', lineHeight:1.7, fontFamily:"'Inter',sans-serif", animation:'fadeUp 0.7s 0.22s cubic-bezier(0.4,0,0.2,1) both' }}>
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

          {/* Scroll indicator */}
          <div style={{ marginTop:'48px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', animation:'fadeIn 1s 0.9s both', opacity:0 }}>
            <span style={{ fontSize:'0.7rem', color:'rgba(34,197,94,0.45)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Keşfet</span>
            <ChevronDown size={20} style={{ color:'rgba(34,197,94,0.4)', animation:'heroFloat 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── Search Results / Skeleton ── */}
      {(searching || searchResults !== null) && (
        <section ref={resultsRef} style={{ background: 'var(--bg-section-alt)', padding: '52px 0' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {searchResults.map((f, i) => (
                  <AmadeusFlightCard key={f.flightNumber ? `${f.flightNumber}-${i}` : i} flight={f} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Stats strip ──────────────────────────────────────── */}
      <section style={{ padding:'52px 0', background:'var(--bg-surface,#0e1a0e)', borderTop:'1px solid rgba(34,197,94,0.08)', borderBottom:'1px solid rgba(34,197,94,0.08)' }}>
        <div className="container">
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'20px' }}>
            {[{value:'2M+',label:'Mutlu Yolcu',emoji:'👥'},{value:'300+',label:'Havalimanı',emoji:'🏢'},{value:'50+',label:'Havayolu Ortağı',emoji:'✈️'},{value:'120K t',label:'CO₂ Tasarrufu',emoji:'🌿'}].map((s) => (
              <div key={s.label} style={{ textAlign:'center', padding:'28px 16px', background:'rgba(34,197,94,0.04)', border:'1px solid rgba(34,197,94,0.1)', borderRadius:'16px', transition:'background 0.2s,border-color 0.2s,transform 0.2s', cursor:'default' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.09)';e.currentTarget.style.borderColor='rgba(34,197,94,0.28)';e.currentTarget.style.transform='translateY(-3px)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(34,197,94,0.04)';e.currentTarget.style.borderColor='rgba(34,197,94,0.1)';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{fontSize:'2rem',marginBottom:'8px'}}>{s.emoji}</div>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'clamp(1.9rem,3vw,2.8rem)',fontWeight:800,color:'var(--green-primary)',letterSpacing:'-0.04em',lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:'8px',fontFamily:"'Inter',sans-serif"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ padding:'88px 0', background:'var(--bg-base)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'400px', background:'radial-gradient(ellipse,rgba(34,197,94,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div className="container" style={{ position:'relative' }}>
          <div className="fade-up" style={{ textAlign:'center', marginBottom:'56px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.18)', borderRadius:'20px', padding:'4px 14px', fontSize:'0.72rem', fontWeight:700, color:'#22c55e', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'14px' }}>✦ Nasıl Çalışır?</div>
            <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'2.2rem', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.15, margin:'0 auto', color:'#1a4d33' }}>3 Adımda Yeşil Seyahat</h2>
            <p style={{ color:'#6b7280', fontSize:'0.95rem', marginTop:'10px' }}>Sürdürülebilir bir yolculuk planlamak bu kadar kolay</p>
          </div>
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'28px' }}>
            {[
              {step:'01',emoji:'🔍',title:'Rota Seç',desc:'Kalkış ve varış havalimanını belirle, tarih seç. 300+ havalimanına anında erişim.'},
              {step:'02',emoji:'📊',title:'Uçuşları Karşılaştır',desc:'Fiyat, süre ve karbon etkisine göre en iyi uçuşu seç. Tam şeffaflık.'},
              {step:'03',emoji:'🌱',title:'Ekolojiyle Uç',desc:'Rezervasyonunu tamamla, karbon dengeleme programlarına katıl ve gezini kaydet.'},
            ].map((item, i) => (
              <div key={item.step} style={{ background:'var(--bg-card)', border:'1px solid rgba(34,197,94,0.13)', borderRadius:'20px', padding:'36px 28px', position:'relative', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', transition:'transform 0.3s ease,box-shadow 0.3s ease,border-color 0.3s ease' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 20px 48px rgba(34,197,94,0.12),0 8px 16px rgba(0,0,0,0.08)';e.currentTarget.style.borderColor='rgba(34,197,94,0.35)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,0.06)';e.currentTarget.style.borderColor='rgba(34,197,94,0.13)';}}>
                <div style={{ position:'absolute', top:0, left:'28px', right:'28px', height:'2px', background:'linear-gradient(90deg,rgba(34,197,94,0.6),transparent)', borderRadius:'0 0 2px 2px' }} />
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', fontWeight:700, color:'rgba(34,197,94,0.4)', letterSpacing:'0.1em', marginBottom:'16px' }}>ADIM {item.step}</div>
                <div style={{ fontSize:'2.4rem', marginBottom:'16px', lineHeight:1 }}>{item.emoji}</div>
                <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'1.1rem', fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', marginBottom:'10px' }}>{item.title}</h3>
                <p style={{ fontSize:'0.875rem', color:'var(--text-muted)', lineHeight:1.7, fontFamily:"'Inter',sans-serif", margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ── */}
      <PopularDestinations />

      {/* ── Havayolu Ortaklarımız ── */}
      <section className="fade-up" style={{ padding: '72px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
              ✈ Güvenilir Ortaklar
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.15, margin: 0, color: '#1a4d33' }}>
              Havayolu Ortaklarımız
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '8px' }}>Seçkin havayolu şirketleriyle güvenli ve konforlu seyahat edin</p>
            <div style={{ marginTop: '20px', height: '1px', background: 'linear-gradient(90deg, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0.1) 60%, transparent 100%)' }} />
          </div>

          {loadingAirlines ? <LoadingSpinner /> : errorAirlines ? <ErrorMessage message={errorAirlines} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {airlines.slice(0, 8).map((a) => (
                <div key={a.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(34,197,94,0.13)',
                  borderRadius: '16px',
                  padding: '28px 20px 22px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  cursor: 'default',
                  position: 'relative',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.12), 0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.32)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)';
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
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a4d33', marginBottom: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
      <section className="fade-up" style={{ padding: '72px 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
              <Star size={10} /> Yolcu Deneyimleri
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.15, margin: 0, color: '#1a4d33' }}>
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
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(34,197,94,0.12)',
                    borderLeft: '4px solid rgba(34,197,94,0.5)',
                    borderRadius: '16px',
                    padding: '28px 24px 22px',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.1), 0 4px 12px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
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
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.7, fontStyle: 'italic', margin: 0, position: 'relative', zIndex: 1 }}>
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
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a4d33' }}>{r.userName}</div>
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

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="fade-up" style={{ padding:'96px 0', background:'var(--bg-surface)', borderTop:'1px solid rgba(34,197,94,0.1)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'500px', background:'radial-gradient(ellipse,rgba(34,197,94,0.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div className="container" style={{ textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'100px', padding:'5px 16px', fontSize:'0.72rem', fontWeight:700, color:'#22c55e', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'24px' }}>🌿 Bugün Başla</div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, margin:'0 auto 20px', color:'#1a4d33', maxWidth:'640px' }}>Sürdürülebilir Seyahate Hazır Mısın?</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'1.05rem', maxWidth:'480px', margin:'0 auto 40px', lineHeight:1.7, fontFamily:"'Inter',sans-serif" }}>Ücretsiz hesap oluştur, karbon ayak izini takip et ve daha yeşil bir dünya için uç.</p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/signup"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 36px', borderRadius:'12px', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#051005', fontWeight:700, fontSize:'0.95rem', textDecoration:'none', boxShadow:'0 4px 20px rgba(34,197,94,0.35)', transition:'all 0.2s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(34,197,94,0.45)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(34,197,94,0.35)';}}>
              🌱 Ücretsiz Kaydol <ArrowRight size={16} />
            </Link>
            <Link to="/flights"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 36px', borderRadius:'12px', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontWeight:700, fontSize:'0.95rem', textDecoration:'none', background:'rgba(34,197,94,0.05)', transition:'all 0.2s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.12)';e.currentTarget.style.borderColor='rgba(34,197,94,0.5)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(34,197,94,0.05)';e.currentTarget.style.borderColor='rgba(34,197,94,0.3)';}}>
              Uçuşları Keşfet <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
