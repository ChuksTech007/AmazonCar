import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { NAV } from '../data/site'
import { useCatalog } from '../context/Catalog'
import { useStore } from '../context/Store'

export default function Header() {
  const { menuOpen, setMenuOpen, compare } = useStore()
  const { site, TEL_URL, WHATSAPP_URL } = useCatalog()
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const runSearch = (e) => {
    e.preventDefault()
    const query = q.trim()
    setSearchOpen(false)
    setMenuOpen(false)
    navigate(query ? `/stock?q=${encodeURIComponent(query)}` : '/stock')
  }

  const toggleSearch = () => {
    setSearchOpen((open) => !open)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy text-gold-2 text-[12px] tracking-wide">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <p className="hidden sm:block">
            {site.tagline} <span className="text-white/80">{site.tagline2}</span>
          </p>
          <p className="min-w-0 truncate sm:hidden">Priced in Kenyan Shillings · Door delivery</p>
          <div className="flex shrink-0 items-center gap-4 font-semibold">
            <a href={TEL_URL} className="hidden hover:text-white sm:inline">
              {site.phone}
            </a>
            <a href={WHATSAPP_URL()} className="hidden sm:inline hover:text-white" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 bg-navy-2/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
          <Link to="/" className="min-w-0" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="Amason Car Sales" className="logo-glow h-[72px] w-auto object-contain object-left transition duration-300 hover:brightness-110 sm:h-[108px]" />
          </Link>

          <nav className="hidden items-center justify-center gap-5 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2">
            {compare.length > 0 && (
              <span className="hidden rounded bg-gold px-2 py-1 text-[11px] font-bold text-navy sm:inline">
                Compare {compare.length}
              </span>
            )}
            <button
              type="button"
              className={`inline-flex h-10 items-center gap-2 rounded border px-2 text-xs font-bold tracking-widest uppercase sm:px-3 ${
                searchOpen ? 'border-gold bg-gold text-navy' : 'border-gold/70 text-gold-2 hover:bg-gold hover:text-navy'
              }`}
              onClick={toggleSearch}
              aria-expanded={searchOpen}
              aria-label="Search cars"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
            <Link to="/enquire" className="btn-gold hidden md:inline-flex">
              Enquire
            </Link>
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded border border-white/20 text-white lg:hidden"
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="slide-down border-t border-white/10 bg-navy px-4 py-4">
            <form onSubmit={runSearch} className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row">
              <input
                autoFocus
                className="field"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search make, model, stock number…"
                aria-label="Search stock"
              />
              <button className="btn-gold shrink-0" type="submit">
                Search cars
              </button>
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="slide-down border-t border-white/10 bg-navy px-4 py-4 lg:hidden">
            <form onSubmit={runSearch} className="mb-4 flex gap-2">
              <input
                className="field"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cars…"
                aria-label="Search stock"
              />
              <button className="btn-gold shrink-0 !px-4" type="submit">
                Search
              </button>
            </form>
            <div className="flex flex-col gap-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded px-2 py-2 text-sm font-semibold uppercase tracking-widest ${
                      isActive ? 'bg-white/10 text-gold-2' : 'text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/enquire" onClick={() => setMenuOpen(false)} className="btn-gold mt-2">
                Enquire now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
