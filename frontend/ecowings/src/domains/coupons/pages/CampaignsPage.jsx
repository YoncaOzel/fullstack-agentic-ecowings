import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import couponService from '../services/couponService';
import CouponCard from '../components/CouponCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

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
        // Backend doğrudan dizi döndürür: [...]
        if (Array.isArray(res.data)) setCoupons(res.data);
        else setError(res.data?.message || 'Kuponlar yüklenemedi.');
      })
      .catch(() => setError('Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>🎁 Kampanyalar & Kuponlar</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            {isAuthenticated ? 'Mevcut kuponlarınız ve kampanyalar' : 'Size özel fırsatları kaçırmayın'}
          </p>
        </div>
      </div>

      <div className="container section">
        {!isAuthenticated ? (
          <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏷️</div>
            <h2 style={{ marginBottom: '12px' }}>Özel Kampanyalar Sizi Bekliyor</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7 }}>
              EcoWings üyeleri özel indirim kuponları ve kampanyalardan yararlanır.
              Giriş yaparak kişisel kuponlarınızı görün.
            </p>

            {/* Static promotion cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px', textAlign: 'left' }}>
              {[
                { icon: '🌱', title: 'Eco İndirim', desc: 'İlk uçuşunuzda %15 indirim' },
                { icon: '✈️', title: 'Sık Uçan Avantajı', desc: '5 uçuşta 1 bedava' },
                { icon: '🎂', title: 'Doğum Günü Surprizi', desc: 'Özel günlerde %20 indirim' },
              ].map((p) => (
                <div key={p.title} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{p.icon}</div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>

            <Link to="/login" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
              Giriş Yap ve Kuponlarını Gör
            </Link>
          </div>
        ) : (
          <>
            {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
              <>
                {coupons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎫</div>
                    <h3>Kuponunuz bulunmuyor</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                      Şu an aktif kuponunuz yok. Uçuşlarınız için kampanyaları takip edin.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="subtitle" style={{ marginBottom: '20px' }}>{coupons.length} kupon mevcut</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
