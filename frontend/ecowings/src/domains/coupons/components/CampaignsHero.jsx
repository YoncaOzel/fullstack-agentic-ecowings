import { MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

function CampaignsHero({ isAuthenticated }) {
  return (
    <div className="w-full py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Sol: Metin */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Badge variant="outline">Özel Fırsatlar</Badge>
            </div>
            <h1 className="text-5xl md:text-7xl tracking-tighter text-left font-regular" style={{ maxWidth: 520, lineHeight: 1.08 }}>
              EcoWings ile Tasarruf Başlıyor
            </h1>
            <p className="text-xl leading-relaxed tracking-tight text-left" style={{ color: 'var(--text-muted)', maxWidth: 420 }}>
              Seyahat planlarınız için özel kampanyalar ve kişisel kuponlar burada.
              Üye olun, indirimlerinizi keşfedin ve her uçuşta kazanın.
            </p>

            {/* Butonlar */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Link
                to="/flights"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1.5px solid #1B3A2D',
                  color: '#1B3A2D',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'background 0.18s, color 0.18s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f7f3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Uçuşları Keşfet <PhoneCall style={{ width: 16, height: 16 }} />
              </Link>

              {!isAuthenticated && (
                <Link
                  to="/signup"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1B3A2D',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'background 0.18s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2d5a3d'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1B3A2D'; }}
                >
                  Hemen Kaydol <MoveRight style={{ width: 16, height: 16 }} />
                </Link>
              )}
            </div>
          </div>

          {/* Sağ: Görsel */}
          <div style={{ flex: '0 0 480px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: 480, width: '100%', height: 400, borderRadius: 20, overflow: 'hidden' }}>
              <img
                src="/kampanya.png"
                alt="Kampanya görseli"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CampaignsHero };
export default CampaignsHero;
