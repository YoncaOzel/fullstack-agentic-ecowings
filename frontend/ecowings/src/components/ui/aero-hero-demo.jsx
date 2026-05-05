export default function Hero() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center">
      {/* Grid overlay */}
      <div className="absolute inset-0 z-10 size-full">
        <div className="grid w-full grid-cols-12 divide-x divide-white/20">
          <div className="col-span-1 h-screen" />
          <div className="col-span-3 h-screen" />
          <div className="col-span-4 h-screen" />
          <div className="col-span-3 h-screen" />
          <div className="col-span-1 h-screen" />
        </div>
      </div>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="aero-hero-content relative z-20 max-w-5xl px-6 text-center">
        <h1 className="text-center font-normal text-5xl tracking-tight md:text-6xl lg:text-8xl">
          Sustainable Solutions for a Better Future
        </h1>

        <p className="mx-auto max-w-2xl text-center font-light text-lg md:text-xl">
          Empowering businesses and communities to thrive in a low-carbon world
          through tailored clean energy solutions.
        </p>
      </div>
    </section>
  );
}
