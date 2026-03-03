import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Tag, MapPin, Star, Zap, Gift, X, LogOut, User, HelpCircle } from 'lucide-react';

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
    label: 'Kampanyalar',
    desc: 'Özel indirimler ve fırsatlar',
    icon: <Tag size={17} />,
    authRequired: false,
  },
  {
    to: '/flight-tracker',
    label: 'Uçuş Takip',
    desc: 'Gerçek zamanlı uçuş durumu',
    icon: <MapPin size={17} />,
    authRequired: false,
  },
   {
    to: '/faq',
    label: 'Sıkça Sorulan Sorular',
    desc: 'Yapay zeka destekli yardım merkezi',
    icon: <HelpCircle size={17} />,
    authRequired: false,
  },
  {
    to: '/comments',
    label: 'Yorumlar',
    desc: 'Havayolu deneyimlerini paylaş',
    icon: <Star size={17} />,
    authRequired: false,
  },
  {
    to: '/lucky-flight',
    label: 'Şanslı Uçuş',
    desc: 'Rastgele bir destinasyon keşfet',
    icon: <Zap size={17} />,
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
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);

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
    padding: '6px 14px',
    paddingBottom: '7px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.01em',
    color: isActive ? 'var(--green-primary)' : 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.18s ease, border-color 0.18s ease',
    borderBottom: isActive
      ? '2px solid var(--green-primary)'
      : '2px solid transparent',
    position: 'relative',
  });

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'box-shadow 0.2s ease',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.5)' : 'none',
      }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          {/* ── Left: Logo ─────────────────────────────── */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌿</span>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--green-primary)',
              letterSpacing: '-0.02em',
            }}>
              EcoWings
            </span>
          </Link>

          {/* ── Center: Ana Sayfa + About Us ────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <NavLink
              to="/"
              end
              className="nav-center-link"
              style={({ isActive }) => centerLinkStyle(isActive)}
            >
              Ana Sayfa
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
          </div>

          {/* ── Right: badge + logout + hamburger ──────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* User badge (authenticated) */}
            {isAuthenticated && (
              <NavLink to="/profile" style={{ textDecoration: 'none' }} title="Profil">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '100px',
                    padding: '4px 12px 4px 4px',
                    cursor: 'pointer',
                    transition: 'border-color 0.18s ease, background 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#f0fdf4',
                    letterSpacing: '0.04em',
                    fontFamily: "'DM Mono', monospace",
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '0.01em',
                    maxWidth: '96px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user?.userName || 'Profil'}
                  </span>
                </div>
              </NavLink>
            )}

            {/* Logout button (authenticated) */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'color 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f87171';
                  e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)';
                  e.currentTarget.style.background = 'rgba(248,113,113,0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
              >
                <LogOut size={14} />
                Çıkış
              </button>
            )}

            {/* Login / Signup (unauthenticated) */}
            {!isAuthenticated && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
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
                  Giriş Yap
                </Link>
                <Link
                  to="/signup"
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#f0fdf4',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textDecoration: 'none',
                    boxShadow: '0 2px 12px rgba(34,197,94,0.3)',
                  }}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* ── Hamburger ──────────────────────────────── */}
            <button
              onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
              aria-label={drawerOpen ? 'Menüyü kapat' : 'Menüyü aç'}
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
                EcoWings Menü
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
              Sayfalar
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
                      {user?.userName || 'Kullanıcı'}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginTop: '1px',
                    }}>
                      {user?.email || 'EcoWings Üyesi'}
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
                  Çıkış Yap
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
                  Giriş Yap
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
                    color: '#f0fdf4',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textDecoration: 'none',
                    boxShadow: '0 2px 16px rgba(34,197,94,0.3)',
                  }}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
