import { useState } from 'react';
import { User, AtSign, Mail, Save, Check } from 'lucide-react';
import userService from '../services/userService';

export default function ProfileForm({ profile, onUpdate }) {
  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    userName: profile?.userName || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      if (res.status >= 200 && res.status < 300) {
        setSuccess(true);
        onUpdate?.((prev) => ({ ...prev, ...form }));
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.data?.message || 'Güncelleme başarısız.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (key) => ({
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === key ? '#22c55e' : 'rgba(34,197,94,0.15)'}`,
    borderRadius: '10px', padding: '12px 14px', color: '#f0fdf4',
    fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none',
    boxShadow: focused === key ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
    transition: 'border-color 0.2s,box-shadow 0.2s',
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={16} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0fdf4', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Profil Bilgileri</h3>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>Adı, soyadı ve kullanıcı adını düzenle</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>⚠ {error}</span>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px' }}>
          <Check size={14} style={{ color: '#4ade80' }} />
          <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600 }}>Profil başarıyla güncellendi!</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '480px' }}>
        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Ad</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              onFocus={() => setFocused('firstName')}
              onBlur={() => setFocused('')}
              required
              style={inputStyle('firstName')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Soyad</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              onFocus={() => setFocused('lastName')}
              onBlur={() => setFocused('')}
              required
              style={inputStyle('lastName')}
            />
          </div>
        </div>

        {/* Username */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Kullanıcı Adı</label>
          <div style={{ position: 'relative' }}>
            <AtSign size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(34,197,94,0.5)', pointerEvents: 'none' }} />
            <input
              value={form.userName}
              onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))}
              onFocus={() => setFocused('userName')}
              onBlur={() => setFocused('')}
              required
              style={{ ...inputStyle('userName'), paddingLeft: '34px' }}
            />
          </div>
        </div>

        {/* Email (readonly) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(107,114,128,0.6)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>E-posta <span style={{ fontWeight: 400, fontSize: '10px' }}>(değiştirilemez)</span></label>
          <div style={{ position: 'relative' }}>
            <Mail size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(107,114,128,0.4)', pointerEvents: 'none' }} />
            <input
              value={profile?.email || ''}
              disabled
              style={{ ...inputStyle('email'), paddingLeft: '34px', opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
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
            <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(8,14,8,0.3)', borderTopColor: '#080e08', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Kaydediliyor…</>
          ) : (
            <><Save size={14} /> Değişiklikleri Kaydet</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </form>
  );
}
