import { Link } from 'react-router-dom'
import { useStore } from '../context/Store'
import { formatKes, carTitle } from '../lib/format'

export default function CompareBar() {
  const { compareCars, toggleCompare, clearCompare } = useStore()
  if (!compareCars.length) return null

  return (
    <div className="compare-bar">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <p className="text-xs font-bold tracking-widest text-gold-2 uppercase">Compare ({compareCars.length}/3)</p>
        <div className="flex flex-1 flex-wrap gap-3">
          {compareCars.map((car) => (
            <div key={car.slug} className="flex items-center gap-2 rounded border border-white/15 px-2 py-1 text-sm">
              <img src={car.image} alt="" className="h-8 w-12 object-cover" />
              <span>
                {carTitle(car)} · {formatKes(car.priceKes)}
              </span>
              <button onClick={() => toggleCompare(car.slug)} className="text-gold-2">
                ×
              </button>
            </div>
          ))}
        </div>
        <Link to="/stock?compare=1" className="btn-gold !py-2">
          View compare
        </Link>
        <button onClick={clearCompare} className="text-xs uppercase tracking-widest text-white/70">
          Clear
        </button>
      </div>
    </div>
  )
}
