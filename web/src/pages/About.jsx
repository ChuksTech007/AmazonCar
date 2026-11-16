import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useCatalog } from '../context/Catalog'
import Seo from '../components/Seo'

export default function About() {
  const { site } = useCatalog()
  return (
    <div>
      <Seo title="About" path="/about" />
      <PageHero
        kicker="The company"
        title="Amason Car Sales"
        subtitle={site.tagline + ' ' + site.tagline2}
      />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <div className="mb-8 inline-block max-w-sm rounded-sm bg-navy p-5">
            <img src="/logo.png" alt="Amason Car Sales logo" className="logo-glow h-auto w-full object-contain" />
          </div>
          <h2 className="font-display text-3xl text-navy">A Kenyan name on a Japan-to-Kenya pipeline</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Amason Car Sales imports the cars Kenyan drivers search for — Toyota Prado, Harrier, Alphard, Hilux — and the luxury marques clients want on the driveway: BMW, Mercedes-Benz, Range Rover, Lexus.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            We buy in Japan, ship to Mombasa, clear with KRA and NTSA, and deliver to your door. The same desk now books cruise itineraries from Kenya and world ports into Thailand, Bali, the USA, South Africa and Zanzibar. Every figure is in Kenyan Shillings.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            Talk to a person on {site.phone}. Send a chassis number on WhatsApp. Get a landed figure, not a vague “from Japan” price.
          </p>
        </div>
        <img src="/cars/bmw7.jpg" alt="Amason luxury sedan" className="rounded-sm object-cover shadow-lg" />
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          {[
            ['Japan sourcing', 'Auction access and licensed exporters. Auction sheets shared before you pay.'],
            ['Mombasa clearing', 'Duty, IDF, RDL, port and inland transport handled as one file.'],
            ['Door delivery', 'Nairobi, Mombasa, Kisumu, Eldoret, Nakuru and the rest of Kenya.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-sm bg-white p-6">
              <h3 className="font-display text-2xl text-navy">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl text-navy">Company snapshot</h2>
        <div className="gold-line mt-4 mb-8" />
        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            ['Trading name', site.name],
            ['Market', 'Kenya'],
            ['Currency', 'Kenyan Shilling (KES)'],
            ['Sales line', site.phone],
            ['Email', site.email],
            ['Hours', site.hours],
            ['Port of entry', site.port],
            ['Office', `${site.city}, Kenya`],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-navy/10 pt-3">
              <dt className="text-xs tracking-widest text-muted uppercase">{k}</dt>
              <dd className="mt-1 font-semibold text-navy">{v}</dd>
            </div>
          ))}
        </dl>
        <Link to="/contact" className="btn-gold mt-10">
          Contact the desk
        </Link>
      </section>
    </div>
  )
}
