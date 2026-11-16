import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'
import { UPLOAD_DIR } from './store.js'

export function cloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
  )
}

export function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) return
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }
}

function localPath(folder, filename) {
  const dir = path.join(UPLOAD_DIR, folder)
  fs.mkdirSync(dir, { recursive: true })
  return { dir, abs: path.join(dir, filename), url: `/uploads/${folder}/${filename}`.replace(/\\/g, '/') }
}

export async function uploadImageBuffer(buffer, { folder, id }) {
  const webp = await sharp(buffer)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer()

  if (cloudinaryEnabled()) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `amason/${folder}/${id}`,
          resource_type: 'image',
          format: 'webp',
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      )
      stream.end(webp)
    })
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' }
  }

  const filename = `${Date.now()}-${id}.webp`
  const { abs, url } = localPath(`${folder}/${id}`, filename)
  fs.writeFileSync(abs, webp)
  return { url, publicId: '', provider: 'local' }
}

export async function uploadDocumentBuffer(buffer, { folder, id, originalName, mimetype }) {
  const ext = path.extname(originalName || '').toLowerCase() || (mimetype === 'application/pdf' ? '.pdf' : '.bin')
  if (cloudinaryEnabled()) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `amason/${folder}/${id}`,
          resource_type: 'raw',
          filename_override: originalName || `document${ext}`,
          use_filename: true,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      )
      stream.end(buffer)
    })
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' }
  }
  const filename = `${Date.now()}-${id}${ext}`
  const { abs, url } = localPath(`${folder}/${id}`, filename)
  fs.writeFileSync(abs, buffer)
  return { url, publicId: '', provider: 'local' }
}

export async function destroyMedia(url) {
  if (!url) return
  if (url.includes('res.cloudinary.com') && cloudinaryEnabled()) {
    const match = url.match(/amason\/[^.]+/)
    if (match) {
      const publicId = match[0].replace(/\.[a-z0-9]+$/i, '')
      const resourceType = url.includes('/raw/upload/') ? 'raw' : 'image'
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {})
    }
    return
  }
  if (url.startsWith('/uploads/')) {
    const abs = path.normalize(path.join(UPLOAD_DIR, url.replace(/^\/uploads\//, '')))
    if (abs.startsWith(path.normalize(UPLOAD_DIR)) && fs.existsSync(abs)) fs.unlinkSync(abs)
  }
}
