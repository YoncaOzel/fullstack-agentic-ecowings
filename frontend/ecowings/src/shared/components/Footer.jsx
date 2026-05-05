import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const sections = [
  {
    title: "Explore",
    links: [
      { name: "Flights", href: "/flights" },
      { name: "Campaigns", href: "/campaigns" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Sustainability", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/faq" },
      { name: "Reviews", href: "/comments" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: <FaInstagram size={18} />, href: "https://instagram.com", label: "Instagram" },
  { icon: <FaFacebook size={18} />, href: "https://facebook.com", label: "Facebook" },
  { icon: <FaTwitter size={18} />, href: "https://twitter.com", label: "Twitter" },
  { icon: <FaLinkedin size={18} />, href: "https://linkedin.com", label: "LinkedIn" },
];

const legalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export default function Footer() {
  return (
    <footer>
      <div style={{ padding: '80px 0 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '40px',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              {/* Brand column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <span style={{
                    fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}>
                    EcoWings
                  </span>
                </Link>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'var(--text-muted)',
                  margin: 0,
                }}>
                  A smart flight search platform for sustainable travel. Fly greener, live better.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      style={{
                        color: 'var(--text-muted)',
                        transition: 'color 0.2s ease',
                        display: 'flex',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--green-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '40px 60px',
                flex: '1 1 auto',
                maxWidth: '640px',
              }}>
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-primary)',
                      marginBottom: '20px',
                    }}>
                      {section.title}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            to={link.href}
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.875rem',
                              color: 'var(--text-muted)',
                              textDecoration: 'none',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--green-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '28px 0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                margin: 0,
                fontWeight: 500,
              }}>
                © {new Date().getFullYear()} EcoWings. All rights reserved.
              </p>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', listStyle: 'none', padding: 0, margin: 0 }}>
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--green-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
