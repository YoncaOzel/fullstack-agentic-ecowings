import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1b5e20', color: '#fff', padding: '48px 0 24px' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>🌿</span>
              <span style={{ fontWeight: 700, fontSize: '1.3rem' }}>EcoWings</span>
            </div>
            <p style={{ color: '#a5d6a7', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Sürdürülebilir seyahat için akıllı uçuş arama platformu.
              Daha yeşil bir dünya için uçalım.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Hızlı Bağlantılar</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/', label: 'Ana Sayfa' },
                { to: '/flights', label: 'Uçuşlar' },
                { to: '/campaigns', label: 'Kampanyalar' },
                { to: '/comments', label: 'Yorumlar' },
                { to: '/lucky-flight', label: 'Şanslı Uçuş' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} style={{
                    color: '#a5d6a7',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#81c784'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#a5d6a7'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>İletişim</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ color: '#a5d6a7', fontSize: '0.9rem' }}>📧 info@ecowings.com</li>
              <li style={{ color: '#a5d6a7', fontSize: '0.9rem' }}>📞 +90 212 000 00 00</li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer"
                  style={{ color: '#a5d6a7', fontSize: '0.9rem', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#81c784'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a5d6a7'}
                >
                  𝕏 Twitter
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer"
                  style={{ color: '#a5d6a7', fontSize: '0.9rem', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#81c784'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a5d6a7'}
                >
                  📸 Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <p style={{ color: '#a5d6a7', fontSize: '0.85rem', margin: 0 }}>
            © {new Date().getFullYear()} EcoWings. Tüm hakları saklıdır.
          </p>
          <p style={{ color: '#81c784', fontSize: '0.85rem', margin: 0 }}>
            🌱 Karbon ayak izini azalt
          </p>
        </div>
      </div>
    </footer>
  );
}
