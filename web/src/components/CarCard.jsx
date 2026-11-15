import { Link } from 'react-router-dom'
import { formatKes, formatKm, carTitle } from '../lib/format'
import { useStore } from '../context/Store'

const statusLabel = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

export default function CarCard({ car }) {
  const { compare, toggleCompare, saved, toggleSaved } = useStore()
  const inCompare = compare.includes(car.slug)
  const inSaved = saved.includes(car.slug)

  return (
    <article className="card-hover group overflow-hidden rounded-sm bg-white shadow-[0_8px_24px_rgba(7,20,40,0.08)]">
      <div className="relative">
        <Link to={`/stock/${car.slug}`} className="block overflow-hidden">
          <img
            src={car.image}
            alt={carTitle(car)}
            className="h-52 w-full bg-navy object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          <span
            className={`badge ${
              car.status === 'available'
                ? 'bg-gold text-navy'
                : car.status === 'reserved'
                  ? 'bg-amber-500 text-navy'
                  : 'bg-zinc-700 text-white'
            }`}
          >
            {statusLabel[car.status]}
          </span>
          {car.source && <span className="badge bg-navy text-gold-2">{car.source}</span>}
        </div>
        {car.images?.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            {car.images.length} photos
          </span>
        )}
        <button
          onClick={() => toggleSaved(car.slug)}
          className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white"
          aria-label="Save"
        >
          {inSaved ? '♥' : '♡'}
        </button>
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-navy/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
          <Link to={`/stock/${car.slug}`} className="btn-gold !px-3 !py-2 text-[11px]">
            View
          </Link>
          <button onClick={() => toggleCompare(car.slug)} className="btn-ghost !px-3 !py-2 text-[11px]">
            {inCompare ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-3 uppercase">
          {car.make} · {car.body}
        </p>
        <h3 className="mt-1 font-display text-lg leading-snug text-navy">
          <Link to={`/stock/${car.slug}`}>{carTitle(car)}</Link>
        </h3>
        <p className="text-sm text-muted">{car.grade}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span>{car.year}</span>
          <span>{car.transmission}</span>
          <span>{formatKm(car.mileage)}</span>
          <span>{car.fuel}</span>
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-cream pt-3">
          <div>
            <p className="text-[11px] tracking-wide text-muted uppercase">Landed Kenya</p>
            <p className="price text-xl">{formatKes(car.priceKes)}</p>
          </div>
          <Link to={`/enquire?car=${car.slug}`} className="text-xs font-bold tracking-widest text-navy-3 uppercase">
            Enquire →
          </Link>
        </div>
      </div>
    </article>
  )
}
