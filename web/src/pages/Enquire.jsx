import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import EnquiryForm from '../components/EnquiryForm'
import Seo from '../components/Seo'
import { useCatalog } from '../context/Catalog'

export default function Enquire() {
  const [params] = useSearchParams()
  const { getCar, getCruise } = useCatalog()
  const car = getCar(params.get('car') || '')
  const cruise = getCruise(params.get('cruise') || '')

  return (
    <div>
      <Seo
        title={car ? 'Request this vehicle' : cruise ? 'Request this cruise' : 'Enquire'}
        path="/enquire"
      />
      <PageHero
        kicker="Enquire"
        title={car ? 'Request this vehicle' : cruise ? 'Request this cruise' : 'Request a car or cruise'}
        subtitle="Tell us what you want. We reply with a Kenyan Shilling quote — landed car or cruise package."
      />
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-sm bg-white p-6 shadow-sm">
          <EnquiryForm car={car} cruise={cruise} />
        </div>
        <div>
          {car ? (
            <div className="overflow-hidden rounded-sm bg-navy text-white">
              <img src={car.image} alt="" className="h-52 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs tracking-widest text-gold-2 uppercase">{car.id}</p>
                <h2 className="font-display text-2xl">
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-white/70">{car.grade}</p>
              </div>
            </div>
          ) : cruise ? (
            <div className="overflow-hidden rounded-sm bg-navy text-white">
              <img src={cruise.image} alt="" className="h-52 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs tracking-widest text-gold-2 uppercase">{cruise.destination}</p>
                <h2 className="font-display text-2xl">{cruise.title}</h2>
                <p className="text-white/70">
                  {cruise.nights} nights · from {cruise.origin}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-sm bg-cream p-6">
              <h2 className="font-display text-2xl text-navy">Not seeing your car or sailing?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Send make, model and budget in KES — or a cruise destination (Thailand, Bali, USA, South Africa, Zanzibar)
                and travel month. The desk replies on WhatsApp.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
