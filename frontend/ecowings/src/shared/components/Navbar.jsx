import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Tag, MapPin, Star, X, LogOut, User, HelpCircle, Globe, ChevronDown, Settings } from 'lucide-react';

/* ── Drawer link definitions ─────────────────────────────── */
const drawerLinks = [
  /*{
    to: '/flights',
    label: 'Uçuşlar',
    desc: 'Uçuş ara, karşılaştır ve rezervasyon yap',
    icon: <Plane size={17} />,
    authRequired: false,
  }, */
  {
    to: '/travel-planner',
    label: 'Travel Planner',
    desc: 'Create a personalised travel plan with AI',
    icon: <Globe size={17} />,
    authRequired: false,
  },
  {
    to: '/faq',
    label: 'FAQ',
    desc: 'AI-powered help centre',
    icon: <HelpCircle size={17} />,
    authRequired: false,
  },
  {
    to: '/comments',
    label: 'Reviews',
    desc: 'Share your airline experiences',
    icon: <Star size={17} />,
    authRequired: false,
  }
  
/*
  {
    to: '/gift-ticket',
    label: 'Biletlerime Hediye Et',
    desc: 'Biletini sevdiklerinle paylaş',
    icon: <Gift size={17} />,
    authRequired: true,
  },
  */
 
];

