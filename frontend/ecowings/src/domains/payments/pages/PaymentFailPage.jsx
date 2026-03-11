import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RotateCcw, Home } from 'lucide-react';

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleRetry = () => {
    if (state?.flight && state?.type) {
      navigate('/checkout', { state });
    } else {
      navigate('/flights');
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
            <XCircle size={48} style={{ color: '#f87171' }} strokeWidth={1.8} />
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'linear-gradient(160deg,#1a0e0e 0%,#150b0b 100%)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '24px', padding: '40px 36px', boxShadow: '0 16px 60px rgba(0,0,0,0.4), 0 0 40px rgba(239,68,68,0.06)' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Ödeme Başarısız
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#fef2f2', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Ödeme Tamamlanamadı
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 28px' }}>
            İşleminiz sırasında bir sorun oluştu. Kart bilgilerinizi kontrol ederek tekrar deneyebilir ya da farklı bir ödeme yöntemi kullanabilirsiniz.
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)', marginBottom: '28px' }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={handleRetry}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ef4444 0%,#b91c1c 100%)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(239,68,68,0.3)', transition: 'filter 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              <RotateCcw size={15} /> Tekrar Dene
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: 'transparent', color: '#9ca3af', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fef2f2'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <Home size={15} /> Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </main>
  );
}
