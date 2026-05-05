import { useState } from 'react';
import { formatDateShort } from '../../../shared/utils/formatDate';

export default function CouponCard({ coupon, variant = 'active' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
  const isUsed = coupon.isUsed;
  const isInactive = !coupon.isActive || isExpired || isUsed;

  const discountLabel = coupon.discountAmount
    ? `${coupon.discountAmount} TL`
    : coupon.discountPercentage
    ? `${coupon.discountPercentage}% Off`
    : null;

  const statusLabel = isUsed ? 'USED' : isExpired ? 'EXPIRED' : 'ACTIVE';
  const expiryFormatted = coupon.expiryDate ? formatDateShort(coupon.expiryDate) : null;

  if (variant === 'used') {
    return (
      <div style={{
        padding: '24px',
        background: '#f1f4f6',
        borderRadius: '12px',
        opacity: 0.6,
        filter: 'grayscale(0.5)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <TicketIcon />
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#586064',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {statusLabel}
          </span>
        </div>
        <h4 style={{
          fontSize: '15px',
          fontWeight: 500,
          color: '#2b3437',
          margin: '0 0 6px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {coupon.name || coupon.code}
        </h4>
        {expiryFormatted && (
          <p style={{
            fontSize: '10px',
            color: '#737c7f',
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Expires: {expiryFormatted}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="coupon-card-active" style={{
      background: '#f1f4f6',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(43,52,55,0.04)',
      transition: 'box-shadow 0.5s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 60px rgba(43,52,55,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 10px 40px rgba(43,52,55,0.04)'}
    >
      <style>{`
        .coupon-card-active:hover .coupon-thumb { transform: scale(1.05); }
      `}</style>

      {/* Thumbnail strip */}
      <div style={{ height: '140px', overflow: 'hidden', background: '#dbe4e7', position: 'relative', flexShrink: 0 }}>
        <div
          className="coupon-thumb"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1b6d24 0%, #076019 60%, #004b0f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.7s ease',
          }}
        >
          <LargeTicketIcon />
        </div>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(27,109,36,0.08)',
          mixBlendMode: 'multiply',
        }} />
      </div>

      {/* Body */}
      <div style={{
        flexGrow: 1,
        padding: '28px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{ marginBottom: '24px' }}>
          {discountLabel && (
            <span style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '26px',
              letterSpacing: '-0.04em',
              color: '#1b6d24',
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: '6px',
            }}>
              {discountLabel}
            </span>
          )}
          <h3 style={{
            fontSize: '17px',
            fontWeight: 500,
            color: '#2b3437',
            margin: '0 0 8px',
            lineHeight: 1.35,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {coupon.name || 'Special Coupon'}
          </h3>
          {coupon.description && (
            <p style={{
              fontSize: '12px',
              color: '#586064',
              lineHeight: 1.6,
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              opacity: 0.8,
            }}>
              {coupon.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{
            background: '#f1f4f6',
            padding: '8px 16px',
            borderRadius: '8px',
          }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              letterSpacing: '0.12em',
              fontWeight: 700,
              color: '#2b3437',
            }}>
              {coupon.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#1b6d24',
              fontFamily: "'DM Sans', sans-serif",
              padding: '4px 0',
              textDecoration: copied ? 'underline' : 'none',
              textUnderlineOffset: '4px',
              transition: 'text-decoration 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => { if (!copied) e.currentTarget.style.textDecoration = 'none'; }}
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#737c7f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <line x1="9" y1="9" x2="9" y2="15"/>
    </svg>
  );
}

function LargeTicketIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <line x1="9" y1="9" x2="9" y2="15"/>
    </svg>
  );
}
