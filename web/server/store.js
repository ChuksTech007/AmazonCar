import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { CARS } from '../src/data/cars.js'
import { CRUISES } from '../src/data/cruises.js'
import { SITE } from '../src/data/site.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = path.join(__dirname, 'data')
export const STORE_PATH = path.join(DATA_DIR, 'store.json')
export const UPLOAD_DIR = path.join(__dirname, 'uploads')

const DEFAULT_USER = process.env.ADMIN_USER || 'amason'
const DEFAULT_PASS = process.env.ADMIN_PASS || 'KenyaDoor2026'

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const next = crypto.scryptSync(password, salt, 32).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(next, 'hex'))
}

function seed() {
  return {
    site: { ...SITE },
    cars: CARS.map((car) => ({
      ...car,
      image: car.images?.[0] || car.image,
      images: car.images?.length ? car.images : car.image ? [car.image] : [],
      auctionSheetUrl: car.auctionSheetUrl || '',
      exportCertUrl: car.exportCertUrl || '',
      crspKes: car.crspKes || 0,
    })),
    cruises: CRUISES.map((cruise) => ({
      ...cruise,
      image: cruise.images?.[0] || cruise.image,
      images: cruise.images?.length ? cruise.images : cruise.image ? [cruise.image] : [],
    })),
    enquiries: [],
    auth: {
      username: DEFAULT_USER,
      password: hashPassword(DEFAULT_PASS),
    },
  }
}

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export function loadStore() {
  ensureDirs()
  if (!fs.existsSync(STORE_PATH)) {
    const fresh = seed()
    saveStore(fresh)
    return fresh
  }
  const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'))
  if (!data.site) data.site = { ...SITE }
  if (!Array.isArray(data.cars)) data.cars = seed().cars
  if (!Array.isArray(data.enquiries)) data.enquiries = []
  if (!Array.isArray(data.cruises) || data.cruises.length === 0) data.cruises = seed().cruises
  if (!data.auth?.password) data.auth = seed().auth
  data.cars = data.cars.map((car) => ({
    auctionSheetUrl: '',
    exportCertUrl: '',
    crspKes: 0,
    ...car,
  }))
  return data
}

export function saveStore(data) {
  ensureDirs()
  const tmp = `${STORE_PATH}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, STORE_PATH)
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

export function nextCruiseId(cruises) {
  const nums = (cruises || [])
    .map((c) => Number(String(c.id || '').replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
  const max = nums.length ? Math.max(...nums) : 1000
  return `AM-CR-${max + 1}`
}

export function nextCarId(cars) {
  const nums = cars
    .map((c) => Number(String(c.id || '').replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
  const max = nums.length ? Math.max(...nums) : 7000
  return `ACS-${max + 1}`
}

export function kenyaMinYear(date = new Date()) {
  return date.getFullYear() - 7
}

export function windowLabel(year) {
  const min = kenyaMinYear()
  if (!year) return 'unknown'
  if (year < min) return 'outside'
  if (year === min) return 'edge'
  return 'ok'
}
