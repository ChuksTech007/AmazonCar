import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatKes } from '../lib/format'
import { api } from './api'

const windowCopy = {
  edge: 'Edge of 8-year window',
  outside: 'Outside Kenya 8-year rule',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/admin/dashboard').then(setData).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="p-8 text-red-700">{error}</p>
  if (!data) return <p className="p-8 text-muted">Loading desk…</p>

  const { counts, site, kenyaMinYear, aging, latestEnquiries, featured } = data

  const cards = [
    [counts.available, 'Available'],
    [counts.reserved, 'Reserved'],
    [counts.sold, 'Sold'],
    [counts.japan, 'Japan stock'],
    [counts.uk, 'UK stock'],
    [counts.featured, 'Featured on home'],
    [counts.cruises || 0, 'Cruise packages'],
    [counts.newEnquiries, 'New enquiries'],
    [`${site.usdKes}`, 'KES per USD'],
  ]

  return (
    <div className="p-6 lg:p-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">Amason sales desk</p>
      <h1 className="mt-1 font-display text-4xl text-navy">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Live stock, Kenya 8-year window (year from {kenyaMinYear}), CIF conversion at {site.usdKes} KES/USD, cruise
        packages, and WhatsApp leads. Storage: {data.storage}. Photos: {data.media}.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([n, label]) => (
          <div key={label} className="rounded-sm bg-white p-5 shadow-sm">
            <p className="font-display text-3xl text-navy">{n}</p>
            <p className="mt-1 text-xs tracking-widest text-muted uppercase">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-navy">8-year flags</h2>
            <Link to="/admin/stock" className="text-xs font-bold tracking-widest uppercase text-navy">
              Stock desk →
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted">Units that sit on the Kenya import year edge or outside it.</p>
          {aging.length === 0 ? (
            <p className="mt-4 text-sm text-muted">All unsold stock is inside the window.</p>
          ) : (
            <ul className="mt-4 divide-y divide-cream">
              {aging.map((car) => (
                <li key={car.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <Link to={`/admin/stock/${car.id}`} className="font-semibold text-navy">
                      {car.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {car.source} · {car.id}
                    </p>
                  </div>
                  <span
                    className={`badge ${car.window === 'outside' ? 'bg-red-700 text-white' : 'bg-amber-400 text-navy'}`}
                  >
                    {windowCopy[car.window] || car.window}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-sm bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-navy">Latest enquiries</h2>
            <Link to="/admin/enquiries" className="text-xs font-bold tracking-widest uppercase text-navy">
              Inbox →
            </Link>
          </div>
          {latestEnquiries.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No web enquiries yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-cream">
              {latestEnquiries.map((e) => (
                <li key={e.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy">{e.name}</p>
                    <span className="badge bg-cream text-navy">{e.status}</span>
                  </div>
                  <p className="text-xs text-muted">
                    {e.city} · {e.phone}
                    {e.carTitle ? ` · ${e.carTitle}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-sm bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Featured on homepage</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <Link key={car.id} to={`/admin/stock/${car.id}`} className="flex gap-3 rounded-sm border border-cream p-2">
              <img src={car.image} alt="" className="h-16 w-24 object-cover" />
              <div>
                <p className="font-semibold text-navy">
                  {car.year} {car.make} {car.model}
                </p>
                <p className="text-xs text-muted">{formatKes(car.priceKes)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
