import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCc, formatKes, formatKm, formatUsd, formatYen, carFullTitle, usdToKes } from '../lib/format'
import EnquiryForm from '../components/EnquiryForm'
import CarCard from '../components/CarCard'
import DutyBreakdown from '../components/DutyBreakdown'
import Seo from '../components/Seo'
import { useCatalog } from '../context/Catalog'
import { useStore } from '../context/Store'
import { mediaUrl } from '../lib/media'

export default function CarDetail() {
  const { slug } = useParams()
  const { getCar, similarCars, WHATSAPP_URL } = useCatalog()
  const car = getCar(slug)
  const { toggleCompare, compare, toggleSaved, saved } = useStore()
  const [active, setActive] = useState(0)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setActive(0)
    setTab('overview')
  }, [slug])

  if (!car) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Vehicle not found</h1>
        <Link to="/stock" className="btn-gold mt-6">
          Back to stock
        </Link>
      </div>
    )
  }

  const similar = similarCars(car)
  const cifKes = usdToKes(car.cifUsd)
  const photos = car.images?.length ? car.images : [car.image]
  const photo = photos[Math.min(active, photos.length - 1)]

  const specRows = [
    ['Stock no.', car.stockNo || car.id],
    ['Year / month', `${car.year}/${String(car.month).padStart(2, '0')}`],
    ['Make', car.make],
    ['Model', car.model],
    ['Grade', car.grade],
    ['Mileage', formatKm(car.mileage)],
    ['Engine', `${formatCc(car.engineCc)} ${car.fuel}`],
    ['Transmission', car.transmission],
    ['Drive', car.drive],
    ['Colour', car.color],
    ['Body', car.body],
    ['Seats / doors', `${car.seats} / ${car.doors}`],
    ['Chassis', car.chassis],
    ['Inspection', car.auctionGrade],
    ['Source', car.source],
    ['Location', car.location],
    ['ETA', car.eta],
  ]

  const go = (dir) => setActive((i) => (i + dir + photos.length) % photos.length)

  return (
    <div>
      <Seo
        title={carFullTitle(car)}
        description={`${carFullTitle(car)} from ${car.source}, estimated landed Kenya ${car.priceKes}. ${car.description || ''}`}
        image={car.image}
        path={`/stock/${car.slug}`}
      />
      <section className="bg-navy py-6 text-white">
        <div className="mx-auto max-w-7xl px-4 text-sm text-white/60">
          <Link to="/">Home</Link> / <Link to="/stock">Stock</Link> / {carFullTitle(car)}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="relative overflow-hidden rounded-sm bg-navy">
            <img key={photo} src={mediaUrl(photo, 1400)} alt={`${carFullTitle(car)} photo ${active + 1}`} className="frame-photo photo-fade" />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                >
                  ›
                </button>
                <span className="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  {active + 1} / {photos.length}
                </span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
              {photos.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-sm ring-2 ${i === active ? 'ring-gold' : 'ring-transparent'}`}
                >
                  <img src={mediaUrl(src, 240)} alt="" className="h-16 w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-sm bg-white shadow-sm">
            <div className="flex border-b border-cream">
              {[
                ['overview', 'Overview'],
                ['photos', `Photos (${photos.length})`],
                ['specs', 'Specifications'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-5 py-3 text-xs font-bold tracking-widest uppercase ${
                    tab === id ? 'border-b-2 border-gold text-navy' : 'text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="p-6">
              {tab === 'overview' && (
                <>
                  <h2 className="font-display text-2xl text-navy">Vehicle overview</h2>
                  <p className="mt-3 leading-relaxed text-muted">{car.description}</p>
                  <h3 className="mt-8 font-display text-xl text-navy">Equipment</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(car.equipment || []).map((e) => (
                      <li key={e} className="text-sm text-muted">
                        — {e}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {tab === 'photos' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {photos.map((src, i) => (
                    <button key={src + i} type="button" onClick={() => { setActive(i); setTab('overview') }}>
                      <img src={mediaUrl(src, 900)} alt={`${carFullTitle(car)} ${i + 1}`} className="frame-photo w-full rounded-sm" />
                    </button>
                  ))}
                </div>
              )}
              {tab === 'specs' && (
                <table className="w-full text-sm">
                  <tbody>
                    {specRows.map(([k, v]) => (
                      <tr key={k} className="border-b border-cream">
                        <th className="w-40 py-2 pr-4 text-left text-[11px] font-semibold tracking-widest text-muted uppercase">{k}</th>
                        <td className="py-2 font-semibold text-navy">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <aside>
          <div className="rounded-sm bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.22em] text-gold-3 uppercase">
              {car.status} · {car.source} · Stock {car.stockNo || car.id}
            </p>
            <h1 className="mt-2 font-display text-3xl text-navy">{carFullTitle(car)}</h1>
            <p className="mt-4 text-[11px] tracking-wide text-muted uppercase">Estimated landed Kenya</p>
            <p className="price text-4xl">{formatKes(car.priceKes)}</p>
            <p className="mt-2 text-sm text-muted">
              CIF Mombasa {formatUsd(car.cifUsd)} · {formatKes(cifKes)}
            </p>
            {car.fobJpy ? (
              <p className="mt-1 text-sm text-muted">FOB Japan {formatYen(car.fobJpy)}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted">Landed figure includes typical KRA duty, IDF, RDL and port. Final duty follows CRSP.</p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {specRows.slice(0, 12).map(([k, v]) => (
                <div key={k} className="border-t border-cream pt-2">
                  <dt className="text-[11px] tracking-widest text-muted uppercase">{k}</dt>
                  <dd className="font-semibold text-navy">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <a
                className="btn-gold"
                href={WHATSAPP_URL(`Hello Amason, I am enquiring about ${carFullTitle(car)} stock ${car.stockNo || car.id}. Please share the KES landed breakdown.`)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp this car
              </a>
              <button className="btn-navy" onClick={() => toggleCompare(car.slug)}>
                {compare.includes(car.slug) ? 'In compare' : 'Add to compare'}
              </button>
              <button className="text-sm font-semibold" onClick={() => toggleSaved(car.slug)}>
                {saved.includes(car.slug) ? 'Saved' : 'Save this car'}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-sm bg-cream p-6">
            <h2 className="font-display text-2xl text-navy">Request this unit</h2>
            <p className="mb-4 text-sm text-muted">We reply with a full KES breakdown and shipping window.</p>
            <EnquiryForm car={car} />
          </div>

          {(car.auctionSheetUrl || car.exportCertUrl) && (
            <div className="mt-6 rounded-sm bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-navy">Inspection documents</h2>
              <div className="mt-3 flex flex-col gap-2">
                {car.auctionSheetUrl && (
                  <a className="text-sm font-semibold text-navy" href={car.auctionSheetUrl} target="_blank" rel="noreferrer">
                    Auction sheet PDF →
                  </a>
                )}
                {car.exportCertUrl && (
                  <a className="text-sm font-semibold text-navy" href={car.exportCertUrl} target="_blank" rel="noreferrer">
                    Export certificate PDF →
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <DutyBreakdown car={car} />
          </div>
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="font-display text-3xl text-navy">Similar stock</h2>
          <div className="gold-line mt-4 mb-8" />
          <div className="grid gap-6 md:grid-cols-3">
            {similar.map((c) => (
              <CarCard key={c.slug} car={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
