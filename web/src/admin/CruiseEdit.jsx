import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CRUISE_DESTINATIONS } from '../data/cruises'
import { api } from './api'

const empty = {
  title: '',
  destination: 'Thailand',
  origin: '',
  flyFrom: 'Nairobi (NBO)',
  nights: 7,
  days: 8,
  ship: '',
  operator: 'Amason Travel partners',
  cabin: 'Ocean-view balcony',
  priceKes: '',
  priceUsd: '',
  nextDeparture: '',
  status: 'available',
  featured: true,
  description: '',
  inclusions: [],
  itinerary: [],
  images: [],
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold tracking-widest text-muted uppercase">{label}</span>
      {children}
    </label>
  )
}

export default function CruiseEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [includeText, setIncludeText] = useState('')
  const [itinText, setItinText] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const parseItinerary = (text) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const [port, title, summary] = line.split('|').map((x) => x.trim())
        return { day: i + 1, port: port || '', title: title || port || '', summary: summary || '' }
      })

  useEffect(() => {
    if (isNew) return
    api(`/api/admin/cruises/${id}`)
      .then((data) => {
        setForm({ ...empty, ...data.cruise })
        setIncludeText((data.cruise.inclusions || []).join('\n'))
        setItinText(
          (data.cruise.itinerary || [])
            .map((d) => `${d.port} | ${d.title} | ${d.summary}`)
            .join('\n'),
        )
      })
      .catch((err) => setError(err.message))
  }, [id, isNew])

  const payload = () => ({
    ...form,
    nights: Number(form.nights),
    days: Number(form.days),
    priceKes: Number(form.priceKes) || 0,
    priceUsd: Number(form.priceUsd) || 0,
    featured: Boolean(form.featured),
    inclusions: includeText.split('\n').map((x) => x.trim()).filter(Boolean),
    itinerary: parseItinerary(itinText),
  })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const body = JSON.stringify(payload())
      if (isNew) {
        const data = await api('/api/admin/cruises', { method: 'POST', body })
        navigate(`/admin/cruises/${data.cruise.id}`, { replace: true })
      } else {
        await api(`/api/admin/cruises/${id}`, { method: 'PUT', body })
        setSaved('Package saved.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const upload = async (e) => {
    const files = e.target.files
    if (!files?.length || isNew) return
    const data = new FormData()
    Array.from(files).forEach((file) => data.append('photos', file))
    try {
      const result = await api(`/api/admin/cruises/${id}/photos`, { method: 'POST', body: data })
      setForm((f) => ({ ...f, images: result.cruise.images, image: result.cruise.image }))
    } catch (err) {
      setError(err.message)
    }
    e.target.value = ''
  }

  const dropPhoto = async (url) => {
    const data = await api(`/api/admin/cruises/${id}/photos`, { method: 'DELETE', body: JSON.stringify({ url }) })
    setForm((f) => ({ ...f, images: data.cruise.images, image: data.cruise.image }))
  }

  return (
    <div className="p-6 lg:p-8">
      <Link to="/admin/cruises" className="text-xs font-bold tracking-widest uppercase text-muted">
        ← Cruise desk
      </Link>
      <h1 className="mt-2 font-display text-4xl text-navy">{isNew ? 'Add cruise package' : 'Edit package'}</h1>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-800">{saved}</p>}

      <form onSubmit={save} className="mt-6 grid gap-6">
        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm md:grid-cols-2">
          <Field label="Title">
            <input className="field" required value={form.title} onChange={set('title')} />
          </Field>
          <Field label="Destination">
            <select className="field" value={form.destination} onChange={set('destination')}>
              {CRUISE_DESTINATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Embarkation / origin">
            <input className="field" required value={form.origin} onChange={set('origin')} placeholder="Singapore, Miami, Mombasa…" />
          </Field>
          <Field label="Fly from">
            <input className="field" value={form.flyFrom} onChange={set('flyFrom')} />
          </Field>
          <Field label="Nights">
            <input className="field" type="number" value={form.nights} onChange={set('nights')} />
          </Field>
          <Field label="Days">
            <input className="field" type="number" value={form.days} onChange={set('days')} />
          </Field>
          <Field label="Ship">
            <input className="field" value={form.ship} onChange={set('ship')} />
          </Field>
          <Field label="Cabin">
            <input className="field" value={form.cabin} onChange={set('cabin')} />
          </Field>
          <Field label="Price KES">
            <input className="field" type="number" value={form.priceKes} onChange={set('priceKes')} />
          </Field>
          <Field label="Price USD">
            <input className="field" type="number" value={form.priceUsd} onChange={set('priceUsd')} />
          </Field>
          <Field label="Next departure">
            <input className="field" type="date" value={form.nextDeparture} onChange={set('nextDeparture')} />
          </Field>
          <Field label="Status">
            <select className="field" value={form.status} onChange={set('status')}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold out</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={set('featured')} />
            Feature on homepage
          </label>
          <Field label="Description">
            <textarea className="field min-h-28 md:col-span-2" value={form.description} onChange={set('description')} />
          </Field>
        </section>

        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl text-navy">Inclusions (one per line)</h2>
            <textarea className="field mt-3 min-h-48" value={includeText} onChange={(e) => setIncludeText(e.target.value)} />
          </div>
          <div>
            <h2 className="font-display text-xl text-navy">Itinerary</h2>
            <p className="text-xs text-muted">One day per line: Port | Title | Summary</p>
            <textarea className="field mt-3 min-h-48" value={itinText} onChange={(e) => setItinText(e.target.value)} />
          </div>
        </section>

        <section className="rounded-sm bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl text-navy">Photos</h2>
          {isNew ? (
            <p className="mt-2 text-sm text-muted">Save first, then upload. Cloudinary is used when keys are in .env; otherwise resized local WebP.</p>
          ) : (
            <>
              <input className="mt-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload} />
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {(form.images || []).map((src) => (
                  <div key={src} className="overflow-hidden rounded-sm border border-cream">
                    <img src={src} alt="" className="h-28 w-full object-cover" />
                    <button type="button" className="p-2 text-[10px] font-bold tracking-widest text-red-700 uppercase" onClick={() => dropPhoto(src)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <div className="flex gap-3">
          <button className="btn-gold" type="submit" disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Create package' : 'Save package'}
          </button>
          <Link to="/admin/cruises" className="btn-navy">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
