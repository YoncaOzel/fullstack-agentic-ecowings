import { useState } from 'react';
import reviewService from '../services/reviewService';

export default function ReviewForm({ airlines, onSuccess }) {
  const [form, setForm] = useState({ airlineId: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.airlineId) { setError('Havayolu seçin.'); return; }
    if (!form.rating) { setError('Puan verin.'); return; }
    if (!form.comment.trim()) { setError('Yorum yazın.'); return; }

    setSubmitting(true);
    try {
      const res = await reviewService.addReview({
        airlineId: Number(form.airlineId),
        rating: form.rating,
        comment: form.comment,
      });
      if (res.data?.succeeded) {
        onSuccess?.(res.data.data);
        setForm({ airlineId: '', rating: 0, comment: '' });
      } else {
        setError(res.data?.message || 'Yorum gönderilemedi.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '20px' }}>✍️ Yorum Yaz</h3>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px', padding: '10px 14px', color: '#c53030', fontSize: '0.875rem', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">Havayolu</label>
        <select className="form-input" value={form.airlineId}
          onChange={(e) => setForm((p) => ({ ...p, airlineId: e.target.value }))}>
          <option value="">Havayolu seçin</option>
          {airlines.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">Puan</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              onClick={() => setForm((p) => ({ ...p, rating: s }))}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                cursor: 'pointer',
                fontSize: '1.8rem',
                color: s <= (hoverRating || form.rating) ? 'var(--primary)' : '#ddd',
                transition: 'color 0.1s',
                userSelect: 'none',
              }}
            >★</span>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label">Yorumunuz</label>
        <textarea
          className="form-input"
          placeholder="Uçuş deneyiminizi paylaşın..."
          rows={4}
          value={form.comment}
          onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}
        style={{ padding: '12px 28px' }}>
        {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
      </button>
    </form>
  );
}
