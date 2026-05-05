import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Globe from "@/components/ui/globe";
import { cn } from "@/lib/utils";

const defaultGlobeConfig = {
  positions: [
    { top: "40%", left: "71%", scale: 1.34 },
    { top: "23%", left: "61%", scale: 0.96 },
    { top: "17%", left: "76%", scale: 1.84 },
    { top: "44%", left: "60%", scale: 1.64 },
  ],
};

const parsePercent = (value) => parseFloat(String(value).replace("%", ""));

function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState("");
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const animationFrameId = useRef();

  const calculatedPositions = useMemo(
    () =>
      globeConfig.positions.map((position) => ({
        top: parsePercent(position.top),
        left: parsePercent(position.left),
        scale: position.scale,
      })),
    [globeConfig.positions],
  );

  const buildTransform = useCallback((position) => {
    const isDesktop = typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
    const xOffset = isDesktop ? -4 : 0;
    const yOffset = isDesktop ? -5 : -2;
    return `translate3d(calc(${position.left}vw + ${xOffset}px), calc(${position.top}vh + ${yOffset}px), 0) translate3d(-50%, -50%, 0) scale3d(${position.scale}, ${position.scale}, 1)`;
  }, []);

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);

    setScrollProgress(progress);

    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    sectionRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        newActiveSection = index;
      }
    });

    const currentPosition = calculatedPositions[newActiveSection];
    setGlobeTransform(buildTransform(currentPosition));
    setActiveSection(newActiveSection);
  }, [buildTransform, calculatedPositions]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      animationFrameId.current = requestAnimationFrame(() => {
        updateScrollPosition();
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollPosition();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateScrollPosition]);

  useEffect(() => {
    const initialPosition = calculatedPositions[0];
    setGlobeTransform(buildTransform(initialPosition));
  }, [buildTransform, calculatedPositions]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "globe-scroll-page relative min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background pt-24 text-foreground sm:pt-28",
        className,
      )}
    >
      <div className="fixed left-0 top-[72px] z-50 h-0.5 w-full bg-gradient-to-r from-border/20 via-border/40 to-border/20">
        <div
          className="h-full bg-gradient-to-r from-primary via-blue-600 to-blue-900 shadow-sm will-change-transform"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: "left center",
            transition: "transform 0.15s ease-out",
            filter: "drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))",
          }}
        />
      </div>

      <div className="fixed right-2 top-1/2 z-40 hidden -translate-y-1/2 sm:flex sm:right-4 lg:right-8">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="group relative">
              <div
                className={cn(
                  "nav-label absolute right-5 top-1/2 z-50 -translate-y-1/2 rounded-md border border-border/60 bg-background/95 px-2 py-1 text-xs font-medium whitespace-nowrap shadow-xl backdrop-blur-md sm:right-6 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm lg:right-8 lg:px-4 lg:py-2",
                  activeSection === index ? "animate-fadeOut" : "opacity-0",
                )}
              >
                <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse sm:h-1.5 sm:w-1.5 lg:h-2 lg:w-2" />
                  <span className="text-xs sm:text-sm lg:text-base">{section.badge || `Section ${index + 1}`}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  sectionRefs.current[index]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className={cn(
                  "relative h-2 w-2 rounded-full border-2 transition-all duration-300 hover:scale-125 before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3",
                  activeSection === index
                    ? "border-primary bg-primary shadow-lg before:animate-ping before:bg-primary/20"
                    : "border-muted-foreground/40 bg-transparent hover:border-primary/60 hover:bg-primary/10",
                )}
                aria-label={`Go to ${section.badge || `section ${index + 1}`}`}
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-1/2 top-0 -z-10 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent lg:w-px" />
      </div>

      <div
        className="pointer-events-none fixed z-10 transition-all duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
        style={{
          transform: globeTransform,
          filter: `opacity(${activeSection === 3 ? 0.4 : 0.85})`,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100">
          <Globe />
        </div>
      </div>

      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(element) => {
            sectionRefs.current[index] = element;
          }}
          className="relative z-20 flex min-h-screen w-full justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-20"
        >
          <div className="mx-auto flex w-full max-w-[1200px] items-center">
            <div className="w-full max-w-sm translate-y-0 text-left opacity-100 transition-all duration-700 will-change-transform sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <h1
              className={cn(
                "mb-6 font-bold leading-[1.1] tracking-tight sm:mb-8",
                index === 0
                  ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
                  : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl",
              )}
            >
              {section.subtitle ? (
                <div className="space-y-1 sm:space-y-2">
                  <div className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {section.title}
                  </div>
                  <div className="text-[0.6em] font-medium tracking-wider text-muted-foreground/90 sm:text-[0.7em]">
                    {section.subtitle}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  {section.title}
                </div>
              )}
            </h1>

            <div
              className={cn(
                "mb-8 text-base leading-relaxed font-light text-muted-foreground/80 sm:mb-10 sm:text-lg lg:text-xl",
                "max-w-full",
              )}
            >
              <p className="mb-3 sm:mb-4">{section.description}</p>
              {index === 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/60 sm:mt-6 sm:gap-4 sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    <span>Interactive Experience</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <span>Scroll to Explore</span>
                  </div>
                </div>
              )}
            </div>

            {section.features && (
              <div className="mb-8 grid gap-3 sm:mb-10 sm:gap-4">
                {section.features.map((feature, featureIndex) => (
                  <div
                    key={feature.title}
                    className="group rounded-lg border bg-card/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm sm:rounded-xl sm:p-5 lg:p-6"
                    style={{ animationDelay: `${featureIndex * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60 transition-colors group-hover:bg-primary sm:mt-2 sm:h-2 sm:w-2" />
                      <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                        <h3 className="text-base font-semibold text-card-foreground sm:text-lg">{feature.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground/80 sm:text-base">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.actions && (
              <div
                className={cn(
                  "flex flex-col flex-wrap gap-3 sm:flex-row sm:gap-4",
                  "justify-start",
                )}
              >
                {section.actions.map((action, actionIndex) => (
                  action.href ? (
                    <Link
                      key={action.label}
                      to={action.href}
                      className={cn(
                        "group relative inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/20 hover:shadow-lg sm:w-auto sm:rounded-xl sm:px-8 sm:py-4 sm:text-base",
                        action.variant === "primary"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30"
                          : "border-2 border-border/60 bg-background/60 text-foreground backdrop-blur-sm hover:border-primary/30 hover:bg-accent/40",
                      )}
                      style={{ animationDelay: `${actionIndex * 0.1 + 0.2}s` }}
                    >
                      <span className="relative z-10">{action.label}</span>
                      {action.variant === "primary" && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-xl" />
                      )}
                    </Link>
                  ) : (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={cn(
                        "group relative w-full rounded-lg px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20 hover:shadow-lg sm:w-auto sm:rounded-xl sm:px-8 sm:py-4 sm:text-base",
                        action.variant === "primary"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30"
                          : "border-2 border-border/60 bg-background/60 text-foreground backdrop-blur-sm hover:border-primary/30 hover:bg-accent/40",
                      )}
                      style={{ animationDelay: `${actionIndex * 0.1 + 0.2}s` }}
                    >
                      <span className="relative z-10">{action.label}</span>
                      {action.variant === "primary" && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-xl" />
                      )}
                    </button>
                  )
                ))}
              </div>
            )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export default function GlobeScrollDemo() {
  const demoSections = [
    {
      id: "hero",
      badge: "About EcoWings",
      title: "Smarter Flights",
      subtitle: "Greener Journeys",
      description:
        "EcoWings helps travelers discover flights with more climate awareness, better route visibility and a cleaner booking experience. We combine smart travel technology with sustainability-first thinking so every trip can feel more informed, efficient and responsible.",
      align: "left",
      actions: [
        { label: "Explore Flights", variant: "primary", href: "/flights" },
        { label: "Join EcoWings", variant: "secondary", href: "/signup" },
      ],
    },
    {
      id: "mission",
      badge: "Mission",
      title: "Sustainable Travel, Designed for Real People",
      description:
        "Our mission is to make eco-conscious air travel easier to understand and easier to choose. From flight discovery to route comparison, EcoWings turns complex travel decisions into simple actions backed by transparent information and user-friendly tools.",
      align: "left",
      features: [
        {
          title: "Transparent flight decisions",
          description: "We surface useful travel details so users can compare routes with greater clarity and confidence.",
        },
        {
          title: "Traveler-first product thinking",
          description: "Every EcoWings experience is designed to reduce friction, save time and keep information accessible.",
        },
      ],
    },
    {
      id: "platform",
      badge: "Platform",
      title: "Why Travelers Choose",
      subtitle: "EcoWings",
      description:
        "EcoWings is more than a booking interface. It is a growing travel platform focused on cleaner mobility, intuitive tools and a better relationship between technology, aviation and environmental responsibility.",
      align: "left",
      features: [
        { title: "Flight search with purpose", description: "Search routes quickly while keeping sustainability and smarter planning in view." },
        { title: "Clear, modern travel experience", description: "A simpler interface helps travelers focus on the best route instead of endless booking noise." },
        { title: "Built for the future of aviation", description: "EcoWings supports a long-term vision where innovation and environmental awareness move together." },
      ]
    },
    {
      id: "vision",
      badge: "Vision",
      title: "A Better Future",
      subtitle: "Starts With Better Choices",
      description:
        "We believe the future of travel should be efficient, transparent and more respectful of the planet. EcoWings exists to help travelers, teams and modern explorers move forward with a stronger understanding of how their journeys can create less impact and more value.",
      align: "left",
      actions: [
        { label: "Create Free Account", variant: "primary", href: "/signup" },
        { label: "Read Reviews", variant: "secondary", href: "/comments" },
      ],
    },
  ];

  return <ScrollGlobe sections={demoSections} className="bg-gradient-to-br from-background via-muted/20 to-background" />;
}
