import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, PenLine, X } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import reviewService from '../services/reviewService';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import apiClient from '../../../shared/services/apiClient';
import { ScrollFlyIn } from '../../../components/ui/hero-section-3';
import WallOfLoveSection from '../../../components/ui/testimonials';

export default function CommentsPage() {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAirline, setFilterAirline] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    Promise.all([
      reviewService.getReviews(),
      apiClient.get('/api/Airline'),
    ])
      .then(([revRes, airRes]) => {
        if (Array.isArray(revRes.data)) setReviews(revRes.data);
        else setError(revRes.data?.message || 'Could not load reviews.');
        if (Array.isArray(airRes.data)) setAirlines(airRes.data);
      })
      .catch(() => setError('Failed to load data. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayed = filterAirline
    ? reviews.filter((r) => String(r.airlineId) === filterAirline)
    : reviews;

  const selectedAirline = airlines.find(a => String(a.id) === filterAirline);

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
    <main style={{ minHeight: 'calc(100vh - 64px)', background: '#ffffff' }}>

      {/* ══ Hero ══ */}
      <ScrollFlyIn
        imageUrl="https://cdn.prod.website-files.com/661fdce3e735db03332bf817/66223004372c7c1124c1b0d1_Top-view2x-p-2000.webp"
        imageAlt="Aerial view of a plane"
        stats={!loading && reviews.length > 0 ? [
          { value: reviews.length, label: 'Reviews' },
          { value: airlines.length, label: 'Airlines' },
          { value: reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '—', label: 'Avg Rating' },
        ] : undefined}
      >
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7aaa8a', marginBottom: '12px' }}>
            Passenger Experiences
          </p>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, color: '#4d7c5f', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 24px' }}>
            Real reviews,<br />real journeys
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#6c8274', maxWidth: '520px', margin: '0 auto' }}>
            Read genuine airline reviews and share your own travel experience
          </p>
        </div>
      </ScrollFlyIn>

      {/* ══ Filter Bar ══ */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '14px 0',
        position: 'sticky',
        top: '64px',
        zIndex: 40,
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* Custom airline dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${dropdownOpen || filterAirline ? '#4d7c5f' : '#e2e8f0'}`,
                  background: filterAirline ? '#f0f7f3' : '#fff',
                  color: filterAirline ? '#4d7c5f' : '#64748b',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '13px', color: filterAirline ? '#4d7c5f' : '#94a3b8' }}>✈</span>
                {selectedAirline ? selectedAirline.name : 'All Airlines'}
                <ChevronDown
                  size={13}
                  style={{
                    marginLeft: '2px',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    color: filterAirline ? '#4d7c5f' : '#94a3b8',
                  }}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  minWidth: '200px',
                  background: '#fff',
                  border: '1px solid #e8edf2',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  {/* All Airlines option */}
                  <button
                    onClick={() => { setFilterAirline(''); setDropdownOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 14px',
                      background: !filterAirline ? '#f8faf9' : 'transparent',
                      border: 'none',
                      fontSize: '13.5px',
                      color: !filterAirline ? '#4d7c5f' : '#374151',
                      fontWeight: !filterAirline ? 600 : 400,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                    onMouseEnter={e => { if (filterAirline) e.currentTarget.style.background = '#f8faf9'; }}
                    onMouseLeave={e => { if (filterAirline) e.currentTarget.style.background = 'transparent'; }}
                  >
                    All Airlines
                  </button>
                  {airlines.map((a) => {
                    const isActive = String(a.id) === filterAirline;
                    return (
                      <button
                        key={a.id}
                        onClick={() => { setFilterAirline(String(a.id)); setDropdownOpen(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '9px 14px',
                          background: isActive ? '#f0f7f3' : 'transparent',
                          border: 'none',
                          fontSize: '13.5px',
                          color: isActive ? '#4d7c5f' : '#374151',
                          fontWeight: isActive ? 600 : 400,
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8faf9'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active filter chip */}
            {filterAirline && selectedAirline && (
              <button
                onClick={() => setFilterAirline('')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px 5px 12px',
                  borderRadius: '999px',
                  border: '1px solid #c7ddd0',
                  background: '#eef6f1',
                  color: '#4d7c5f',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {selectedAirline.name}
                <X size={11} strokeWidth={2.5} />
              </button>
            )}

            {/* Review count */}
            {!loading && !error && (
              <span style={{ color: '#b0b8c1', fontSize: '13px', fontWeight: 400 }}>
                {displayed.length} {displayed.length === 1 ? 'review' : 'reviews'}
              </span>
            )}

            {/* Write review button */}
            {isAuthenticated && (
              <button
                onClick={() => setShowForm(v => !v)}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: showForm ? '1px solid #c7ddd0' : '1px solid transparent',
                  background: showForm ? '#fff' : '#4d7c5f',
                  color: showForm ? '#4d7c5f' : '#fff',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                <PenLine size={13} />
                {showForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ Content ══ */}
      <div style={{ background: '#ffffff', paddingBottom: '80px' }}>
        <div className="container">

          {isAuthenticated && showForm && !loading && (
            <div style={{
              margin: '32px 0',
              background: '#ffffff',
              border: '1px solid rgba(77,124,95,0.16)',
              borderTop: '3px solid #4d7c5f',
              borderRadius: '20px',
              padding: '0',
              boxShadow: '0 4px 24px rgba(77,124,95,0.10), 0 1px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}>
              <ReviewForm airlines={airlines} onSuccess={handleNewReview} />
            </div>
          )}

          {loading ? (
            <div style={{ padding: '80px 0' }}>
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div style={{ padding: '40px 0' }}>
              <ErrorMessage message={error} />
            </div>
          ) : (
            <WallOfLoveSection
              reviews={displayed}
              airlines={airlines}
              loading={loading}
            />
          )}

          {!isAuthenticated && !loading && (
            <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                <Link to="/login" style={{ color: '#4d7c5f', fontWeight: 600 }}>Sign in</Link> to write a review.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══ Bottom Info Section ══ */}
      <div style={{ background: '#f7fbf8' }}>
        {/* Divider wave */}
        <div style={{ lineHeight: 0, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0,32 C360,0 1080,64 1440,32 L1440,0 L0,0 Z" fill="#ffffff" />
          </svg>
        </div>

        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '56px 24px 72px' }}>
          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#7aaa8a', marginBottom: '10px' }}>
              Why it matters
            </p>
            <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, color: '#1c2b22', lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 auto', maxWidth: '560px' }}>
              Every review helps someone fly smarter
            </h3>
          </div>

          {/* Three columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: '✦',
                title: 'Honest & Verified',
                body: 'Reviews come from real passengers who have booked through EcoWings. No incentivised posts, no sponsored content — just genuine experiences.',
              },
              {
                icon: '⬡',
                title: 'Helps Others Decide',
                body: 'Choosing an airline is more than price. Comfort, punctuality, and sustainability all matter. Your words make that decision easier for the next traveller.',
              },
              {
                icon: '◈',
                title: 'Shapes Better Flying',
                body: 'Airlines listen to feedback. When passengers consistently highlight what works — and what doesn\'t — it creates pressure for meaningful improvement.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#ffffff',
                border: '1px solid #e6efe9',
                borderRadius: '14px',
                padding: '28px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <span style={{ fontSize: '1.1rem', color: '#4d7c5f', lineHeight: 1 }}>{item.icon}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c2b22', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6c8274', lineHeight: 1.7, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom quote */}
          <div style={{ marginTop: '56px', borderTop: '1px solid #ddeae2', paddingTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontStyle: 'italic', color: '#4d7c5f', maxWidth: '560px', lineHeight: 1.7, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              "Sustainable travel isn't just about carbon — it's about accountability, transparency, and the voices of the people who fly."
            </p>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8aab96', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              — EcoWings Community
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
