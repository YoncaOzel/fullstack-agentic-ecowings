import { useState } from 'react';
import userService from '../services/userService';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

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
      // Backend { message: "..." } döndürür, 2xx ise başarılı
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

  const fields = [
    { key: 'currentPassword', label: 'Mevcut Şifre' },
    { key: 'newPassword', label: 'Yeni Şifre' },
    { key: 'confirmNewPassword', label: 'Yeni Şifre Tekrar' },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
      <ErrorMessage message={error} errors={errors} />
      {success && (
        <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: '8px', padding: '10px 14px', color: '#276749', fontSize: '0.875rem' }}>
          ✅ Şifreniz başarıyla değiştirildi.
        </div>
      )}
      {fields.map((f) => (
        <div className="form-group" key={f.key}>
          <label className="form-label">{f.label}</label>
          <input type="password" className="form-input" value={form[f.key]}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder="••••••••" required autoComplete="new-password" />
        </div>
      ))}
      <button type="submit" className="btn btn-primary" disabled={saving}
        style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
        {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
      </button>
    </form>
  );
}
