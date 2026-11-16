import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EQUIPMENT_PACKS } from '../lib/catalogUtils'
import { formatKes, formatUsd, formatYen, usdToKes } from '../lib/format'
import { api } from './api'

const empty = {
  make: '',
  model: '',
  grade: '',
  year: new Date().getFullYear(),
  month: 1,
  priceKes: '',
  cifUsd: '',
  fobJpy: '',
  crspKes: '',
  auctionSheetUrl: '',
  exportCertUrl: '',
  mileage: '',
  engineCc: '',
  fuel: 'Petrol',
  transmission: 'Automatic',
  drive: '4WD',
  color: '',
  body: 'SUV',
  seats: 5,
  doors: 5,
  chassis: '',
  auctionGrade: '',
  location: 'Japan — ready to ship',
  eta: '5–6 weeks to Mombasa',
  status: 'available',
  featured: false,
  source: 'Japan',
  stockNo: '',
  equipment: [],
  description: '',
  images: [],
}

const MAKES = ['Toyota', 'Lexus', 'Nissan', 'Mazda', 'Subaru', 'Honda', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Land Rover', 'Ford', 'Volkswagen', 'Audi']
const BODIES = ['SUV', 'Sedan', 'Pickup', 'MPV', 'Hatchback', 'Wagon', 'Coupe']
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const GEARS = ['Automatic', 'Manual', 'CVT']
const DRIVES = ['2WD', '4WD', 'AWD']

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold tracking-widest text-muted uppercase">{label}</span>
      {children}
    </label>
  )
}

