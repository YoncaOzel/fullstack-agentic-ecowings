import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Mail, Settings, Key, Tag, Shield, Ticket } from 'lucide-react';
import userService from '../services/userService';
import ProfileForm from '../components/ProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import CouponCard from '../../coupons/components/CouponCard';
import MyTicketsTab from '../../tickets/components/MyTicketsTab';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

const TABS = [
  { label: 'Profil Bilgileri', icon: User },
  { label: 'Şifre Değiştir', icon: Key },
  { label: 'Kuponlarım', icon: Tag },
  { label: 'Biletlerim', icon: Ticket },
];

const TAB_PARAM_MAP = { profile: 0, password: 1, coupons: 2, tickets: 3 };

export default function ProfileSettingsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = TAB_PARAM_MAP[searchParams.get('tab')] ?? 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    userService.getProfile()
      .then((res) => {
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
        if (Array.isArray(res.data)) setCoupons(res.data);
        else setCouponError(res.data?.message || 'Kuponlar yüklenemedi.');
      })
      .catch(() => setCouponError('Kuponlar yüklenirken hata oluştu.'))
      .finally(() => setLoadingCoupons(false));
  }, [activeTab]);

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?'
    : '?';
  const hue = (profile?.userName || profile?.email || '')
    .split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* ══ Hero ══ */}
      <section style={{
        background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)',
        padding: '64px 0 56px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '5%', width: '320px', height: '280px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '22px', flexShrink: 0,
              background: `linear-gradient(135deg, hsl(${hue},55%,22%) 0%, hsl(${hue},45%,14%) 100%)`,
              border: `2px solid hsl(${hue},55%,35%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 900, color: `hsl(${hue},70%,75%)`,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              boxShadow: `0 8px 28px hsl(${hue},55%,10%)`,
            }}>
              {initials}
            </div>

            {/* Name & email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                <Settings size={10} /> Profil Ayarları
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: '0 0 8px', lineHeight: 1.15, color: '#1a4d33' }}>
                {profile ? `${profile.firstName} ${profile.lastName}` : 'Profilim'}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {profile?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.78rem', color: '#9ca3af' }}>
                    <Mail size={11} /> {profile.email}
                  </div>
                )}
                {profile?.userName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.78rem', color: '#4ade80' }}>
                    <Shield size={11} /> @{profile.userName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Content ══ */}
      <div style={{ padding: '48px 0 80px', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', background: '#f0f7f2', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '14px', padding: '6px' }}>
            {TABS.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                onClick={() => setActiveTab(i)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  padding: '11px 16px', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Plus Jakarta Sans',sans-serif",
                  background: activeTab === i
                    ? '#ffffff'
                    : 'transparent',
                  color: activeTab === i ? '#166534' : '#6b7280',
                  border: activeTab === i ? '1px solid rgba(34,197,94,0.28)' : '1px solid transparent',
                  boxShadow: activeTab === i ? '0 2px 8px rgba(34,197,94,0.12)' : 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (activeTab !== i) { e.currentTarget.style.color = '#166534'; e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; } }}
                onMouseLeave={e => { if (activeTab !== i) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(34,197,94,0.14)',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 4px 24px rgba(77,124,95,0.07)',
          }}>
            {activeTab === 0 && (
              loadingProfile ? <LoadingSpinner /> : profileError ? <ErrorMessage message={profileError} /> : (
                <ProfileForm profile={profile} onUpdate={setProfile} />
              )
            )}

            {activeTab === 1 && <ChangePasswordForm />}

            {activeTab === 3 && <MyTicketsTab />}

            {activeTab === 2 && (
              loadingCoupons ? <LoadingSpinner /> : couponError ? <ErrorMessage message={couponError} /> : (
                coupons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>🎫</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Kuponunuz Bulunmuyor</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Şu an aktif kuponunuz yok. Kampanyaları takip edin.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tag size={15} style={{ color: '#22c55e' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Kuponlarım</h2>
                        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>{coupons.length} kupon mevcut</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '18px' }}>
                      {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                    </div>
                  </>
                )
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
