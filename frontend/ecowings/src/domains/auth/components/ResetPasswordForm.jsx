import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ newPassword: '', confirmNewPassword: '' });
  const [show, setShow] = useState({ newPassword: false, confirmNewPassword: false });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  if (!token || !email) {
    return (
      <div className="auth-form-card">
        <span className="auth-form-eyebrow">Password Reset</span>
        <h2 className="auth-form-h2">Invalid reset link.</h2>
        <div className="auth-error" style={{ marginTop: '16px' }}>
          <AlertCircle size={15} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            This reset link is missing required information. Please request a new
            password reset link.
          </div>
        </div>
        <Link
          to="/forgot-password"
          className="auth-submit"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', marginTop: '24px' }}
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrors([]);

    if (form.newPassword.length < 8) {
      setErrors(['Password must be at least 8 characters.']);
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      setErrors(['Passwords do not match.']);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        token,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          'Password reset failed. The link may have expired.'
      );
      setErrors(err.response?.data?.errors || []);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form-card">
        <span className="auth-form-eyebrow">Password Reset</span>
        <h2 className="auth-form-h2">Password updated!</h2>
        <p className="auth-form-sub">
          Your password has been reset successfully. Redirecting you to sign
          in…
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form-card">
      <span className="auth-form-eyebrow">Password Reset</span>
      <h2 className="auth-form-h2">Choose a new password.</h2>
      <p className="auth-form-sub">
        Must be at least 8 characters with uppercase, lowercase, and numbers.
      </p>

      {(errorMsg || errors.length > 0) && (
        <div className="auth-error">
          <AlertCircle size={15} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            {errorMsg && <div>{errorMsg}</div>}
            {errors.map((err, i) => <div key={i}>{err}</div>)}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="reset-new-password">New Password</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              id="reset-new-password"
              type={show.newPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShow((s) => ({ ...s, newPassword: !s.newPassword }))}
              aria-label={show.newPassword ? 'Hide password' : 'Show password'}
            >
              {show.newPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="reset-confirm-password">Confirm New Password</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              id="reset-confirm-password"
              type={show.confirmNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirmNewPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShow((s) => ({ ...s, confirmNewPassword: !s.confirmNewPassword }))}
              aria-label={show.confirmNewPassword ? 'Hide password' : 'Show password'}
            >
              {show.confirmNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Resetting…' : 'Reset Password'}
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
