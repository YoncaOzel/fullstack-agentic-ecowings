import { useState, useEffect } from 'react';
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

  useEffect(() => {
    Promise.all([
      reviewService.getReviews(),
      apiClient.get('/api/Airline'),
    ])
      .then(([revRes, airRes]) => {
        // Backend doğrudan dizi döndürür: [...]
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

  const handleNewReview = (newReview) => {
    if (newReview && newReview.id) setReviews((prev) => [newReview, ...prev]);
    else reviewService.getReviews().then((res) => {
      if (Array.isArray(res.data)) setReviews(res.data);
    });
  };

  const handleUpdate = (updated) => {
    setReviews((prev) => prev.map((r) => r.id === updated.id ? updated : r));
  };

  const handleDelete = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>💬 Yorumlar</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Havayollarına ait değerlendirmeleri okuyun ve paylaşın</p>
        </div>
      </div>

      <div className="container section">
        {/* Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-input" value={filterAirline}
            onChange={(e) => setFilterAirline(e.target.value)}
            style={{ maxWidth: '240px' }}>
            <option value="">Tüm Havayolları</option>
            {airlines.map((a) => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
          </select>
          {filterAirline && (
            <button className="btn btn-outline" onClick={() => setFilterAirline('')}
              style={{ padding: '8px 14px', fontSize: '0.875rem' }}>
              Filtreyi Kaldır ✕
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
          <>
            <p className="subtitle" style={{ marginBottom: '20px' }}>{displayed.length} yorum</p>
            {displayed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💭</div>
                <p>Henüz yorum yok. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {displayed.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Add review form */}
        {isAuthenticated && !loading && (
          <div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '40px 0' }} />
            <ReviewForm airlines={airlines} onSuccess={handleNewReview} />
          </div>
        )}
        {!isAuthenticated && !loading && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
            Yorum eklemek için{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>giriş yapın</a>.
          </p>
        )}
      </div>
    </main>
  );
}
