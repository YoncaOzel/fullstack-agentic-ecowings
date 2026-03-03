import { useState } from 'react';
import { Copy, Check, Tag, Calendar, Users, Percent } from 'lucide-react';
import { formatDateShort } from '../../../shared/utils/formatDate';

export default function CouponCard({ coupon }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
  const isActive = coupon.isActive && !isExpired;

  const discountLabel = coupon.discountAmount
    ? `${coupon.discountAmount} ₺`
    : coupon.discountPercentage
    ? `%${coupon.discountPercentage}`
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)',
        border: `1px solid ${isActive ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.2)'}`,
        borderLeft: `4px solid ${isActive ? '#22c55e' : '#ef4444'}`,
        borderRadius: '14px',
        padding: '20px',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 30px ${isActive ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.1)'}`
          : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'transform 0.22s,box-shadow 0.22s,border-color 0.22s',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
        background: isActive ? 'radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(239,68,68,0.06) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Discount badge */}
      {discountLabel && (
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: isActive ? 'linear-gradient(135deg,rgba(34,197,94,0.18),rgba(22,163,74,0.12))' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: '20px', padding: '3px 10px',
          fontSize: '11px', fontWeight: 700,
          color: isActive ? '#4ade80' : '#fca5a5',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Percent size={9} />
          {discountLabel}
        </div>
      )}

      {/* Code row */}
      <div style={{ marginBottom: '16px', marginRight: discountLabel ? '70px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <Tag size={11} style={{ color: 'rgba(34,197,94,0.5)' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(34,197,94,0.6)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Kupon Kodu</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '1.25rem', fontWeight: 800, letterSpacing: '3px',
            color: isActive ? '#4ade80' : '#9ca3af',
            fontFamily: "'DM Mono',monospace",
          }}>
            {coupon.code}
          </span>
          <button
            onClick={handleCopy}
            title="Kopyala"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 11px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
              color: copied ? '#4ade80' : 'rgba(240,253,244,0.7)',
              fontSize: '11px', fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            {copied ? <><Check size={11} /> Kopyalandı</> : <><Copy size={11} /> Kopyala</>}
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={12} style={{ color: 'rgba(34,197,94,0.5)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Limit</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0fdf4' }}>{coupon.usageLimit ?? 'Sınırsız'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={12} style={{ color: 'rgba(34,197,94,0.5)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Son Kullanım</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isExpired ? '#fca5a5' : '#f0fdf4' }}>
              {coupon.expiryDate ? formatDateShort(coupon.expiryDate) : 'Süresiz'}
            </div>
          </div>
        </div>
      </div>

      {/* Status chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '20px',
        background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: isActive ? '#22c55e' : '#ef4444',
          display: 'inline-block',
          boxShadow: isActive ? '0 0 5px rgba(34,197,94,0.6)' : 'none',
        }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: isActive ? '#4ade80' : '#fca5a5' }}>
          {isActive ? 'Aktif' : 'Süresi Dolmuş'}
        </span>
      </div>
    </div>
  );
}
