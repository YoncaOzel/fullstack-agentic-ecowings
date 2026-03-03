import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoginForm from '../components/LoginForm';
import { Leaf, Shield, Zap, Plane } from 'lucide-react';

const features = [
  { icon: <Plane size={15} />, text: '300+ havalimanına erişim' },
  { icon: <Leaf size={15} />, text: 'Karbon offset ve yeşil rotalar' },
  { icon: <Zap size={15} />, text: 'Gerçek zamanlı uçuş takibi' },
  { icon: <Shield size={15} />, text: 'Şeffaf fiyatlandırma' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (credentials) => {
    setLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) { navigate('/'); return { success: true }; }
      return result;
    } catch {
      return { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Left decorative panel ─────────────────────────── */}
      <div style={{
        flex: '0 0 42%', display: 'none',
        background: 'linear-gradient(160deg, #0a180a 0%, #080e08 100%)',
        borderRight: '1px solid var(--border)',
        padding: '60px 52px',
        flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">
        <div style={{
          position: 'absolute', bottom: '-120px', right: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-60px', left: '-60px',
          width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Brand */}
        <div style={{ position: 'relative' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '52px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌿</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>EcoWings</span>
          </Link>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--green-glow)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '100px', padding: '4px 12px',
            fontSize: '0.72rem', color: 'var(--green-primary)', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px',
            display: 'flex',
          }}>
            <Leaf size={11} /> Hoş geldiniz
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '16px',
          }}>
            Yeşil seyahatin<br />
            <span style={{ color: 'var(--green-primary)' }}>akıllı platformu</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '320px' }}>
            EcoWings hesabınıza giriş yapın ve sürdürülebilir seyahat dünyasını keşfedin.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          {features.map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--green-primary)',
              }}>{f.icon}</div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
          {[['2M+', 'Yolcu'], ['50+', 'Havayolu'], ['120K t', 'CO₂ tasarrufu']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green-primary)',
                fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>{v}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'navItemSlideIn 0.4s cubic-bezier(0.4,0,0.2,1) both' }}>
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }} className="auth-mobile-header">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '24px' }}>
              <span style={{ fontSize: '2rem' }}>🌿</span>
            </Link>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.75rem', fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '8px',
            }}>Hoş Geldiniz</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              EcoWings hesabınıza giriş yapın
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.4)',
          }}>
            <div style={{ marginBottom: '28px' }} className="auth-desktop-header">
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.5rem', fontWeight: 800,
                letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '6px',
              }}>Giriş Yap</h1>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                Hesabınıza erişmek için bilgilerinizi girin
              </p>
            </div>
            <LoginForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </main>
  );
}
