import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatKes, formatKm } from '../lib/format'
import { api } from './api'
import Pagination from '../components/Pagination'
import { paginate } from '../lib/paginate'

const windowCopy = {
  ok: 'Inside window',
  edge: 'Edge of window',
  outside: 'Outside 8-year',
}

export default function StockList() {
  const [cars, setCars] = useState([])
  const [kenyaMinYear, setKenyaMinYear] = useState(2019)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  const load = () =>
    api('/api/admin/cars')
      .then((data) => {
        setCars(data.cars || [])
        setKenyaMinYear(data.kenyaMinYear)
      })
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const patch = async (id, body) => {
    await api(`/api/admin/cars/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
    load()
  }

  const remove = async (car) => {
    if (!window.confirm(`Remove ${car.year} ${car.make} ${car.model} from stock?`)) return
    await api(`/api/admin/cars/${car.id}`, { method: 'DELETE' })
    load()
  }

  const list = useMemo(() => {
    return cars.filter((c) => {
      if (status && c.status !== status) return false
      if (source && c.source !== source) return false
      if (q) {
        const hay = `${c.make} ${c.model} ${c.grade} ${c.id} ${c.stockNo} ${c.chassis} ${c.color}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [cars, q, status, source])

  const paged = paginate(list, page, 10)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">Inventory</p>
          <h1 className="mt-1 font-display text-4xl text-navy">Stock desk</h1>
          <p className="mt-2 text-sm text-muted">
            Japan and UK units shown to the public. Kenya 8-year floor is {kenyaMinYear}. Photos go to Cloudinary when keys
            are set.
          </p>
        </div>
        <Link to="/admin/stock/new" className="btn-gold">
          Add vehicle
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <input
          className="field md:col-span-2"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          placeholder="Search make, model, stock no., chassis"
        />
        <select
          className="field"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <select
          className="field"
          value={source}
          onChange={(e) => {
            setSource(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Japan or UK</option>
          <option value="Japan">Japan</option>
          <option value="UK">UK</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-cream text-[11px] tracking-widest text-muted uppercase">
            <tr>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Source</th>
              <th className="p-3">Landed KES</th>
              <th className="p-3">Status</th>
              <th className="p-3">8-year</th>
              <th className="p-3">Home</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {paged.slice.map((car) => (
              <tr key={car.id} className="border-t border-cream">
                <td className="p-3">
                  <Link to={`/admin/stock/${car.id}`} className="flex items-center gap-3">
                    <img src={car.image} alt="" className="h-14 w-20 bg-navy object-cover" />
                    <div>
                      <p className="font-semibold text-navy">
                        {car.year} {car.make} {car.model} {car.grade}
                      </p>
                      <p className="text-xs text-muted">
                        {car.stockNo || car.id} · {formatKm(car.mileage)} · {car.location}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="p-3">{car.source}</td>
                <td className="p-3 font-semibold">{formatKes(car.priceKes)}</td>
                <td className="p-3">
                  <select
                    className="field !py-1"
                    value={car.status}
                    onChange={(e) => patch(car.id, { status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </td>
                <td className="p-3">
                  <span
                    className={`badge ${
                      car.window === 'outside'
                        ? 'bg-red-700 text-white'
                        : car.window === 'edge'
                          ? 'bg-amber-400 text-navy'
                          : 'bg-navy text-gold-2'
                    }`}
                  >
                    {windowCopy[car.window]}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    className="text-xs font-bold tracking-widest uppercase"
                    onClick={() => patch(car.id, { featured: !car.featured })}
                  >
                    {car.featured ? 'Featured' : 'Off'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <Link to={`/admin/stock/${car.id}`} className="mr-3 text-xs font-bold tracking-widest uppercase">
                    Edit
                  </Link>
                  <button type="button" className="text-xs tracking-widest text-red-700 uppercase" onClick={() => remove(car)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-muted">No units match those filters.</p>}
      </div>
      <Pagination
        page={paged.page}
        pages={paged.pages}
        total={paged.total}
        from={paged.from}
        to={paged.to}
        onPage={setPage}
        noun="vehicles"
      />
    </div>
  )
}
