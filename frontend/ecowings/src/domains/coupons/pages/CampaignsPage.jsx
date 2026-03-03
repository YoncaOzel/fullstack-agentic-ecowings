import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import couponService from '../services/couponService';
import CouponCard from '../components/CouponCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

const PROMOS = [
  { icon: '🌱', title: 'Eco İndirim', desc: 'İlk uçuşunuzda %15 indirim — gezginlere özel karşılama fırsatı', badge: '%15' },
  { icon: '✈️', title: 'Sık Uçan Avantajı', desc: '5 uçuşu tamamlayın, 6. biletinizi tamamen ücretsiz alın', badge: '5+1' },
  { icon: '🎂', title: 'Doğum Günü Surprizi', desc: 'Doğum gününüzde uçuşlarınıza özel %20 indirim hediyesi', badge: '%20' },
  { icon: '♻️', title: 'Yeşil Seyahat', desc: 'Düşük karbon salımlı uçuşlarda ekstra %10 indirim', badge: '%10' },
];

export default function CampaignsPage() {
  const { isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    couponService.getMyCoupons()
      .then((res) => {
        if (Array.isArray(res.data)) setCoupons(res.data);
        else setError(res.data?.message || 'Kuponlar yüklenemedi.');
      })
      .catch(() => setError('Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* ══ Hero ══ */}
      <section style={{
        background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)',
        padding: '72px 0 64px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '420px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.16) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '5%', width: '350px', height: '280px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Tag size={11} /> Özel Fırsatlar
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.15, margin: '0 0 16px', background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kampanyalar & Kuponlar
          </h1>
          <p style={{ color: 'rgba(187,247,208,0.75)', fontSize: '1.05rem', maxWidth: '500px' }}>
            {isAuthenticated ? 'Mevcut kuponlarınız ve size özel kampanyalar' : 'EcoWings üyeleri için özel indirimler ve fırsatlar'}
          </p>
        </div>
      </section>

      {/* ══ Content ══ */}
      <div style={{ padding: '60px 0 80px', background: 'var(--bg-base)' }}>
        <div className="container">

          {/* Not authenticated — teaser view */}
          {!isAuthenticated && (
            <>
              {/* Section header */}
              <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  🏷️ Üyelere Özel
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: '0 0 10px', background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Özel Kampanyalar Sizi Bekliyor
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 12px', lineHeight: 1.6 }}>
                  EcoWings üyesi olun, kişisel kuponlarınıza ve sürdürülebilir seyahat fırsatlarına göz atın.
                </p>
                <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent 0%,rgba(34,197,94,0.3) 50%,transparent 100%)', marginTop: '24px' }} />
              </div>

              {/* Promo cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px', marginBottom: '48px' }}>
                {PROMOS.map((p, i) => (
                  <div
                    key={p.title}
                    style={{
                      background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)',
                      border: '1px solid rgba(34,197,94,0.13)',
                      borderRadius: '18px',
                      padding: '28px 22px 24px',
                      position: 'relative', overflow: 'hidden',
                      transition: 'transform 0.2s,box-shadow 0.2s,border-color 0.2s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                      animationDelay: `${i * 80}ms`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(34,197,94,0.12),0 4px 12px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.13)'; }}
                  >
                    {/* Glow blob */}
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

                    {/* Discount badge */}
                    <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.62rem', fontWeight: 800, color: '#080e08', letterSpacing: '0.04em' }}>
                      {p.badge}
                    </div>

                    <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>{p.icon}</div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.title}</h3>
                    <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>

                    {/* Bottom tag */}
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>
                      <CheckCircle2 size={11} /> Üyelere özel
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                background: 'linear-gradient(160deg,rgba(34,197,94,0.07) 0%,rgba(34,197,94,0.02) 100%)',
                border: '1px solid rgba(34,197,94,0.18)',
                borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🎫</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0fdf4', marginBottom: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Kişisel Kuponlarınıza Erişin
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                  Giriş yaparak mevcut indirim kuponlarınızı görebilir ve uçuş rezervasyonlarınızda kullanabilirsiniz.
                </p>
                <Link
                  to="/login"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', color: '#080e08', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.3)'; }}
                >
                  Giriş Yap ve Kuponlarını Gör <ArrowRight size={15} />
                </Link>
              </div>
            </>
          )}

          {/* Authenticated — coupon list */}
          {isAuthenticated && (
            <>
              {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
                <>
                  {coupons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '20px' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎫</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Kuponunuz Bulunmuyor</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Şu an aktif kuponunuz yok. Uçuşlarınız için kampanyaları takip edin.</p>
                    </div>
                  ) : (
                    <>
                      {/* Section header */}
                      <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
                          ✦ Mevcut Kuponlar
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0, background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {coupons.length} Kupon Mevcut
                        </h2>
                        <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg,rgba(34,197,94,0.4) 0%,rgba(34,197,94,0.1) 60%,transparent 100%)' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '22px' }}>
                        {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
