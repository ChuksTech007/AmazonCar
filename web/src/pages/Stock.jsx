import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import CarCard from '../components/CarCard'
import { useCatalog } from '../context/Catalog'
import { useStore } from '../context/Store'
import { MILEAGE_OPTIONS, PRICE_OPTIONS } from '../lib/catalogUtils'
import { formatKes, carTitle, formatKm, formatCc } from '../lib/format'
import Seo from '../components/Seo'
import Pagination from '../components/Pagination'
import { paginate } from '../lib/paginate'
import Reveal from '../components/Reveal'

export default function Stock() {
  const [params, setParams] = useSearchParams()
  const { compareCars, clearCompare } = useStore()
  const { cars, makes, bodies, fuels, years, transmissions, sources, modelsFor } = useCatalog()
  const showCompare = params.get('compare') === '1' && compareCars.length > 0

  const [sort, setSort] = useState('featured')
  const make = params.get('make') || ''
  const model = params.get('model') || ''
  const year = params.get('year') || ''
  const yearTo = params.get('yearTo') || ''
  const body = params.get('body') || ''
  const fuel = params.get('fuel') || ''
  const gearbox = params.get('gearbox') || ''
  const min = params.get('min') || ''
  const max = params.get('max') || ''
  const mileage = params.get('mileage') || ''
  const source = params.get('source') || ''
  const q = params.get('q') || ''

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'make') next.delete('model')
    next.delete('compare')
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const reset = () => setParams({})

  const models = useMemo(() => modelsFor(make), [make, modelsFor])

  const list = useMemo(() => {
    let rows = cars.filter((c) => {
      if (make && c.make !== make) return false
      if (model && c.model !== model) return false
      if (year && c.year < Number(year)) return false
      if (yearTo && c.year > Number(yearTo)) return false
      if (body && c.body !== body) return false
      if (fuel && c.fuel !== fuel) return false
      if (gearbox && c.transmission !== gearbox) return false
      if (source && c.source !== source) return false
      if (min && c.priceKes < Number(min)) return false
      if (max && c.priceKes > Number(max)) return false
      if (mileage && c.mileage > Number(mileage)) return false
      if (q) {
        const hay = `${c.make} ${c.model} ${c.grade} ${c.color} ${c.id} ${c.stockNo || ''} ${c.chassis} ${c.source} ${c.body} ${c.fuel}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
    if (sort === 'price-asc') rows = [...rows].sort((a, b) => a.priceKes - b.priceKes)
    if (sort === 'price-desc') rows = [...rows].sort((a, b) => b.priceKes - a.priceKes)
    if (sort === 'year') rows = [...rows].sort((a, b) => b.year - a.year)
    if (sort === 'km') rows = [...rows].sort((a, b) => a.mileage - b.mileage)
    if (sort === 'featured') rows = [...rows].sort((a, b) => Number(b.featured) - Number(a.featured))
    return rows
  }, [cars, make, model, year, yearTo, body, fuel, gearbox, source, min, max, mileage, q, sort])

  const page = Number(params.get('page') || 1) || 1
  const paged = paginate(list, page, 9)
  const goPage = (n) => {
    set('page', n <= 1 ? '' : String(n))
    document.getElementById('stock-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <Seo title="Current stock" description="Japan and UK vehicles for import to Kenya. Estimated landed prices in KES." path="/stock" />
      <PageHero
        kicker="Inventory"
        title="Current stock"
        subtitle="Japan (Goo-net / partner yards) and UK (AutoTrader-style) vehicles for import to Kenya. Prices shown as estimated landed Kenya in KES."
      />

      {showCompare && (
        <section className="mx-auto max-w-7xl overflow-x-auto px-4 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-navy">Compare</h2>
            <button onClick={clearCompare} className="text-sm uppercase tracking-widest">
              Clear
            </button>
          </div>
          <table className="w-full min-w-[720px] border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className="border p-3 text-left"> </th>
                {compareCars.map((c) => (
                  <th key={c.slug} className="border p-3 text-left">
                    <img src={c.image} alt="" className="mb-2 h-24 w-full object-cover" />
                    {carTitle(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Price', (c) => formatKes(c.priceKes)],
                ['Grade', (c) => c.grade],
                ['Mileage', (c) => formatKm(c.mileage)],
                ['Engine', (c) => `${formatCc(c.engineCc)} ${c.fuel}`],
                ['Drive', (c) => `${c.transmission} · ${c.drive}`],
                ['Source', (c) => c.source],
                ['Colour', (c) => c.color],
                ['Seats', (c) => c.seats],
              ].map(([label, fn]) => (
                <tr key={label}>
                  <td className="border bg-cream p-3 font-semibold">{label}</td>
                  {compareCars.map((c) => (
                    <td key={c.slug} className="border p-3">
                      {fn(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-sm bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl text-navy">Search stock</h2>
          <div className="gold-line mt-3 mb-5" />
          <label className="mb-1 block text-xs font-semibold tracking-widest uppercase">Keyword</label>
          <input className="field mb-4" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Make, model, stock no." />
          {[
            ['make', 'Make', make, makes],
            ['model', 'Model', model, models],
            ['year', 'Year from', year, years],
            ['yearTo', 'Year to', yearTo, years],
            ['body', 'Body', body, bodies],
            ['fuel', 'Fuel', fuel, fuels],
            ['gearbox', 'Gearbox', gearbox, transmissions],
            ['source', 'Source', source, sources],
          ].map(([key, label, value, options]) => (
            <div key={key} className="mb-4">
              <label className="mb-1 block text-xs font-semibold tracking-widest uppercase">{label}</label>
              <select className="field" value={value} onChange={(e) => set(key, e.target.value)}>
                <option value="">All</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          <label className="mb-1 block text-xs font-semibold tracking-widest uppercase">Min landed price</label>
          <select className="field mb-4" value={min} onChange={(e) => set('min', e.target.value)}>
            <option value="">Any</option>
            {PRICE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <label className="mb-1 block text-xs font-semibold tracking-widest uppercase">Max landed price</label>
          <select className="field mb-4" value={max} onChange={(e) => set('max', e.target.value)}>
            <option value="">Any</option>
            {PRICE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <label className="mb-1 block text-xs font-semibold tracking-widest uppercase">Max mileage</label>
          <select className="field" value={mileage} onChange={(e) => set('mileage', e.target.value)}>
            <option value="">Any</option>
            {MILEAGE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button onClick={reset} className="mt-5 text-xs font-bold tracking-widest uppercase text-navy">
            Reset filters
          </button>
        </aside>

        <div id="stock-results">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <strong className="text-navy">{list.length}</strong> vehicles matching
            </p>
            <select
              className="field max-w-48"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                set('page', '')
              }}
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="year">Newest year</option>
              <option value="km">Lowest km</option>
            </select>
          </div>
          {list.length === 0 ? (
            <div className="rounded-sm bg-white p-10 text-center">
              <p className="font-display text-2xl text-navy">No units match those filters</p>
              <p className="mt-2 text-sm text-muted">Reset the filters or request a car from Japan or the UK.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paged.slice.map((car, i) => (
                  <Reveal key={car.slug} delay={(i % 9) * 70}>
                    <CarCard car={car} />
                  </Reveal>
                ))}
              </div>
              <Pagination
                page={paged.page}
                pages={paged.pages}
                total={paged.total}
                from={paged.from}
                to={paged.to}
                onPage={goPage}
                noun="vehicles"
              />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
