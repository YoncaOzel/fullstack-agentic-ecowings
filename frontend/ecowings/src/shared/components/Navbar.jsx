import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Ana Sayfa', authRequired: false },
  { to: '/flights', label: 'Uçuşlar', authRequired: false },
  { to: '/campaigns', label: 'Kampanyalar', authRequired: false },
  { to: '/flight-tracker', label: 'Uçuş Takip', authRequired: false },
  { to: '/comments', label: 'Yorumlar', authRequired: false },
  { to: '/lucky-flight', label: 'Şanslı Uçuş', authRequired: false },
  { to: '/gift-ticket', label: 'Biletlerime Hediye Et', authRequired: true },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#fff',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      transition: 'box-shadow 0.2s',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>EcoWings</span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}
          className="nav-links-desktop">
          {navLinks
            .filter((l) => !l.authRequired || isAuthenticated)
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                style={({ isActive }) => ({
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--primary)' : '#333',
                  background: isActive ? 'rgba(46,125,50,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                })}
                onMouseEnter={(e) => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={(e) => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = '#333'; }}
              >
                {l.label}
              </NavLink>
            ))}
        </div>

        {/* Auth area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--primary)' : '#333',
                  textDecoration: 'none',
                })}
              >
                👤 {user?.userName || 'Profil'}
              </NavLink>
              <button className="btn btn-outline" onClick={handleLogout}
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                Giriş Yap
              </Link>
              <Link to="/signup" className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
