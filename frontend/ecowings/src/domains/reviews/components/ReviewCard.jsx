import { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import reviewService from '../services/reviewService';
import { formatDateShort } from '../../../shared/utils/formatDate';

export default function ReviewCard({ review, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating || 5);
  const [editComment, setEditComment] = useState(review.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentFocus, setCommentFocus] = useState(false);

  const isOwner = user?.id === review.userId || user?.userName === review.userName;
  const initials = (review.userName || '?').slice(0, 1).toUpperCase();
  const hue = (review.userName || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const filled = Math.max(0, Math.min(5, Math.round(review.rating)));

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await reviewService.updateReview(review.id, { airlineId: review.airlineId, rating: editRating, comment: editComment });
      if (res.status >= 200 && res.status < 300) {
        onUpdate?.({ ...review, rating: editRating, comment: editComment });
        setEditing(false);
      }
    } catch { /* silently fail */ } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu yorumu silmek istediÄŸinize emin misiniz?')) return;
    setDeleting(true);
    try {
      await reviewService.deleteReview(review.id);
      onDelete?.(review.id);
    } catch { /* silently fail */ } finally { setDeleting(false); }
  };

  return (
    <div style={{
      background: 'linear-gradient(160deg,#111c11 0%,#0e1a0e 100%)',
      border: '1px solid rgba(34,197,94,0.12)',
      borderLeft: '4px solid rgba(34,197,94,0.45)',
      borderRadius: '16px',
      padding: '26px 24px 22px',
      display: 'flex', flexDirection: 'column', gap: '14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      transition: 'transform 0.2s,box-shadow 0.2s,border-color 0.2s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.1),0 4px 12px rgba(0,0,0,0.4)'; e.currentTarget.style.borderLeftColor = 'rgba(34,197,94,0.7)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'; e.currentTarget.style.borderLeftColor = 'rgba(34,197,94,0.45)'; }}
    >
      {/* Big quote backdrop */}
      <div style={{ position: 'absolute', top: '4px', right: '14px', fontSize: '5.5rem', lineHeight: 1, color: 'rgba(34,197,94,0.06)', fontFamily: 'Georgia,serif', fontWeight: 900, pointerEvents: 'none', userSelect: 'none' }}>&ldquo;</div>

      {editing ? (
        /* â”€â”€ Edit mode â”€â”€ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>Puan</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setEditRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ cursor: 'pointer', fontSize: '1.5rem', color: s <= (hoverRating || editRating) ? '#22c55e' : 'rgba(107,114,128,0.4)', transition: 'color 0.15s,transform 0.1s', display: 'inline-block', transform: s <= (hoverRating || editRating) ? 'scale(1.15)' : 'scale(1)' }}
                >â˜…</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>Yorum</div>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              onFocus={() => setCommentFocus(true)}
              onBlur={() => setCommentFocus(false)}
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${commentFocus ? '#22c55e' : 'rgba(34,197,94,0.15)'}`,
                borderRadius: '10px', padding: '11px 14px', color: '#f0fdf4', fontSize: '14px',
                fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'vertical',
                boxShadow: commentFocus ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none', transition: 'border-color 0.2s,box-shadow 0.2s',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleUpdate}
              disabled={saving}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: saving ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#080e08', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              {saving ? 'Kaydediliyorâ€¦' : 'Kaydet'}
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)', background: 'transparent', color: '#6b7280', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.color = '#bbf7d0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'; e.currentTarget.style.color = '#6b7280'; }}
            >
              Ä°ptal
            </button>
          </div>
        </div>
      ) : (
        /* â”€â”€ View mode â”€â”€ */
        <>
          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < filled ? '#22c55e' : 'none'} stroke={i < filled ? '#22c55e' : '#374151'} strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', marginLeft: '5px' }}>{filled}/5</span>
          </div>

          {/* Comment */}
          <p style={{ color: '#bbf7d0', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic', margin: 0, position: 'relative', zIndex: 1 }}>
            &ldquo;{review.comment}&rdquo;
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(34,197,94,0.1)' }} />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Avatar monogram */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: `linear-gradient(135deg,hsl(${hue},55%,22%) 0%,hsl(${hue},45%,15%) 100%)`,
                border: `1.5px solid hsl(${hue},55%,35%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 800, color: `hsl(${hue},70%,70%)`,
                fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0,
              }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f0fdf4' }}>{review.userName || 'Anonim'}</div>
                {review.createdDate && (
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '1px' }}>
                    {formatDateShort(review.createdDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setEditing(true)}
                  style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '7px', color: '#22c55e', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.18)'; }}
                >
                  DÃ¼zenle
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#f87171', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                >
                  {deleting ? 'â€¦' : 'Sil'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
