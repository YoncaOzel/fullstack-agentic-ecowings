import { useState, useEffect } from 'react';
import { Plane, Search, SlidersHorizontal, ChevronDown, Wind } from 'lucide-react';
import flightService from '../services/flightService';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

function FlightSkeletonCard() {
  return (
    <div style={{
      background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)',
      border: '1px solid rgba(34,197,94,0.1)',
      borderRadius: '18px', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(34,197,94,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ width: '64px', height: '10px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '48px', height: '14px', borderRadius: '4px' }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '56px', height: '22px', borderRadius: '20px' }} />
      </div>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '80px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '68px', height: '32px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '42px', height: '14px', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <div className="skeleton" style={{ width: '44px', height: '9px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100%', height: '1px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '80px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '68px', height: '32px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '42px', height: '14px', borderRadius: '4px' }} />
        </div>
      </div>
      <div style={{ padding: '12px 20px 18px', borderTop: '1px solid rgba(34,197,94,0.08)', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="skeleton" style={{ width: '32px', height: '9px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '90px', height: '24px', borderRadius: '6px' }} />
          </div>
          <div className="skeleton" style={{ width: '88px', height: '38px', borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  );
}

export default function FlightsPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  useEffect(() => {
    flightService.getFlights()
      .then((res) => {
        if (Array.isArray(res.data)) setFlights(res.data);
        else setError(res.data?.message || 'Uçuşlar yüklenemedi.');
      })
      .catch(() => setError('Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, []);

  const durationMins = (f) => {
    if (!f.departureTime || !(f.estimatedArrivalTime || f.arrivalTime)) return 0;
    return Math.round((new Date(f.estimatedArrivalTime || f.arrivalTime) - new Date(f.departureTime)) / 60000);
  };

  const getPrice = (f) => Number(f.price ?? f.economyPrice ?? 0);

  const filtered = flights
    .filter((f) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        f.flightNumber?.toLowerCase().includes(q) ||
        f.departure?.name?.toLowerCase().includes(q) ||
        f.departure?.code?.toLowerCase().includes(q) ||
        f.departure?.city?.toLowerCase().includes(q) ||
        f.destination?.name?.toLowerCase().includes(q) ||
        f.destination?.code?.toLowerCase().includes(q) ||
        f.destination?.city?.toLowerCase().includes(q) ||
        f.airline?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return getPrice(a) - getPrice(b);
      if (sortBy === 'price-desc') return getPrice(b) - getPrice(a);
      if (sortBy === 'duration')   return durationMins(a) - durationMins(b);
      return 0;
    });

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* ══ Hero ══ */}
      <section style={{
        background: 'linear-gradient(135deg, #080e08 0%, #0d1f0d 40%, #0a1a12 100%)',
        padding: '72px 0 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow decorations */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '5%', width: '400px', height: '300px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Plane size={11} /> Tüm Rotalar
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.15, margin: '0 0 16px', background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tüm Uçuşlar
          </h1>
          <p style={{ color: 'rgba(187,247,208,0.75)', fontSize: '1.05rem', marginBottom: '40px', maxWidth: '500px' }}>
            {loading ? 'Uçuşlar yükleniyor…' : `${flights.length} uçuş listeleniyor — en uygun rota sizi bekliyor`}
          </p>

          {/* Stats chips */}
          {!loading && !error && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { icon: '✈️', label: `${flights.length} Uçuş` },
                { icon: '🏷️', label: 'Güncel Fiyatlar' },
                { icon: '🌿', label: 'Karbon Takibi' },
              ].map((chip) => (
                <div key={chip.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '30px', padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#bbf7d0' }}>
                  <span>{chip.icon}</span>{chip.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ Filter Bar ══ */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid rgba(34,197,94,0.1)', padding: '24px 0', position: 'sticky', top: '64px', zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '380px' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: searchFocus ? '#22c55e' : 'rgba(107,114,128,0.7)', pointerEvents: 'none', transition: 'color 0.2s' }} />
              <input
                placeholder="Uçuş no, şehir veya havalimanı…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${searchFocus ? '#22c55e' : 'rgba(34,197,94,0.18)'}`,
                  borderRadius: '10px', padding: '11px 14px 11px 42px', color: '#f0fdf4', fontSize: '14px',
                  fontFamily: 'Inter,sans-serif', outline: 'none', transition: 'border-color 0.2s,box-shadow 0.2s',
                  boxShadow: searchFocus ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                }}
              />
            </div>

            {/* Sort */}
            <div style={{ position: 'relative', flex: '0 0 220px' }}>
              <SlidersHorizontal size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(34,197,94,0.6)', pointerEvents: 'none' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%', appearance: 'none', WebkitAppearance: 'none',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,197,94,0.18)',
                  borderRadius: '10px', padding: '11px 40px 11px 40px', color: '#f0fdf4',
                  fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', cursor: 'pointer',
                }}
                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(34,197,94,0.18)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="default" style={{ background: '#0a1a0a' }}>Varsayılan Sıralama</option>
                <option value="price-asc" style={{ background: '#0a1a0a' }}>Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc" style={{ background: '#0a1a0a' }}>Fiyat: Yüksekten Düşüğe</option>
                <option value="duration" style={{ background: '#0a1a0a' }}>Süre: En Kısa</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(34,197,94,0.6)', pointerEvents: 'none' }} />
            </div>

            {/* Result count badge */}
            {!loading && !error && (
              <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#4ade80', whiteSpace: 'nowrap' }}>
                <Wind size={12} />
                {filtered.length} Sonuç
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Content ══ */}
      <div style={{ padding: '52px 0 80px', background: 'var(--bg-base)' }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Array.from({ length: 6 }).map((_, i) => <FlightSkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✈️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px' }}>Sonuç Bulunamadı</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Farklı bir arama terimi veya sıralama deneyin.</p>
            </div>
          ) : (
            <>
              {/* Section header */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  ✦ Müsait Rotalar
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0, background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {search ? `"${search}" için ${filtered.length} Uçuş` : 'Tüm Uçuşlar'}
                </h2>
                <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg,rgba(34,197,94,0.4) 0%,rgba(34,197,94,0.1) 60%,transparent 100%)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filtered.map((f, idx) => (
                  <div key={f.id} style={{ position: 'relative' }}>
                    {idx < 3 && (
                      <div style={{ position: 'absolute', top: '-1px', left: '18px', zIndex: 2, background: 'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius: '0 0 8px 8px', padding: '2px 10px', fontSize: '0.62rem', fontWeight: 800, color: '#080e08', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                        Öne Çıkan
                      </div>
                    )}
                    <div style={idx < 3 ? { boxShadow: '0 0 0 1px rgba(34,197,94,0.3)', borderRadius: '14px' } : {}}>
                      <FlightCard flight={f} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
