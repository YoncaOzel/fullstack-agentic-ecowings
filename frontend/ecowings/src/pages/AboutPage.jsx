import { Leaf, Globe, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: <Leaf size={22} />,
    title: 'Sürdürülebilir Uçuş',
    desc: 'Karbon ayak izini minimuma indirmeyi hedefleyen rota optimizasyonu ve karbon offset programlarıyla çevre dostu seyahat.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Global Bağlantı',
    desc: '300+ havalimanı, 50+ havayolu ortağı. Dünyanın her köşesine en yeşil yol üzerinden ulaş.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Güvenli & Şeffaf',
    desc: 'Uçuş fiyatlandırması, karbon maliyeti ve çevre etkisi tamamen şeffaf biçimde sunulur.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Anlık Takip',
    desc: 'Gerçek zamanlı uçuş takibi, kapı değişiklikleri ve gecikme bildirimleriyle her zaman önde ol.',
  },
  {
    icon: <Users size={22} />,
    title: 'Topluluk Odaklı',
    desc: 'Yolcu yorumları, havayolu değerlendirmeleri ve ortak indirimlerle büyüyen bir eko-seyahat topluluğu.',
  },
];

const stats = [
  { value: '2M+', label: 'Mutlu Yolcu' },
  { value: '300+', label: 'Havalimanı' },
  { value: '50+', label: 'Havayolu Ortağı' },
  { value: '120K t', label: 'CO₂ Tasarrufu' },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        padding: '90px 24px 80px',
        textAlign: 'center',
        background: 'linear-gradient(160deg, #0a180a 0%, #080e08 100%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* ambient glow */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--green-glow)', border: '1px solid var(--border)',
            borderRadius: '100px', padding: '6px 16px', fontSize: '0.8rem',
            color: 'var(--green-primary)', fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '24px',
          }}>
            <Leaf size={13} /> Hakkımızda
          </div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            color: 'var(--text-primary)', marginBottom: '20px',
            lineHeight: 1.15,
          }}>
            Doğayla Uyumlu<br />
            <span style={{ color: 'var(--green-primary)' }}>Akıllı Seyahat</span>
          </h1>
          <p style={{
            fontSize: '1.05rem', color: 'var(--text-secondary)',
            lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 32px',
          }}>
            EcoWings, uçuş deneyimini daha bilinçli, daha sürdürülebilir ve daha
            bağlantılı kılmak için kuruldu. Her bilet, bir ağaç.
          </p>
          <Link to="/flights" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#f0fdf4', padding: '13px 28px', borderRadius: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
            fontSize: '0.95rem', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.35)'; }}
          >
            Uçuşları Keşfet <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{
        padding: '56px 24px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '32px', textAlign: 'center',
        }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, color: 'var(--green-primary)',
                letterSpacing: '-0.04em', lineHeight: 1,
              }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>Değerlerimiz</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Her kararımızın arkasındaki ilkeler</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {values.map((v) => (
              <div key={v.title} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '28px 24px',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(34,197,94,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '11px',
                  background: 'var(--green-glow)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green-primary)', marginBottom: '16px',
                }}>
                  {v.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1rem', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '8px',
                }}>{v.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{
        padding: '72px 24px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 700, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '12px',
          }}>Birlikte daha yeşil uç</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
            EcoWings topluluğuna katıl, sürdürülebilir seyahat fırsatlarını kaçırma.
          </p>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: '1px solid var(--border-hover)',
            color: 'var(--green-primary)', padding: '12px 28px', borderRadius: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
            fontSize: '0.9rem', textDecoration: 'none',
            transition: 'background 0.18s ease, transform 0.18s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-glow)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Ücretsiz Kayıt Ol <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
}
