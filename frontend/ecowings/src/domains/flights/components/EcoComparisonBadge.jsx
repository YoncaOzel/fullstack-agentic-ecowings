import { Leaf, TrendingDown } from 'lucide-react';

function modeLabel(mode) {
  return mode || 'Alternative';
}

/**
 * ecoComparison: {
 *   flightEmissionKg, alternativeEmissionKg, alternativeMode,
 *   percentageDifference, isAlternativeGreener, savingsCategory
 * }
 * variant: 'card' (compact, uçuş kartı için) | 'checkout' (geniş, checkout için)
 */
export default function EcoComparisonBadge({ ecoComparison, variant = 'card' }) {
  if (!ecoComparison || !ecoComparison.savingsCategory) return null;

  const { alternativeEmissionKg, alternativeMode, percentageDifference } = ecoComparison;
  const modeTR = modeLabel(alternativeMode);
  const pct = Math.round(percentageDifference);

  if (variant === 'checkout') {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: '14px',
        padding: '16px 18px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingDown size={16} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#22c55e', marginBottom: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            A greener alternative exists
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.6 }}>
            Traveling by {modeTR} would emit only{' '}
            <span style={{ fontWeight: 700, color: '#22c55e' }}>{alternativeEmissionKg.toFixed(1)} kg CO₂</span>{' '}
            — <span style={{ fontWeight: 700, color: '#22c55e' }}>{pct}% less</span> than this flight.
          </div>
        </div>
      </div>
    );
  }

  /* variant === 'card' */
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
      marginTop: '6px',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.22)',
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '0.66rem', fontWeight: 700, color: '#16a34a',
        textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap',
      }}>
        <Leaf size={9} />
        {modeTR}: {alternativeEmissionKg.toFixed(1)} kg CO₂
        <span style={{ fontWeight: 600, opacity: 0.8 }}>({pct}% less)</span>
      </div>
    </div>
  );
}
