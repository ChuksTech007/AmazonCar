import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatKes } from '../lib/format'
import { api } from './api'
import Pagination from '../components/Pagination'
import { paginate } from '../lib/paginate'

export default function CruiseList() {
  const [cruises, setCruises] = useState([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  const load = () =>
    api('/api/admin/cruises')
      .then((data) => setCruises(data.cruises || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const remove = async (cruise) => {
    if (!window.confirm(`Remove ${cruise.title}?`)) return
    await api(`/api/admin/cruises/${cruise.id}`, { method: 'DELETE' })
    load()
  }

  const paged = paginate(cruises, page, 8)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">Travel</p>
          <h1 className="mt-1 font-display text-4xl text-navy">Cruise desk</h1>
          <p className="mt-2 text-sm text-muted">
            Packages from world ports into Thailand, Bali, USA, South Africa and Zanzibar. Photos go to Cloudinary when keys
            are set.
          </p>
        </div>
        <Link to="/admin/cruises/new" className="btn-gold">
          Add package
        </Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 overflow-x-auto rounded-sm bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-cream text-[11px] tracking-widest text-muted uppercase">
            <tr>
              <th className="p-3">Package</th>
              <th className="p-3">Route</th>
              <th className="p-3">KES</th>
              <th className="p-3">Departure</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {paged.slice.map((cruise) => (
              <tr key={cruise.id} className="border-t border-cream">
                <td className="p-3">
                  <Link to={`/admin/cruises/${cruise.id}`} className="flex items-center gap-3">
                    <img src={cruise.image} alt="" className="h-14 w-20 bg-navy object-cover" />
                    <div>
                      <p className="font-semibold text-navy">{cruise.title}</p>
                      <p className="text-xs text-muted">
                        {cruise.nights} nights · {cruise.ship}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="p-3">
                  {cruise.origin} → {cruise.destination}
                </td>
                <td className="p-3 font-semibold">{formatKes(cruise.priceKes)}</td>
                <td className="p-3">{cruise.nextDeparture}</td>
                <td className="p-3 text-right">
                  <Link to={`/admin/cruises/${cruise.id}`} className="mr-3 text-xs font-bold tracking-widest uppercase">
                    Edit
                  </Link>
                  <button type="button" className="text-xs tracking-widest text-red-700 uppercase" onClick={() => remove(cruise)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  )
}
