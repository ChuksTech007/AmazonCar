import { useState } from 'react'
import { useCatalog } from '../context/Catalog'
import { carFullTitle } from '../lib/format'

export default function EnquiryForm({ car, cruise }) {
  const { site, WHATSAPP_URL } = useCatalog()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const about = car
    ? `I would like a KES quote and import timeline for the ${carFullTitle(car)} (Stock ${car.id}).`
    : cruise
      ? `I would like the ${cruise.title} to ${cruise.destination}, departing ${cruise.nextDeparture || 'the next sailing'}. Please send a KES package quote.`
      : 'I would like to import a car to Kenya or book a cruise package. Please advise.'
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: site.city || 'Nairobi',
    message: about,
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await fetch('/api/public/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          kind: car ? 'car' : cruise ? 'cruise' : 'general',
          carSlug: car?.slug,
          carId: car?.id,
          stockNo: car?.stockNo,
          cruiseSlug: cruise?.slug,
        }),
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not send enquiry')
      })
    } catch (err) {
      setError(err.message)
    }
    setSent(true)
  }

  const waText = `Hello ${site.name}, I am ${form.name || 'a client'} from ${form.city}. ${form.message} My number is ${form.phone || site.phone}.`

  if (sent) {
    return (
      <div className="rounded-sm border border-gold/40 bg-cream p-6">
        <h3 className="font-display text-2xl text-navy">Request received</h3>
        <p className="mt-2 text-sm text-muted">
          Thank you. The sales desk has this in the inbox and will call you on {form.phone || 'your number'} during {site.hours}.
        </p>
        {error && (
          <p className="mt-2 text-sm text-muted">If the desk copy did not land, WhatsApp still reaches the sales line.</p>
        )}
        <a className="btn-gold mt-5" href={WHATSAPP_URL(waText)} target="_blank" rel="noreferrer">
          Continue on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      {car && (
        <p className="text-sm font-semibold text-navy">
          Enquiring about: {carFullTitle(car)} · {car.id}
        </p>
      )}
      {cruise && (
        <p className="text-sm font-semibold text-navy">
          Enquiring about: {cruise.title} · {cruise.destination}
        </p>
      )}
      <input className="field" required placeholder="Full name" value={form.name} onChange={set('name')} />
      <input className="field" required placeholder="Phone / WhatsApp" value={form.phone} onChange={set('phone')} />
      <input className="field" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
      <input className="field" placeholder="City in Kenya" value={form.city} onChange={set('city')} />
      <textarea className="field min-h-28" required value={form.message} onChange={set('message')} />
      <button className="btn-gold" type="submit">
        Send enquiry
      </button>
      <a className="btn-navy" href={WHATSAPP_URL(waText)} target="_blank" rel="noreferrer">
        Or WhatsApp now
      </a>
    </form>
  )
}
