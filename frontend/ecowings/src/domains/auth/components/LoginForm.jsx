import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

/* ── Reusable input with prefix icon ─────────────────────── */
function InputField({ label, icon, type, placeholder, value, onChange, autoComplete, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: focused ? 'var(--green-primary)' : 'var(--text-muted)',
        transition: 'color 0.18s ease',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: focused ? 'var(--bg-base)' : 'var(--bg-elevated)',
        border: `1px solid ${focused ? 'rgba(34,197,94,0.5)' : filled ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
        borderRadius: '12px',
        transition: 'border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
        boxShadow: focused ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
        overflow: 'hidden',
      }}>
        <span style={{
          padding: '0 14px 0 16px', color: focused ? 'var(--green-primary)' : 'var(--text-muted)',
          transition: 'color 0.18s ease', display: 'flex', flexShrink: 0,
        }}>{icon}</span>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          autoComplete={autoComplete} required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'var(--bg-base)', border: 'none', outline: 'none',
            padding: '14px 0', fontSize: '0.9rem', color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
            colorScheme: 'dark',
          }}
        />
        {rightSlot && <span style={{ padding: '0 14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{rightSlot}</span>}
      </div>
    </div>
  );
}

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setErrorMsg('');

    if (!email.trim()) { setErrors(['E-posta adresi gerekli.']); return; }
    if (!password) { setErrors(['Şifre gerekli.']); return; }

    const result = await onSubmit({ email, password });
    if (!result.success) {
      setErrorMsg(result.message || 'Giriş yapılamadı.');
      setErrors(result.errors || []);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Error banner */}
      {(errorMsg || errors.length > 0) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '10px', padding: '12px 14px',
          animation: 'navItemSlideIn 0.25s ease both',
        }}>
          <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '0.83rem', color: '#f87171', lineHeight: 1.5 }}>
            {errorMsg && <div>{errorMsg}</div>}
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        </div>
      )}

      <InputField
        label="E-posta Adresi"
        icon={<Mail size={16} />}
        type="email"
        placeholder="ornek@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <InputField
        label="Şifre"
        icon={<Lock size={16} />}
        type={showPw ? 'text' : 'password'}
        placeholder="En az 6 karakter"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        rightSlot={
          <button type="button" onClick={() => setShowPw((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', padding: '0',
              transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--green-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div style={{ textAlign: 'right', marginTop: '-6px' }}>
        <Link to="/forgot-password" style={{
          fontSize: '0.8rem', color: 'var(--green-primary)',
          fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Şifremi Unuttum
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '15px',
          background: loading
            ? 'rgba(34,197,94,0.4)'
            : 'linear-gradient(135deg, #22c55e, #16a34a)',
          border: 'none', borderRadius: '12px',
          color: '#f0fdf4', fontSize: '0.95rem', fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(34,197,94,0.35)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.5)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(34,197,94,0.35)'; }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              width: '15px', height: '15px', border: '2px solid rgba(240,253,244,0.3)',
              borderTop: '2px solid #f0fdf4', borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }} />
            Giriş yapılıyor...
          </span>
        ) : 'Giriş Yap'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)',
        fontFamily: "'Inter', sans-serif", marginTop: '4px' }}>
        Hesabın yok mu?{' '}
        <Link to="/signup" style={{ color: 'var(--green-primary)', fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Kayıt Ol</Link>
      </p>
    </form>
  );
}
