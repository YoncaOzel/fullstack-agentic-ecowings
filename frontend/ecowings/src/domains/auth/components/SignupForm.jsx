import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function SignupForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', userName: '',
    email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

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

  const fields = [
    { key: 'firstName', label: 'Ad', type: 'text', placeholder: 'Adınız' },
    { key: 'lastName', label: 'Soyad', type: 'text', placeholder: 'Soyadınız' },
    { key: 'userName', label: 'Kullanıcı Adı', type: 'text', placeholder: 'kullanici_adi' },
    { key: 'email', label: 'E-posta', type: 'email', placeholder: 'ornek@email.com' },
    { key: 'password', label: 'Şifre', type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword', label: 'Şifre Tekrar', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ErrorMessage message={errorMsg} errors={errors} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {fields.slice(0, 2).map((f) => (
          <div className="form-group" key={f.key}>
            <label className="form-label">{f.label}</label>
            <input type={f.type} className="form-input" placeholder={f.placeholder}
              value={form[f.key]} onChange={set(f.key)} required />
          </div>
        ))}
      </div>

      {fields.slice(2).map((f) => (
        <div className="form-group" key={f.key}>
          <label className="form-label">{f.label}</label>
          <input type={f.type} className="form-input" placeholder={f.placeholder}
            value={form[f.key]} onChange={set(f.key)} required />
        </div>
      ))}

      <button type="submit" className="btn btn-primary" disabled={loading}
        style={{ width: '100%', padding: '14px', marginTop: '4px' }}>
        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Zaten hesabın var mı?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Giriş Yap</Link>
      </p>
    </form>
  );
}
