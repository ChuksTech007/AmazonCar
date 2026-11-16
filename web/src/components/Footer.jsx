import { Link } from 'react-router-dom'
import { useCatalog } from '../context/Catalog'

export default function Footer() {
  const { site, makes, TEL_URL, WHATSAPP_URL } = useCatalog()
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img src="/logo.png" alt="Amason Car Sales" className="logo-glow mb-4 h-28 w-auto" />
          <p className="text-sm leading-relaxed text-white/70">
            {site.tagline} {site.tagline2} Japan and UK vehicles sourced, cleared at Mombasa, and cruise packages to Thailand, Bali, USA, South Africa and Zanzibar. Priced in Kenyan Shillings.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.2em] text-gold-2 uppercase">Explore</h3>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            <Link to="/stock">Current stock</Link>
            <Link to="/cruises">Cruise itineraries</Link>
            <Link to="/import">How to import</Link>
            <Link to="/about">About Amason</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/enquire">Request a car</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.2em] text-gold-2 uppercase">Makes</h3>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            {makes.slice(0, 8).map((m) => (
              <Link key={m} to={`/stock?make=${encodeURIComponent(m)}`}>
                {m}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.2em] text-gold-2 uppercase">Talk to us</h3>
          <p className="text-sm text-white/80">
            {site.city}, Kenya
            <br />
            Clearing: {site.port} Port
          </p>
          <a href={TEL_URL} className="mt-3 block font-display text-xl text-gold-2">
            {site.phone}
          </a>
          <a href={WHATSAPP_URL()} className="mt-1 block text-sm text-white/80" target="_blank" rel="noreferrer">
            WhatsApp sales
          </a>
          <a href={`mailto:${site.email}`} className="mt-1 block text-sm text-white/80">
            {site.email}
          </a>
          <p className="mt-3 text-xs text-white/50">{site.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {site.name}. All prices in {site.currency}. CIF Mombasa plus estimated Kenya duty.
      </div>
    </footer>
  )
}
