import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useCatalog } from '../context/Catalog'
import DutyBreakdown from '../components/DutyBreakdown'
import Seo from '../components/Seo'

const steps = [
  {
    t: '1. Choose a car — or ask us to find one',
    d: 'Browse current stock or send a brief: make, model, year, fuel, mileage cap and budget in KES. We bid at Japanese auctions and buy from licensed exporters.',
  },
  {
    t: '2. Receive a KES quote',
    d: 'Every quote shows CIF Mombasa in USD and KES, estimated KRA import duty, excise, VAT, IDF (3.5%), Railway Development Levy (2%), port and inland delivery. You see the landed number before you pay.',
  },
  {
    t: '3. Confirm and pay the invoice',
    d: 'Cash payment is due within seven days of the proforma invoice. We do not offer rent-to-own, zero deposit or monthly instalment ads. Once funds clear, we lock the unit.',
  },
  {
    t: '4. Inspection and export from Japan',
    d: 'The car is inspected, cleaned and given a Japanese export certificate. You receive the auction sheet, photos and chassis number. Pre-export inspection is arranged to KEBS / KS 1515.',
  },
  {
    t: '5. Shipping to Mombasa',
    d: 'RoRo or container, 4–6 weeks typical. You get the bill of lading and an ETA. We track the vessel until it berths.',
  },
  {
    t: '6. Customs, NTSA and door delivery',
    d: 'We clear at Mombasa, pay duty against the CRSP, complete NTSA inspection and deliver the car to your door anywhere in Kenya — Nairobi, Mombasa, Kisumu, Eldoret, Nakuru and beyond.',
  },
]

const rules = [
  'Right-hand drive only for Kenya registration.',
  'Under the 8-year rule: a car arriving in 2026 must generally be first registered 2019 or later.',
  'KEBS / KS 1515 roadworthiness and a matching chassis on the export certificate.',
  'KRA values duty on CRSP (current retail selling price), not only the invoice — we quote with that in mind.',
]

export default function ImportGuide() {
  const { site } = useCatalog()
  return (
    <div>
      <Seo
        title="How to import"
        description="Japan to Kenya import process, 8-year rule, and a KES duty breakdown: CIF, CRSP, import duty, excise, VAT, IDF and RDL."
        path="/import"
      />
      <PageHero
        kicker="How to import"
        title="From Japan to your gate"
        subtitle="A clear buying process for Kenyan clients. Payment in Kenyan Shillings. No surprise duty after the car docks."
      />
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="space-y-6">
          {steps.map((s) => (
            <article key={s.t} className="rounded-sm bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-navy">{s.t}</h2>
              <p className="mt-2 leading-relaxed text-muted">{s.d}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-sm bg-navy p-8 text-white">
          <h2 className="font-display text-3xl">Kenya import rules we work to</h2>
          <ul className="mt-4 space-y-2 text-white/80">
            {rules.map((r) => (
              <li key={r}>— {r}</li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-sm bg-cream p-6">
            <h3 className="font-display text-2xl text-navy">What you pay</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Vehicle (CIF Mombasa) + estimated duty stack + port + carrier to your city. Quoted in {site.currency}. USD is shown only as the CIF reference rate ({site.usdKes} KES per USD on this site).
            </p>
          </div>
          <div className="rounded-sm bg-cream p-6">
            <h3 className="font-display text-2xl text-navy">What we do not do</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We are not affiliated with rent-to-own, zero-deposit or “pay monthly from Japan” adverts circulating in Kenya. Official terms: cash on invoice, then we ship.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <DutyBreakdown />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/stock" className="btn-gold">
            Browse stock
          </Link>
          <Link to="/enquire" className="btn-navy">
            Request a car
          </Link>
        </div>
      </section>
    </div>
  )
}
