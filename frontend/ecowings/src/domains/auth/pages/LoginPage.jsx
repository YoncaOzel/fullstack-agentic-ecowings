import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (credentials) => {
    setLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/');
        return { success: true };
      }
      return result;
    } catch {
      return { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '2.5rem' }}>🌿</span>
          <h1 style={{ fontSize: '1.8rem', marginTop: '8px' }}>Hoş Geldiniz</h1>
          <p className="subtitle" style={{ marginTop: '6px' }}>EcoWings hesabınıza giriş yapın</p>
        </div>

        <LoginForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </main>
  );
}
