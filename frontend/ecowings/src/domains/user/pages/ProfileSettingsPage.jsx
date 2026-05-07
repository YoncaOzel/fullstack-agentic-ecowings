import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import userService from '../services/userService';
import ProfileForm from '../components/ProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import MyTicketsTab from '../../tickets/components/MyTicketsTab';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

const TABS = [
  { label: 'Profile', value: 'profile' },
  { label: 'Change Password', value: 'password' },
  { label: 'My Tickets', value: 'tickets' },
];

const TAB_PARAM_MAP = { profile: 0, password: 1, tickets: 2 };

export default function ProfileSettingsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = TAB_PARAM_MAP[searchParams.get('tab')] ?? 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    userService.getProfile()
      .then((res) => {
        if (res.data?.id || res.data?.email) setProfile(res.data);
        else setProfileError(res.data?.message || 'Failed to load profile.');
      })
      .catch(() => setProfileError('An error occurred while loading your profile.'))
      .finally(() => setLoadingProfile(false));
  }, []);

  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : '—';

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?'
    : '?';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        .psp-root {
          min-height: calc(100vh - 64px);
          background: #f8f9fa;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Page header ── */
        .psp-header {
          padding: 56px 0 48px;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 48px;
          padding-right: 48px;
        }

        .psp-header h1 {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 300;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #2b3437;
          margin: 0 0 12px;
        }

        .psp-header p {
          font-size: 0.9rem;
          color: #586064;
          font-weight: 400;
          letter-spacing: 0.01em;
          margin: 0;
          max-width: 480px;
          line-height: 1.6;
        }

        /* ── Pill tab bar ── */
        .psp-tabs {
          max-width: 1200px;
          margin: 0 auto 48px;
          padding: 0 48px;
        }

        .psp-tabs-inner {
          display: inline-flex;
          background: #e3e9ec;
          padding: 6px;
          border-radius: 100px;
          gap: 4px;
        }

        .psp-tab-btn {
          padding: 10px 28px;
          border-radius: 100px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .psp-tab-btn.active {
          background: #ffffff;
          color: #2b3437;
          box-shadow: 0 4px 20px rgba(43, 52, 55, 0.08);
        }

        .psp-tab-btn.inactive {
          background: transparent;
          color: #737c7f;
        }

        .psp-tab-btn.inactive:hover {
          background: #dbe4e7;
          color: #2b3437;
        }

        /* ── Main grid ── */
        .psp-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px 80px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 48px;
          align-items: start;
        }

        /* ── Left avatar card ── */
        .psp-avatar-card {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: sticky;
          top: 88px;
        }

        .psp-avatar-img-wrap {
          aspect-ratio: 4/5;
          border-radius: 12px;
          overflow: hidden;
          background: #eaeff1;
          position: relative;
        }

        .psp-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dbe4e7;
          overflow: hidden;
        }

        .psp-avatar-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(27,109,36,0.92) 0%, transparent 100%);
          padding: 24px 20px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .psp-avatar-name-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 4px;
          font-weight: 400;
        }

        .psp-avatar-name {
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        /* ── Right form panel ── */
        .psp-panel {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(171, 179, 183, 0.15);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.02);
          padding: 48px;
        }

        /* ── Secondary action buttons ── */
        .psp-secondary-actions {
          margin-top: 32px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .psp-action-btn {
          flex: 1;
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 24px;
          border-radius: 12px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .psp-action-btn.neutral {
          background: #f1f4f6;
          color: #2b3437;
        }

        .psp-action-btn.neutral:hover {
          background: #e3e9ec;
        }

        .psp-action-btn.danger {
          background: #f1f4f6;
          color: #9f403d;
        }

        .psp-action-btn.danger:hover {
          background: rgba(159, 64, 61, 0.06);
        }

        /* ── Empty state ── */
        .psp-empty {
          text-align: center;
          padding: 64px 24px;
          color: #737c7f;
        }

        .psp-empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.4;
        }

        .psp-empty h3 {
          font-size: 1rem;
          font-weight: 500;
          color: #2b3437;
          margin: 0 0 8px;
        }

        .psp-empty p {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .psp-body {
            grid-template-columns: 1fr;
            padding: 0 24px 60px;
          }
          .psp-avatar-card {
            position: static;
            max-width: 280px;
          }
          .psp-header, .psp-tabs {
            padding-left: 24px;
            padding-right: 24px;
          }
          .psp-panel {
            padding: 28px 24px;
          }
        }

        @media (max-width: 580px) {
          .psp-tabs-inner {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="psp-root">
        {/* ── Page Header ── */}
        <div className="psp-header">
          <h1>Account Settings</h1>
          <p>Manage your profile preferences and account security settings.</p>
        </div>

        {/* ── Pill Tab Selector ── */}
        <div className="psp-tabs">
          <div className="psp-tabs-inner">
            {TABS.map((tab, i) => (
              <button
                key={tab.value}
                className={`psp-tab-btn ${activeTab === i ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab(i)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="psp-body">

          {/* Left: Avatar card */}
          <div className="psp-avatar-card">
            <div className="psp-avatar-img-wrap">
              <div className="psp-avatar-placeholder" style={{
                background: 'linear-gradient(145deg, #1b6d24 0%, #076019 55%, #004b0f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
                {/* Initials circle */}
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  border: '2px solid rgba(255,255,255,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: '#e5ffdd',
                  letterSpacing: '0.04em',
                  fontFamily: "'DM Sans', sans-serif",
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
              </div>
              <div className="psp-avatar-overlay">
                <div>
                  <div className="psp-avatar-name-label">EcoWings Member</div>
                  <div className="psp-avatar-name">{fullName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Panel */}
          <div>
            <div className="psp-panel">
              {activeTab === 0 && (
                loadingProfile
                  ? <LoadingSpinner />
                  : profileError
                  ? <ErrorMessage message={profileError} />
                  : <ProfileForm profile={profile} onUpdate={setProfile} />
              )}

              {activeTab === 1 && <ChangePasswordForm />}

              {activeTab === 2 && <MyTicketsTab />}
            </div>

            {/* Secondary actions – only show on profile tab */}
            {activeTab === 0 && (
              <div className="psp-secondary-actions">
                <button className="psp-action-btn neutral">
                  <DownloadIcon />
                  Download My Data
                </button>
                <button className="psp-action-btn danger">
                  <DeleteIcon />
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
