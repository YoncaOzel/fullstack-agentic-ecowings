import { useState } from 'react';
import { Radio, Search, Radar } from 'lucide-react';
import flightService from '../services/flightService';
import FlightDetail from '../components/FlightDetail';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function FlightTrackerPage() {
  const [flightNumber, setFlightNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!flightNumber.trim()) { setError('Uçuş numarası girin.'); return; }
    setError('');
    setResult(null);
    setNotFound(false);
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await flightService.getFlights();
      if (Array.isArray(res.data)) {
        const found = res.data.find(
          (f) => f.flightNumber?.toLowerCase() === flightNumber.trim().toLowerCase()
        );
        if (found) setResult(found);
        else setNotFound(true);
      } else {
        setError(res.data?.message || 'Uçuş bilgisi alınamadı.');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* ══ Hero ══ */}
      <section style={{
        background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)',
        padding: '72px 0 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.16) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '8%', width: '350px', height: '280px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Radio size={11} /> Anlık Takip
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.15, margin: '0 0 16px', background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Uçuş Takip
          </h1>
          <p style={{ color: 'rgba(187,247,208,0.75)', fontSize: '1.05rem', marginBottom: '0', maxWidth: '480px' }}>
            Uçuş numarasını girin, anlık konum ve durum bilgisine ulaşın
          </p>
        </div>
      </section>

      {/* ══ Tracker Panel ══ */}
      <div style={{ background: 'var(--bg-base)', padding: '60px 0 80px' }}>
        <div className="container">
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>

            {/* Search card */}
            <div style={{
              background: 'linear-gradient(160deg,rgba(11,21,11,0.92) 0%,rgba(8,14,8,0.95) 100%)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '20px',
              padding: '32px 32px 28px',
              marginBottom: '28px',
              boxShadow: '0 20px 56px rgba(0,0,0,0.5),inset 0 1px 0 rgba(34,197,94,0.08)',
              backdropFilter: 'blur(24px)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radar size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0fdf4', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Uçuş Numarası ile Sorgula</h3>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>Örn: TK123, PC456, TF789</p>
                </div>
              </div>

              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: inputFocus ? '#22c55e' : 'rgba(107,114,128,0.7)', pointerEvents: 'none', transition: 'color 0.2s' }} />
                  <input
                    placeholder="Uçuş numarasını girin…"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    onFocus={() => setInputFocus(true)}
                    onBlur={() => setInputFocus(false)}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${inputFocus ? '#22c55e' : 'rgba(34,197,94,0.2)'}`,
                      borderRadius: '10px', padding: '13px 14px 13px 42px', color: '#f0fdf4', fontSize: '14px',
                      fontFamily: "'DM Mono',monospace", letterSpacing: '0.08em', outline: 'none',
                      transition: 'border-color 0.2s,box-shadow 0.2s',
                      boxShadow: inputFocus ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '0 24px', borderRadius: '10px', border: 'none',
                    background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                    color: '#080e08', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(34,197,94,0.3)',
                    whiteSpace: 'nowrap', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,197,94,0.4)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(34,197,94,0.3)'; }}
                >
                  {loading ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', border: '2px solid rgba(8,14,8,0.4)', borderTopColor: '#080e08', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Aranıyor
                    </span>
                  ) : (
                    <><Search size={14} />Ara</>
                  )}
                </button>
              </form>

              {error && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>⚠ {error}</span>
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <LoadingSpinner />
                <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '0.9rem' }}>Uçuş aranıyor…</p>
              </div>
            )}

            {/* Not found */}
            {!loading && notFound && (
              <div style={{
                background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)',
                border: '1px solid rgba(34,197,94,0.1)',
                borderRadius: '20px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Uçuş Bulunamadı</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  <span style={{ color: '#bbf7d0', fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>"{flightNumber}"</span> numaralı uçuş sistemde kayıtlı değil.
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '8px' }}>Uçuş numaranızı kontrol edip tekrar deneyin.</p>
              </div>
            )}

            {/* Result */}
            {!loading && result && (
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(34,197,94,0.1),0 4px 20px rgba(0,0,0,0.4)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                {/* Result header */}
                <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12) 0%,rgba(34,197,94,0.05) 100%)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(34,197,94,0.12)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)', animation: 'pulse 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Uçuş Bulundu</span>
                </div>
                <FlightDetail flight={result} />
              </div>
            )}

            {/* Idle state hint */}
            {!hasSearched && !loading && (
              <div style={{
                background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)',
                border: '1px solid rgba(34,197,94,0.08)',
                borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📡</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px' }}>Uçuşunuzu Takip Edin</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Uçuş numaranızı girerek kalkış, varış ve durum bilgisine anında ulaşın.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </main>
  );
}
