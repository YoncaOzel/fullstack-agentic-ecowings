import { useEffect } from "react";
import "./AboutPage.css";

export default function AboutPage() {
  useEffect(() => {
    document.title =
      "About EcoWings | Sustainable Flights, Smart Travel and Eco-Friendly Aviation";
    const ensureMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    ensureMeta(
      "description",
      "Learn how EcoWings combines sustainable aviation, smart flight discovery and transparent travel planning to help travelers choose greener journeys worldwide."
    );
  }, []);

  useEffect(() => {
    // Reveal on scroll
    const revealEls = document.querySelectorAll(".about-page .reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // Animated counters
    const fmt = (n) => Math.round(n).toLocaleString();
    const counters = document.querySelectorAll(".about-page [data-count-to]");
    const cIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.countTo);
          const suffix = el.querySelector("em") ? el.querySelector("em").outerHTML : "";
          const start = performance.now();
          const dur = 1400;
          const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.innerHTML = fmt(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          cIO.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cIO.observe(el));

    // Progress bar
    const bars = document.querySelectorAll(".about-page [data-fill]");
    const bIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          requestAnimationFrame(() => {
            el.style.width = el.dataset.fill + "%";
          });
          bIO.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((el) => bIO.observe(el));

    // Cloud parallax
    const clouds = document.querySelectorAll(".about-page .ab-cloud");
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 800) return;
      clouds.forEach((c, i) => {
        c.style.transform = `translateY(${y * (0.05 + i * 0.03)}px) translateX(${y * 0.02}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      cIO.disconnect();
      bIO.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="about-page">
      {/* HERO */}
      <header className="ab-hero">
        <div className="ab-hero-bg">
          <div className="ab-hero-grid-lines" />
          <div className="ab-cloud c1 ab-float-y" />
          <div className="ab-cloud c2 ab-float-y" style={{ animationDelay: "-2s" }} />
          <div className="ab-cloud c3 ab-float-y" style={{ animationDelay: "-4s" }} />
        </div>

        <div className="ab-hero-plane" aria-hidden="true">
          <svg viewBox="0 0 760 460" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="planeG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BFE3CC" stopOpacity=".55" />
                <stop offset="100%" stopColor="#1F6B4A" stopOpacity=".25" />
              </linearGradient>
            </defs>
            <path d="M-40 360 C 200 360, 360 280, 760 220" stroke="rgba(191,227,204,.25)" strokeWidth="2" fill="none" strokeDasharray="2 8" />
            <path d="M-40 380 C 220 380, 380 310, 760 260" stroke="rgba(191,227,204,.18)" strokeWidth="1.5" fill="none" strokeDasharray="2 12" />
            <g transform="translate(180 110)" fill="url(#planeG)" stroke="rgba(191,227,204,.45)" strokeWidth="1">
              <path d="M0 120 L 360 110 L 460 80 L 480 92 L 410 130 L 460 220 L 430 224 L 320 150 L 200 158 L 180 200 L 160 200 L 170 154 L 70 156 L 40 180 L 24 178 L 36 148 L 0 138 Z" />
            </g>
          </svg>
        </div>

        <div className="ab-hero-inner">
          <div className="reveal in">
            <span className="ab-eyebrow">
              <span className="ab-dot" />
              Sustainable Aviation · Est. 2024
            </span>
          </div>
          <h1 className="reveal in delay-1">
            About <em>EcoWings.</em>
            <br />A greener way to explore the world.
          </h1>
          <p className="ab-hero-sub reveal in delay-2">
            We're building the flight booking platform our planet has been waiting for —
            smart routing, transparent impact, and a calmer, more thoughtful way to travel.
          </p>
          <div className="ab-hero-stats reveal in delay-3">
            <div className="ab-hero-stat">
              <div className="num">120<em>+</em></div>
              <div className="lbl">Eco routes mapped</div>
            </div>
            <div className="ab-hero-stat">
              <div className="num">48<em>k</em></div>
              <div className="lbl">Travelers onboard</div>
            </div>
            <div className="ab-hero-stat">
              <div className="num">9</div>
              <div className="lbl">Partner airlines</div>
            </div>
            <div className="ab-hero-stat">
              <div className="num">2024</div>
              <div className="lbl">Founded with intent</div>
            </div>
          </div>
        </div>
      </header>

      {/* MISSION */}
      <section className="ab-mission">
        <div className="ab-container">
          <div className="ab-mission-grid">
            <div className="ab-mission-text reveal">
              <span className="ab-sec-eyebrow">Our Mission</span>
              <h2 style={{ marginTop: "16px" }}>
                Travel that thinks <em>twice</em>—<br />so you don't have to.
              </h2>
              <p>
                EcoWings is on a quiet mission: make booking a flight feel as good as taking
                one. We surface the smarter route, the lower-impact aircraft, the off-peak
                window — without making you read a sustainability report to find them.
              </p>
              <p>
                Every search runs through our routing engine, weighing fuel efficiency,
                distance, and aircraft generation alongside price and time. The greener choice
                should also be the easier one.
              </p>
              <div className="ab-mission-quote reveal delay-1">
                "We don't believe travel needs to disappear. We believe it needs to grow up."
              </div>
            </div>

            <div className="ab-mission-visual reveal delay-2">
              <div className="ab-stripe-overlay" />
              <div className="ab-mission-photo-label">// FIG 01 — EDITORIAL · AERIAL · GREEN CORRIDOR</div>
              <div className="ab-mission-tag">
                <div className="ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20C5 20 3 15 3 12c0-3 2-5 5-7s5-3 7-3c0 2-1 4-3 7s-5 5-2 10Z" />
                    <path d="M2 22c5-3 8-6 11-9" />
                  </svg>
                </div>
                <div>
                  <div className="ttl">Verified eco-routing engine</div>
                  <div className="sub">Independently audited carbon math · Updated quarterly</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="ab-values">
        <div className="ab-container">
          <div className="ab-sec-head">
            <div className="reveal">
              <span className="ab-sec-eyebrow">What We Stand For</span>
              <h2 className="ab-sec-title">Four values, <em>one</em> flight path.</h2>
            </div>
            <p className="ab-sec-lede reveal delay-1">
              These aren't poster-on-the-wall values. They're how we choose features,
              partners, and the routes we surface first.
            </p>
          </div>

          <div className="ab-values-grid">
            <article className="ab-value-card reveal">
              <span className="ab-value-num">01</span>
              <div className="ab-value-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20C5 20 3 15 3 12c0-3 2-7 8-9 0 6 3 8 6 9-1 5-3 8-6 8Z" />
                  <path d="M11 20c0-4 1-7 4-10" />
                </svg>
              </div>
              <h3>Sustainability</h3>
              <p>Lower-impact routes are the default, not the upgrade. We surface them first, every search, every time.</p>
              <span className="more">Our impact model →</span>
            </article>

            <article className="ab-value-card reveal delay-1">
              <span className="ab-value-num">02</span>
              <div className="ab-value-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h6l3-7 3 14 3-7h3" />
                </svg>
              </div>
              <h3>Smart Travel</h3>
              <p>An algorithm that learns your patterns — then quietly suggests the route that costs you less, in every sense.</p>
              <span className="more">How routing works →</span>
            </article>

            <article className="ab-value-card reveal delay-2">
              <span className="ab-value-num">03</span>
              <div className="ab-value-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3>Trust &amp; Transparency</h3>
              <p>Every CO₂ figure is sourced and dated. If we're estimating, we'll say so — and show our work.</p>
              <span className="more">See our methodology →</span>
            </article>

            <article className="ab-value-card reveal delay-3">
              <span className="ab-value-num">04</span>
              <div className="ab-value-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <path d="M9 9h.01M15 9h.01" />
                </svg>
              </div>
              <h3>Better Experience</h3>
              <p>Booking shouldn't feel like a tax form. Calm typography, fewer clicks, no dark patterns — ever.</p>
              <span className="more">Inside the product →</span>
            </article>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="ab-why">
        <div className="ab-container">
          <div className="ab-sec-head">
            <div className="reveal">
              <span className="ab-sec-eyebrow">Why EcoWings</span>
              <h2 className="ab-sec-title">The case for booking <em>here.</em></h2>
            </div>
            <p className="ab-sec-lede reveal delay-1">
              Four things you'll notice on day one — and four reasons people stay.
            </p>
          </div>

          <div className="ab-why-grid">
            <div className="ab-why-item reveal">
              <div className="ab-why-num">i.</div>
              <div>
                <h4>Easy flight search</h4>
                <p>From "I'm thinking about it" to "I've booked it" in under sixty seconds. Smart defaults, calm copy, no upsell labyrinth.</p>
              </div>
            </div>
            <div className="ab-why-item reveal delay-1">
              <div className="ab-why-num">ii.</div>
              <div>
                <h4>User-friendly booking</h4>
                <p>One screen, one summary, one confirmation. Clear breakdowns of fare, taxes, and impact — exactly where you'd expect them.</p>
              </div>
            </div>
            <div className="ab-why-item reveal delay-2">
              <div className="ab-why-num">iii.</div>
              <div>
                <h4>Eco-conscious perspective</h4>
                <p>Every route shows its carbon estimate, the aircraft generation, and a greener alternative if one exists. Yours to weigh.</p>
              </div>
            </div>
            <div className="ab-why-item reveal delay-3">
              <div className="ab-why-num">iv.</div>
              <div>
                <h4>Modern &amp; reliable platform</h4>
                <p>Built on a fault-tolerant booking core with 99.98% uptime, real-time inventory, and instant ticketing — the boring parts done well.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="ab-sus">
        <div className="ab-container">
          <div className="ab-sec-head">
            <div className="reveal">
              <span className="ab-sec-eyebrow">Sustainability</span>
              <h2 className="ab-sec-title">A lighter <em>footprint,</em> by default.</h2>
            </div>
            <p className="ab-sec-lede reveal delay-1">
              We don't promise a perfectly green flight — that doesn't exist. We promise the
              most thoughtful version of the one you're about to take.
            </p>
          </div>

          <div className="ab-sus-stats">
            <div className="ab-sus-stat reveal">
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20C5 20 3 15 3 12c0-3 2-7 8-9 0 6 3 8 6 9-1 5-3 8-6 8Z" />
                </svg>
              </div>
              <div className="big" data-count-to="23">0<em>%</em></div>
              <div className="ttl">Average CO₂ saved</div>
              <div className="sub">When travelers pick the eco-recommended route over the default search result.</div>
            </div>
            <div className="ab-sus-stat reveal delay-1">
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                </svg>
              </div>
              <div className="big" data-count-to="120">0<em>+</em></div>
              <div className="ttl">Smarter routes</div>
              <div className="sub">Continuously re-scored against fuel, aircraft generation, and seasonal wind patterns.</div>
            </div>
            <div className="ab-sus-stat reveal delay-2">
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5-3 8-7 8-13a8 8 0 1 0-16 0c0 6 3 10 8 13Z" />
                  <path d="M9 11h6M12 8v6" />
                </svg>
              </div>
              <div className="big" data-count-to="9">0</div>
              <div className="ttl">Partner airlines</div>
              <div className="sub">Each onboarded only after meeting our published efficiency and transparency criteria.</div>
            </div>
          </div>

          <div className="ab-sus-bar reveal delay-3">
            <div>
              <div className="lbl">Toward our 2030 goal</div>
              <div className="val">Net-zero booking operations</div>
            </div>
            <div className="ab-progress">
              <div className="ab-progress-fill" data-fill="62" />
            </div>
            <div className="ab-sus-bar-pct">62%</div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="ab-vision">
        <div className="ab-container">
          <div className="ab-vision-grid">
            <div className="ab-vision-visual reveal">
              <div className="ab-grid-art" />
              <div className="ab-vision-orbit">
                <div className="ab-orbit-ring r3" />
                <div className="ab-orbit-ring r2" />
                <div className="ab-orbit-ring r1" />
                <div className="ab-orbit-core">
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5-3 8-7 8-13a8 8 0 1 0-16 0c0 6 3 10 8 13Z" />
                    <path d="M12 22V8" />
                  </svg>
                </div>
                <div className="ab-orbit-pin p1" title="Engineering">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h6l3-7 3 14 3-7h3" />
                  </svg>
                </div>
                <div className="ab-orbit-pin p2" title="Climate Science">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20C5 20 3 15 3 12c0-3 2-7 8-9 0 6 3 8 6 9-1 5-3 8-6 8Z" />
                  </svg>
                </div>
                <div className="ab-orbit-pin p3" title="Travel Operations">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12 22 4l-4 18-5-7-7-3Z" />
                  </svg>
                </div>
                <div className="ab-orbit-pin p4" title="Design">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18M3 12h18" />
                  </svg>
                </div>
                <div className="ab-orbit-pin p5" title="Trust &amp; Safety">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="ab-vision-text reveal delay-1">
              <span className="ab-sec-eyebrow">Our Vision</span>
              <h2>
                Technology, travel, and the <em>planet</em>—on the same flight plan.
              </h2>
              <p>
                EcoWings is a small, deliberate team of engineers, climate scientists, and
                former airline operators. We came together around one belief: the people
                booking flights deserve more honest tools, and the planet deserves an industry
                willing to use them.
              </p>
              <p>
                We're not here to disrupt aviation. We're here to nudge it — one search, one
                booking, one informed traveler at a time.
              </p>
              <div className="ab-vision-pillars">
                <div className="ab-vision-pillar"><span className="pdot" /> Technology</div>
                <div className="ab-vision-pillar"><span className="pdot" /> Travel</div>
                <div className="ab-vision-pillar"><span className="pdot" /> Sustainability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ab-cta">
        <div className="ab-cta-card reveal">
          <span className="ab-eyebrow" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.14)", color: "#BFE3CC" }}>
            <span className="ab-dot" style={{ background: "#BFE3CC" }} />
            The Greener Way
          </span>
          <h2>Ready to start your <em>green</em> journey?</h2>
          <p>
            Search smarter routes, see honest impact figures, and book in calm. No
            greenwashing, no upsells — just a thoughtful way to fly.
          </p>
          <div className="ab-cta-actions">
            <a className="ab-btn ab-btn-primary ab-btn-lg" href="/flights">
              Explore Flights
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a className="ab-btn ab-btn-ghost ab-btn-lg" href="#">Read our impact report</a>
          </div>
        </div>
      </section>
    </div>
  );
}
