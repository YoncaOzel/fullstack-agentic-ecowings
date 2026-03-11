import { useState } from 'react';
import { Key, Eye, EyeOff, Shield, Check, Lock } from 'lucide-react';
import userService from '../services/userService';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState('');
  const [show, setShow] = useState({ currentPassword: false, newPassword: false, confirmNewPassword: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setSuccess(false);
    if (form.newPassword !== form.confirmNewPassword) {
      setErrors(['Yeni şifreler eşleşmiyor.']); return;
    }
    if (form.newPassword.length < 6) {
      setErrors(['Yeni şifre en az 6 karakter olmalıdır.']); return;
    }
    setSaving(true);
    try {
      const res = await userService.changePassword(form);
      if (res.status >= 200 && res.status < 300) {
        setSuccess(true);
        setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.data?.message || 'Şifre değiştirilemedi.');
        setErrors(res.data?.errors || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
      setErrors(err.response?.data?.errors || []);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (key) => ({
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === key ? '#22c55e' : 'rgba(34,197,94,0.15)'}`,
    borderRadius: '10px', padding: '12px 40px 12px 14px', color: '#f0fdf4',
    fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none',
    boxShadow: focused === key ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
    transition: 'border-color 0.2s,box-shadow 0.2s',
  });

  const fields = [
    { key: 'currentPassword', label: 'Mevcut Şifre', hint: 'Hesabınızın mevcut şifresi' },
    { key: 'newPassword', label: 'Yeni Şifre', hint: 'En az 6 karakter' },
    { key: 'confirmNewPassword', label: 'Yeni Şifre Tekrar', hint: 'Yeni şifrenizi doğrulayın' },
  ];

  // Password strength for new password
  const pw = form.newPassword;
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3;
  const strengthLabel = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
  const strengthColor = ['', '#ef4444', '#f97316', '#22c55e', '#4ade80'];

  return (
    <form onSubmit={handleSubmit}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Key size={16} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a4d33', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Şifre Değiştir</h3>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>Hesabınızın güvenliği için güçlü bir şifre seçin</p>
        </div>
      </div>

      {/* Alerts */}
      {(error || errors.length > 0) && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px' }}>
          {error && <p style={{ fontSize: '0.85rem', color: '#fca5a5', margin: '0 0 4px' }}>⚠ {error}</p>}
          {errors.map((e, i) => <p key={i} style={{ fontSize: '0.82rem', color: '#fca5a5', margin: '2px 0 0' }}>• {e}</p>)}
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px' }}>
          <Check size={14} style={{ color: '#4ade80' }} />
          <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600 }}>Şifreniz başarıyla değiştirildi!</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '480px' }}>
        {fields.map((f) => (
          <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{f.label}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show[f.key] ? 'text' : 'password'}
                value={form[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                onFocus={() => setFocused(f.key)}
                onBlur={() => setFocused('')}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={inputStyle(f.key)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, [f.key]: !s[f.key] }))}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(34,197,94,0.5)', padding: '2px', display: 'flex' }}
              >
                {show[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {f.hint && <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>{f.hint}</span>}
            {/* Strength bar for new password */}
            {f.key === 'newPassword' && pw.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, background: strengthColor[strength], borderRadius: '2px', transition: 'width 0.3s,background 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: strengthColor[strength], whiteSpace: 'nowrap' }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>
        ))}

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '10px', padding: '12px 14px' }}>
          <Shield size={13} style={{ color: 'rgba(34,197,94,0.5)', marginTop: '1px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
            Güvenliğiniz için şifrenizi kimseyle paylaşmayın. Güçlü bir şifre büyük harf, rakam ve özel karakter içermelidir.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', borderRadius: '10px', border: 'none',
            background: saving ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
            color: '#080e08', fontWeight: 700, fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 18px rgba(34,197,94,0.28)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(34,197,94,0.4)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = saving ? 'none' : '0 4px 18px rgba(34,197,94,0.28)'; }}
        >
          {saving ? (
            <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(8,14,8,0.3)', borderTopColor: '#080e08', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Değiştiriliyor…</>
          ) : (
            <><Lock size={14} /> Şifreyi Değiştir</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </form>
  );
}
