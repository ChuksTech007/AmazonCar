import { Link, useParams } from 'react-router-dom'
import EnquiryForm from '../components/EnquiryForm'
import Seo from '../components/Seo'
import { useCatalog } from '../context/Catalog'
import { formatKes, formatUsd } from '../lib/format'
import { mediaUrl } from '../lib/media'

export default function CruiseDetail() {
  const { slug } = useParams()
  const { getCruise, WHATSAPP_URL } = useCatalog()
  const cruise = getCruise(slug)

  if (!cruise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Package not found</h1>
        <Link to="/cruises" className="btn-gold mt-6">
          Back to cruises
        </Link>
      </div>
    )
  }

  const photos = cruise.images?.length ? cruise.images : [cruise.image]

  return (
    <div>
      <Seo title={cruise.title} description={cruise.description} image={cruise.image} path={`/cruises/${cruise.slug}`} />
      <section className="bg-navy py-6 text-white">
        <div className="mx-auto max-w-7xl px-4 text-sm text-white/60">
          <Link to="/">Home</Link> / <Link to="/cruises">Cruises</Link> / {cruise.title}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <img src={mediaUrl(photos[0], 1400)} alt={cruise.title} className="frame-photo rounded-sm" />
          <div className="mt-8 rounded-sm bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-navy">Itinerary</h2>
            <ol className="mt-4 space-y-4">
              {(cruise.itinerary || []).map((day) => (
                <li key={`${day.day}-${day.port}`} className="border-t border-cream pt-4">
                  <p className="text-[11px] font-semibold tracking-widest text-gold-3 uppercase">
                    Day {day.day} · {day.port}
                  </p>
                  <h3 className="font-display text-xl text-navy">{day.title}</h3>
                  <p className="mt-1 text-sm text-muted">{day.summary}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 rounded-sm bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-navy">Included</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {(cruise.inclusions || []).map((item) => (
                <li key={item} className="text-sm text-muted">
                  — {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside>
          <div className="rounded-sm bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.22em] text-gold-3 uppercase">
              {cruise.destination} · from {cruise.origin}
            </p>
            <h1 className="mt-2 font-display text-3xl text-navy">{cruise.title}</h1>
            <p className="mt-3 text-sm text-muted">{cruise.description}</p>
            <p className="mt-4 text-[11px] tracking-wide text-muted uppercase">Package from</p>
            <p className="price text-4xl">{formatKes(cruise.priceKes)}</p>
            {cruise.priceUsd ? <p className="text-sm text-muted">{formatUsd(cruise.priceUsd)} reference</p> : null}
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Nights', cruise.nights],
                ['Ship', cruise.ship],
                ['Cabin', cruise.cabin],
                ['Fly from', cruise.flyFrom],
                ['Next departure', cruise.nextDeparture],
                ['Operator', cruise.operator],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-cream pt-2">
                  <dt className="text-[11px] tracking-widest text-muted uppercase">{k}</dt>
                  <dd className="font-semibold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
            <a
              className="btn-gold mt-6"
              href={WHATSAPP_URL(
                `Hello Amason, I want the ${cruise.title} (${cruise.destination}) departing ${cruise.nextDeparture}. Please share the KES package breakdown.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp this cruise
            </a>
          </div>
          <div className="mt-6 rounded-sm bg-cream p-6">
            <h2 className="font-display text-2xl text-navy">Request this package</h2>
            <p className="mb-4 text-sm text-muted">We reply with cabin availability and a KES invoice.</p>
            <EnquiryForm cruise={cruise} />
          </div>
        </aside>
      </section>
    </div>
  )
}
