import './loadEnv.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initRepo, getDb, putCar, putCruise, storageMode } from './repo.js'
import { configureCloudinary, cloudinaryEnabled, uploadImageBuffer } from './cloudinary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const UPLOAD_DIR = path.join(__dirname, 'uploads')

function localFile(url) {
  if (!url || url.startsWith('http')) return null
  const rel = url.replace(/^\//, '').replace(/\//g, path.sep)
  const candidates = [path.join(PUBLIC_DIR, rel), path.join(UPLOAD_DIR, rel.replace(/^uploads[\\/]/, ''))]
  return candidates.find((p) => fs.existsSync(p)) || null
}

async function migrateList(items, kind, save) {
  let moved = 0
  for (const item of items) {
    const next = []
    let changed = false
    for (const url of item.images || []) {
      if (url.includes('res.cloudinary.com')) {
        next.push(url)
        continue
      }
      const file = localFile(url)
      if (!file) {
        next.push(url)
        continue
      }
      const up = await uploadImageBuffer(fs.readFileSync(file), { folder: kind, id: item.id })
      next.push(up.url)
      changed = true
      moved += 1
      console.log(`  ${kind} ${item.id}: ${url} -> cloudinary`)
    }
    if (changed) {
      item.images = next
      item.image = next[0] || item.image
      await save(item)
    }
  }
  return moved
}

const db = await initRepo().then(() => getDb())
configureCloudinary()
if (!cloudinaryEnabled()) {
  console.error('Cloudinary keys missing. Abort.')
  process.exit(1)
}
console.log(`Storage ${storageMode()}. Uploading local photos to Cloudinary…`)
const cars = await migrateList(db.cars, 'cars', putCar)
const cruises = await migrateList(db.cruises || [], 'cruises', putCruise)
console.log(`Done. Moved ${cars} car photos and ${cruises} cruise photos.`)
process.exit(0)
