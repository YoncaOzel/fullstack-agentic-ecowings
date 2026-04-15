import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
    to: '/campaigns',
    label: 'Campaigns',
    desc: 'Exclusive discounts and deals',
    icon: <Tag size={17} />,
    authRequired: false,
  },
  {
    to: '/flight-tracker',
    label: 'Flight Tracker',
    desc: 'Real-time flight status',
    icon: <MapPin size={17} />,
    authRequired: false,
  },
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
  },
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
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeDrawer = () => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setDrawerClosing(false);
    }, 280);
  };

  /* ESC key + body scroll lock */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (drawerOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const openDrawer = () => {
    setDrawerOpen(true);
    setDrawerClosing(false);
  };

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
    closeDrawer();
  };

  const visibleDrawerLinks = drawerLinks.filter(
    (l) => !l.authRequired || isAuthenticated
  );

  const initials = user?.userName
    ? user.userName.slice(0, 2).toUpperCase()
    : '??';

  const centerLinkStyle = (isActive) => ({
    padding: '4px 4px 8px',
    fontSize: '0.875rem',
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: isActive ? '#003527' : '#404944',
    textDecoration: 'none',
    transition: 'color 0.3s ease, transform 0.3s ease',
    borderBottom: isActive ? '2px solid #003527' : '2px solid transparent',
  });

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        background: 'rgba(247,249,251,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(191,201,195,0.18)',
        boxShadow: scrolled ? '0 12px 40px rgba(25,28,30,0.08)' : '0 12px 40px rgba(25,28,30,0.04)',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 48px',
            height: '72px',
          }}
        >
          {/* ── Left: Logo ─────────────────────────────── */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: '1.2rem',
              color: '#003527',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}>
              EcoWings
            </span>
          </Link>

          {/* ── Center: Nav links ────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <NavLink
              to="/"
              end
              className="nav-center-link"
              style={({ isActive }) => centerLinkStyle(isActive)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              end
              className="nav-center-link"
              style={({ isActive }) => centerLinkStyle(isActive)}
            >
              About Us
            </NavLink>
            <NavLink
              to="/faq"
              end
              className="nav-center-link"
              style={({ isActive }) => centerLinkStyle(isActive)}
            >
              SSS
            </NavLink>
            <NavLink
              to="/travel-planner"
              end
              className="nav-center-link"
              style={({ isActive }) => centerLinkStyle(isActive)}
            >
              Travel Planner
            </NavLink>
          </div>

          {/* ── Right: badge + logout + hamburger ──────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

            {/* User dropdown (authenticated) */}
            {isAuthenticated && (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                {/* Trigger pill */}
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: dropdownOpen ? 'rgba(0,53,39,0.1)' : 'rgba(0,53,39,0.06)',
                    border: `1px solid ${dropdownOpen ? 'rgba(0,53,39,0.32)' : 'rgba(0,53,39,0.15)'}`,
                    borderRadius: '100px',
                    padding: '4px 10px 4px 4px',
                    cursor: 'pointer',
                    transition: 'border-color 0.22s ease, background 0.22s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,53,39,0.32)';
                    e.currentTarget.style.background = 'rgba(0,53,39,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) {
                      e.currentTarget.style.borderColor = 'rgba(0,53,39,0.15)';
                      e.currentTarget.style.background = 'rgba(0,53,39,0.06)';
                    }
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.63rem',
                    fontWeight: 700,
                    color: '#f0fdf4',
                    letterSpacing: '0.05em',
                    fontFamily: "'DM Mono', monospace",
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                  }}>
                    {initials}
                  </div>
                  {/* Username */}
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#003527',
                    fontFamily: "'Manrope', sans-serif",
                    letterSpacing: '0.01em',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user?.userName || 'Profile'}
                  </span>
                  {/* Chevron */}
                  <ChevronDown
                    size={12}
                    color="#003527"
                    style={{
                      transition: 'transform 0.22s ease',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '232px',
                    background: 'rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(0,53,39,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(0,45,28,0.13), 0 2px 8px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    zIndex: 1100,
                    animation: 'dropdownFadeIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
                  }}>
                    {/* User info header */}
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(0,53,39,0.04))',
                      borderBottom: '1px solid rgba(0,53,39,0.07)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#f0fdf4',
                          letterSpacing: '0.05em',
                          fontFamily: "'DM Mono', monospace",
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
                        }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: '#002d1c',
                            fontFamily: "'Manrope', sans-serif",
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {user?.userName || 'User'}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#6c8274',
                            marginTop: '2px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {user?.email || 'EcoWings Member'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px' }}>
                      <NavLink
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          color: '#003527',
                          fontSize: '0.845rem',
                          fontWeight: 500,
                          fontFamily: "'Manrope', sans-serif",
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,53,39,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '8px',
                          background: 'rgba(0,53,39,0.07)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <User size={14} color="#003527" />
                        </div>
                        View Profile
                      </NavLink>

                      {/* Divider */}
                      <div style={{ height: '1px', background: 'rgba(0,53,39,0.07)', margin: '4px 2px' }} />

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.845rem',
                          fontWeight: 500,
                          fontFamily: "'Manrope', sans-serif",
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '8px',
                          background: 'rgba(220,38,38,0.07)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <LogOut size={14} color="#dc2626" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login / Signup (unauthenticated) */}
            {!isAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#404944',
                    fontFamily: "'Manrope', sans-serif",
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#003527';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#404944';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#ffffff',
                    background: '#003527',
                    fontFamily: "'Manrope', sans-serif",
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,53,39,0.2)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,53,39,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,53,39,0.2)';
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* ── Hamburger ──────────────────────────────── */}
            <button
              onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                width: '40px',
                height: '40px',
                background: 'var(--bg-surface)',
                border: `1px solid ${drawerOpen ? 'rgba(34,197,94,0.45)' : 'var(--border)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                padding: '0',
                flexShrink: 0,
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!drawerOpen) e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                if (!drawerOpen) e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {/* Top line */}
              <span style={{
                display: 'block',
                width: '16px',
                height: '1.5px',
                background: drawerOpen ? 'var(--green-primary)' : 'var(--text-secondary)',
                borderRadius: '2px',
                transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), background 0.2s ease',
                transform: drawerOpen
                  ? 'translateY(6.5px) rotate(45deg)'
                  : 'translateY(0) rotate(0)',
                transformOrigin: 'center',
              }} />
              {/* Mid line */}
              <span style={{
                display: 'block',
                width: '16px',
                height: '1.5px',
                background: drawerOpen ? 'var(--green-primary)' : 'var(--text-secondary)',
                borderRadius: '2px',
                transition: 'opacity 0.18s ease, background 0.2s ease',
                opacity: drawerOpen ? 0 : 1,
              }} />
              {/* Bottom line */}
              <span style={{
                display: 'block',
                width: '16px',
                height: '1.5px',
                background: drawerOpen ? 'var(--green-primary)' : 'var(--text-secondary)',
                borderRadius: '2px',
                transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), background 0.2s ease',
                transform: drawerOpen
                  ? 'translateY(-6.5px) rotate(-45deg)'
                  : 'translateY(0) rotate(0)',
                transformOrigin: 'center',
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Overlay ───────────────────────────────────────── */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 998,
            animation: drawerClosing
              ? 'overlayFadeIn 0.28s cubic-bezier(0.4,0,0.2,1) reverse'
              : 'overlayFadeIn 0.28s cubic-bezier(0.4,0,0.2,1) forwards',
          }}
        />
      )}

      {/* ── Drawer ────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '320px',
            background: 'rgba(8,14,8,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid var(--border)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            animation: drawerClosing
              ? 'drawerSlideIn 0.28s cubic-bezier(0.4,0,0.2,1) reverse'
              : 'drawerSlideIn 0.28s cubic-bezier(0.4,0,0.2,1) forwards',
            overflowY: 'auto',
          }}
        >
          {/* Drawer header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🌿</span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--green-primary)',
              }}>
                EcoWings Menu
              </span>
            </div>
            <button
              onClick={closeDrawer}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'color 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--green-primary)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Drawer nav items */}
          <div style={{ flex: 1, padding: '10px 12px 0', overflowY: 'auto' }}>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '8px 8px 6px',
            }}>
              Pages
            </div>
            {visibleDrawerLinks.map((link, i) => (
              <DrawerItem key={link.to} link={link} index={i} onClose={closeDrawer} />
            ))}
          </div>

          {/* Drawer footer */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '16px',
            flexShrink: 0,
          }}>
            {isAuthenticated ? (
              <>
                {/* User card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '10px',
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f0fdf4',
                    letterSpacing: '0.04em',
                    fontFamily: "'DM Mono', monospace",
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {user?.userName || 'User'}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginTop: '1px',
                    }}>
                      {user?.email || 'EcoWings Member'}
                    </div>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={closeDrawer}
                    style={{ color: 'var(--text-muted)', transition: 'color 0.18s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--green-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <User size={15} />
                  </NavLink>
                </div>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'rgba(248,113,113,0.06)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#f87171',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: 'pointer',
                    transition: 'background 0.18s ease, border-color 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(248,113,113,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)';
                  }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textDecoration: 'none',
                    transition: 'border-color 0.18s ease, color 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.color = 'var(--green-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={closeDrawer}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    background: '#003527',
                    fontFamily: "'Manrope', sans-serif",
                    textDecoration: 'none',
                    boxShadow: '0 2px 16px rgba(0,53,39,0.3)',
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
