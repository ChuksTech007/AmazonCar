import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BODIES, FUELS, MAKES, MILEAGE_OPTIONS, PRICE_OPTIONS, SOURCES, TRANSMISSIONS, YEARS, modelsFor } from '../data/cars'

export default function SearchBar({ dark = false }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [body, setBody] = useState('')
  const [fuel, setFuel] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [mileage, setMileage] = useState('')
  const [source, setSource] = useState('')

  const models = useMemo(() => modelsFor(make), [make])

  const search = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (make) params.set('make', make)
    if (model) params.set('model', model)
    if (year) params.set('year', year)
    if (yearTo) params.set('yearTo', yearTo)
    if (body) params.set('body', body)
    if (fuel) params.set('fuel', fuel)
    if (gearbox) params.set('gearbox', gearbox)
    if (min) params.set('min', min)
    if (max) params.set('max', max)
    if (mileage) params.set('mileage', mileage)
    if (source) params.set('source', source)
    navigate(`/stock?${params.toString()}`)
  }

  return (
    <form onSubmit={search} className={`hero-search grid gap-3 rounded-sm p-4 ${dark ? 'bg-navy/80' : 'bg-white shadow-xl'}`}>
      <div className="grid gap-3 md:grid-cols-12">
        <input
          className="field md:col-span-12 lg:col-span-4"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search make, model, stock no."
          aria-label="Keyword search"
        />
        <select className="field md:col-span-4 lg:col-span-2" value={make} onChange={(e) => { setMake(e.target.value); setModel('') }}>
          <option value="">All makes</option>
          {MAKES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select className="field md:col-span-4 lg:col-span-2" value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">All models</option>
          {models.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select className="field md:col-span-4 lg:col-span-2" value={max} onChange={(e) => setMax(e.target.value)}>
          <option value="">Max price (KES)</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button className="btn-gold w-full md:col-span-12 lg:col-span-2" type="submit">
          Search cars
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <select className="field" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Year from</option>
          {YEARS.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <select className="field" value={yearTo} onChange={(e) => setYearTo(e.target.value)}>
          <option value="">Year to</option>
          {YEARS.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <select className="field" value={mileage} onChange={(e) => setMileage(e.target.value)}>
          <option value="">Max mileage</option>
          {MILEAGE_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select className="field" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
          <option value="">Gearbox</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="field" value={body} onChange={(e) => setBody(e.target.value)}>
          <option value="">Body style</option>
          {BODIES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select className="field" value={fuel} onChange={(e) => setFuel(e.target.value)}>
          <option value="">Fuel</option>
          {FUELS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select className="field" value={min} onChange={(e) => setMin(e.target.value)}>
          <option value="">Min price (KES)</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select className="field" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">Japan or UK</option>
          {SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </form>
  )
}
