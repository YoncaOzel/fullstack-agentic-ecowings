import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import SignupForm from '../components/SignupForm';
import { CheckCircle2, Leaf } from 'lucide-react';

const benefits = [
  'Karbon ayak izinizi anlık takip edin',
  'Yeşil sertifikalı havayollarıyla uçun',
  'Her rezervasyonda ağaç dikme desteği',
  'Kişiselleştirilmiş eko seyahat önerileri',
];

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const startCountdown = () => {
    let c = 3;
    const id = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) { clearInterval(id); navigate('/login'); }
    }, 1000);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const result = await register(formData);
      if (result?.succeeded) {
        setSuccess(true);
        startCountdown();
        return { succeeded: true };
      }
      return result;
    } catch (err) {
      return {
        succeeded: false,
        message: err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        errors: err.response?.data?.errors || [],
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', background: 'var(--bg-base)', overflowY: 'auto' }}>

      {/* ── Left decorative panel ─────────────────────────── */}
      <div style={{
        flex: '0 0 42%', display: 'none',
        background: 'linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
        borderRight: '1px solid var(--border)',
        padding: '60px 52px',
        flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">
        <div style={{
          position: 'absolute', bottom: '-120px', right: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(77,124,95,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-60px', left: '-60px',
          width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(77,124,95,0.12) 0%, transparent 70%)',
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
          }}>
            <Leaf size={11} /> Ücretsiz katıl
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '16px',
          }}>
            Daha bilinçli bir<br />
            <span style={{ color: 'var(--green-primary)' }}>seyahat deneyimi</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '320px' }}>
            EcoWings'e katılın — sürdürülebilir uçuşları takip edin, karbon dengenizi gözetin.
          </p>
        </div>

        {/* Benefits list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          {benefits.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2 size={17} style={{ color: 'var(--green-primary)', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Testimonial card */}
        <div style={{
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: '14px', padding: '20px 22px', position: 'relative',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic',
            lineHeight: 1.6, marginBottom: '12px' }}>
            "EcoWings sayesinde seyahat ederken daha iyi hissediyorum — gezilerim hem daha ucuz hem de daha yeşil oldu."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-primary), var(--green-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: '#fff',
            }}>A</div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ayşe K.</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>EcoWings kullanıcısı</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 24px 48px' }}>
        <div style={{ width: '100%', maxWidth: '460px', animation: 'navItemSlideIn 0.4s cubic-bezier(0.4,0,0.2,1) both' }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }} className="auth-mobile-header">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '24px' }}>
              <span style={{ fontSize: '2rem' }}>🌿</span>
            </Link>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.75rem', fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '8px',
            }}>Hesap Oluştur</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              EcoWings'in yeşil seyahat topluluğuna katılın
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 4px 24px rgba(77,124,95,0.10)',
          }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0', animation: 'navItemSlideIn 0.4s ease both' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={32} color="var(--green-primary)" />
                </div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em',
                  color: 'var(--text-primary)', marginBottom: '8px',
                }}>Kayıt Başarılı! 🎉</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  E-postanızı doğrulayın. <strong style={{ color: 'var(--text-secondary)' }}>{countdown} saniye</strong> içinde giriş sayfasına yönlendiriliyorsunuz.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: i < (3 - countdown) ? 'var(--green-primary)' : 'rgba(34,197,94,0.2)',
                      transition: 'background 0.3s ease',
                    }} />
                  ))}
                </div>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  color: 'var(--green-primary)', textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 600,
                }}>
                  Hemen Giriş Yap →
                </Link>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '28px' }} className="auth-desktop-header">
                  <h1 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.5rem', fontWeight: 800,
                    letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '6px',
                  }}>Hesap Oluştur</h1>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                    Birkaç adımda EcoWings'e katılın
                  </p>
                </div>
                <SignupForm onSubmit={handleSubmit} loading={loading} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
