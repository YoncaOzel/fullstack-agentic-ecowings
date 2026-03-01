import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import SignupForm from '../components/SignupForm';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const result = await register(formData);
      if (result?.succeeded) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
        return { succeeded: true };
      }
      return result;
    } catch (err) {
      return {
        succeeded: false,
        message: err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        errors: err.response?.data?.errors || [],
      };
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
        maxWidth: '520px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '2.5rem' }}>🌱</span>
          <h1 style={{ fontSize: '1.8rem', marginTop: '8px' }}>Hesap Oluştur</h1>
          <p className="subtitle" style={{ marginTop: '6px' }}>EcoWings'e katılın</p>
        </div>

        {success ? (
          <div style={{
            background: '#f0fff4',
            border: '1px solid #68d391',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            color: '#276749',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
            <p style={{ fontWeight: 600 }}>Kayıt başarılı!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
              E-postanızı doğrulayın. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        ) : (
          <SignupForm onSubmit={handleSubmit} loading={loading} />
        )}
      </div>
    </main>
  );
}
