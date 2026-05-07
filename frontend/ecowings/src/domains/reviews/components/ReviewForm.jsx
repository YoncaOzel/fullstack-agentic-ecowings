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
    <form onSubmit={handleSubmit} style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f7f3 0%, #e8f4ed 100%)',
        borderBottom: '1px solid rgba(77,124,95,0.12)',
        padding: '24px 28px',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: '#4d7c5f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(77,124,95,0.25)',
            flexShrink: 0,
          }}>
            <PenLine size={18} color="#ffffff" />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.05rem', fontWeight: 700, color: '#1c2b22', margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2,
            }}>
              Deneyimini Paylaş
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6c8274', margin: '3px 0 0', lineHeight: 1.4 }}>
              Her yorum bir sonraki yolcuya yol gösterir
            </p>
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 11px', borderRadius: '999px',
          background: 'rgba(77,124,95,0.08)',
          border: '1px solid rgba(77,124,95,0.20)',
          color: '#4d7c5f',
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          <ShieldCheck size={12} />
          Doğrulanmış Yorum
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px' }}>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#fff1f2', border: '1px solid #fecdd3',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '20px',
          }}>
            <span style={{ fontSize: '0.85rem', color: '#be123c' }}>⚠ {error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Airline select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 700, color: '#384d3e',
              letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>
              Havayolu
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.airlineCode}
                onChange={(e) => setForm((p) => ({ ...p, airlineCode: e.target.value }))}
                onFocus={() => setAirlineFocus(true)}
                onBlur={() => setAirlineFocus(false)}
                style={{
                  width: '100%', appearance: 'none', WebkitAppearance: 'none',
                  background: '#ffffff',
                  border: `1px solid ${airlineFocus ? '#4d7c5f' : 'rgba(77,124,95,0.22)'}`,
                  borderRadius: '10px', padding: '11px 40px 11px 14px',
                  color: form.airlineCode ? '#1c2b22' : '#8aab96',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
                  boxShadow: airlineFocus ? '0 0 0 3px rgba(77,124,95,0.12)' : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <option value="">Havayolu seçin</option>
                {airlines.map((a) => <option key={a.id} value={a.airlineCode}>{a.name}</option>)}
              </select>
              <ChevronDown size={13} style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#7aaa8a', pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Star rating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 700, color: '#384d3e',
              letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>
              Puan
            </label>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, rating: s }))}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    cursor: 'pointer', border: 'none', background: 'transparent',
                    padding: '2px', lineHeight: 1,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    transform: s <= (hoverRating || form.rating) ? 'translateY(-2px) scale(1.1)' : 'translateY(0) scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                  aria-label={`${s} puan`}
                >
                  <Star
                    size={26}
                    strokeWidth={1.6}
                    style={{
                      color: s <= (hoverRating || form.rating) ? '#f59e0b' : 'rgba(77,124,95,0.20)',
                      fill: s <= (hoverRating || form.rating) ? '#fbbf24' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  />
                </button>
              ))}
              {form.rating > 0 && (
                <span style={{
                  fontSize: '0.8rem', fontWeight: 700, color: '#2f5e42',
                  marginLeft: '10px', letterSpacing: '0.02em',
                }}>
                  {form.rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{
              fontSize: '11px', fontWeight: 700, color: '#384d3e',
              letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>
              Yorumunuz
            </label>
            <textarea
              placeholder="Uçuş deneyiminizi paylaşın…"
              rows={5}
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              onFocus={() => setCommentFocus(true)}
              onBlur={() => setCommentFocus(false)}
              style={{
                width: '100%', background: '#ffffff',
                border: `1px solid ${commentFocus ? '#4d7c5f' : 'rgba(77,124,95,0.22)'}`,
                borderRadius: '10px', padding: '12px 14px',
                color: '#1c2b22', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                outline: 'none', resize: 'vertical', lineHeight: 1.65,
                boxShadow: commentFocus ? '0 0 0 3px rgba(77,124,95,0.12)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '0.73rem', color: '#8aab96', textAlign: 'right' }}>
              {form.comment.length} karakter
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px 24px', borderRadius: '10px', border: 'none', width: '100%',
              background: submitting ? '#9aada0' : 'linear-gradient(135deg, #4d7c5f, #2f5e42)',
              color: '#ffffff', fontWeight: 700, fontSize: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 18px rgba(77,124,95,0.28)',
              transition: 'all 0.2s ease',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              if (!submitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(77,124,95,0.36)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #3d6b50, #254e37)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = submitting ? 'none' : '0 4px 18px rgba(77,124,95,0.28)';
              e.currentTarget.style.background = submitting ? '#9aada0' : 'linear-gradient(135deg, #4d7c5f, #2f5e42)';
            }}
          >
            {submitting ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.35)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Gönderiliyor…
              </>
            ) : (
              <><PenLine size={15} /> Yorumu Gönder</>
            )}
          </button>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
