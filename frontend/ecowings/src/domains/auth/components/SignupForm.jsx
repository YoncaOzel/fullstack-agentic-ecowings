import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9!@#$%^&*]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthLabels = [
  '',
  'Weak — add uppercase letters, digits, and a special character.',
  'Fair — add a special character (e.g. !@#$%).',
  'Good — almost there!',
  'Strong password.',
];

export default function SignupForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setErrorMsg('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrors(['First and last name are required.']);
      return;
    }
    if (!form.email.trim()) {
      setErrors(['Email address is required.']);
      return;
    }
    if (form.password.length < 6) {
      setErrors(['Password must be at least 6 characters.']);
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setErrors(['Password must contain at least one uppercase letter.']);
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setErrors(['Password must contain at least one digit.']);
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(form.password)) {
      setErrors(['Password must contain at least one special character (e.g. !@#$%).']);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrors(['Passwords do not match.']);
      return;
    }
    if (!agreeToTerms) {
      setErrors(['Please agree to the Terms of Service and Privacy Policy.']);
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      userName: (() => {
        const base = `${form.firstName}.${form.lastName}`.toLowerCase().replace(/\s+/g, '');
        return base.length >= 6 ? base : base.padEnd(6, '0');
      })(),
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    const result = await onSubmit(payload);
    if (result?.succeeded) {
      setErrorMsg('');
      setErrors([]);
    } else {
      setErrorMsg(result?.message || 'Registration failed. Please try again.');
      setErrors(result?.errors || []);
    }
  };

  return (
    <div className="auth-form-card">
      <span className="auth-form-eyebrow">Create Account</span>
      <h2 className="auth-form-h2">Create your <em>EcoWings</em> account.</h2>
      <p className="auth-form-sub">Takes less than two minutes. No card required.</p>

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
        {/* First / Last name */}
        <div className="auth-field-row">
          <div className="auth-field" style={{ marginBottom: 0 }}>
            <label htmlFor="signup-fn">First name</label>
            <div className="auth-input-wrap no-ico">
              <input
                id="signup-fn"
                type="text"
                placeholder="Ada"
                value={form.firstName}
                onChange={set('firstName')}
                autoComplete="given-name"
                required
              />
            </div>
          </div>
          <div className="auth-field" style={{ marginBottom: 0 }}>
            <label htmlFor="signup-ln">Last name</label>
            <div className="auth-input-wrap no-ico">
              <input
                id="signup-ln"
                type="text"
                placeholder="Lovelace"
                value={form.lastName}
                onChange={set('lastName')}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="auth-field">
          <label htmlFor="signup-email">Email</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="signup-password">Password</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
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
          {form.password && (
            <>
              <div className="auth-strength">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className={`seg${strength >= n ? ` s${strength}` : ''}`} />
                ))}
              </div>
              <div className="auth-strength-label">{strengthLabels[strength]}</div>
            </>
          )}
        </div>

        {/* Confirm password */}
        <div className="auth-field">
          <label htmlFor="signup-confirm">Confirm password</label>
          <div className="auth-input-wrap">
            <span className="auth-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShowConfirm((p) => !p)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label
          className={`auth-terms${agreeToTerms ? ' auth-check-checked' : ''}`}
          onClick={() => setAgreeToTerms((v) => !v)}
        >
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={() => setAgreeToTerms((v) => !v)}
          />
          <span className="auth-check-box" />
          <span>
            I agree to the <a href="#" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and{' '}
            <a href="#" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>, and would like a calmer way to fly.
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Creating account…' : 'Create Account'}
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

      <p className="auth-swap">
        Already have an account?{' '}
        <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}
