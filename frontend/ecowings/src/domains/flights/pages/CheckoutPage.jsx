import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Clock, Leaf, CreditCard, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import flightService from '../services/flightService';
import paymentService from '../../../shared/services/paymentService';
import airportService from '../../../shared/services/airportService';

/* ─── helpers ─────────────────────────────────────── */
function fmt(d) {
  if (!d) return '--:--';
  return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function calcDuration(dep, arr) {
  if (!dep || !arr) return null;
  const mins = Math.round((new Date(arr) - new Date(dep)) / 60000);
  if (isNaN(mins) || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}s ${m > 0 ? m + 'd' : ''}`.trim() : `${m}d`;
}

const emissionColor = (cls) =>
  cls === 'Low' ? '#4ade80' : cls === 'Medium' ? '#facc15' : '#f87171';

/* ─── component ──────────────────────────────────── */
export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const flight = state?.flight;
  const type = state?.type; // 'amadeus' | 'db'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Airport resolution for Amadeus flights
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(type === 'amadeus');

  useEffect(() => {
    if (type !== 'amadeus') return;
    airportService.getAllAirports()
      .then(res => {
        if (Array.isArray(res.data)) setAirports(res.data);
      })
      .catch(() => {/* non-fatal */})
      .finally(() => setAirportsLoading(false));
  }, [type]);

  // Redirect if arrived without state
  useEffect(() => {
    if (!flight) navigate('/', { replace: true });
  }, [flight, navigate]);

  if (!flight) return null;

  /* ── Derived display values ── */
  const isAmadeus = type === 'amadeus';

  const depCode = isAmadeus ? flight.departure : (flight.departure?.code || flight.departureAirportId);
  const arrCode = isAmadeus ? flight.arrival : (flight.destination?.code || flight.destinationAirportId);
  const depCity = isAmadeus
    ? (airports.find(a => a.code === flight.departure)?.city || flight.departure)
    : (flight.departure?.city || '');
  const arrCity = isAmadeus
    ? (airports.find(a => a.code === flight.arrival)?.city || flight.arrival)
    : (flight.destination?.city || '');

  const depTime = isAmadeus ? fmt(flight.departureTime) : fmt(flight.departureTime);
  const arrTime = isAmadeus ? fmt(flight.arrivalTime) : fmt(flight.estimatedArrivalTime || flight.arrivalTime);
  const depDateStr = fmtDate(flight.departureTime);
  const duration = isAmadeus
    ? flight.duration
    : calcDuration(flight.departureTime, flight.estimatedArrivalTime || flight.arrivalTime);
  const carrier = isAmadeus ? flight.carrier : (flight.airline?.name || '—');
  const flightNumber = flight.flightNumber || '—';
  const rawPrice = isAmadeus ? parseFloat(flight.price || 0) : parseFloat(flight.price || flight.economyPrice || 0);
  const currency = isAmadeus ? (flight.currency || 'TRY') : '₺';
  const priceDisplay = isAmadeus
    ? `${rawPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`
    : `${rawPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

  const stopCount = isAmadeus ? ((flight.segments?.length ?? 1) - 1) : 0;
  const stopLabel = stopCount === 0 ? 'Direkt' : `${stopCount} Aktarma`;

  /* ── Pay handler ── */
  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      let ticketId;

      if (isAmadeus) {
        // Resolve airport IDs from our DB
        const depAirport = airports.find(a => a.code === flight.departure);
        const arrAirport = airports.find(a => a.code === flight.arrival);

        if (!depAirport || !arrAirport) {
          setError('Havalimanı bilgileri çözümlenemedi. Lütfen daha sonra tekrar deneyin.');
          setLoading(false);
          return;
        }

        const bookRes = await flightService.bookAmadeusFlight({
          flightNumber: flight.flightNumber,
          departureAirportId: depAirport.id,
          destinationAirportId: arrAirport.id,
          departureTime: flight.departureTime,
          estimatedArrivalTime: flight.arrivalTime,
          price: rawPrice,
          airlineId: 0, // Known gap: Airline entity has no IATA code field
          userId: user?.id || 0,
        });

        ticketId = bookRes.data?.ticketId;
      } else {
        // DB flight — create ticket
        const ticketRes = await import('../../tickets/services/ticketService').then(m =>
          m.default.buyTicket({ flightId: flight.id, travelClass: 'Economy' })
        );
        ticketId = ticketRes.data?.id;
      }

      if (!ticketId) {
        setError('Bilet oluşturulamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      const payRes = await paymentService.initiatePayment(ticketId, rawPrice);
      const paymentUrl = payRes.data?.paymentUrl;

      if (!paymentUrl) {
        setError('Ödeme sayfası açılamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      window.location.href = paymentUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  /* ── Render ── */
  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)',
        padding: '52px 0 44px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '7px 16px', fontSize: '0.8rem', color: '#9ca3af', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f0fdf4'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <ArrowLeft size={13} /> Geri Dön
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            <CreditCard size={10} /> Ödeme Özeti
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: '0 0 8px', color: '#f0fdf4', letterSpacing: '-0.02em' }}>
            Biletinizi Satın Alın
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
            Uçuş bilgilerini kontrol edin ve ödemeye geçin.
          </p>
        </div>
      </section>

      {/* Body */}
      <div style={{ padding: '48px 0 80px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>

          {airportsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(34,197,94,0.2)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '28px', alignItems: 'start' }}>

              {/* ── Left: Flight details ── */}
              <div style={{ background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}>

                {/* Card header */}
                <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plane size={15} style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f0fdf4', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Uçuş Bilgileri</div>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>Aldığınız biletin detayları</div>
                  </div>
                </div>

                <div style={{ padding: '28px' }}>

                  {/* Route visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                    {/* Departure */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#22c55e', fontFamily: "'DM Mono',monospace", letterSpacing: '0.04em', lineHeight: 1 }}>
                        {depCode || '—'}
                      </div>
                      {depCity && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '4px', fontWeight: 500 }}>{depCity}</div>}
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f0fdf4', marginTop: '6px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{depTime}</div>
                      {depDateStr && <div style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '3px' }}>{depDateStr}</div>}
                    </div>

                    {/* Line */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      {duration && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#6b7280' }}>
                          <Clock size={11} />{duration}
                        </div>
                      )}
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #22c55e', background: 'rgba(34,197,94,0.15)', flexShrink: 0, boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
                        <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg,rgba(34,197,94,0.3),rgba(34,197,94,0.7),rgba(34,197,94,0.3))' }} />
                        <Plane size={16} style={{ color: '#22c55e', margin: '0 6px', flexShrink: 0 }} />
                        <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg,rgba(34,197,94,0.3),rgba(34,197,94,0.7),rgba(34,197,94,0.3))' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #22c55e', background: 'rgba(34,197,94,0.15)', flexShrink: 0, boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: stopCount === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(250,204,21,0.08)', color: stopCount === 0 ? '#4ade80' : '#facc15', border: `1px solid ${stopCount === 0 ? 'rgba(74,222,128,0.2)' : 'rgba(250,204,21,0.2)'}`, borderRadius: '20px', padding: '3px 10px', fontSize: '0.67rem', fontWeight: 700 }}>
                        <Plane size={9} />{stopLabel}
                      </div>
                    </div>

                    {/* Arrival */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#22c55e', fontFamily: "'DM Mono',monospace", letterSpacing: '0.04em', lineHeight: 1 }}>
                        {arrCode || '—'}
                      </div>
                      {arrCity && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '4px', fontWeight: 500 }}>{arrCity}</div>}
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f0fdf4', marginTop: '6px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{arrTime}</div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Havayolu', value: carrier },
                      { label: 'Uçuş No', value: flightNumber, mono: true },
                      ...(isAmadeus && flight.emissionClass ? [{ label: 'Karbon Emisyonu', value: `${flight.emissionClass} · ${flight.carbonEmission?.toFixed(1)} kg CO₂`, color: emissionColor(flight.emissionClass) }] : []),
                    ].map(({ label, value, mono, color }) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(34,197,94,0.08)', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.67rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '5px' }}>{label}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: color || '#f0fdf4', fontFamily: mono ? "'DM Mono',monospace" : 'inherit' }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Segments */}
                  {stopCount > 0 && flight.segments && (
                    <div style={{ marginTop: '16px', background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.12)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.67rem', color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '10px' }}>Aktarma Detayları</div>
                      {flight.segments.map((seg, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.78rem', color: '#9ca3af', marginBottom: i < flight.segments.length - 1 ? '6px' : 0 }}>
                          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: '#fde68a' }}>{seg.departure} → {seg.arrival}</span>
                          <span style={{ color: '#374151' }}>·</span>
                          <span>{seg.carrier} {seg.flightNumber}</span>
                          <span style={{ color: '#374151' }}>·</span>
                          <span>{seg.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: Price summary ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}>

                  {/* Card header */}
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={14} style={{ color: '#22c55e' }} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f0fdf4', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Fiyat Özeti</div>
                  </div>

                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Bilet fiyatı</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0fdf4' }}>{priceDisplay}</span>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(34,197,94,0.1)', margin: '14px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0fdf4' }}>Toplam</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#22c55e', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{priceDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 16px' }}>
                    <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '0.83rem', color: '#f87171', lineHeight: 1.5 }}>{error}</span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handlePay}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    background: loading
                      ? 'rgba(34,197,94,0.25)'
                      : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                    color: loading ? '#6b7280' : '#051005',
                    fontWeight: 800, fontSize: '1rem',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    letterSpacing: '0.04em',
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(34,197,94,0.35)',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#6b7280', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <CreditCard size={17} />
                      Ödemeye Geç
                    </>
                  )}
                </button>

                {/* Trust note */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', justifyContent: 'center', fontSize: '0.75rem', color: '#4b5563' }}>
                  <Shield size={12} style={{ color: '#22c55e' }} />
                  Ödemeniz Stripe ile güvenli şekilde işlenir
                </div>

                {/* Leaf note */}
                {isAmadeus && flight.emissionClass === 'Low' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', padding: '12px 16px' }}>
                    <Leaf size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#4ade80', lineHeight: 1.5 }}>Bu uçuş düşük karbon emisyonluğu ile çevre dostudur.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
