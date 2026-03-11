import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { Leaf, Shield, Zap, Plane, CheckCircle2 } from 'lucide-react';

// ── Static data ─────────────────────────────────────────────
const loginFeatures = [
  { icon: <Plane size={15} />, text: '300+ havalimanına erişim' },
  { icon: <Leaf size={15} />, text: 'Karbon offset ve yeşil rotalar' },
  { icon: <Zap size={15} />, text: 'Gerçek zamanlı uçuş takibi' },
  { icon: <Shield size={15} />, text: 'Şeffaf fiyatlandırma' },
];

const signupBenefits = [
  'Karbon ayak izinizi anlık takip edin',
  'Yeşil sertifikalı havayollarıyla uçun',
  'Her rezervasyonda ağaç dikme desteği',
  'Kişiselleştirilmiş eko seyahat önerileri',
];

const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';
const DURATION = '0.65s';
const BRAND_W = 42; // percent

// ── Shared ambient glow blobs ──────────────────────────────
function GlowBlobs() {
  return (
    <>
      <div style={{
        position: 'absolute', bottom: '-120px', right: '-80px',
        width: '400px', height: '400px', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(77,124,95,0.18) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', top: '-60px', left: '-60px',
        width: '280px', height: '280px', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(77,124,95,0.12) 0%, transparent 70%)',
      }} />
    </>
  );
}

// ── Brand panel content: login ─────────────────────────────
function LoginBrand() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative', zIndex: 1 }}>
      <GlowBlobs />

      <div style={{ position: 'relative' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '44px' }}>
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
          <Leaf size={11} /> Hoş geldiniz
        </div>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(1.5rem, 2.2vw, 2.1rem)', fontWeight: 800,
          letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '14px',
        }}>
          Yeşil seyahatin<br />
          <span style={{ color: 'var(--green-primary)' }}>akıllı platformu</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '300px' }}>
          EcoWings hesabınıza giriş yapın ve sürdürülebilir seyahat dünyasını keşfedin.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', position: 'relative' }}>
        {loginFeatures.map((f) => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-primary)',
            }}>{f.icon}</div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{f.text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
        {[['2M+', 'Yolcu'], ['50+', 'Havayolu'], ['120K t', 'CO₂ tasarrufu']].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--green-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>{v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Brand panel content: signup ────────────────────────────
function SignupBrand() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative', zIndex: 1 }}>
      <GlowBlobs />

      <div style={{ position: 'relative' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '44px' }}>
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
          fontSize: 'clamp(1.5rem, 2.2vw, 2.1rem)', fontWeight: 800,
          letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '14px',
        }}>
          Daha bilinçli bir<br />
          <span style={{ color: 'var(--green-primary)' }}>seyahat deneyimi</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '300px' }}>
          EcoWings'e katılın — sürdürülebilir uçuşları takip edin, karbon dengenizi gözetin.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', position: 'relative' }}>
        {signupBenefits.map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <CheckCircle2 size={17} style={{ color: 'var(--green-primary)', flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)',
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: '14px', padding: '18px 20px', position: 'relative',
      }}>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic',
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
  );
}

// ── Main AuthPage ──────────────────────────────────────────
export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Desktop detection for conditional positioning
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Login handler ──────────────────────────────────────
  const handleLogin = async (credentials) => {
    setLoginLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) { navigate('/'); return { success: true }; }
      return result;
    } catch {
      return { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' };
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup handler ─────────────────────────────────────
  const startCountdown = () => {
    let c = 3;
    const id = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) { clearInterval(id); navigate('/login'); }
    }, 1000);
  };

  const handleSignup = async (formData) => {
    setSignupLoading(true);
    try {
      const result = await register(formData);
      if (result?.succeeded) { setSuccess(true); startCountdown(); return { succeeded: true }; }
      return result;
    } catch (err) {
      return {
        succeeded: false,
        message: err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        errors: err.response?.data?.errors || [],
      };
    } finally {
      setSignupLoading(false);
    }
  };

  // ── Sliding positions ──────────────────────────────────
  // Login:  brand LEFT (0%),           form RIGHT (42%)
  // Signup: form  LEFT (0%),           brand RIGHT (58%)
  const brandLeft = isDesktop ? (isLogin ? '0%' : `${100 - BRAND_W}%`) : '-100%';
  const formLeft  = isDesktop ? (isLogin ? `${BRAND_W}%` : '0%')        : '0%';
  const formWidth = isDesktop ? `${100 - BRAND_W}%` : '100%';

  const panelTransition = `left ${DURATION} ${EASING}`;

  // ── Success state ──────────────────────────────────────
  const successContent = (
    <div style={{ textAlign: 'center', padding: '20px 0', animation: 'navItemSlideIn 0.4s ease both' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <CheckCircle2 size={32} color="var(--green-primary)" />
      </div>
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 800,
        letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '8px',
      }}>Kayıt Başarılı! 🎉</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        E-postanızı doğrulayın.{' '}
        <strong style={{ color: 'var(--text-secondary)' }}>{countdown} saniye</strong>{' '}
        içinde giriş sayfasına yönlendiriliyorsunuz.
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
      <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--green-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
        Hemen Giriş Yap →
      </Link>
    </div>
  );

  return (
    <main style={{
      height: 'calc(100vh - 64px)',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>

      {/* ── Brand / decorative panel ───────────────────── */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        width: `${BRAND_W}%`,
        left: brandLeft,
        transition: panelTransition,
        background: 'linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
        borderRight: isLogin ? '1px solid var(--border)' : 'none',
        borderLeft: isLogin ? 'none' : '1px solid var(--border)',
        padding: '56px 48px',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        {isLogin ? <LoginBrand /> : <SignupBrand />}
      </div>

      {/* ── Form panel ────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        width: formWidth,
        left: formLeft,
        transition: panelTransition,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '56px 24px 48px',
        overflowY: 'auto',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: isLogin ? '420px' : '460px' }}>

          {/* Mobile logo (brand panel hidden on mobile) */}
          <div className="auth-mobile-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '20px' }}>
              <span style={{ fontSize: '2rem' }}>🌿</span>
            </Link>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '6px',
            }}>{isLogin ? 'Hoş Geldiniz' : 'Hesap Oluştur'}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              {isLogin ? 'EcoWings hesabınıza giriş yapın' : 'EcoWings\'in yeşil seyahat topluluğuna katılın'}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '36px 32px',
            boxShadow: '0 4px 24px rgba(77,124,95,0.10)',
          }}>
            {isLogin ? (
              <>
                <div className="auth-desktop-header" style={{ marginBottom: '28px' }}>
                  <h1 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800,
                    letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '6px',
                  }}>Giriş Yap</h1>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                    Hesabınıza erişmek için bilgilerinizi girin
                  </p>
                </div>
                <LoginForm onSubmit={handleLogin} loading={loginLoading} />
              </>
            ) : success ? successContent : (
              <>
                <div className="auth-desktop-header" style={{ marginBottom: '28px' }}>
                  <h1 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800,
                    letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '6px',
                  }}>Hesap Oluştur</h1>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                    Birkaç adımda EcoWings'e katılın
                  </p>
                </div>
                <SignupForm onSubmit={handleSignup} loading={signupLoading} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
