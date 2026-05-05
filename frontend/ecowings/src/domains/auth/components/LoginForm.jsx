import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ onSubmit, loading, showSignupLink = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setErrorMsg('');

    if (!email.trim()) {
      setErrors(['Email address is required.']);
      return;
    }
    if (!password) {
      setErrors(['Password is required.']);
      return;
    }

    const result = await onSubmit({ email, password, remember });
    if (!result.success) {
      setErrorMsg(result.message || 'Login failed. Please try again.');
      setErrors(result.errors || []);
    }
  };

  return (
    <div className="auth-form-card">
      <span className="auth-form-eyebrow">Sign In</span>
      <h2 className="auth-form-h2">Sign in to <em>EcoWings.</em></h2>
      <p className="auth-form-sub">Use your email and password, or continue with a single click.</p>

      {/* Error banner */}
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
        {/* Email */}
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="auth-row">
          <label
            className={`auth-check${remember ? ' auth-check-checked' : ''}`}
            onClick={() => setRemember((v) => !v)}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember((v) => !v)}
            />
            <span className="auth-check-box" />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-forgot">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Signing in…' : 'Sign In'}
          {!loading && (
            <svg
              className="auth-submit-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>

      {showSignupLink && (
        <p className="auth-swap">
          Don&apos;t have an account?{' '}
          <Link to="/signup">Sign Up</Link>
        </p>
      )}
    </div>
  );
}
