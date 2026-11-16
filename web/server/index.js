import './loadEnv.js'
import express from 'express'
import multer from 'multer'
import cookieParser from 'cookie-parser'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  slugify,
  nextCarId,
  nextCruiseId,
  kenyaMinYear,
  windowLabel,
  UPLOAD_DIR,
  verifyPassword,
  hashPassword,
} from './store.js'
import { getDb, putCar, removeCar, putCruise, removeCruise, addEnquiry, putEnquiry, putSite, putAuth, initRepo, storageMode } from './repo.js'
import { configureCloudinary, cloudinaryEnabled, uploadImageBuffer, uploadDocumentBuffer, destroyMedia } from './cloudinary.js'
import { notifyEnquiry } from './notify.js'
import { estimateDuty } from '../src/lib/duty.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 8787)
const SECRET = process.env.ADMIN_SECRET || 'amason-kenya-admin-secret'
const COOKIE = 'amason_admin'
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/',
  maxAge: 1000 * 60 * 60 * 12,
}
const app = express()

configureCloudinary()
app.set('trust proxy', 1)
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(UPLOAD_DIR))

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function readSession(token) {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const expect = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expect)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

function requireAdmin(req, res, next) {
  const session = readSession(req.cookies[COOKIE])
  if (!session) return res.status(401).json({ error: 'Sign in required' })
  req.admin = session
  next()
}

function publicSite(site) {
  const { ...safe } = site
  return safe
}

function publicCar(car) {
  const images = car.images?.length ? car.images : car.image ? [car.image] : []
  return { ...car, images, image: images[0] || car.image || '' }
}

function publicCruise(cruise) {
  const images = cruise.images?.length ? cruise.images : cruise.image ? [cruise.image] : []
  return { ...cruise, images, image: images[0] || cruise.image || '' }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 24 },
})

function originOf(req) {
  return process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
}

app.get('/api/public/catalog', wrap(async (_req, res) => {
  const db = await getDb()
  res.json({
    site: publicSite(db.site),
    cars: db.cars.map(publicCar),
    cruises: (db.cruises || []).map(publicCruise),
    kenyaMinYear: kenyaMinYear(),
    storage: storageMode(),
    media: cloudinaryEnabled() ? 'cloudinary' : 'local',
  })
}))

app.get('/api/public/duty', (req, res) => {
  res.json(estimateDuty({
    cifUsd: Number(req.query.cifUsd) || 0,
    usdKes: Number(req.query.usdKes) || 129,
    engineCc: Number(req.query.engineCc) || 1800,
    fuel: req.query.fuel || 'Petrol',
    body: req.query.body || 'SUV',
    crspKes: Number(req.query.crspKes) || 0,
  }))
})

app.post('/api/public/enquiries', wrap(async (req, res) => {
  const { name, phone, email, city, message, carSlug, carId, stockNo, cruiseSlug, kind } = req.body || {}
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone and message are required' })
  }
  const db = await getDb()
  const car = db.cars.find((c) => c.slug === carSlug || c.id === carId)
  const cruise = (db.cruises || []).find((c) => c.slug === cruiseSlug)
  const enquiry = {
    id: `ENQ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    kind: kind || (cruise ? 'cruise' : car ? 'car' : 'general'),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email || '').trim(),
    city: String(city || 'Nairobi').trim(),
    message: String(message).trim(),
    carSlug: car?.slug || carSlug || '',
    carId: car?.id || carId || '',
    stockNo: car?.stockNo || stockNo || '',
    carTitle: car ? `${car.year} ${car.make} ${car.model} ${car.grade}` : '',
    cruiseSlug: cruise?.slug || cruiseSlug || '',
    cruiseTitle: cruise?.title || '',
    status: 'new',
    notes: '',
    quoteKes: '',
    notify: [],
  }
  await addEnquiry(enquiry)
  enquiry.notify = await notifyEnquiry(db.site, enquiry)
  res.json({ ok: true, id: enquiry.id, notify: enquiry.notify })
}))

app.get(['/sitemap.xml', '/api/sitemap.xml'], wrap(async (req, res) => {
  const db = await getDb()
  const base = originOf(req).replace(/\/$/, '')
  const urls = [
    '',
    '/stock',
    '/cruises',
    '/import',
    '/about',
    '/contact',
    '/enquire',
    ...db.cars.map((c) => `/stock/${c.slug}`),
    ...(db.cruises || []).map((c) => `/cruises/${c.slug}`),
  ]
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (pathName) => `  <url><loc>${base}${pathName || '/'}</loc><changefreq>weekly</changefreq></url>`,
  )
  .join('\n')}
</urlset>`
  res.type('application/xml').send(body)
}))

