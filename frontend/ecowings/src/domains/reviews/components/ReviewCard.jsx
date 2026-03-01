import { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import reviewService from '../services/reviewService';
import { formatDateShort } from '../../../shared/utils/formatDate';

function StarRating({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#ffc107' : '#ddd', fontSize: '1rem' }}>★</span>
      ))}
    </span>
  );
}

export default function ReviewCard({ review, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating || 5);
  const [editComment, setEditComment] = useState(review.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === review.userId || user?.userName === review.userName;

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await reviewService.updateReview(review.id, { airlineId: review.airlineId, rating: editRating, comment: editComment });
      // Backend Ok(updatedId) döndürür
      if (res.status >= 200 && res.status < 300) {
        onUpdate?.({ ...review, rating: editRating, comment: editComment });
        setEditing(false);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    setDeleting(true);
    try {
      await reviewService.deleteReview(review.id);
      onDelete?.(review.id);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card">
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Puan</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setEditRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '1.4rem',
                    color: s <= (hoverRating || editRating) ? 'var(--primary)' : '#ddd',
                    transition: 'color 0.1s',
                  }}
                >★</span>
              ))}
            </div>
          </div>
          <textarea
            className="form-input"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              İptal
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 600 }}>{review.userName || 'Anonim'}</span>
            <StarRating rating={review.rating} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '10px' }}>
            "{review.comment}"
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
              {review.createdDate ? formatDateShort(review.createdDate) : ''}
            </span>
            {isOwner && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-outline" onClick={() => setEditing(true)}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                  Düzenle
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    background: 'transparent',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    color: '#ef5350',
                    cursor: 'pointer',
                  }}>
                  {deleting ? '...' : 'Sil'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
