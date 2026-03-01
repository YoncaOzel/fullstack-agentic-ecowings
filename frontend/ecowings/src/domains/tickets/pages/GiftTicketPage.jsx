import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import couponService from '../../coupons/services/couponService';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function GiftTicketPage() {
  const { isAdmin } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: '', couponId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    couponService.getAllCoupons()
      .then((res) => {
        // Backend doğrudan dizi döndürür: [...]
        if (Array.isArray(res.data)) setCoupons(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.userId.trim()) { setError('Kullanıcı ID gerekli.'); return; }
    if (!form.couponId) { setError('Kupon seçin.'); return; }
    setSubmitting(true);
    try {
      const res = await couponService.giftCoupon({ userId: form.userId.trim(), couponId: Number(form.couponId) });
      // Backend Ok(couponCode) döndürür
      if (res.status >= 200 && res.status < 300) {
        setSuccess('Kupon başarıyla hediye edildi! ✅');
        setForm({ userId: '', couponId: '' });
      } else {
        setError(res.data?.message || 'İşlem başarısız.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>🎁 Biletlerime Hediye Et</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Kupon veya bilet hediye edin</p>
        </div>
      </div>

      <div className="container section">
        {loading ? <LoadingSpinner /> : !isAdmin ? (
          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
              <h3 style={{ marginBottom: '8px' }}>Yetkisiz Erişim</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Bu sayfa yalnızca admin kullanıcılar içindir.
                Bilet hediye etme özelliği geliştirme aşamasındadır.
              </p>
              <div style={{
                marginTop: '20px',
                padding: '14px',
                background: 'var(--bg-section-alt)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                textAlign: 'left',
              }}>
                <strong>📌 Bilgi:</strong> Kullanıcıdan kullanıcıya bilet hediyesi için backend'de
                <code style={{ background: '#e8f5e9', padding: '2px 6px', borderRadius: '4px', margin: '0 4px' }}>
                  POST /api/Ticket/gift
                </code>
                endpoint'i eklenmesi gerekmektedir.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '480px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Kupon Hediye Et</h3>

              {error && <ErrorMessage message={error} />}
              {success && (
                <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: '8px', padding: '10px 14px', color: '#276749', marginBottom: '16px' }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Kullanıcı ID</label>
                  <input className="form-input" placeholder="Hediye edeceğiniz kullanıcının ID'si"
                    value={form.userId} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Kupon Seç</label>
                  <select className="form-input" value={form.couponId}
                    onChange={(e) => setForm((p) => ({ ...p, couponId: e.target.value }))}>
                    <option value="">Kupon seçin</option>
                    {coupons.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} {c.discountAmount ? `— ${c.discountAmount}₺` : c.discountPercentage ? `— %${c.discountPercentage}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}
                  style={{ padding: '12px 28px', alignSelf: 'flex-start' }}>
                  {submitting ? 'Gönderiliyor...' : '🎁 Hediye Et'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
