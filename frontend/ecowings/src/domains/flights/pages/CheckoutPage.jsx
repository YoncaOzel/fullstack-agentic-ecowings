import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Clock, Leaf, CreditCard, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import flightService from '../services/flightService';
import airportService from '../../../shared/services/airportService';
import EcoComparisonBadge from '../components/EcoComparisonBadge';
import './CheckoutPage.css';

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
  cls === 'Low' ? '#16a34a' : cls === 'Medium' ? '#d97706' : '#dc2626';

/* ─── component ──────────────────────────────────── */
export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const flight = state?.flight;
  const type = state?.type; // 'amadeus' | 'db'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Airport name resolution for display only (non-blocking)
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(false);

  useEffect(() => {
    if (type !== 'amadeus') return;
    airportService.getAllAirports()
      .then(res => {
        if (Array.isArray(res.data)) setAirports(res.data);
      })
      .catch(() => {/* non-fatal */});
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
  const currency = isAmadeus ? (flight.currency || 'TRY') : '₺';
  const originalPrice = isAmadeus ? parseFloat(flight.price || 0) : parseFloat(flight.price || flight.economyPrice || 0);

  const emissionClass = flight.emissionClass
    ?? (flight.carbonEmission != null
      ? (flight.carbonEmission < 100 ? 'Low' : flight.carbonEmission < 250 ? 'Medium' : 'High')
      : null);
  const discountRate = isAmadeus
    ? (emissionClass === 'Low' ? 20 : emissionClass === 'Medium' ? 10 : null)
    : null;
  const isDiscounted = !!discountRate;
  const discountedPrice = isDiscounted ? parseFloat((originalPrice * (1 - discountRate / 100)).toFixed(2)) : null;
  const rawPrice = isDiscounted ? discountedPrice : originalPrice;

  const priceDisplay = isAmadeus
    ? `${rawPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`
    : `${rawPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
  const originalPriceDisplay = isAmadeus
    ? `${originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`
    : `${originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

  const stopCount = isAmadeus ? ((flight.segments?.length ?? 1) - 1) : 0;
  const stopLabel = stopCount === 0 ? 'Direkt' : `${stopCount} Aktarma`;

  /* ── Pay handler ── */
  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      let paymentUrl;

      if (isAmadeus) {
        // book-and-pay: tek istekte uçuş + bilet oluşturur, ödeme linki döner
        const res = await flightService.bookAndPay({
          flightNumber: flight.flightNumber,
          departureAirportCode: flight.departure,
          destinationAirportCode: flight.arrival,
          departureTime: flight.departureTime,
          estimatedArrivalTime: flight.arrivalTime,
          price: rawPrice,
          airlineCode: flight.carrier || '',
          userEmail: user?.email || '',
          isDiscounted,
          discountRate,
          discountedPrice,
        });

        paymentUrl = res.data?.paymentUrl;
        const ticketId = res.data?.ticketId;
        if (ticketId) localStorage.setItem('pendingTicketId', String(ticketId));
      } else {
        // DB uçuşu — bilet oluştur, sonra ödeme başlat
        const ticketRes = await import('../../tickets/services/ticketService').then(m =>
          m.default.buyTicket({ flightId: flight.id, travelClass: 'Economy' })
        );
        const ticketId = ticketRes.data?.id;

        if (!ticketId) {
          setError('Bilet oluşturulamadı. Lütfen tekrar deneyin.');
          setLoading(false);
          return;
        }

        localStorage.setItem('pendingTicketId', String(ticketId));

        const payRes = await import('../../../shared/services/paymentService').then(m =>
          m.default.initiatePayment(ticketId, rawPrice)
        );
        paymentUrl = payRes.data?.paymentUrl;
      }

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

  /* ── Reveal on scroll ── */
  const revealRef = useRef([]);
  useEffect(() => {
    const els = revealRef.current.filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const r = (i) => (el) => { revealRef.current[i] = el; };

  /* ── Render ── */
  return (
    <main className="co-page">

      {/* Hero */}
      <section className="co-hero">
        <div className="co-hero-grid" />
        <div className="co-hero-glow" />
        <div className="co-hero-inner">
          <button className="co-back-btn reveal" ref={r(0)} onClick={() => navigate(-1)}>
            <ArrowLeft size={13} /> Geri Dön
          </button>

          <div className="co-eyebrow reveal d1" ref={r(1)}>
            <span className="co-dot" />
            Ödeme Özeti
          </div>

          <h1 className="reveal d2" ref={r(2)}>
            Biletinizi <em>Satın Alın</em>
          </h1>
          <p className="co-hero-sub reveal d3" ref={r(3)}>
            Uçuş bilgilerini kontrol edin ve ödemeye geçin.
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="co-body">
        <div className="co-container">

          {airportsLoading ? (
            <div className="co-loading">
              <div className="co-loading-ring" />
            </div>
          ) : (
            <div className="co-grid">

              {/* ── Left: Flight details ── */}
              <div className="co-card reveal" ref={r(4)}>
                <div className="co-card-header">
                  <div className="co-card-icon">
                    <Plane size={16} />
                  </div>
                  <div>
                    <div className="co-card-title">Uçuş Bilgileri</div>
                    <div className="co-card-subtitle">Aldığınız biletin detayları</div>
                  </div>
                </div>

                <div className="co-card-body">
                  {/* Route visual */}
                  <div className="co-route">
                    {/* Departure */}
                    <div className="co-route-endpoint">
                      <div className="co-route-code">{depCode || '—'}</div>
                      {depCity && <div className="co-route-city">{depCity}</div>}
                      <div className="co-route-time">{depTime}</div>
                      {depDateStr && <div className="co-route-date">{depDateStr}</div>}
                    </div>

                    {/* Connection line */}
                    <div className="co-route-middle">
                      {duration && (
                        <div className="co-route-duration">
                          <Clock size={11} />{duration}
                        </div>
                      )}
                      <div className="co-route-line">
                        <div className="co-route-dot" />
                        <div className="co-route-track" />
                        <Plane size={15} className="co-route-plane-icon" />
                        <div className="co-route-track" />
                        <div className="co-route-dot" />
                      </div>
                      <span className={`co-stop-badge ${stopCount === 0 ? 'direct' : 'stops'}`}>
                        <Plane size={9} />{stopLabel}
                      </span>
                    </div>

                    {/* Arrival */}
                    <div className="co-route-endpoint">
                      <div className="co-route-code">{arrCode || '—'}</div>
                      {arrCity && <div className="co-route-city">{arrCity}</div>}
                      <div className="co-route-time">{arrTime}</div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="co-details-grid">
                    {[
                      { label: 'Havayolu', value: carrier },
                      { label: 'Uçuş No', value: flightNumber, mono: true },
                      ...(isAmadeus && flight.emissionClass ? [{
                        label: 'Karbon Emisyonu',
                        value: `${flight.emissionClass} · ${flight.carbonEmission?.toFixed(1)} kg CO₂`,
                        color: emissionColor(flight.emissionClass),
                      }] : []),
                    ].map(({ label, value, mono, color }) => (
                      <div key={label} className="co-detail-item">
                        <div className="co-detail-label">{label}</div>
                        <div
                          className={`co-detail-value${mono ? ' mono' : ''}`}
                          style={color ? { color } : undefined}
                        >
                          {value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Segments */}
                  {stopCount > 0 && flight.segments && (
                    <div className="co-segments">
                      <div className="co-segments-title">Aktarma Detayları</div>
                      {flight.segments.map((seg, i) => (
                        <div key={i} className="co-segment-row">
                          <span className="co-segment-route">{seg.departure} → {seg.arrival}</span>
                          <span>·</span>
                          <span>{seg.carrier} {seg.flightNumber}</span>
                          <span>·</span>
                          <span>{seg.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: Price summary ── */}
              <div className="co-sidebar">
                <div className="co-card reveal d1" ref={r(5)}>
                  <div className="co-card-header">
                    <div className="co-card-icon">
                      <CreditCard size={15} />
                    </div>
                    <div className="co-card-title">Fiyat Özeti</div>
                  </div>

                  <div className="co-card-body">
                    <div className="co-price-row">
                      <span className="co-price-label">Bilet fiyatı</span>
                      {isDiscounted
                        ? <span className="co-price-original">{originalPriceDisplay}</span>
                        : <span className="co-price-value">{priceDisplay}</span>
                      }
                    </div>

                    {isDiscounted && (
                      <div className="co-price-row">
                        <span className="co-discount-label">
                          <span className="co-discount-pill">%{discountRate}</span>
                          Eko indirim
                        </span>
                        <span className="co-discount-value">
                          -{(originalPrice - rawPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </div>
                    )}

                    <div className="co-price-divider" />

                    <div className="co-total-row">
                      <span className="co-total-label">Toplam</span>
                      <span className="co-total-value">{priceDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="co-error reveal" ref={r(6)}>
                    <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                    <span>{error}</span>
                  </div>
                )}

                {/* CTA */}
                <button
                  className="co-pay-btn reveal d2"
                  ref={r(7)}
                  onClick={handlePay}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="co-spinner" />
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
                <div className="co-trust reveal d3" ref={r(8)}>
                  <Shield size={12} />
                  Ödemeniz Stripe ile güvenli şekilde işlenir
                </div>

                {/* Leaf note */}
                {isAmadeus && flight.emissionClass === 'Low' && (
                  <div className="co-eco-note reveal d4" ref={r(9)}>
                    <Leaf size={15} />
                    <span>Bu uçuş düşük karbon emisyonluğu ile çevre dostudur.</span>
                  </div>
                )}

                {/* Eco alternative note */}
                <EcoComparisonBadge ecoComparison={flight.ecoComparison} variant="checkout" />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
