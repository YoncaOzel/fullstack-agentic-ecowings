import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Ticket, Home, Loader2 } from 'lucide-react';
import paymentService from '../../../shared/services/paymentService';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 30000;

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  const [status, setStatus] = useState('polling'); // 'polling' | 'confirmed' | 'timeout'
  const [pnrCode, setPnrCode] = useState(null);
  const [countdown, setCountdown] = useState(8);

  const ticketIdRef = useRef(localStorage.getItem('pendingTicketId'));

  /* ── Polling: webhook'un IsPaid = true yapmasını bekle ── */
  useEffect(() => {
    const ticketId = ticketIdRef.current;

    if (!ticketId) {
      // ticketId yoksa doğrudan confirmed göster (eski biletler için)
      setStatus('confirmed');
      return;
    }

    let elapsed = 0;
    const interval = setInterval(async () => {
      elapsed += POLL_INTERVAL_MS;
      try {
        const res = await paymentService.checkTicket(ticketId);
        if (res.data?.isPaid) {
          clearInterval(interval);
          localStorage.removeItem('pendingTicketId');
          setPnrCode(res.data.pnrCode || null);
          setStatus('confirmed');
        }
      } catch {
        // non-fatal, bir sonraki poll'da tekrar dene
      }

      if (elapsed >= POLL_MAX_MS) {
        clearInterval(interval);
        localStorage.removeItem('pendingTicketId');
        setStatus('timeout');
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  /* ── Geri sayım: confirmed veya timeout durumunda başlat ── */
  useEffect(() => {
    if (status === 'polling') return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/profile?tab=tickets', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, navigate]);

  /* ── Render ── */
  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg,#f6faf7 0%,#eaf3ed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: status === 'polling' ? 'rgba(22,74,56,0.06)' : 'rgba(22,74,56,0.1)',
            border: `2px solid ${status === 'polling' ? 'rgba(22,74,56,0.14)' : 'rgba(22,74,56,0.22)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: status !== 'polling' ? 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' : 'none',
          }}>
            {status === 'polling'
              ? <Loader2 size={48} style={{ color: '#1F6B4A', animation: 'spin 1s linear infinite' }} />
              : <CheckCircle size={48} style={{ color: '#1F6B4A' }} strokeWidth={1.8} />
            }
          </div>
          {status !== 'polling' && (
            <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(22,74,56,0.18) 0%,transparent 70%)', animation: 'pulse 2s ease-in-out infinite' }} />
          )}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e2efe6', borderRadius: '24px', padding: '40px 36px', boxShadow: '0 4px 24px rgba(15,61,46,0.08), 0 1px 4px rgba(15,61,46,0.04)' }}>

          {status === 'polling' && (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22,74,56,0.07)', border: '1.5px solid rgba(22,74,56,0.16)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#164A38', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Verifying Payment
              </div>
              <h1 style={{ fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0B2E22', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Processing Your Payment…
              </h1>
              <p style={{ color: '#5A5F5C', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                Your payment is being confirmed by Stripe. This may take a few seconds — please do not close this page.
              </p>
            </>
          )}

          {(status === 'confirmed' || status === 'timeout') && (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22,74,56,0.08)', border: '1.5px solid rgba(22,74,56,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#164A38', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Payment Successful
              </div>

              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0B2E22', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Your Ticket is Confirmed!
              </h1>

              {status === 'confirmed' && pnrCode ? (
                <div style={{ margin: '0 0 20px' }}>
                  <p style={{ color: '#5A5F5C', fontSize: '0.9rem', marginBottom: '14px' }}>
                    Your PNR code has been generated:
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F1F6F2', border: '1.5px solid #d6eadd', borderRadius: '12px', padding: '12px 24px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#8A8E8B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>PNR</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 800, fontSize: '1.4rem', color: '#0F3D2E', letterSpacing: '0.18em' }}>{pnrCode}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#5A5F5C', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 28px' }}>
                  Your payment was received successfully. Your ticket will appear in the system shortly and your PNR code will be visible in your profile.
                </p>
              )}

              <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#d6eadd,transparent)', marginBottom: '28px' }} />

              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button
                  onClick={() => navigate('/profile?tab=tickets')}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#2E8B5F 0%,#164A38 100%)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(15,61,46,0.25)', transition: 'filter 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Ticket size={16} /> View My Tickets
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1.5px solid #e2efe6', cursor: 'pointer', background: '#F1F6F2', color: '#5A5F5C', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#0B2E22'; e.currentTarget.style.borderColor = '#b8d9c4'; e.currentTarget.style.background = '#e8f3ec'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#5A5F5C'; e.currentTarget.style.borderColor = '#e2efe6'; e.currentTarget.style.background = '#F1F6F2'; }}
                >
                  <Home size={15} /> Back to Home
                </button>
              </div>

              <p style={{ marginTop: '20px', fontSize: '0.78rem', color: '#8A8E8B' }}>
                You will be redirected to your tickets in {countdown} seconds…
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1);   opacity: 0.7; }
          50%       { transform: scale(1.3); opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