/* ── DrawerItem subcomponent ─────────────────────────────── */
function DrawerItem({ link, index, onClose }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={link.to}
      onClick={onClose}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '9px 10px',
        borderRadius: '10px',
        border: `1px solid ${hovered || isActive ? 'rgba(34,197,94,0.35)' : 'transparent'}`,
        background: isActive || hovered ? 'rgba(34,197,94,0.08)' : 'transparent',
        textDecoration: 'none',
        transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease',
        transform: hovered ? 'translateX(-3px)' : 'translateX(0)',
        marginBottom: '2px',
        animation: `navItemSlideIn 0.35s cubic-bezier(0.4,0,0.2,1) ${index * 55}ms both`,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon box */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '9px',
        background: hovered ? 'rgba(34,197,94,0.15)' : 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: hovered ? 'var(--green-primary)' : 'var(--text-muted)',
        flexShrink: 0,
        transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
      }}>
        {link.icon}
      </div>
      {/* Label + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.3,
        }}>
          {link.label}
        </div>
        <div style={{
          fontSize: '0.71rem',
          color: 'var(--text-muted)',
          marginTop: '2px',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {link.desc}
        </div>
      </div>
    </NavLink>
  );
}

/* ── Main Navbar ─────────────────────────────────────────── */
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ESC key */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    if (drawerOpen) {
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  /* Click-outside closes dropdown */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDrawerOpen(false);
  };

  const visibleDrawerLinks = drawerLinks.filter(
    (l) => !l.authRequired || isAuthenticated
  );

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'Profile'
    : 'Profile';

  const initials = user
    ? `${(user.firstName?.[0] || '')}${(user.lastName?.[0] || '')}`.toUpperCase() || (user.userName?.slice(0, 2).toUpperCase() ?? '?')
    : '?';

  const centerLinkStyle = (isActive) => ({
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: isAuthPage
      ? (isActive ? '#ffffff' : 'rgba(255,255,255,0.65)')
      : (isActive ? '#000000' : '#71717A'),
    textDecoration: 'none',
    transition: 'color 0.2s ease, background-color 0.2s ease',
    borderRadius: '6px',
    backgroundColor: isActive
      ? (isAuthPage ? 'rgba(255,255,255,0.1)' : '#f4f4f5')
      : 'transparent',
  });

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        background: isAuthPage
          ? (scrolled ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)')
          : '#ffffff',
        backdropFilter: isAuthPage ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isAuthPage ? 'blur(12px)' : 'none',
        borderBottom: isAuthPage ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e4e4e7',
        boxShadow: scrolled && !isAuthPage ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.2s ease',
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '10px 32px',
          }}
        >
          {/* ── Left: Logo ─────────────────────────────── */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Siyah kare ikon efekti Shadcn logosuna benzesin diye */}
            <span style={{
              fontWeight: 600,
              fontSize: '1.125rem',
              color: isAuthPage ? '#ffffff' : '#09090b',
              letterSpacing: '-0.025em',
            }}>
              EcoWings
            </span>
          </Link>

          {/* ── Center: Nav links ────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NavLink
              to="/"
              end
              style={({ isActive }) => centerLinkStyle(isActive)}
              onMouseEnter={(e) => {
                if (e.currentTarget.style.backgroundColor === 'transparent') {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.style.backgroundColor === 'rgb(250, 250, 250)') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              end
              style={({ isActive }) => centerLinkStyle(isActive)}
              onMouseEnter={(e) => {
                if (e.currentTarget.style.backgroundColor === 'transparent') {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.style.backgroundColor === 'rgb(250, 250, 250)') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              About Us
            </NavLink>

            {/* ── Menu Feature Dropdown ── */}
            <div
               style={{ position: 'relative' }}
               onMouseEnter={() => setDrawerOpen(true)}
               onMouseLeave={() => setDrawerOpen(false)}
            >
              {/* Dropdown Trigger */}
              <button
                style={{
                  ...centerLinkStyle(drawerOpen),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: drawerOpen ? '#09090b' : '#71717A',
                }}
              >
                Features
                <ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 0.2s',
                    transform: drawerOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {/* Dropdown Content */}
              {drawerOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  paddingTop: '8px',
                  zIndex: 1050,
                  animation: 'dropdownFadeIn 0.2s ease',
                }}>
                  <div style={{
                    width: '500px',
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '6px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}>
                  {visibleDrawerLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setDrawerOpen(false)}
                      style={({ isActive }) => ({
                        display: 'block',
                        padding: '12px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        background: isActive ? '#f4f4f5' : 'transparent',
                        transition: 'background 0.2s',
                      })}
                      onMouseEnter={(e) => {
                        if (e.currentTarget.style.background === 'transparent') {
                          e.currentTarget.style.background = '#fafafa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (e.currentTarget.style.background === 'rgb(250, 250, 250)') {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: '#f4f4f5',
                          color: '#09090b',
                          flexShrink: 0,
                        }}>
                          {link.icon || <Plane size={16} />}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#09090b',
                            marginBottom: '2px',
                          }}>
                            {link.label}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#71717A',
                            lineHeight: 1.4,
                          }}>
                            {link.description || 'Explore this feature'}
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  ))}
                  </div>
                </div>
              )}
            </div>
            {/* ── End Menu Feature Dropdown ── */}
          </div>

          {/* ── Right: Auth / User Profile ───────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* User dropdown (authenticated) */}
            {isAuthenticated && (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                {/* Trigger pill */}
                <button
                  className="nav-profile-trigger"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  style={{
                    background: isAuthPage
                      ? (dropdownOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)')
                      : (dropdownOpen ? '#f4f4f5' : '#ffffff'),
                    border: isAuthPage ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e4e4e7',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isAuthPage ? 'rgba(255,255,255,0.15)' : '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) {
                      e.currentTarget.style.background = isAuthPage ? 'rgba(255,255,255,0.08)' : '#ffffff';
                    }
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1b6d24 0%, #004b0f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.688rem',
                    fontWeight: 700,
                    color: '#e5ffdd',
                    flexShrink: 0,
                    letterSpacing: '0.03em',
                  }}>
                    {initials}
                  </div>
                  {/* Display name */}
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isAuthPage ? '#ffffff' : '#09090b',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {displayName}
                  </span>
                  {/* Chevron */}
                  <ChevronDown
                    size={14}
                    color={isAuthPage ? 'rgba(255,255,255,0.6)' : '#71717a'}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    marginTop: '8px',
                    right: 0,
                    width: '220px',
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    zIndex: 1100,
                  }}>
                    {/* User info header */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e4e4e7',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1b6d24 0%, #004b0f 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#e5ffdd',
                          flexShrink: 0,
                          letterSpacing: '0.03em',
                        }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#09090b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {displayName}
                          </div>
                          <div style={{
                            fontSize: '0.72rem',
                            color: '#71717a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '1px',
                          }}>
                            {user?.email || 'EcoWings Member'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '4px' }}>
                      <NavLink
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          color: '#09090b',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f4f4f5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <User size={16} color="#09090b" />
                        View Profile
                      </NavLink>

                      {/* Divider */}
                      <div style={{ height: '1px', background: '#e4e4e7', margin: '4px -4px' }} />

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#09090b',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f4f4f5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOut size={16} color="#09090b" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login / Signup (unauthenticated) */}
            {!isAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isAuthPage ? 'rgba(255,255,255,0.85)' : '#09090b',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: isAuthPage ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e4e4e7',
                    background: isAuthPage ? 'rgba(255,255,255,0.08)' : '#ffffff',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isAuthPage ? 'rgba(255,255,255,0.15)' : '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isAuthPage ? 'rgba(255,255,255,0.08)' : '#ffffff';
                  }}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  WebkitTextFillColor: '#ffffff',
                  background: 'linear-gradient(135deg, #002d1c 0%, #00452e 100%)',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                  border: '1px solid #002d1c',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.88';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Sign Up
              </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

