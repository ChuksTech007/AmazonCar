import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'
import CruiseCard from '../components/CruiseCard'
import Seo from '../components/Seo'
import Pagination from '../components/Pagination'
import { paginate } from '../lib/paginate'
import { useCatalog } from '../context/Catalog'

export default function Cruises() {
  const { cruises } = useCatalog()
  const [destination, setDestination] = useState('')
  const [page, setPage] = useState(1)
  const destinations = useMemo(() => [...new Set(cruises.map((c) => c.destination))], [cruises])
  const list = destination ? cruises.filter((c) => c.destination === destination) : cruises
  const paged = paginate(list, page, 6)
  const pickDestination = (value) => {
    setDestination(value)
    setPage(1)
  }

  return (
    <div>
      <Seo
        title="Cruise itineraries"
        description="Cruise packages from Kenya and world ports to Thailand, Bali, USA, South Africa and Zanzibar. Quoted in Kenyan Shillings."
        path="/cruises"
      />
      <PageHero
        kicker="Amason Travel"
        title="Cruise itineraries"
        subtitle="Packages from Nairobi, Mombasa and world embarkation ports to Thailand, Bali, the USA, South Africa and Zanzibar. Priced in KES."
      />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" className={`badge ${!destination ? 'bg-navy text-gold-2' : 'bg-white'}`} onClick={() => pickDestination('')}>
            All
          </button>
          {destinations.map((d) => (
            <button
              key={d}
              type="button"
              className={`badge ${destination === d ? 'bg-navy text-gold-2' : 'bg-white'}`}
              onClick={() => pickDestination(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.slice.map((cruise) => (
            <CruiseCard key={cruise.slug} cruise={cruise} />
          ))}
        </div>
        <Pagination
          page={paged.page}
          pages={paged.pages}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          onPage={setPage}
          noun="packages"
        />
      </section>
    </div>
  )
}
