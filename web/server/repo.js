import mongoose from 'mongoose'
import {
  loadStore,
  saveStore,
  hashPassword,
} from './store.js'

const loose = { strict: false, timestamps: true }

const Car = mongoose.models.Car || mongoose.model('Car', new mongoose.Schema({ id: { type: String, unique: true } }, loose))
const Cruise = mongoose.models.Cruise || mongoose.model('Cruise', new mongoose.Schema({ id: { type: String, unique: true } }, loose))
const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', new mongoose.Schema({ id: { type: String, unique: true } }, loose))
const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({ key: { type: String, unique: true } }, loose))

let mode = 'json'

function lean(doc) {
  if (!doc) return null
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc }
  delete obj._id
  delete obj.__v
  return obj
}

export function storageMode() {
  return mode
}

export async function initRepo() {
  if (mongoose.connection.readyState === 1) {
    mode = 'mongo'
    return mode
  }
  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise()
    mode = 'mongo'
    return mode
  }
  const uri = process.env.MONGODB_URI
  if (uri) {
    try {
      await mongoose.connect(uri, { dbName: 'amason', serverSelectionTimeoutMS: 12000 })
      mode = 'mongo'
      await seedMongoIfEmpty()
      console.log('Amason data: MongoDB')
    } catch (err) {
      mode = 'json'
      console.warn(`MongoDB unavailable (${err.message}). Using local JSON store.`)
    }
  } else {
    mode = 'json'
    console.log('Amason data: JSON store (set MONGODB_URI to use MongoDB)')
  }
  return mode
}

async function seedMongoIfEmpty() {
  const count = await Car.countDocuments()
  if (count > 0) return
  const json = loadStore()
  if (json.cars?.length) await Car.insertMany(json.cars)
  if (json.cruises?.length) await Cruise.insertMany(json.cruises)
  if (json.enquiries?.length) await Enquiry.insertMany(json.enquiries)
  await Setting.findOneAndUpdate({ key: 'site' }, { key: 'site', ...json.site, auth: json.auth }, { upsert: true })
}

export async function getDb() {
  await initRepo()
  if (mode === 'mongo') {
    const siteDoc = await Setting.findOne({ key: 'site' }).lean()
    const { auth, key, _id, __v, createdAt, updatedAt, ...site } = siteDoc || {}
    return {
      site,
      auth: auth || loadStore().auth,
      cars: (await Car.find().lean()).map(lean),
      cruises: (await Cruise.find().lean()).map(lean),
      enquiries: (await Enquiry.find().sort({ createdAt: -1 }).lean()).map(lean),
    }
  }
  return loadStore()
}

export async function saveDb(db) {
  if (mode === 'mongo') {
    await Setting.findOneAndUpdate({ key: 'site' }, { key: 'site', ...db.site, auth: db.auth }, { upsert: true })
    return db
  }
  saveStore(db)
  return db
}

export async function replaceCars(cars) {
  const db = await getDb()
  db.cars = cars
  if (mode === 'mongo') {
    await Car.deleteMany({})
    if (cars.length) await Car.insertMany(cars)
  }
  await saveDb(db)
}

export async function putCar(car) {
  const db = await getDb()
  const idx = db.cars.findIndex((c) => c.id === car.id)
  if (idx < 0) db.cars.unshift(car)
  else db.cars[idx] = car
  if (mode === 'mongo') {
    await Car.findOneAndUpdate({ id: car.id }, car, { upsert: true })
  }
  await saveDb(db)
  return car
}

export async function removeCar(id) {
  const db = await getDb()
  db.cars = db.cars.filter((c) => c.id !== id)
  if (mode === 'mongo') await Car.deleteOne({ id })
  await saveDb(db)
}

export async function putCruise(cruise) {
  const db = await getDb()
  const idx = db.cruises.findIndex((c) => c.id === cruise.id)
  if (idx < 0) db.cruises.unshift(cruise)
  else db.cruises[idx] = cruise
  if (mode === 'mongo') {
    await Cruise.findOneAndUpdate({ id: cruise.id }, cruise, { upsert: true })
  }
  await saveDb(db)
  return cruise
}

export async function removeCruise(id) {
  const db = await getDb()
  db.cruises = db.cruises.filter((c) => c.id !== id)
  if (mode === 'mongo') await Cruise.deleteOne({ id })
  await saveDb(db)
}

export async function addEnquiry(enquiry) {
  const db = await getDb()
  db.enquiries.unshift(enquiry)
  if (mode === 'mongo') await Enquiry.create(enquiry)
  await saveDb(db)
  return enquiry
}

export async function putEnquiry(enquiry) {
  const db = await getDb()
  const idx = db.enquiries.findIndex((e) => e.id === enquiry.id)
  if (idx >= 0) db.enquiries[idx] = enquiry
  if (mode === 'mongo') await Enquiry.findOneAndUpdate({ id: enquiry.id }, enquiry)
  await saveDb(db)
  return enquiry
}

export async function putSite(site) {
  const db = await getDb()
  db.site = site
  await saveDb(db)
  return site
}

export async function putAuth(auth) {
  const db = await getDb()
  db.auth = auth
  await saveDb(db)
  return auth
}

export { hashPassword }
