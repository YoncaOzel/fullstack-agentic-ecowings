import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, TicketPercent, Sparkles } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import couponService from '../services/couponService';
import CouponCard from '../components/CouponCard';
import CampaignsHero from '../components/CampaignsHero';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

const PROMOS = [
  { icon: '🌱', title: 'Eco İndirim', desc: 'İlk uçuşunuzda %15 indirim — gezginlere özel karşılama fırsatı', badge: '%15' },
  { icon: '✈️', title: 'Sık Uçan Avantajı', desc: '5 uçuşu tamamlayın, 6. biletinizi tamamen ücretsiz alın', badge: '5+1' },
  { icon: '🎂', title: 'Doğum Günü Surprizi', desc: 'Doğum gününüzde uçuşlarınıza özel %20 indirim hediyesi', badge: '%20' },
  { icon: '♻️', title: 'Yeşil Seyahat', desc: 'Düşük karbon salımlı uçuşlarda ekstra %10 indirim', badge: '%10' },
];

export default function CampaignsPage() {
  const { isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    couponService.getMyCoupons()
      .then((res) => {
        if (Array.isArray(res.data)) setCoupons(res.data);
        else setError(res.data?.message || 'Kuponlar yüklenemedi.');
      })
      .catch(() => setError('Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-(--bg-base)">
      <CampaignsHero isAuthenticated={isAuthenticated} />

      <section id="campaigns-content" className="py-16 lg:py-24 bg-[radial-gradient(circle_at_top,rgba(77,124,95,0.08)_0%,transparent_45%)]">
        <div className="container">
          {!isAuthenticated && (
            <>
              <header className="mx-auto max-w-2xl text-center mb-10 lg:mb-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-300/45 bg-green-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-green-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  Members-only perks
                </div>
                <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-(--text-primary)">
                  Campaign Drops Built for Frequent Flyers
                </h2>
                <p className="mt-4 text-base md:text-lg leading-relaxed text-(--text-muted)">
                  Join EcoWings to unlock personalized coupon access and exclusive discounts designed for conscious travelers.
                </p>
              </header>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-12">
                {PROMOS.map((promo) => (
                  <article
                    key={promo.title}
                    className="group relative overflow-hidden rounded-3xl border border-green-700/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-green-500/30 hover:shadow-[0_20px_45px_rgba(34,197,94,0.16)]"
                  >
                    <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16)_0%,transparent_72%)]" />
                    <span className="absolute right-4 top-4 rounded-full bg-linear-to-r from-green-500 to-green-600 px-3 py-1 text-[0.68rem] font-bold tracking-wide text-[#06210f]">
                      {promo.badge}
                    </span>
                    <div className="text-4xl mb-4">{promo.icon}</div>
                    <h3 className="text-lg font-bold text-(--text-primary)">{promo.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-(--text-muted)">{promo.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Members benefit
                    </div>
                  </article>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-green-500/20 bg-[linear-gradient(160deg,rgba(34,197,94,0.10)_0%,rgba(255,255,255,0.7)_60%,rgba(34,197,94,0.05)_100%)] p-8 md:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.15)]">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.20)_0%,transparent_68%)]" />
                <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-green-700">
                      <TicketPercent className="h-3.5 w-3.5" />
                      Unlock your codes
                    </div>
                    <h3 className="mt-4 text-2xl md:text-3xl font-extrabold text-(--text-primary)">
                      Access Personal Coupon Wallet
                    </h3>
                    <p className="mt-3 text-(--text-secondary) leading-relaxed max-w-xl">
                      Sign in to view your active discount codes and apply them directly during flight checkout.
                    </p>
                  </div>
                  <div className="justify-self-start md:justify-self-end">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-500 to-green-600 px-6 py-3.5 text-sm font-bold tracking-wide text-[#07210f] shadow-[0_10px_26px_rgba(34,197,94,0.36)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(34,197,94,0.42)]"
                    >
                      Sign in and view coupons <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {isAuthenticated && (
            <>
              {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
                <>
                  {coupons.length === 0 ? (
                    <div className="mx-auto max-w-3xl rounded-3xl border border-green-500/20 bg-white/85 p-10 text-center shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                        <TicketPercent className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-(--text-primary)">No Active Coupons Yet</h3>
                      <p className="mt-2 text-(--text-muted) leading-relaxed">
                        You currently have no active coupons. Keep an eye on this page for upcoming campaign drops.
                      </p>
                    </div>
                  ) : (
                    <>
                      <header className="mb-8 md:mb-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-green-300/40 bg-green-100/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-green-800">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Your active deals
                        </div>
                        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-(--text-primary)">
                          {coupons.length} Coupons Available
                        </h2>
                        <p className="mt-2 text-(--text-muted) max-w-2xl">
                          Copy and use your coupon code during checkout to reduce your trip cost instantly.
                        </p>
                      </header>

                      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {coupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />)}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
