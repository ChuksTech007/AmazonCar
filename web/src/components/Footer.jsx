import { Link } from 'react-router-dom'
import { SITE, TEL_URL, WHATSAPP_URL } from '../data/site'
import { MAKES } from '../data/cars'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img src="/logo.png" alt="Amason Car Sales" className="logo-glow mb-4 h-28 w-auto" />
          <p className="text-sm leading-relaxed text-white/70">
            {SITE.tagline} {SITE.tagline2} Japan and UK vehicles sourced, cleared at Mombasa, and delivered anywhere in Kenya. All stock priced in Kenyan Shillings.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.2em] text-gold-2 uppercase">Explore</h3>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            <Link to="/stock">Current stock</Link>
            <Link to="/import">How to import</Link>
            <Link to="/about">About Amason</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/enquire">Request a car</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.2em] text-gold-2 uppercase">Makes</h3>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            {MAKES.slice(0, 8).map((m) => (
              <Link key={m} to={`/stock?make=${encodeURIComponent(m)}`}>
                {m}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.2em] text-gold-2 uppercase">Talk to us</h3>
          <p className="text-sm text-white/80">
            {SITE.city}, Kenya
            <br />
            Clearing: {SITE.port} Port
          </p>
          <a href={TEL_URL} className="mt-3 block font-display text-xl text-gold-2">
            {SITE.phone}
          </a>
          <a href={WHATSAPP_URL()} className="mt-1 block text-sm text-white/80" target="_blank" rel="noreferrer">
            WhatsApp sales
          </a>
          <a href={`mailto:${SITE.email}`} className="mt-1 block text-sm text-white/80">
            {SITE.email}
          </a>
          <p className="mt-3 text-xs text-white/50">{SITE.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {SITE.name}. All prices in {SITE.currency}. CIF Mombasa plus estimated Kenya duty.
      </div>
    </footer>
  )
}
