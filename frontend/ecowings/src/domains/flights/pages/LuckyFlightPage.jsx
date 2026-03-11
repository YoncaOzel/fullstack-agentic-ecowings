import { useState } from 'react';
import { Shuffle, Search, Leaf, Plane, MapPin, Clock, Tag, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import flightService from '../services/flightService';
import FlightDetail from '../components/FlightDetail';

export default function LuckyFlightPage() {
  const { user } = useAuth();
  const userId = user?.id ?? user?.userId ?? user?.nameid ?? null;

  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flight, setFlight] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!origin.trim()) { setError('Kalkış havalimanı kodu girin.'); return; }
    setError('');
    setFlight(null);
    setSearched(true);
    setLoading(true);
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

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '500px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.13) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '0', width: '400px', height: '400px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '0', width: '350px', height: '350px', background: 'radial-gradient(ellipse,rgba(74,222,128,0.05) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* ══ Hero ══ */}
      <section style={{ background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)', padding: '72px 0 64px', position: 'relative' }}>
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>

          {/* Floating icon */}
          <div style={{ fontSize: '4.5rem', marginBottom: '20px', display: 'inline-block', animation: 'floatIcon 3.5s ease-in-out infinite' }}>
            🍀
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Shuffle size={11} /> Şanslı Uçuş
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: '0 0 14px', lineHeight: 1.15, color: '#1a4d33' }}>
            Şansını Dene, Kanatlan!
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Kalkış noktanı yaz, gerisini bize bırak — sana özel bir uçuş keşfedelim.
          </p>
        </div>
      </section>

      {/* ══ Search Panel ══ */}
      <section style={{ padding: '48px 0', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div style={{ background: 'var(--bg-card)', backdropFilter: 'none', WebkitBackdropFilter: 'none', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '36px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={17} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a4d33', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Kalkış Noktanı Gir</h2>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>3 harfli IATA havalimanı kodu</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="örn. IST"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
                  onKeyDown={handleKeyDown}
                  maxLength={3}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '12px', padding: '14px 16px', color: 'var(--text-primary)',
                    fontSize: '1.15rem', fontFamily: "'DM Mono',monospace", letterSpacing: '4px',
                    outline: 'none', textTransform: 'uppercase', textAlign: 'center',
                    transition: 'border-color 0.2s,box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(34,197,94,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  padding: '14px 22px', borderRadius: '12px', border: 'none',
                  background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                  color: '#080e08', fontWeight: 800, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(34,197,94,0.3)',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(34,197,94,0.45)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(34,197,94,0.3)'; }}
              >
                {loading
                  ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(8,14,8,0.3)', borderTopColor: '#080e08', borderRadius: '50%', display: 'inline-block', animation: 'spinAnim 0.7s linear infinite' }} /> Arıyor…</>
                  : <><Shuffle size={14} /> Şansımı Dene</>
                }
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>⚠ {error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ Result ══ */}
      {searched && !loading && (
        <section style={{ padding: '0 0 80px', position: 'relative' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            {flight ? (
              <div style={{ background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>

                {/* Card header */}
                <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12) 0%,rgba(22,163,74,0.06) 100%)', padding: '20px 24px', borderBottom: '1px solid rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plane size={16} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Şanslı Uçuşunuz</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f0fdf4', fontFamily: "'DM Mono',monospace", letterSpacing: '2px' }}>
                        {flight.flightNumber}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.7)', animation: 'pulseGlow 1.8s ease-in-out infinite' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>Aktif</span>
                  </div>
                </div>

                {/* Route display */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(34,197,94,0.07)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4ade80', fontFamily: "'DM Mono',monospace", letterSpacing: '2px' }}>{flight.originAirport || origin.toUpperCase()}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>{flight.originCity || 'Kalkış'}</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(34,197,94,0.5),rgba(34,197,94,0.1))' }} />
                    <Plane size={16} style={{ color: '#22c55e', transform: 'rotate(0deg)' }} />
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(34,197,94,0.1),rgba(34,197,94,0.5))' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4ade80', fontFamily: "'DM Mono',monospace", letterSpacing: '2px' }}>{flight.destinationAirport || '???'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>{flight.destinationCity || 'Varış'}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(34,197,94,0.07)' }}>
                  <FlightDetail flight={flight} />
                </div>

                {/* Footer chips */}
                <div style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {flight.price != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }}>
                      <Tag size={11} /> {flight.price.toLocaleString('tr-TR')} ₺
                    </div>
                  )}
                  {flight.duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', color: '#9ca3af' }}>
                      <Clock size={11} /> {flight.duration}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '5px 12px', fontSize: '0.78rem', color: '#4ade80' }}>
                    <Leaf size={10} /> Düşük Karbon
                  </div>
                  <button
                    onClick={handleSearch}
                    style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)', color: '#22c55e', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
                  >
                    <RefreshCw size={11} /> Yeniden Dene
                  </button>
                </div>
              </div>
            ) : !error ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '20px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a4d33', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Uçuş Bulunamadı</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }}>{origin.toUpperCase()} noktasından uygun uçuş bulunamadı. Başka bir kalkış kodu deneyin.</p>
                <button onClick={() => { setSearched(false); setOrigin(''); }} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#080e08', fontWeight: 700, cursor: 'pointer' }}>
                  Tekrar Ara
                </button>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Idle hint */}
      {!searched && (
        <section style={{ padding: '0 0 80px', position: 'relative' }}>
          <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(34,197,94,0.03)', border: '1px dashed rgba(34,197,94,0.15)', borderRadius: '16px', padding: '32px 24px' }}>
              <Search size={28} style={{ color: 'rgba(34,197,94,0.35)', marginBottom: '12px' }} />
              <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Kalkış havalimanı kodunu girerek sana özel bir uçuş macerası keşfet.
              </p>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes floatIcon { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes spinAnim { to { transform:rotate(360deg); } }
        @keyframes pulseGlow { 0%,100% { opacity:1; box-shadow:0 0 8px rgba(34,197,94,0.7); } 50% { opacity:0.5; box-shadow:0 0 4px rgba(34,197,94,0.3); } }
      `}</style>
    </main>
  );
}
