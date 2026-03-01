import { useState, useEffect } from 'react';
import userService from '../services/userService';
import ProfileForm from '../components/ProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import CouponCard from '../../coupons/components/CouponCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

const TABS = ['Profil Bilgileri', 'Şifre Değiştir', 'Kuponlarım'];

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    userService.getProfile()
      .then((res) => {
        // Backend düz nesne döndürür: { id, firstName, lastName, email, userName }
        if (res.data?.id || res.data?.email) setProfile(res.data);
        else setProfileError(res.data?.message || 'Profil yüklenemedi.');
      })
      .catch(() => setProfileError('Profil yüklenirken hata oluştu.'))
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 2) return;
    setLoadingCoupons(true);
    userService.getMyCoupons()
      .then((res) => {
        // Backend düz liste döndürür: [...]
        if (Array.isArray(res.data)) setCoupons(res.data);
        else setCouponError(res.data?.message || 'Kuponlar yüklenemedi.');
      })
      .catch(() => setCouponError('Kuponlar yüklenirken hata oluştu.'))
      .finally(() => setLoadingCoupons(false));
  }, [activeTab]);

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '4px' }}>⚙️ Profil Ayarları</h1>
          {profile && (
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>
              {profile.firstName} {profile.lastName} · {profile.email}
            </p>
          )}
        </div>
      </div>

      <div className="container section">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: activeTab === i ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === i ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'color 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          <>
            {loadingProfile ? <LoadingSpinner /> : profileError ? <ErrorMessage message={profileError} /> : (
              <ProfileForm profile={profile} onUpdate={setProfile} />
            )}
          </>
        )}

        {activeTab === 1 && <ChangePasswordForm />}

        {activeTab === 2 && (
          <>
            {loadingCoupons ? <LoadingSpinner /> : couponError ? <ErrorMessage message={couponError} /> : (
              coupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎫</div>
                  <p>Henüz kuponunuz yok.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                </div>
              )
            )}
          </>
        )}
      </div>
    </main>
  );
}
