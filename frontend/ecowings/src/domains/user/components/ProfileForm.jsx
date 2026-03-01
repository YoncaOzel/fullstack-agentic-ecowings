import { useState } from 'react';
import userService from '../services/userService';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function ProfileForm({ profile, onUpdate }) {
  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    userName: profile?.userName || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      if (res.data?.succeeded) {
        setSuccess(true);
        onUpdate?.(res.data.data);
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
      <ErrorMessage message={error} />
      {success && (
        <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: '8px', padding: '10px 14px', color: '#276749', fontSize: '0.875rem' }}>
          ✅ Profil güncellendi.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Ad</label>
          <input className="form-input" value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Soyad</label>
          <input className="form-input" value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Kullanıcı Adı</label>
        <input className="form-input" value={form.userName}
          onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))} required />
      </div>

      <div className="form-group">
        <label className="form-label">E-posta</label>
        <input className="form-input" value={profile?.email || ''} disabled
          style={{ background: 'var(--bg-section-alt)', color: 'var(--text-light)' }} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
      </button>
    </form>
  );
}
