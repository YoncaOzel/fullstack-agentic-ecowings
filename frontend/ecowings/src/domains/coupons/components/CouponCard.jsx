import { formatDateShort } from '../../../shared/utils/formatDate';

export default function CouponCard({ coupon }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code || '');
  };

  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();

  return (
    <div className="card" style={{ border: isExpired ? '1px solid #fca5a5' : '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '4px' }}>Kupon Kodu</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: '1px' }}>
            {coupon.code}
          </div>
        </div>
        <button
          className="btn btn-outline"
          onClick={handleCopy}
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Kodu kopyala"
        >
          📋 Kopyala
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-light)' }}>İndirim: </span>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
            {coupon.discountAmount
              ? `${coupon.discountAmount} ₺`
              : coupon.discountPercentage
              ? `%${coupon.discountPercentage}`
              : '—'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)' }}>Limit: </span>
          <span style={{ fontWeight: 600 }}>{coupon.usageLimit ?? '—'}</span>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ color: 'var(--text-light)' }}>Son Kullanım: </span>
          <span style={{ fontWeight: 600, color: isExpired ? '#ef5350' : 'var(--text-primary)' }}>
            {coupon.expiryDate ? formatDateShort(coupon.expiryDate) : 'Süresiz'}
            {isExpired && ' (Süresi Dolmuş)'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: coupon.isActive && !isExpired ? 'rgba(46,125,50,0.1)' : 'rgba(239,83,80,0.1)',
          color: coupon.isActive && !isExpired ? 'var(--primary)' : '#ef5350',
        }}>
          {coupon.isActive && !isExpired ? '✓ Aktif' : '✗ Pasif'}
        </span>
      </div>
    </div>
  );
}
