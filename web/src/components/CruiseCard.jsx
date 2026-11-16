import { Link } from 'react-router-dom'
import { formatKes } from '../lib/format'
import { mediaUrl } from '../lib/media'

export default function CruiseCard({ cruise }) {
  return (
    <article className="card-hover overflow-hidden rounded-sm bg-white shadow-[0_8px_24px_rgba(7,20,40,0.08)]">
      <Link to={`/cruises/${cruise.slug}`} className="block overflow-hidden">
        <img src={mediaUrl(cruise.image, 800)} alt={cruise.title} className="frame-photo bg-navy" />
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-3 uppercase">
          {cruise.destination} · from {cruise.origin}
        </p>
        <h3 className="mt-1 font-display text-xl text-navy">
          <Link to={`/cruises/${cruise.slug}`}>{cruise.title}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted">
          {cruise.nights} nights · {cruise.ship} · Fly {cruise.flyFrom}
        </p>
        <div className="mt-4 flex items-end justify-between border-t border-cream pt-3">
          <div>
            <p className="text-[11px] tracking-wide text-muted uppercase">From</p>
            <p className="price text-xl">{formatKes(cruise.priceKes)}</p>
          </div>
          <Link to={`/enquire?cruise=${cruise.slug}`} className="text-xs font-bold tracking-widest text-navy-3 uppercase">
            Enquire →
          </Link>
        </div>
      </div>
    </article>
  )
}
