import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import EnquiryForm from '../components/EnquiryForm'
import { getCar } from '../data/cars'

export default function Enquire() {
  const [params] = useSearchParams()
  const car = getCar(params.get('car') || '')

  return (
    <div>
      <PageHero
        kicker="Enquire"
        title={car ? 'Request this vehicle' : 'Request a car from Japan'}
        subtitle="Tell us what you want. We reply with stock options and a Kenyan Shilling landed quote."
      />
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-sm bg-white p-6 shadow-sm">
          <EnquiryForm car={car} />
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
          ) : (
            <div className="rounded-sm bg-cream p-6">
              <h2 className="font-display text-2xl text-navy">Not seeing your car?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Send make, model, year from, fuel, maximum kilometres and budget in KES. We search Japanese auctions and come back with units that fit Kenya’s 8-year rule.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
