import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import CarCard from '../components/CarCard'
import { featuredCars, availableCount, BODIES, MAKES, CARS } from '../data/cars'
import { SITE, TEL_URL, WHATSAPP_URL } from '../data/site'
import { formatKes } from '../lib/format'

const steps = [
  { n: '01', t: 'Choose or request', d: 'Browse live stock or tell us the make, year and budget. We source from Japan auctions and dealers.' },
  { n: '02', t: 'KES quote', d: 'You receive CIF Mombasa plus estimated KRA duty, IDF, RDL and port charges — all in Kenyan Shillings.' },
  { n: '03', t: 'Pay and ship', d: 'Confirm, pay the invoice, and we inspect, export and load. Typical sea time to Mombasa is 4–6 weeks.' },
  { n: '04', t: 'Door delivery', d: 'We clear at Mombasa, handle NTSA inspection and deliver the car to your door anywhere in Kenya.' },
]

const bodyCopy = {
  SUV: 'Harrier, Land Cruiser, Range Rover, Discovery Sport',
  Sedan: 'Premio, C-Class, 7 Series',
  Pickup: 'Ranger Wildtrak, Hilux',
  MPV: 'Alphard, Noah',
}

export default function Home() {
  const featured = featuredCars()
  const lowest = Math.min(...CARS.filter((c) => c.status === 'available').map((c) => c.priceKes))

  return (
    <div>
      <section className="relative min-h-[calc(100svh-7.5rem)] overflow-hidden bg-navy">
        <img src="/cars/hero.jpg" alt="Amason luxury import" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/70 to-navy/25" />
        <div className="relative mx-auto flex min-h-[calc(100svh-7.5rem)] max-w-7xl flex-col justify-end px-4 py-10 sm:py-14">
          <img src="/logo.png" alt="Amason Car Sales" className="logo-glow mb-5 h-auto w-56 self-start sm:w-72" />
          <p className="text-xs font-semibold tracking-[0.35em] text-gold-2 uppercase">Official importer · Kenya</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-white sm:text-6xl">
            {SITE.tagline}
            <span className="block italic text-gold-2">{SITE.tagline2}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/75">
            Japan (Goo-net) and UK (AutoTrader) stock, inspected at source, cleared at Mombasa and priced in {SITE.currency}. Call {SITE.phone}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/stock" className="btn-gold">
              Browse stock
            </Link>
            <a href={WHATSAPP_URL()} className="btn-ghost" target="_blank" rel="noreferrer">
              WhatsApp sales
            </a>
            <a href={TEL_URL} className="btn-ghost hidden sm:inline-flex">
              {SITE.phone}
            </a>
          </div>
          <div className="mt-10 max-w-5xl">
            <SearchBar dark />
          </div>
        </div>
      </section>

      <section className="bg-navy-2 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-4">
          {[
            [availableCount(), 'Vehicles in stock'],
            [formatKes(lowest), 'Stock from'],
            ['4–6 wks', 'Japan to Mombasa'],
            ['Door-to-door', 'Anywhere in Kenya'],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="stat-num text-2xl sm:text-3xl">{n}</p>
              <p className="mt-2 text-sm text-white/60">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">Approved stock</p>
            <h2 className="mt-2 font-display text-4xl text-navy">Featured vehicles</h2>
            <div className="gold-line mt-4" />
          </div>
          <Link to="/stock" className="btn-navy">
            View all stock
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <CarCard key={car.slug} car={car} />
          ))}
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-4xl text-navy">Shop by body style</h2>
          <div className="gold-line mt-4" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BODIES.map((b) => (
              <Link
                key={b}
                to={`/stock?body=${encodeURIComponent(b)}`}
                className="card-hover rounded-sm bg-navy p-6 text-white"
              >
                <p className="font-display text-2xl">{b}</p>
                <p className="mt-2 text-sm text-white/60">{bodyCopy[b] || 'View stock'}</p>
                <p className="mt-6 text-xs font-bold tracking-widest text-gold-2 uppercase">Explore →</p>
              </Link>
            ))}
          </div>
          <h3 className="mt-14 font-display text-2xl text-navy">Shop by make</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {MAKES.map((m) => (
              <Link
                key={m}
                to={`/stock?make=${encodeURIComponent(m)}`}
                className="rounded-sm border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-gold"
              >
                {m}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">How it works</p>
        <h2 className="mt-2 font-display text-4xl text-navy">Import with us in four steps</h2>
        <div className="gold-line mt-4" />
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-sm border border-navy/10 bg-white p-6">
              <p className="font-display text-3xl text-gold">{s.n}</p>
              <h3 className="mt-3 font-display text-xl text-navy">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <Link to="/import" className="btn-gold mt-8">
          Full import guide
        </Link>
      </section>

      <section className="relative overflow-hidden bg-navy py-16 text-white">
        <img src="/stock/lc300/01.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-gold-2 uppercase">Why Amason</p>
            <h2 className="mt-2 font-display text-4xl">A Kenyan importer with Japan access</h2>
            <p className="mt-4 text-white/75">
              We buy the cars Kenyans actually drive — Prado, Harrier, Alphard, Hilux — plus UK Range Rovers and Rangers. Every unit is right-hand drive, within the 8-year rule, and quoted in KES before you pay.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li>— Auction sheets and export certificates shared before shipping</li>
              <li>— Transparent CIF Mombasa + estimated KRA duty</li>
              <li>— Clearing at Mombasa and NTSA inspection support</li>
              <li>— Nationwide door delivery from {SITE.city}</li>
            </ul>
            <Link to="/about" className="btn-gold mt-8">
              About the company
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Cash on invoice', 'Payment within 7 days of the proforma. No rent-to-own, no fake zero-deposit ads.'],
              ['WhatsApp-first sales', `${SITE.phone} — talk to a person, send a chassis number, get a KES figure.`],
              ['Family + luxury', 'From Premio to 7 Series. One importer for the whole driveway.'],
              ['After-sales path', 'We remain on the line after the car is at your gate.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-sm bg-white/5 p-5 ring-1 ring-gold/30">
                <h3 className="font-display text-lg text-gold-2">{t}</h3>
                <p className="mt-2 text-sm text-white/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-4xl text-navy">Clients across Kenya</h2>
          <div className="gold-line mt-4" />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ['James, Westlands', 'Imported a 2022 Prado TX-L. Quote was in KES, landed figure matched, and they delivered to the house in 6 weeks.'],
              ['Amina, Mombasa', 'Wanted an Alphard for family trips. Amason sourced a black 2020, sent the auction sheet, and cleared it locally.'],
              ['David, Eldoret', 'Hilux double cab for the farm. WhatsApp updates from Japan to the gate. No surprises on duty.'],
            ].map(([n, q]) => (
              <blockquote key={n} className="rounded-sm bg-white p-6 shadow-sm">
                <p className="text-sm leading-relaxed text-muted">“{q}”</p>
                <footer className="mt-4 text-sm font-semibold text-navy">{n}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
