import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ErrorMessage message={errorMsg} errors={errors} />

      <div className="form-group">
        <label className="form-label">E-posta Adresi</label>
        <input
          type="email"
          className="form-input"
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Şifre</label>
        <input
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <div style={{ textAlign: 'right' }}>
        <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
          Şifremi Unuttum
        </Link>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}
        style={{ width: '100%', padding: '14px' }}>
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Hesabın yok mu?{' '}
        <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Kayıt Ol</Link>
      </p>
    </form>
  );
}
