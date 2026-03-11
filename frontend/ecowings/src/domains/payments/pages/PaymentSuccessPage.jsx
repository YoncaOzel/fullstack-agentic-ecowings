import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Ticket, Home } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
            <CheckCircle size={48} style={{ color: '#22c55e' }} strokeWidth={1.8} />
          </div>
          {/* Glow */}
          <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,197,94,0.25) 0%,transparent 70%)', animation: 'pulse 2s ease-in-out infinite' }} />
        </div>

        {/* Card */}
        <div style={{ background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '24px', padding: '40px 36px', boxShadow: '0 16px 60px rgba(0,0,0,0.4), 0 0 40px rgba(34,197,94,0.08)' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Ödeme Başarılı
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#f0fdf4', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Biletiniz Onaylandı!
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 28px' }}>
            Ödemeniz başarıyla alındı. Biletiniz kısa süre içinde sisteme yansıyacak ve PNR kodunuz profilinizde görünecektir.
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(34,197,94,0.2),transparent)', marginBottom: '28px' }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', color: '#051005', fontWeight: 800, fontSize: '0.9rem', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', transition: 'filter 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              <Ticket size={16} /> Biletlerimi Gör
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#9ca3af', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f0fdf4'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <Home size={15} /> Ana Sayfaya Dön
            </button>
          </div>

          {/* Countdown */}
          <p style={{ marginTop: '20px', fontSize: '0.78rem', color: '#4b5563' }}>
            {countdown} saniye içinde ana sayfaya yönlendiriliyorsunuz…
          </p>
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
      `}</style>
    </main>
  );
}
