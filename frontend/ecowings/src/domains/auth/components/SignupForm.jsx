import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, AtSign, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

/* ── Password strength ────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Çok Zayıf', color: '#ef4444' },
    { label: 'Zayıf',     color: '#f97316' },
    { label: 'Orta',      color: '#eab308' },
    { label: 'Güçlü',     color: '#22c55e' },
    { label: 'Çok Güçlü', color: '#4ade80' },
  ];
  return { score, ...map[score] };
}

/* ── Reusable input field ─────────────────────────────────── */
function InputField({ label, icon, type, placeholder, value, onChange, autoComplete, rightSlot, half }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: half ? undefined : '1 / -1' }}>
      <label style={{
        fontSize: '0.76rem', fontWeight: 600, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: focused ? 'var(--green-primary)' : 'var(--text-muted)',
        transition: 'color 0.18s ease', fontFamily: "'Plus Jakarta Sans', sans-serif",
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
          padding: '0 14px 0 16px',
          color: focused ? 'var(--green-primary)' : 'var(--text-muted)',
          transition: 'color 0.18s ease', display: 'flex', flexShrink: 0,
        }}>{icon}</span>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          autoComplete={autoComplete} required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'var(--bg-base)', border: 'none', outline: 'none',
            padding: '13px 0', fontSize: '0.88rem', color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
            colorScheme: 'dark',
          }}
        />
        {rightSlot && (
          <span style={{ padding: '0 14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {rightSlot}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SignupForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', userName: '',
    email: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const strength = getStrength(form.password);
  const pwMatch = form.confirmPassword && form.password === form.confirmPassword;
  const pwMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setErrorMsg('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrors(['Ad ve soyad alanları gerekli.']); return;
    }
    if (!form.userName.trim()) { setErrors(['Kullanıcı adı gerekli.']); return; }
    if (!form.email.trim()) { setErrors(['E-posta adresi gerekli.']); return; }
    if (form.password.length < 6) { setErrors(['Şifre en az 6 karakter olmalıdır.']); return; }
    if (form.password !== form.confirmPassword) {
      setErrors(['Şifreler eşleşmiyor.']); return;
    }

    const result = await onSubmit(form);
    if (!result?.succeeded) {
      setErrorMsg(result?.message || 'Kayıt işlemi başarısız.');
      setErrors(result?.errors || []);
    }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', display: 'flex', padding: '0',
        transition: 'color 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--green-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Error banner */}
      {(errorMsg || errors.length > 0) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '10px', padding: '12px 14px',
          animation: 'navItemSlideIn 0.25s ease both',
        }}>
          <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '0.82rem', color: '#f87171', lineHeight: 1.5 }}>
            {errorMsg && <div>{errorMsg}</div>}
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        </div>
      )}

      {/* First + Last name grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <InputField half label="Ad" icon={<User size={15} />} type="text"
          placeholder="Adınız" value={form.firstName} onChange={set('firstName')}
          autoComplete="given-name" />
        <InputField half label="Soyad" icon={<User size={15} />} type="text"
          placeholder="Soyadınız" value={form.lastName} onChange={set('lastName')}
          autoComplete="family-name" />
      </div>

      <InputField label="Kullanıcı Adı" icon={<AtSign size={15} />} type="text"
        placeholder="kullanici_adi" value={form.userName} onChange={set('userName')}
        autoComplete="username" />

      <InputField label="E-posta" icon={<Mail size={15} />} type="email"
        placeholder="ornek@email.com" value={form.email} onChange={set('email')}
        autoComplete="email" />

      {/* Password with strength meter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <InputField label="Şifre" icon={<Lock size={15} />}
          type={showPw ? 'text' : 'password'}
          placeholder="En az 6 karakter"
          value={form.password} onChange={set('password')}
          autoComplete="new-password"
          rightSlot={eyeBtn(showPw, () => setShowPw((v) => !v))}
        />
        {/* Strength bar */}
        {form.password.length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  flex: 1, height: '3px', borderRadius: '3px',
                  background: i < strength.score ? strength.color : 'var(--bg-elevated)',
                  border: i < strength.score ? 'none' : '1px solid var(--border)',
                  transition: 'background 0.2s ease',
                }} />
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Şifre gücü: {strength.label}
            </div>
          </div>
        )}
      </div>

      {/* Confirm password with match indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <InputField label="Şifre Tekrar" icon={<Lock size={15} />}
          type={showConfirm ? 'text' : 'password'}
          placeholder="Şifrenizi tekrar girin"
          value={form.confirmPassword} onChange={set('confirmPassword')}
          autoComplete="new-password"
          rightSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {pwMatch && <CheckCircle2 size={14} color="#22c55e" />}
              {pwMismatch && <AlertCircle size={14} color="#f87171" />}
              {eyeBtn(showConfirm, () => setShowConfirm((v) => !v))}
            </div>
          }
        />
        {pwMismatch && (
          <div style={{ fontSize: '0.76rem', color: '#f87171', paddingLeft: '4px',
            fontFamily: "'Inter', sans-serif" }}>
            Şifreler eşleşmiyor
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '15px', marginTop: '4px',
          background: loading
            ? 'rgba(34,197,94,0.4)'
            : 'linear-gradient(135deg, #22c55e, #16a34a)',
          border: 'none', borderRadius: '12px',
          color: '#f0fdf4', fontSize: '0.95rem', fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(34,197,94,0.35)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
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
              display: 'inline-block', animation: 'spin 0.7s linear infinite',
            }} />
            Kayıt yapılıyor...
          </span>
        ) : 'Kayıt Ol'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)',
        fontFamily: "'Inter', sans-serif", marginTop: '4px' }}>
        Zaten hesabın var mı?{' '}
        <Link to="/login" style={{ color: 'var(--green-primary)', fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Giriş Yap</Link>
      </p>
    </form>
  );
}