app.get(['/robots.txt', '/api/robots.txt'], (req, res) => {
  const base = originOf(req).replace(/\/$/, '')
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`)
})

app.post('/api/admin/login', wrap(async (req, res) => {
  const { username, password } = req.body || {}
  const db = await getDb()
  if (username !== db.auth.username || !verifyPassword(String(password || ''), db.auth.password)) {
    return res.status(401).json({ error: 'Wrong username or password' })
  }
  const token = signSession({ user: db.auth.username, exp: Date.now() + 1000 * 60 * 60 * 12 })
  res.cookie(COOKIE, token, cookieOpts)
  res.json({ ok: true, username: db.auth.username })
}))

app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie(COOKIE, { path: '/', secure: isProd, sameSite: 'lax' })
  res.json({ ok: true })
})

app.get('/api/admin/session', requireAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin.user })
})

app.get('/api/admin/dashboard', requireAdmin, wrap(async (_req, res) => {
  const db = await getDb()
  const minYear = kenyaMinYear()
  const byStatus = (status) => db.cars.filter((c) => c.status === status).length
  res.json({
    username: db.auth.username,
    site: db.site,
    kenyaMinYear: minYear,
    storage: storageMode(),
    media: cloudinaryEnabled() ? 'cloudinary' : 'local',
    counts: {
      cars: db.cars.length,
      available: byStatus('available'),
      reserved: byStatus('reserved'),
      sold: byStatus('sold'),
      japan: db.cars.filter((c) => c.source === 'Japan').length,
      uk: db.cars.filter((c) => c.source === 'UK').length,
      featured: db.cars.filter((c) => c.featured).length,
      cruises: (db.cruises || []).length,
      cruiseFeatured: (db.cruises || []).filter((c) => c.featured).length,
      enquiries: db.enquiries.length,
      newEnquiries: db.enquiries.filter((e) => e.status === 'new').length,
    },
    aging: db.cars
      .filter((c) => c.status !== 'sold' && windowLabel(c.year) !== 'ok')
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        title: `${c.year} ${c.make} ${c.model}`,
        year: c.year,
        window: windowLabel(c.year),
        source: c.source,
      })),
    latestEnquiries: db.enquiries.slice(0, 6),
    featured: db.cars.filter((c) => c.featured).map(publicCar),
    featuredCruises: (db.cruises || []).filter((c) => c.featured).map(publicCruise),
  })
}))

app.get('/api/admin/cars', requireAdmin, wrap(async (_req, res) => {
  const db = await getDb()
  res.json({
    cars: db.cars.map((c) => ({ ...publicCar(c), window: windowLabel(c.year) })),
    kenyaMinYear: kenyaMinYear(),
  })
}))

app.get('/api/admin/cars/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id || c.slug === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  res.json({ car: { ...publicCar(car), window: windowLabel(car.year) }, kenyaMinYear: kenyaMinYear() })
}))

function buildCar(body, existing, cars) {
  const year = Number(body.year) || existing?.year || new Date().getFullYear()
  const make = String(body.make || existing?.make || '').trim()
  const model = String(body.model || existing?.model || '').trim()
  const grade = String(body.grade || existing?.grade || '').trim()
  const slug = slugify(body.slug) || existing?.slug || slugify(`${year} ${make} ${model} ${grade}`)
  const images = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : existing?.images || (existing?.image ? [existing.image] : [])
  const equipment = Array.isArray(body.equipment)
    ? body.equipment.map((x) => String(x).trim()).filter(Boolean)
    : String(body.equipment || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
  return {
    id: existing?.id || String(body.id || '').trim() || nextCarId(cars),
    slug,
    make,
    model,
    grade,
    year,
    month: Number(body.month) || existing?.month || 1,
    priceKes: Number(body.priceKes) || 0,
    cifUsd: Number(body.cifUsd) || 0,
    fobJpy: body.fobJpy === '' || body.fobJpy == null ? existing?.fobJpy || 0 : Number(body.fobJpy) || 0,
    crspKes: body.crspKes === '' || body.crspKes == null ? existing?.crspKes || 0 : Number(body.crspKes) || 0,
    mileage: Number(body.mileage) || 0,
    engineCc: Number(body.engineCc) || 0,
    fuel: String(body.fuel || existing?.fuel || 'Petrol'),
    transmission: String(body.transmission || existing?.transmission || 'Automatic'),
    drive: String(body.drive || existing?.drive || '2WD'),
    color: String(body.color || existing?.color || '').trim(),
    body: String(body.body || existing?.body || 'SUV'),
    seats: Number(body.seats) || existing?.seats || 5,
    doors: Number(body.doors) || existing?.doors || 5,
    chassis: String(body.chassis || existing?.chassis || '').trim(),
    auctionGrade: String(body.auctionGrade || existing?.auctionGrade || '').trim(),
    auctionSheetUrl: body.auctionSheetUrl != null ? String(body.auctionSheetUrl) : existing?.auctionSheetUrl || '',
    exportCertUrl: body.exportCertUrl != null ? String(body.exportCertUrl) : existing?.exportCertUrl || '',
    location: String(body.location || existing?.location || '').trim(),
    eta: String(body.eta || existing?.eta || '').trim(),
    status: ['available', 'reserved', 'sold'].includes(body.status) ? body.status : existing?.status || 'available',
    featured: body.featured != null ? Boolean(body.featured) : Boolean(existing?.featured),
    source: body.source ? (body.source === 'UK' ? 'UK' : 'Japan') : existing?.source || 'Japan',
    stockNo: String(body.stockNo || existing?.stockNo || '').trim(),
    equipment,
    description: String(body.description || existing?.description || '').trim(),
    images,
    image: images[0] || '',
  }
}

function buildCruise(body, existing, cruises) {
  const title = String(body.title || existing?.title || '').trim()
  const destination = String(body.destination || existing?.destination || '').trim()
  const origin = String(body.origin || existing?.origin || '').trim()
  const slug = slugify(body.slug) || existing?.slug || slugify(`${destination} from ${origin} ${title}`)
  const images = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : existing?.images || (existing?.image ? [existing.image] : [])
  const inclusions = Array.isArray(body.inclusions)
    ? body.inclusions.map((x) => String(x).trim()).filter(Boolean)
    : String(body.inclusions || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
  const itinerary = Array.isArray(body.itinerary)
    ? body.itinerary
    : existing?.itinerary || []
  return {
    id: existing?.id || String(body.id || '').trim() || nextCruiseId(cruises),
    slug,
    title,
    destination,
    origin,
    flyFrom: String(body.flyFrom || existing?.flyFrom || 'Nairobi (NBO)').trim(),
    nights: Number(body.nights) || existing?.nights || 7,
    days: Number(body.days) || existing?.days || Number(body.nights) + 1 || 8,
    ship: String(body.ship || existing?.ship || '').trim(),
    operator: String(body.operator || existing?.operator || 'Amason Travel partners').trim(),
    cabin: String(body.cabin || existing?.cabin || '').trim(),
    priceKes: Number(body.priceKes) || 0,
    priceUsd: Number(body.priceUsd) || 0,
    nextDeparture: String(body.nextDeparture || existing?.nextDeparture || '').trim(),
    status: ['available', 'reserved', 'sold'].includes(body.status) ? body.status : existing?.status || 'available',
    featured: body.featured != null ? Boolean(body.featured) : Boolean(existing?.featured),
    inclusions,
    itinerary,
    description: String(body.description || existing?.description || '').trim(),
    images,
    image: images[0] || '',
  }
}

app.post('/api/admin/cars', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const car = buildCar(req.body || {}, null, db.cars)
  if (!car.make || !car.model) return res.status(400).json({ error: 'Make and model are required' })
  if (db.cars.some((c) => c.slug === car.slug)) car.slug = `${car.slug}-${car.id.toLowerCase()}`
  await putCar(car)
  res.json({ car: publicCar(car) })
}))

app.put('/api/admin/cars/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const existing = db.cars.find((c) => c.id === req.params.id)
  if (!existing) return res.status(404).json({ error: 'Car not found' })
  const car = buildCar(req.body || {}, existing, db.cars)
  car.id = existing.id
  await putCar(car)
  res.json({ car: publicCar(car) })
}))

app.patch('/api/admin/cars/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  if (req.body.status && ['available', 'reserved', 'sold'].includes(req.body.status)) car.status = req.body.status
  if (req.body.featured != null) car.featured = Boolean(req.body.featured)
  await putCar(car)
  res.json({ car: publicCar(car) })
}))

app.delete('/api/admin/cars/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  await removeCar(req.params.id)
  res.json({ ok: true })
}))

app.post('/api/admin/cars/:id/photos', requireAdmin, upload.array('photos', 24), wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  const added = []
  for (const file of req.files || []) {
    const up = await uploadImageBuffer(file.buffer, { folder: 'cars', id: req.params.id })
    added.push(up.url)
  }
  car.images = [...(car.images || []), ...added]
  car.image = car.images[0] || ''
  await putCar(car)
  res.json({ car: publicCar(car), added, provider: cloudinaryEnabled() ? 'cloudinary' : 'local' })
}))

app.put('/api/admin/cars/:id/photos', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  car.images = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : car.images
  car.image = car.images[0] || ''
  await putCar(car)
  res.json({ car: publicCar(car) })
}))

app.delete('/api/admin/cars/:id/photos', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  const url = String(req.body.url || '')
  car.images = (car.images || []).filter((img) => img !== url)
  car.image = car.images[0] || ''
  await destroyMedia(url)
  await putCar(car)
  res.json({ car: publicCar(car) })
}))

app.post('/api/admin/cars/:id/docs', requireAdmin, upload.single('file'), wrap(async (req, res) => {
  const db = await getDb()
  const car = db.cars.find((c) => c.id === req.params.id)
  if (!car) return res.status(404).json({ error: 'Car not found' })
  if (!req.file) return res.status(400).json({ error: 'PDF required' })
  const field = req.body.field === 'exportCertUrl' ? 'exportCertUrl' : 'auctionSheetUrl'
  if (car[field]) await destroyMedia(car[field])
  const up = await uploadDocumentBuffer(req.file.buffer, {
    folder: 'docs',
    id: req.params.id,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  })
  car[field] = up.url
  await putCar(car)
  res.json({ car: publicCar(car), field, url: up.url })
}))

app.get('/api/admin/cruises', requireAdmin, wrap(async (_req, res) => {
  const db = await getDb()
  res.json({ cruises: (db.cruises || []).map(publicCruise) })
}))

app.get('/api/admin/cruises/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const cruise = (db.cruises || []).find((c) => c.id === req.params.id || c.slug === req.params.id)
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' })
  res.json({ cruise: publicCruise(cruise) })
}))

app.post('/api/admin/cruises', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const cruise = buildCruise(req.body || {}, null, db.cruises || [])
  if (!cruise.title || !cruise.destination) return res.status(400).json({ error: 'Title and destination are required' })
  await putCruise(cruise)
  res.json({ cruise: publicCruise(cruise) })
}))

app.put('/api/admin/cruises/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const existing = (db.cruises || []).find((c) => c.id === req.params.id)
  if (!existing) return res.status(404).json({ error: 'Cruise not found' })
  const cruise = buildCruise(req.body || {}, existing, db.cruises)
  cruise.id = existing.id
  await putCruise(cruise)
  res.json({ cruise: publicCruise(cruise) })
}))

app.delete('/api/admin/cruises/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const cruise = (db.cruises || []).find((c) => c.id === req.params.id)
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' })
  await removeCruise(req.params.id)
  res.json({ ok: true })
}))

app.post('/api/admin/cruises/:id/photos', requireAdmin, upload.array('photos', 24), wrap(async (req, res) => {
  const db = await getDb()
  const cruise = (db.cruises || []).find((c) => c.id === req.params.id)
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' })
  const added = []
  for (const file of req.files || []) {
    const up = await uploadImageBuffer(file.buffer, { folder: 'cruises', id: req.params.id })
    added.push(up.url)
  }
  cruise.images = [...(cruise.images || []), ...added]
  cruise.image = cruise.images[0] || ''
  await putCruise(cruise)
  res.json({ cruise: publicCruise(cruise), added })
}))

app.put('/api/admin/cruises/:id/photos', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const cruise = (db.cruises || []).find((c) => c.id === req.params.id)
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' })
  cruise.images = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : cruise.images
  cruise.image = cruise.images[0] || ''
  await putCruise(cruise)
  res.json({ cruise: publicCruise(cruise) })
}))

app.delete('/api/admin/cruises/:id/photos', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const cruise = (db.cruises || []).find((c) => c.id === req.params.id)
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' })
  const url = String(req.body.url || '')
  cruise.images = (cruise.images || []).filter((img) => img !== url)
  cruise.image = cruise.images[0] || ''
  await destroyMedia(url)
  await putCruise(cruise)
  res.json({ cruise: publicCruise(cruise) })
}))

app.get('/api/admin/enquiries', requireAdmin, wrap(async (_req, res) => {
  const db = await getDb()
  res.json({ enquiries: db.enquiries })
}))

app.put('/api/admin/enquiries/:id', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const item = db.enquiries.find((e) => e.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Enquiry not found' })
  if (req.body.status) item.status = req.body.status
  if (req.body.notes != null) item.notes = String(req.body.notes)
  if (req.body.quoteKes != null) item.quoteKes = req.body.quoteKes
  await putEnquiry(item)
  res.json({ enquiry: item })
}))

app.put('/api/admin/password', requireAdmin, wrap(async (req, res) => {
  const { current, next } = req.body || {}
  const db = await getDb()
  if (!verifyPassword(String(current || ''), db.auth.password)) {
    return res.status(401).json({ error: 'Current password is wrong' })
  }
  if (!next || String(next).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }
  db.auth.password = hashPassword(String(next))
  await putAuth(db.auth)
  res.json({ ok: true })
}))

app.get('/api/admin/settings', requireAdmin, wrap(async (_req, res) => {
  const db = await getDb()
  res.json({
    site: db.site,
    storage: storageMode(),
    media: cloudinaryEnabled() ? 'cloudinary' : 'local',
  })
}))

app.put('/api/admin/settings', requireAdmin, wrap(async (req, res) => {
  const db = await getDb()
  const next = { ...db.site, ...(req.body || {}) }
  if (next.phone) {
    next.phoneRaw = String(next.phone).replace(/\D/g, '')
    if (next.phoneRaw.startsWith('0')) next.phoneRaw = `254${next.phoneRaw.slice(1)}`
  }
  if (next.whatsapp) next.whatsapp = String(next.whatsapp).replace(/\D/g, '')
  next.usdKes = Number(next.usdKes) || db.site.usdKes
  await putSite(next)
  res.json({ site: next })
}))

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || 'Request failed' })
})

if (!process.env.VERCEL) {
  initRepo().then(() => {
    app.listen(PORT, () => {
      console.log(`Amason admin API on http://localhost:${PORT} (${storageMode()}, ${cloudinaryEnabled() ? 'cloudinary' : 'local media'})`)
    })
  })
}

export default app
