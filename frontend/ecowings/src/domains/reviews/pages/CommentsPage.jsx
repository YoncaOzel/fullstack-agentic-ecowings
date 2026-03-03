import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import reviewService from '../services/reviewService';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import apiClient from '../../../shared/services/apiClient';

export default function CommentsPage() {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAirline, setFilterAirline] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterFocus, setFilterFocus] = useState(false);

  useEffect(() => {
    Promise.all([
      reviewService.getReviews(),
      apiClient.get('/api/Airline'),
    ])
      .then(([revRes, airRes]) => {
        if (Array.isArray(revRes.data)) setReviews(revRes.data);
        else setError(revRes.data?.message || 'Yorumlar yüklenemedi.');
        if (Array.isArray(airRes.data)) setAirlines(airRes.data);
      })
      .catch(() => setError('Veriler yüklenirken hata oluştu.'))
      .finally(() => setLoading(false));
  }, []);

  const displayed = filterAirline
    ? reviews.filter((r) => String(r.airlineId) === filterAirline)
    : reviews;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const handleNewReview = (newReview) => {
    if (newReview && newReview.id) setReviews((prev) => [newReview, ...prev]);
    else reviewService.getReviews().then((res) => {
      if (Array.isArray(res.data)) setReviews(res.data);
    });
    setShowForm(false);
  };

  const handleUpdate = (updated) => {
    setReviews((prev) => prev.map((r) => r.id === updated.id ? updated : r));
  };

  const handleDelete = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)' }}>

      {/* ══ Hero ══ */}
      <section style={{
        background: 'linear-gradient(135deg,#080e08 0%,#0d1f0d 40%,#0a1a12 100%)',
        padding: '72px 0 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '420px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.16) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '5%', width: '350px', height: '280px', background: 'radial-gradient(ellipse,rgba(34,197,94,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Star size={11} /> Yolcu Deneyimleri
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.15, margin: '0 0 16px', background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Yorumlar
          </h1>
          <p style={{ color: 'rgba(187,247,208,0.75)', fontSize: '1.05rem', marginBottom: '28px', maxWidth: '480px' }}>
            Havayollarına ait gerçek değerlendirmeleri okuyun ve deneyimlerinizi paylaşın
          </p>

          {/* Stats chips */}
          {!loading && !error && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '30px', padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#bbf7d0' }}>
                💬 {reviews.length} Yorum
              </div>
              {avgRating && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '30px', padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#bbf7d0' }}>
                  <Star size={12} style={{ fill: '#22c55e', color: '#22c55e' }} /> {avgRating} Ortalama
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '30px', padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#bbf7d0' }}>
                ✈️ {airlines.length} Havayolu
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ Filter Bar ══ */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid rgba(34,197,94,0.1)', padding: '20px 0', position: 'sticky', top: '64px', zIndex: 40 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Airline filter */}
            <div style={{ position: 'relative', flex: '0 1 280px' }}>
              <Filter size={13} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: filterFocus ? '#22c55e' : 'rgba(107,114,128,0.7)', pointerEvents: 'none', transition: 'color 0.2s' }} />
              <select
                value={filterAirline}
                onChange={(e) => setFilterAirline(e.target.value)}
                onFocus={() => setFilterFocus(true)}
                onBlur={() => setFilterFocus(false)}
                style={{
                  width: '100%', appearance: 'none', WebkitAppearance: 'none',
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${filterFocus ? '#22c55e' : 'rgba(34,197,94,0.18)'}`,
                  borderRadius: '10px', padding: '10px 38px 10px 38px', color: '#f0fdf4',
                  fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', cursor: 'pointer',
                  boxShadow: filterFocus ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
                  transition: 'border-color 0.2s,box-shadow 0.2s',
                }}
              >
                <option value="" style={{ background: '#0a1a0a' }}>Tüm Havayolları</option>
                {airlines.map((a) => <option key={a.id} value={String(a.id)} style={{ background: '#0a1a0a' }}>{a.name}</option>)}
              </select>
            </div>

            {/* Clear filter */}
            {filterAirline && (
              <button
                onClick={() => setFilterAirline('')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)', color: '#22c55e', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.05)'; }}
              >
                ✕ Filtreyi Kaldır
              </button>
            )}

            {/* Add review CTA */}
            {isAuthenticated && (
              <button
                onClick={() => setShowForm((v) => !v)}
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '10px', border: 'none', background: showForm ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)', color: showForm ? '#22c55e' : '#080e08', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: showForm ? 'none' : '0 3px 14px rgba(34,197,94,0.25)', transition: 'all 0.2s' }}
              >
                <MessageSquarePlus size={14} /> {showForm ? 'Formu Gizle' : 'Yorum Yaz'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ Content ══ */}
      <div style={{ padding: '52px 0 80px', background: 'var(--bg-base)' }}>
        <div className="container">

          {/* Review form (collapsible) */}
          {isAuthenticated && showForm && !loading && (
            <div style={{ marginBottom: '40px', background: 'linear-gradient(160deg,rgba(11,21,11,0.9) 0%,rgba(8,14,8,0.95) 100%)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
              <ReviewForm airlines={airlines} onSuccess={handleNewReview} />
            </div>
          )}

          {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
            <>
              {/* Header */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  <Star size={10} /> {displayed.length} Yorum
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0, background: 'linear-gradient(135deg,#f0fdf4 30%,#4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {filterAirline ? `${airlines.find(a => String(a.id) === filterAirline)?.name || ''} Yorumları` : 'Tüm Yorumlar'}
                </h2>
                <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg,rgba(34,197,94,0.4) 0%,rgba(34,197,94,0.1) 60%,transparent 100%)' }} />
              </div>

              {displayed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '20px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>💭</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Henüz Yorum Yok</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>İlk yorumu siz yapın ve seyahat topluluğuna katkıda bulunun!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '22px', marginBottom: '40px' }}>
                  {displayed.map((r) => (
                    <ReviewCard key={r.id} review={r} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Not logged in — CTA */}
          {!isAuthenticated && !loading && (
            <div style={{ textAlign: 'center', paddingTop: '40px', borderTop: '1px solid rgba(34,197,94,0.1)' }}>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px' }}>
                Yorum eklemek için{' '}
                <Link to="/login" style={{ color: '#22c55e', fontWeight: 600 }}>giriş yapın</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
