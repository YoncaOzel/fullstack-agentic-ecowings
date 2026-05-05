import { useState } from 'react';
import { PenLine, ChevronDown, Star, ShieldCheck } from 'lucide-react';
import reviewService from '../services/reviewService';

export default function ReviewForm({ airlines, onSuccess }) {
  const [form, setForm] = useState({ airlineCode: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [commentFocus, setCommentFocus] = useState(false);
  const [airlineFocus, setAirlineFocus] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.airlineCode) { setError('Havayolu seçin.'); return; }
    if (!form.rating) { setError('Puan verin.'); return; }
    if (!form.comment.trim()) { setError('Yorum yazın.'); return; }

    setSubmitting(true);
    try {
      const res = await reviewService.addReview({
        airlineCode: form.airlineCode,
        rating: form.rating,
        comment: form.comment,
      });
      if (res.status >= 200 && res.status < 300) {
        onSuccess?.(null);
        setForm({ airlineCode: '', rating: 0, comment: '' });
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf3', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PenLine size={17} style={{ color: '#15803d' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Write Review</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '2px' }}>Deneyimini kısa ve net bir şekilde paylaş</p>
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: '999px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#475569',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          <ShieldCheck size={12} />
          Verified Feedback
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px' }}>
          <span style={{ fontSize: '0.85rem', color: '#be123c' }}>⚠ {error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Airline select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Havayolu</label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.airlineCode}
              onChange={(e) => setForm((p) => ({ ...p, airlineCode: e.target.value }))}
              onFocus={() => setAirlineFocus(true)}
              onBlur={() => setAirlineFocus(false)}
              style={{
                width: '100%', appearance: 'none', WebkitAppearance: 'none',
                background: '#ffffff', border: `1px solid ${airlineFocus ? '#14b8a6' : '#dbe3ec'}`,
                borderRadius: '10px', padding: '12px 40px 12px 14px', color: '#0f172a',
                fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none', cursor: 'pointer',
                boxShadow: airlineFocus ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
                transition: 'border-color 0.2s,box-shadow 0.2s',
              }}
            >
              <option value="">Havayolu seçin</option>
              {airlines.map((a) => <option key={a.id} value={a.airlineCode}>{a.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Puan</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((p) => ({ ...p, rating: s }))}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: s <= (hoverRating || form.rating) ? 'translateY(-1px)' : 'translateY(0)',
                  transition: 'transform 0.12s ease',
                }}
                aria-label={`${s} puan`}
              >
                <Star
                  size={24}
                  strokeWidth={1.8}
                  style={{
                    color: s <= (hoverRating || form.rating) ? '#f59e0b' : '#cbd5e1',
                    fill: s <= (hoverRating || form.rating) ? '#fbbf24' : 'transparent',
                    transition: 'all 0.12s ease',
                  }}
                />
              </button>
            ))}
            {form.rating > 0 && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f766e', marginLeft: '8px' }}>{form.rating}/5</span>
            )}
          </div>
        </div>

        {/* Comment textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Yorumunuz</label>
          <textarea
            placeholder="Uçuş deneyiminizi paylaşın…"
            rows={5}
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            onFocus={() => setCommentFocus(true)}
            onBlur={() => setCommentFocus(false)}
            style={{
              width: '100%', background: '#ffffff',
              border: `1px solid ${commentFocus ? '#14b8a6' : '#dbe3ec'}`,
              borderRadius: '10px', padding: '12px 14px', color: '#0f172a',
              fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none', resize: 'vertical',
              lineHeight: 1.6,
              boxShadow: commentFocus ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
              transition: 'border-color 0.2s,box-shadow 0.2s',
            }}
          />
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', textAlign: 'right' }}>
            {form.comment.length} karakter
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px', border: '1px solid transparent',
            background: submitting ? '#94a3b8' : '#0f766e',
            color: '#ffffff', fontWeight: 700, fontSize: '13.5px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 10px 22px rgba(15,118,110,0.22)',
            alignSelf: 'flex-start',
            transition: 'all 0.2s',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#0d6b63'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = submitting ? '#94a3b8' : '#0f766e'; }}
        >
          {submitting ? (
            <>
              <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
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
