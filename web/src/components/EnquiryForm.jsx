import { useState } from 'react'
import { SITE, WHATSAPP_URL } from '../data/site'
import { carFullTitle } from '../lib/format'

export default function EnquiryForm({ car }) {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Nairobi',
    message: car
      ? `I would like a KES quote and import timeline for the ${carFullTitle(car)} (Stock ${car.id}).`
      : 'I would like to import a car to Kenya. Please advise on stock and a KES quote.',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  const waText = `Hello Amason Car Sales, I am ${form.name || 'a client'} from ${form.city}. ${form.message} My number is ${form.phone || SITE.phone}.`

  if (sent) {
    return (
      <div className="rounded-sm border border-gold/40 bg-cream p-6">
        <h3 className="font-display text-2xl text-navy">Request received</h3>
        <p className="mt-2 text-sm text-muted">
          Thank you. A sales consultant will call you on {form.phone || 'your number'} during {SITE.hours}. For a faster reply, continue on WhatsApp.
        </p>
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
