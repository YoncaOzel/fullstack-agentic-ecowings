import { useState } from 'react';
import { Leaf, Loader2, AlertCircle } from 'lucide-react';
import flightService from '../services/flightService';
import EcoComparisonBadge from './EcoComparisonBadge';

function buildEcoComparison(alt, carbonEmissionKg) {
  const flightKg = carbonEmissionKg || 0;
  const pct = flightKg > 0 ? ((flightKg - alt.emissionKg) / flightKg) * 100 : 0;
  const savingsCategory =
    pct >= 95 ? 'HIGH' :
    pct >= 85 ? 'MEDIUM' :
    pct >= 70 ? 'LOW' :
    null;
  return {
    flightEmissionKg: flightKg,
    alternativeEmissionKg: alt.emissionKg,
    alternativeMode: alt.mode,
    percentageDifference: pct,
    isAlternativeGreener: alt.emissionKg < flightKg,
    savingsCategory,
  };
}

export default function EcoCheckButton({ origin, destination, carbonEmissionKg, theme = 'dark' }) {
  const [status, setStatus] = useState('idle');
  const [ecoData, setEcoData] = useState(null);

  const isDark = theme === 'dark';

  const handleCheck = async () => {
    if (!origin || !destination) return;
    setStatus('loading');
    try {
      const res = await flightService.getAlternativeTransport(origin, destination);
      const alt = res.data?.data;
      if (!alt || alt.mode === 'There is no reasonable alternative way') {
        setStatus('no-alt');
        return;
      }
      setEcoData(buildEcoComparison(alt, carbonEmissionKg));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done' && ecoData) {
    return <EcoComparisonBadge ecoComparison={ecoData} variant="card" />;
  }

  if (status === 'loading') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '0.65rem', fontWeight: 600,
        color: isDark ? '#6b7280' : '#64748b',
      }}>
        <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
        Hesaplanıyor...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'no-alt') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '0.64rem', fontWeight: 600,
        color: isDark ? '#6b7280' : '#94a3b8',
      }}>
        <Leaf size={9} />
        Alternatif yol yok
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={handleCheck}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: '0.64rem', fontWeight: 600,
          color: isDark ? '#f87171' : '#ef4444',
        }}
      >
        <AlertCircle size={9} />
        Tekrar dene
      </button>
    );
  }

  /* idle */
  return (
    <button
      onClick={handleCheck}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: isDark ? 'rgba(34,197,94,0.07)' : 'rgba(15,118,110,0.06)',
        border: isDark ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(15,118,110,0.18)',
        borderRadius: '999px',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '0.64rem', fontWeight: 700,
        color: isDark ? '#4ade80' : '#0f766e',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark ? 'rgba(34,197,94,0.14)' : 'rgba(15,118,110,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDark ? 'rgba(34,197,94,0.07)' : 'rgba(15,118,110,0.06)';
      }}
    >
      <Leaf size={9} />
      Eco Karşılaştır
    </button>
  );
}
