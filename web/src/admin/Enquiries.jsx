import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatKes } from '../lib/format'
import { api, clientWhatsApp } from './api'
import Pagination from '../components/Pagination'
import { paginate } from '../lib/paginate'

const STATUSES = ['new', 'contacted', 'quoted', 'closed']

export default function Enquiries() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)

  const load = () =>
    api('/api/admin/enquiries')
      .then((data) => setRows(data.enquiries || []))
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const save = async (id, body) => {
    const data = await api(`/api/admin/enquiries/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    setRows((list) => list.map((row) => (row.id === id ? data.enquiry : row)))
    setOpen((row) => (row?.id === id ? data.enquiry : row))
  }

  const list = useMemo(() => rows.filter((r) => !status || r.status === status), [rows, status])
  const paged = paginate(list, page, 8)

  return (
    <div className="p-6 lg:p-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">Leads</p>
      <h1 className="mt-1 font-display text-4xl text-navy">Enquiries</h1>
      <p className="mt-2 text-sm text-muted">
        Messages from the public enquiry form. Call or WhatsApp the client, then mark contacted / quoted / closed and store
        the KES figure you sent.
      </p>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={`badge ${!status ? 'bg-navy text-gold-2' : 'bg-white'}`}
          onClick={() => {
            setStatus('')
            setPage(1)
          }}
        >
          All {rows.length}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`badge ${status === s ? 'bg-navy text-gold-2' : 'bg-white'}`}
            onClick={() => {
              setStatus(s)
              setPage(1)
            }}
          >
            {s} {rows.filter((r) => r.status === s).length}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <ul className="divide-y divide-cream overflow-hidden rounded-sm bg-white shadow-sm">
          {paged.slice.map((row) => (
            <li key={row.id}>
              <button type="button" className="w-full px-4 py-4 text-left hover:bg-cream/60" onClick={() => setOpen(row)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-navy">{row.name}</p>
                  <span className="badge bg-cream text-navy">{row.status}</span>
                </div>
                <p className="text-xs text-muted">
                  {row.city} · {row.phone} · {new Date(row.createdAt).toLocaleString('en-KE')}
                </p>
                <p className="mt-1 truncate text-sm text-muted">{row.carTitle || row.cruiseTitle || 'General request'}</p>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="p-8 text-center text-sm text-muted">No enquiries in this tray.</li>}
        </ul>
        <Pagination
          page={paged.page}
          pages={paged.pages}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          onPage={setPage}
          noun="leads"
        />
        </div>

        {open ? (
          <article className="rounded-sm bg-white p-5 shadow-sm">
            <p className="text-xs tracking-widest text-gold-3 uppercase">{open.id}</p>
            <h2 className="font-display text-2xl text-navy">{open.name}</h2>
            <p className="text-sm text-muted">
              {open.city} · {open.email || 'no email'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="btn-gold !py-2" href={`tel:${open.phone}`}>
                Call {open.phone}
              </a>
              <a
                className="btn-navy !py-2"
                href={clientWhatsApp(
                  open.phone,
                  `Hello ${open.name}, this is Amason Car Sales. We received your enquiry${open.carTitle ? ` on the ${open.carTitle}` : ''}.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp client
              </a>
            </div>
            {open.carSlug && (
              <p className="mt-4 text-sm">
                Vehicle:{' '}
                <Link className="font-semibold text-navy" to={`/stock/${open.carSlug}`} target="_blank">
                  {open.carTitle} · {open.stockNo || open.carId}
                </Link>
              </p>
            )}
            {open.cruiseSlug && (
              <p className="mt-4 text-sm">
                Cruise:{' '}
                <Link className="font-semibold text-navy" to={`/cruises/${open.cruiseSlug}`} target="_blank">
                  {open.cruiseTitle}
                </Link>
              </p>
            )}
            <p className="mt-4 whitespace-pre-wrap rounded-sm bg-cream p-4 text-sm">{open.message}</p>
            <label className="mt-4 block text-[11px] font-semibold tracking-widest uppercase">Status</label>
            <select className="field mt-1" value={open.status} onChange={(e) => save(open.id, { status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <label className="mt-4 block text-[11px] font-semibold tracking-widest uppercase">KES quote sent</label>
            <input
              className="field mt-1"
              value={open.quoteKes || ''}
              onChange={(e) => setOpen({ ...open, quoteKes: e.target.value })}
              onBlur={() => save(open.id, { quoteKes: open.quoteKes })}
              placeholder="e.g. 4850000"
            />
            {open.quoteKes ? <p className="mt-1 text-xs text-muted">{formatKes(Number(open.quoteKes) || 0)}</p> : null}
            <label className="mt-4 block text-[11px] font-semibold tracking-widest uppercase">Desk notes</label>
            <textarea
              className="field mt-1 min-h-28"
              value={open.notes || ''}
              onChange={(e) => setOpen({ ...open, notes: e.target.value })}
              onBlur={() => save(open.id, { notes: open.notes })}
            />
          </article>
        ) : (
          <div className="grid place-items-center rounded-sm bg-white p-10 text-sm text-muted shadow-sm">
            Select a lead from the inbox.
          </div>
        )}
      </div>
    </div>
  )
}
