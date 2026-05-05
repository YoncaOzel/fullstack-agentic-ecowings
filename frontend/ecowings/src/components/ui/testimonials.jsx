import { Card } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Star } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const str = String(name).trim();
  if (!str) return '?';
  const parts = str.split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// userName'den deterministik bir avatar index üretir (1-70 arası)
function getAvatarIndex(name) {
  if (!name) return 1;
  const str = String(name);
  const hash = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 70) + 1;
}

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', marginTop: '6px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          style={{
            fill: star <= rating ? '#f59e0b' : '#e5e7eb',
            color: star <= rating ? '#f59e0b' : '#e5e7eb',
          }}
        />
      ))}
    </div>
  );
}

function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export default function WallOfLoveSection({ reviews = [], airlines = [], loading = false }) {
  const getAirlineName = (airlineId) => {
    const found = airlines.find((a) => String(a.id) === String(airlineId));
    return found ? found.name : null;
  };

  if (loading) return null;

  if (reviews.length === 0) {
    return (
      <section style={{ padding: '64px 0' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', padding: '80px 20px', borderRadius: '16px', border: '1px solid #f3f4f6', background: '#fafafa' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💭</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>No Reviews Yet</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Be the first to share your travel experience!</p>
          </div>
        </div>
      </section>
    );
  }

  const chunks = chunkArray(reviews, Math.ceil(reviews.length / 3) || 1);

  return (
    <section style={{ padding: '64px 0 96px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            Passenger Reviews
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Real experiences from real travellers
          </p>
        </div>

        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {chunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chunk.map((review, index) => {
                const airlineName = getAirlineName(review.airlineId);
                const displayName = review.userName || review.username || 'Anonymous';
                const initials = getInitials(review.userName || review.username || review.userId);
                const avatarIndex = getAvatarIndex(review.userName || review.username);
                const avatarSrc = `https://randomuser.me/api/portraits/men/${avatarIndex}.jpg`;

                return (
                  <Card key={review.id || index}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', padding: '20px' }}>
                      <Avatar style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        <AvatarImage
                          alt={displayName}
                          src={avatarSrc}
                          loading="lazy"
                          width="120"
                          height="120"
                        />
                        <AvatarFallback style={{ background: '#f0fdf4', color: '#4d7c5f', fontSize: '0.75rem', fontWeight: 700 }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827', marginBottom: '2px' }}>
                          {displayName}
                        </h3>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', letterSpacing: '0.025em' }}>
                          {airlineName || 'Passenger'}
                        </span>

                        {review.rating && <StarRating rating={review.rating} />}

                        <blockquote>
                          <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.6' }}>
                            {review.comment || review.content || review.text || ''}
                          </p>
                        </blockquote>

                        {(review.createdAt || review.createdDate) && (
                          <p style={{ fontSize: '0.7rem', color: '#d1d5db', marginTop: '10px' }}>
                            {new Date(review.createdAt || review.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
