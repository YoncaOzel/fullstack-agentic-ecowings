import { useState } from 'react';
import userService from '../services/userService';

export default function ProfileForm({ profile, onUpdate }) {
  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    userName: profile?.userName || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      if (res.status >= 200 && res.status < 300) {
        setSuccess(true);
        onUpdate?.((prev) => ({ ...prev, ...form }));
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.data?.message || 'Update failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const inputBase = {
    width: '100%',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    borderRadius: '12px',
    padding: '16px 20px',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    color: '#2b3437',
    transition: 'background 0.25s ease',
    boxSizing: 'border-box',
  };

  const inputStyle = (key) => ({
    ...inputBase,
    background: focused === key ? '#eaeff1' : '#f1f4f6',
  });

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#586064',
    marginBottom: '10px',
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes pf-spin { to { transform: rotate(360deg); } }

        .pf-grid input,
        .pf-grid input:focus,
        .pf-grid input:active,
        .pf-grid input:focus-visible {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px 40px;
        }

        @media (max-width: 640px) {
          .pf-grid { grid-template-columns: 1fr; }
        }

        .pf-field { display: flex; flex-direction: column; }

        .pf-input-wrap { position: relative; }

        .pf-input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .pf-divider {
          border: none;
          border-top: 1px solid rgba(43, 52, 55, 0.05);
          margin: 32px 0 0;
        }

        .pf-footer {
          padding-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 480px) {
          .pf-footer {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .pf-last-updated {
          font-size: 13px;
          color: rgba(88, 96, 100, 0.55);
          font-style: italic;
          font-family: 'DM Sans', sans-serif;
        }

        .pf-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 36px;
          border-radius: 100px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #1b6d24, #076019);
          color: #e5ffdd;
          box-shadow: 0 12px 24px -6px rgba(27,109,36,0.28);
        }

        .pf-save-btn:hover:not(:disabled) {
          box-shadow: 0 16px 32px -6px rgba(27,109,36,0.38);
          transform: scale(1.02);
        }

        .pf-save-btn:active:not(:disabled) {
          transform: scale(0.96);
        }

        .pf-save-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .pf-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(229,255,221,0.3);
          border-top-color: #e5ffdd;
          border-radius: 50%;
          display: inline-block;
          animation: pf-spin 0.7s linear infinite;
        }

        .pf-alert {
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pf-alert.error {
          background: rgba(159, 64, 61, 0.06);
          border: 1px solid rgba(159, 64, 61, 0.15);
          color: #9f403d;
        }

        .pf-alert.success {
          background: rgba(27, 109, 36, 0.06);
          border: 1px solid rgba(27, 109, 36, 0.15);
          color: #1b6d24;
          font-weight: 500;
        }
      `}</style>

      {error && (
        <div className="pf-alert error">
          <AlertIcon /> {error}
        </div>
      )}
      {success && (
        <div className="pf-alert success">
          <CheckIcon /> Profile updated successfully!
        </div>
      )}

      <div className="pf-grid">
        {/* AD */}
        <div className="pf-field">
          <label style={labelStyle}>FIRST NAME</label>
          <input
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            onFocus={() => setFocused('firstName')}
            onBlur={() => setFocused('')}
            required
            style={inputStyle('firstName')}
          />
        </div>

        {/* SOYAD */}
        <div className="pf-field">
          <label style={labelStyle}>LAST NAME</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            onFocus={() => setFocused('lastName')}
            onBlur={() => setFocused('')}
            required
            style={inputStyle('lastName')}
          />
        </div>

        {/* KULLANICI ADI */}
        <div className="pf-field">
          <label style={labelStyle}>USERNAME</label>
          <div className="pf-input-wrap">
            <input
              value={form.userName}
              onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))}
              onFocus={() => setFocused('userName')}
              onBlur={() => setFocused('')}
              required
              style={{ ...inputStyle('userName'), paddingRight: '44px' }}
            />
            <span className="pf-input-icon">
              <CheckCircleIcon />
            </span>
          </div>
        </div>

        {/* E-POSTA */}
        <div className="pf-field">
          <label style={{ ...labelStyle, color: 'rgba(88, 96, 100, 0.5)' }}>
            EMAIL
          </label>
          <div className="pf-input-wrap">
            <input
              value={profile?.email || ''}
              readOnly
              style={{
                ...inputBase,
                background: 'rgba(241,244,246,0.5)',
                color: 'rgba(43, 52, 55, 0.45)',
                cursor: 'not-allowed',
                paddingRight: '44px',
              }}
            />
            <span className="pf-input-icon" style={{ opacity: 0.3 }}>
              <LockIcon />
            </span>
          </div>
        </div>
      </div>

      <hr className="pf-divider" />

      <div className="pf-footer">
        <span className="pf-last-updated">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button type="submit" disabled={saving} className="pf-save-btn">
          {saving ? (
            <><span className="pf-spinner" /> Saving…</>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1b6d24" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59L6.41 12l1.42-1.42L11 13.17l5.17-5.17 1.42 1.41L11 16.59z"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
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
