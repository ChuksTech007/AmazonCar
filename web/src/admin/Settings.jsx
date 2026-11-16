import { useEffect, useState } from 'react'
import { api } from './api'

const empty = {
  name: '',
  shortName: '',
  tagline: '',
  tagline2: '',
  phone: '',
  whatsapp: '',
  email: '',
  hours: '',
  city: '',
  port: '',
  usdKes: 129,
  currency: 'KES',
  country: 'Kenya',
}

export default function Settings() {
  const [form, setForm] = useState(empty)
  const [infra, setInfra] = useState({ storage: 'json', media: 'local' })
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    api('/api/admin/settings')
      .then((data) => {
        setForm({ ...empty, ...data.site })
        setInfra({ storage: data.storage || 'json', media: data.media || 'local' })
      })
      .catch((err) => setError(err.message))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const data = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(form) })
      setForm({ ...empty, ...data.site })
      setSaved('Sales settings saved. Header, footer, WhatsApp and CIF KES conversion follow these values.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSaved('')
    try {
      await api('/api/admin/password', { method: 'PUT', body: JSON.stringify({ current, next }) })
      setCurrent('')
      setNext('')
      setSaved('Password updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-gold-3 uppercase">Company</p>
      <h1 className="mt-1 font-display text-4xl text-navy">Sales settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Phone, WhatsApp, Nairobi office, Mombasa port and the USD/KES rate used to show CIF in Kenyan Shillings. Listings
        store: {infra.storage}. Photos: {infra.media}. Add MONGODB_URI and Cloudinary keys in .env to move files off this
        machine.
      </p>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-800">{saved}</p>}

      <form onSubmit={save} className="mt-6 grid gap-4 rounded-sm bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Trading name</span>
          <input className="field" value={form.name} onChange={set('name')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Short name</span>
          <input className="field" value={form.shortName} onChange={set('shortName')} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Tagline</span>
          <input className="field" value={form.tagline} onChange={set('tagline')} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Second line</span>
          <input className="field" value={form.tagline2} onChange={set('tagline2')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Sales phone</span>
          <input className="field" value={form.phone} onChange={set('phone')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">WhatsApp (digits)</span>
          <input className="field" value={form.whatsapp} onChange={set('whatsapp')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Email</span>
          <input className="field" value={form.email} onChange={set('email')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Hours</span>
          <input className="field" value={form.hours} onChange={set('hours')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Office city</span>
          <input className="field" value={form.city} onChange={set('city')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">Port of entry</span>
          <input className="field" value={form.port} onChange={set('port')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold tracking-widest uppercase">USD → KES rate</span>
          <input className="field" type="number" value={form.usdKes} onChange={set('usdKes')} />
        </label>
        <p className="self-end text-sm text-muted">Used for CIF Mombasa shown in KES on every listing.</p>
        <div className="md:col-span-2">
          <button className="btn-gold" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="mt-6 max-w-md rounded-sm bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Desk password</h2>
        <label className="mt-4 block text-[11px] font-semibold tracking-widest uppercase">Current password</label>
        <input className="field mt-1" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <label className="mt-4 block text-[11px] font-semibold tracking-widest uppercase">New password</label>
        <input className="field mt-1" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        <button className="btn-navy mt-4" type="submit">
          Update password
        </button>
      </form>
    </div>
  )
}
