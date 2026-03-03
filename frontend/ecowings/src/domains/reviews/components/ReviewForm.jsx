import { useState } from 'react';
import { PenLine, ChevronDown } from 'lucide-react';
import reviewService from '../services/reviewService';

export default function ReviewForm({ airlines, onSuccess }) {
  const [form, setForm] = useState({ airlineId: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [commentFocus, setCommentFocus] = useState(false);
  const [airlineFocus, setAirlineFocus] = useState(false);

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
      if (res.status >= 200 && res.status < 300) {
        onSuccess?.(null);
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
    <form onSubmit={handleSubmit}>
      {/* Form title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PenLine size={17} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0fdf4', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Yorum Yaz</h3>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '1px' }}>Seyahat deneyimini topluluğunla paylaş</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px' }}>
          <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>⚠ {error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Airline select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Havayolu</label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.airlineId}
              onChange={(e) => setForm((p) => ({ ...p, airlineId: e.target.value }))}
              onFocus={() => setAirlineFocus(true)}
              onBlur={() => setAirlineFocus(false)}
              style={{
                width: '100%', appearance: 'none', WebkitAppearance: 'none',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${airlineFocus ? '#22c55e' : 'rgba(34,197,94,0.15)'}`,
                borderRadius: '10px', padding: '12px 40px 12px 14px', color: '#f0fdf4',
                fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', cursor: 'pointer',
                boxShadow: airlineFocus ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
                transition: 'border-color 0.2s,box-shadow 0.2s',
              }}
            >
              <option value="" style={{ background: '#0a1a0a' }}>Havayolu seçin</option>
              {airlines.map((a) => <option key={a.id} value={a.id} style={{ background: '#0a1a0a' }}>{a.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(34,197,94,0.6)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Puan</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onClick={() => setForm((p) => ({ ...p, rating: s }))}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  cursor: 'pointer', fontSize: '1.9rem', lineHeight: 1,
                  color: s <= (hoverRating || form.rating) ? '#22c55e' : 'rgba(107,114,128,0.3)',
                  transition: 'color 0.12s,transform 0.1s',
                  display: 'inline-block',
                  transform: s <= (hoverRating || form.rating) ? 'scale(1.2)' : 'scale(1)',
                  userSelect: 'none',
                }}
              >★</span>
            ))}
            {form.rating > 0 && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22c55e', marginLeft: '8px' }}>{form.rating}/5</span>
            )}
          </div>
        </div>

        {/* Comment textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(34,197,94,0.7)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Yorumunuz</label>
          <textarea
            placeholder="Uçuş deneyiminizi paylaşın…"
            rows={4}
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            onFocus={() => setCommentFocus(true)}
            onBlur={() => setCommentFocus(false)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${commentFocus ? '#22c55e' : 'rgba(34,197,94,0.15)'}`,
              borderRadius: '10px', padding: '12px 14px', color: '#f0fdf4',
              fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'vertical',
              lineHeight: 1.6,
              boxShadow: commentFocus ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
              transition: 'border-color 0.2s,box-shadow 0.2s',
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '13px 32px', borderRadius: '10px', border: 'none',
            background: submitting ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
            color: '#080e08', fontWeight: 700, fontSize: '14px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 4px 18px rgba(34,197,94,0.28)',
            alignSelf: 'flex-start',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(34,197,94,0.4)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 4px 18px rgba(34,197,94,0.28)'; }}
        >
          {submitting ? (
            <>
              <span style={{ width: '13px', height: '13px', border: '2px solid rgba(8,14,8,0.3)', borderTopColor: '#080e08', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Gönderiliyor…
            </>
          ) : (
            <><PenLine size={14} /> Yorumu Gönder</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </form>
  );
}