export default function StockEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [equipText, setEquipText] = useState('')
  const [kenyaMinYear, setKenyaMinYear] = useState(new Date().getFullYear() - 7)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  useEffect(() => {
    if (isNew) return
    api(`/api/admin/cars/${id}`)
      .then((data) => {
        setForm({ ...empty, ...data.car, equipment: data.car.equipment || [], images: data.car.images || [] })
        setEquipText((data.car.equipment || []).join('\n'))
        setKenyaMinYear(data.kenyaMinYear)
      })
      .catch((err) => setError(err.message))
  }, [id, isNew])

  const year = Number(form.year)
  const window =
    !year ? '' : year < kenyaMinYear ? 'outside' : year === kenyaMinYear ? 'edge' : 'ok'

  const payload = () => ({
    ...form,
    year: Number(form.year),
    month: Number(form.month),
    priceKes: Number(form.priceKes) || 0,
    cifUsd: Number(form.cifUsd) || 0,
    fobJpy: form.fobJpy === '' ? 0 : Number(form.fobJpy) || 0,
    crspKes: form.crspKes === '' ? 0 : Number(form.crspKes) || 0,
    mileage: Number(form.mileage) || 0,
    engineCc: Number(form.engineCc) || 0,
    seats: Number(form.seats) || 5,
    doors: Number(form.doors) || 5,
    featured: Boolean(form.featured),
    equipment: equipText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean),
  })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const body = JSON.stringify(payload())
      if (isNew) {
        const data = await api('/api/admin/cars', { method: 'POST', body })
        navigate(`/admin/stock/${data.car.id}`, { replace: true })
      } else {
        const data = await api(`/api/admin/cars/${id}`, { method: 'PUT', body })
        setForm((f) => ({ ...f, ...data.car }))
        setSaved('Listing saved. Public stock will pick this up on the next visit.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const applyPack = (key) => {
    const extra = EQUIPMENT_PACKS[key] || []
    const current = equipText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
    setEquipText([...new Set([...current, ...extra])].join('\n'))
  }

  const upload = async (e) => {
    const files = e.target.files
    if (!files?.length || isNew) return
    const data = new FormData()
    Array.from(files).forEach((file) => data.append('photos', file))
    try {
      const result = await api(`/api/admin/cars/${id}/photos`, { method: 'POST', body: data })
      setForm((f) => ({ ...f, images: result.car.images, image: result.car.image }))
    } catch (err) {
      setError(err.message)
    }
    e.target.value = ''
  }

  const uploadDoc = async (e, field) => {
    const file = e.target.files?.[0]
    if (!file || isNew) return
    const data = new FormData()
    data.append('file', file)
    data.append('field', field)
    try {
      const result = await api(`/api/admin/cars/${id}/docs`, { method: 'POST', body: data })
      setForm((f) => ({ ...f, [field]: result.url }))
      setSaved('Document uploaded.')
    } catch (err) {
      setError(err.message)
    }
    e.target.value = ''
  }

  const move = async (index, dir) => {
    const images = [...(form.images || [])]
    const next = index + dir
    if (next < 0 || next >= images.length) return
    ;[images[index], images[next]] = [images[next], images[index]]
    const data = await api(`/api/admin/cars/${id}/photos`, { method: 'PUT', body: JSON.stringify({ images }) })
    setForm((f) => ({ ...f, images: data.car.images, image: data.car.image }))
  }

  const cover = async (index) => {
    const images = [...(form.images || [])]
    const [picked] = images.splice(index, 1)
    images.unshift(picked)
    const data = await api(`/api/admin/cars/${id}/photos`, { method: 'PUT', body: JSON.stringify({ images }) })
    setForm((f) => ({ ...f, images: data.car.images, image: data.car.image }))
  }

  const dropPhoto = async (url) => {
    const data = await api(`/api/admin/cars/${id}/photos`, { method: 'DELETE', body: JSON.stringify({ url }) })
    setForm((f) => ({ ...f, images: data.car.images, image: data.car.image }))
  }

  const cifKes = form.cifUsd ? usdToKes(Number(form.cifUsd)) : 0

  return (
    <div className="p-6 lg:p-8">
      <Link to="/admin/stock" className="text-xs font-bold tracking-widest uppercase text-muted">
        ← Stock desk
      </Link>
      <h1 className="mt-2 font-display text-4xl text-navy">{isNew ? 'Add vehicle' : 'Edit listing'}</h1>
      <p className="mt-2 text-sm text-muted">
        Fields match the public Goo-net / AutoTrader card: KES landed, CIF USD, FOB JPY, auction grade, Mombasa ETA and the
        8-year window.
      </p>

      {window === 'outside' && (
        <p className="mt-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-800">
          Year {form.year} is below Kenya’s 8-year floor ({kenyaMinYear}). This unit may not register.
        </p>
      )}
      {window === 'edge' && (
        <p className="mt-4 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Year {form.year} sits on the 8-year edge. Confirm first registration month before quoting.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-800">{saved}</p>}

      <form onSubmit={save} className="mt-6 grid gap-6">
        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm md:grid-cols-4">
          <h2 className="font-display text-xl text-navy md:col-span-4">Identity</h2>
          <Field label="Make">
            <input className="field" list="makes" required value={form.make} onChange={set('make')} />
            <datalist id="makes">
              {MAKES.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
          <Field label="Model">
            <input className="field" required value={form.model} onChange={set('model')} />
          </Field>
          <Field label="Grade">
            <input className="field" value={form.grade} onChange={set('grade')} />
          </Field>
          <Field label="Stock no.">
            <input className="field" value={form.stockNo} onChange={set('stockNo')} placeholder="Goo-net / yard number" />
          </Field>
          <Field label="Year">
            <input className="field" type="number" min="1990" max="2035" value={form.year} onChange={set('year')} />
          </Field>
          <Field label="Month">
            <input className="field" type="number" min="1" max="12" value={form.month} onChange={set('month')} />
          </Field>
          <Field label="Chassis">
            <input className="field" value={form.chassis} onChange={set('chassis')} />
          </Field>
          <Field label="Auction / inspection">
            <input className="field" value={form.auctionGrade} onChange={set('auctionGrade')} placeholder="4.5" />
          </Field>
        </section>

        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm md:grid-cols-3">
          <h2 className="font-display text-xl text-navy md:col-span-3">Kenya pricing</h2>
          <Field label="Landed Kenya (KES)">
            <input className="field" type="number" value={form.priceKes} onChange={set('priceKes')} />
          </Field>
          <Field label="CIF Mombasa (USD)">
            <input className="field" type="number" value={form.cifUsd} onChange={set('cifUsd')} />
          </Field>
          <Field label="FOB Japan (JPY)">
            <input className="field" type="number" value={form.fobJpy} onChange={set('fobJpy')} />
          </Field>
          <Field label="CRSP KES (optional)">
            <input className="field" type="number" value={form.crspKes} onChange={set('crspKes')} />
          </Field>
          <p className="text-sm text-muted md:col-span-3">
            Public card shows {form.priceKes ? formatKes(Number(form.priceKes) || 0) : 'KES —'}. CIF reference{' '}
            {form.cifUsd ? `${formatUsd(Number(form.cifUsd) || 0)} · ${formatKes(cifKes)}` : '—'}.
            {form.fobJpy ? ` FOB ${formatYen(Number(form.fobJpy) || 0)}.` : ''}
          </p>
        </section>

        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm md:grid-cols-4">
          <h2 className="font-display text-xl text-navy md:col-span-4">Specification</h2>
          <Field label="Mileage (km)">
            <input className="field" type="number" value={form.mileage} onChange={set('mileage')} />
          </Field>
          <Field label="Engine (cc)">
            <input className="field" type="number" value={form.engineCc} onChange={set('engineCc')} />
          </Field>
          <Field label="Fuel">
            <select className="field" value={form.fuel} onChange={set('fuel')}>
              {FUELS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Gearbox">
            <select className="field" value={form.transmission} onChange={set('transmission')}>
              {GEARS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Drive">
            <select className="field" value={form.drive} onChange={set('drive')}>
              {DRIVES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Colour">
            <input className="field" value={form.color} onChange={set('color')} />
          </Field>
          <Field label="Body">
            <select className="field" value={form.body} onChange={set('body')}>
              {BODIES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Seats / doors">
            <div className="grid grid-cols-2 gap-2">
              <input className="field" type="number" value={form.seats} onChange={set('seats')} />
              <input className="field" type="number" value={form.doors} onChange={set('doors')} />
            </div>
          </Field>
        </section>

        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm md:grid-cols-4">
          <h2 className="font-display text-xl text-navy md:col-span-4">Import file</h2>
          <Field label="Source">
            <select className="field" value={form.source} onChange={set('source')}>
              <option>Japan</option>
              <option>UK</option>
            </select>
          </Field>
          <Field label="Location">
            <input className="field" value={form.location} onChange={set('location')} />
          </Field>
          <Field label="ETA to Mombasa">
            <input className="field" value={form.eta} onChange={set('eta')} />
          </Field>
          <Field label="Desk status">
            <select className="field" value={form.status} onChange={set('status')}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm md:col-span-4">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={set('featured')} />
            Feature on homepage
          </label>
        </section>

        <section className="grid gap-4 rounded-sm bg-white p-5 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl text-navy">Description</h2>
            <textarea className="field mt-3 min-h-40" value={form.description} onChange={set('description')} />
          </div>
          <div>
            <h2 className="font-display text-xl text-navy">Equipment</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.keys(EQUIPMENT_PACKS).map((key) => (
                <button key={key} type="button" className="btn-navy !px-3 !py-2 text-[11px]" onClick={() => applyPack(key)}>
                  {key} pack
                </button>
              ))}
            </div>
            <textarea
              className="field mt-3 min-h-40"
              value={equipText}
              onChange={(e) => setEquipText(e.target.value)}
              placeholder="One item per line"
            />
          </div>
        </section>

        <section className="rounded-sm bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl text-navy">Gallery</h2>
          {isNew ? (
            <p className="mt-2 text-sm text-muted">Save the listing first, then add photos. Cloudinary when keys are set; otherwise resized local WebP.</p>
          ) : (
            <>
              <input className="mt-3 text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={upload} />
              <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {(form.images || []).map((src, i) => (
                  <div key={src + i} className="overflow-hidden rounded-sm border border-cream">
                    <img src={src} alt="" className="h-28 w-full object-cover" />
                    <div className="flex flex-wrap gap-1 p-2 text-[10px] font-bold tracking-widest uppercase">
                      <button type="button" onClick={() => move(i, -1)}>
                        Up
                      </button>
                      <button type="button" onClick={() => move(i, 1)}>
                        Down
                      </button>
                      <button type="button" onClick={() => cover(i)}>
                        Cover
                      </button>
                      <button type="button" className="text-red-700" onClick={() => dropPhoto(src)}>
                        Remove
                      </button>
                    </div>
                    {i === 0 && <p className="px-2 pb-2 text-[10px] text-gold-3">Cover photo</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {!isNew && (
          <section className="rounded-sm bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl text-navy">Auction sheet & export certificate</h2>
            <p className="mt-1 text-sm text-muted">PDF on the public listing. Stored on Cloudinary when configured.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase">Auction sheet</p>
                {form.auctionSheetUrl && (
                  <a className="mt-1 block text-sm text-navy" href={form.auctionSheetUrl} target="_blank" rel="noreferrer">
                    View current PDF
                  </a>
                )}
                <input className="mt-2 text-sm" type="file" accept="application/pdf" onChange={(e) => uploadDoc(e, 'auctionSheetUrl')} />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase">Export certificate</p>
                {form.exportCertUrl && (
                  <a className="mt-1 block text-sm text-navy" href={form.exportCertUrl} target="_blank" rel="noreferrer">
                    View current PDF
                  </a>
                )}
                <input className="mt-2 text-sm" type="file" accept="application/pdf" onChange={(e) => uploadDoc(e, 'exportCertUrl')} />
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <button className="btn-gold" type="submit" disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Create listing' : 'Save listing'}
          </button>
          <Link to="/admin/stock" className="btn-navy">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
