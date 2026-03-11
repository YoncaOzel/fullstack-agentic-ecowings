import { useState, useEffect } from 'react';
import { Gift, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import couponService from '../../coupons/services/couponService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function GiftTicketPage() {
  const { isAdmin } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: '', couponId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userIdFocus, setUserIdFocus] = useState(false);
  const [couponFocus, setCouponFocus] = useState(false);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    couponService.getAllCoupons()
      .then((res) => {
        if (Array.isArray(res.data)) setCoupons(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.userId.trim()) { setError('KullanÄ±cÄ± ID gerekli.'); return; }
    if (!form.couponId) { setError('Kupon seÃ§in.'); return; }
    setSubmitting(true);
    try {
      const res = await couponService.giftCoupon({ userId: form.userId.trim(), couponId: Number(form.couponId) });
      if (res.status >= 200 && res.status < 300) {
        setSuccess('Kupon baÅŸarÄ±yla hediye edildi!');
        setForm({ userId: '', couponId: '' });
      } else {
        setError(res.data?.message || 'Ä°ÅŸlem baÅŸarÄ±sÄ±z.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluÅŸtu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* â•â• Hero â•â• */}
      <section style={{
        background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)',
        padding: '72px 0 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '420px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.16) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Gift size={11} /> Hediye GÃ¶nder
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.15, margin: '0 0 16px', color: '#1a4d33' }}>
            Biletlerime Hediye Et
          </h1>
          <p style={{ color: 'rgba(187,247,208,0.75)', fontSize: '1.05rem', maxWidth: '480px' }}>
            Kupon veya bilet hediye edin â€” sevdiklerinizin seyahat hayallerini gerÃ§eÄŸe dÃ¶nÃ¼ÅŸtÃ¼rÃ¼n
          </p>
        </div>
      </section>

      {/* â•â• Content â•â• */}
      <div style={{ padding: '60px 0 80px', background: 'var(--bg-base)' }}>
        <div className="container">

          {loading ? (
            <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
              <LoadingSpinner />
            </div>

          ) : !isAdmin ? (
            /* â”€â”€ Not admin â”€â”€ */
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(34,197,94,0.13)',
                borderRadius: '22px', overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              }}>
                {/* Top strip */}
                <div style={{ height: '4px', background: 'linear-gradient(90deg,rgba(239,68,68,0.6) 0%,rgba(239,68,68,0.2) 100%)' }} />

                <div style={{ padding: '44px 36px', textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Lock size={30} style={{ color: '#f87171' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a4d33', marginBottom: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Yetkisiz Erişim</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto 24px' }}>
                    Bu sayfa yalnÄ±zca admin kullanÄ±cÄ±lar iÃ§indir. Bilet hediye etme Ã¶zelliÄŸi geliÅŸtirme aÅŸamasÄ±ndadÄ±r.
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '12px', padding: '16px 20px', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>ğŸ“Œ Bilgi:</span> KullanÄ±cÄ±dan kullanÄ±cÄ±ya bilet hediyesi iÃ§in backend&apos;de{' '}
                      <code style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80', padding: '1px 6px', borderRadius: '4px', fontFamily: "'DM Mono',monospace", fontSize: '0.78rem' }}>
                        POST /api/Ticket/gift
                      </code>{' '}
                      endpoint&apos;i eklenmesi gerekmektedir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* â”€â”€ Admin form â”€â”€ */
            <div style={{ maxWidth: '560px' }}>
              {/* Section heading */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  âœ¦ Admin Paneli
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0, color: '#1a4d33' }}>
                  Kupon Hediye Et
                </h2>
                <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg,rgba(34,197,94,0.4) 0%,rgba(34,197,94,0.1) 60%,transparent 100%)' }} />
              </div>

              {/* Form card */}
              <div style={{
                background: 'linear-gradient(160deg,rgba(11,21,11,0.9) 0%,rgba(8,14,8,0.95) 100%)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '22px', padding: '36px',
                boxShadow: '0 20px 56px rgba(0,0,0,0.5),inset 0 1px 0 rgba(34,197,94,0.08)',
                backdropFilter: 'blur(24px)',
              }}>

                {/* Success */}
                {success && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
                    <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', color: '#bbf7d0', fontWeight: 600 }}>{success}</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.88rem', color: '#fca5a5' }}>âš  {error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                  {/* User ID */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                      KullanÄ±cÄ± ID
                    </label>
                    <input
                      placeholder="Hediye edeceÄŸiniz kullanÄ±cÄ±nÄ±n ID&apos;si"
                      value={form.userId}
                      onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                      onFocus={() => setUserIdFocus(true)}
                      onBlur={() => setUserIdFocus(false)}
                      style={{
                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${userIdFocus ? '#22c55e' : 'rgba(34,197,94,0.2)'}`,
                        borderRadius: '10px', padding: '13px 16px', color: '#f0fdf4',
                        fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none',
                        width: '100%', transition: 'border-color 0.2s,box-shadow 0.2s',
                        boxShadow: userIdFocus ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                      }}
                    />
                  </div>

                  {/* Coupon select */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                      Kupon SeÃ§
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={form.couponId}
                        onChange={(e) => setForm((p) => ({ ...p, couponId: e.target.value }))}
                        onFocus={() => setCouponFocus(true)}
                        onBlur={() => setCouponFocus(false)}
                        style={{
                          width: '100%', appearance: 'none', WebkitAppearance: 'none',
                          background: 'rgba(255,255,255,0.04)', border: `1px solid ${couponFocus ? '#22c55e' : 'rgba(34,197,94,0.2)'}`,
                          borderRadius: '10px', padding: '13px 40px 13px 16px', color: '#f0fdf4',
                          fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', cursor: 'pointer',
                          boxShadow: couponFocus ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                          transition: 'border-color 0.2s,box-shadow 0.2s',
                        }}
                      >
                        <option value="" style={{ background: '#0a1a0a' }}>Kupon seÃ§in</option>
                        {coupons.map((c) => (
                          <option key={c.id} value={c.id} style={{ background: '#0a1a0a' }}>
                            {c.code}{c.discountAmount ? ` â€” ${c.discountAmount}â‚º` : c.discountPercentage ? ` â€” %${c.discountPercentage}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(34,197,94,0.6)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '15px', borderRadius: '12px', border: 'none',
                      background: submitting ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                      color: '#080e08', fontWeight: 700, fontSize: '15px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      boxShadow: submitting ? 'none' : '0 4px 20px rgba(34,197,94,0.3)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.45)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 4px 20px rgba(34,197,94,0.3)'; }}
                  >
                    {submitting ? (
                      <>
                        <span style={{ width: '15px', height: '15px', border: '2px solid rgba(8,14,8,0.35)', borderTopColor: '#080e08', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        GÃ¶nderiliyorâ€¦
                      </>
                    ) : (
                      <><Gift size={15} /> Hediye Et</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </main>
  );
}
