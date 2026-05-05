import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-form-card">
        <span className="auth-form-eyebrow">Check your inbox</span>
        <h2 className="auth-form-h2">Reset link sent.</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: 'rgba(27,109,36,0.06)',
            border: '1px solid rgba(27,109,36,0.15)',
            borderRadius: '12px',
            padding: '16px 18px',
            color: '#1b6d24',
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '24px 0',
          }}
        >
          <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            If an account exists for <strong>{email}</strong>, we've sent a
            password reset link. Check your spam folder if you don't see it
            within a few minutes.
          </span>
        </div>
        <Link to="/login" className="auth-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form-card">
      <span className="auth-form-eyebrow">Password Reset</span>
      <h2 className="auth-form-h2">Forgot your password?</h2>
      <p className="auth-form-sub">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      {errorMsg && (
        <div className="auth-error">
          <AlertCircle size={15} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="forgot-email">Email</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Sending…' : 'Send Reset Link'}
          {!loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="auth-submit-arrow">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>

      <p className="auth-swap">
        Remember your password?{' '}
        <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}
