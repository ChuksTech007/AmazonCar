export default function PageHero({ kicker, title, subtitle }) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy mx-auto max-w-7xl px-4 py-16 text-white">
        {kicker && (
          <p className="text-xs font-semibold tracking-[0.28em] text-gold-2 uppercase">{kicker}</p>
        )}
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        <div className="gold-line mt-4" />
        {subtitle && <p className="mt-4 max-w-2xl text-white/75">{subtitle}</p>}
      </div>
    </section>
  )
}
