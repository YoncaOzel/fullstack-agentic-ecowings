import { useState } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setSuccess(false);
    if (form.newPassword !== form.confirmNewPassword) {
      setErrors(['New passwords do not match.']);
      return;
    }
    if (form.newPassword.length < 8) {
      setErrors(['New password must be at least 8 characters.']);
      return;
    }
    setSaving(true);
    try {
      const res = await userService.changePassword(form);
      if (res.status >= 200 && res.status < 300) {
        setSuccess(true);
        setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(() => setSuccess(false), 3500);
      } else {
        setError(res.data?.message || 'Password could not be changed.');
        setErrors(res.data?.errors || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
      setErrors(err.response?.data?.errors || []);
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes cpf-spin { to { transform: rotate(360deg); } }

        .cpf-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: start;
        }

        @media (min-width: 768px) {
          .cpf-layout {
            grid-template-columns: 5fr 7fr;
          }
        }

        .cpf-input {
          width: 100%;
          background: #f1f4f6;
          border: none;
          outline: none;
          border-radius: 12px;
          padding: 16px 52px 16px 20px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #2b3437;
          transition: background 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }

        .cpf-input:focus {
          background: #eaeff1;
          box-shadow: 0 0 0 1px #1b6d24;
        }

        .cpf-input::placeholder {
          color: #abb3b7;
          letter-spacing: 0.05em;
        }

        .cpf-eye-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #737c7f;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }

        .cpf-eye-btn:hover { color: #2b3437; }

        .cpf-submit-btn {
          width: 100%;
          background: #1b6d24;
          color: #e5ffdd;
          border: none;
          border-radius: 100px;
          padding: 20px 32px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(27,109,36,0.2);
          transition: background 0.25s ease, transform 0.15s ease;
        }

        .cpf-submit-btn:hover:not(:disabled) { background: #076019; }
        .cpf-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .cpf-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .cpf-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(229,255,221,0.3);
          border-top-color: #e5ffdd;
          border-radius: 50%;
          animation: cpf-spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        .cpf-alert {
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cpf-alert.error {
          background: rgba(159,64,61,0.06);
          border: 1px solid rgba(159,64,61,0.15);
          color: #9f403d;
        }

        .cpf-alert.success {
          background: rgba(27,109,36,0.06);
          border: 1px solid rgba(27,109,36,0.15);
          color: #1b6d24;
          font-weight: 500;
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }

        .cpf-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #586064;
          margin-bottom: 12px;
          font-family: 'DM Sans', sans-serif;
        }

        .cpf-footer-note {
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #abb3b7;
          margin-top: 20px;
          font-family: 'DM Sans', sans-serif;
        }

        .cpf-shield-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 32px;
          margin-top: 32px;
          border-top: 1px solid rgba(171,179,183,0.15);
        }

        .cpf-shield-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f1f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .cpf-shield-row:hover .cpf-shield-icon-wrap {
          background: #a3f69c;
        }
      `}</style>

      <div className="cpf-layout" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Left: Editorial text */}
        <div>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
            fontWeight: 300,
            color: '#2b3437',
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}>
            Choose a strong, unique password to keep your account secure.
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#586064',
            lineHeight: 1.7,
            fontWeight: 300,
            margin: 0,
          }}>
            Your password must be at least 8 characters and include uppercase letters, lowercase letters, and numbers.
            We recommend changing your password periodically to keep your account safe.
          </p>

          <div className="cpf-shield-row">
            <div className="cpf-shield-icon-wrap">
              <ShieldIcon />
            </div>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#586064', fontWeight: 500, margin: '0 0 4px' }}>
                Security Status
              </p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#2b3437', margin: 0 }}>
                Two-Factor Authentication Active
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form canvas */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.02)',
        }}>

          {/* Alerts */}
          {(error || errors.length > 0) && (
            <div className="cpf-alert error">
              {error && <span>⚠ {error}</span>}
              {errors.map((e, i) => <span key={i}>• {e}</span>)}
            </div>
          )}
          {success && (
            <div className="cpf-alert success">
              <CheckIcon />
              Password changed successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Mevcut Şifre */}
            <div>
              <label className="cpf-label" htmlFor="cpf-current">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cpf-current"
                  className="cpf-input"
                  type={show.currentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.currentPassword}
                  onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="cpf-eye-btn" onClick={() => toggleShow('currentPassword')}>
                  {show.currentPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Yeni Şifre */}
            <div>
              <label className="cpf-label" htmlFor="cpf-new">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cpf-new"
                  className="cpf-input"
                  type={show.newPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.newPassword}
                  onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="cpf-eye-btn" onClick={() => toggleShow('newPassword')}>
                  {show.newPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Yeni Şifre Tekrar */}
            <div>
              <label className="cpf-label" htmlFor="cpf-confirm">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cpf-confirm"
                  className="cpf-input"
                  type={show.confirmNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmNewPassword}
                  onChange={e => setForm(p => ({ ...p, confirmNewPassword: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="cpf-eye-btn" onClick={() => toggleShow('confirmNewPassword')}>
                  {show.confirmNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: '8px' }}>
              <button type="submit" disabled={saving} className="cpf-submit-btn">
                {saving ? (
                  <><span className="cpf-spinner" /> Updating…</>
                ) : (
                  <><span>Update Password</span><CheckCircleIcon /></>
                )}
              </button>
              <p className="cpf-footer-note">
                All your sessions will be securely updated.
              </p>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#586064', marginTop: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                Forgot your current password?{' '}
                <Link to="/forgot-password" style={{ color: '#1b6d24', textDecoration: 'none', fontWeight: 500 }}>Reset via email</Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b6d24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
