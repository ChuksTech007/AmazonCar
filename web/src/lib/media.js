export function mediaUrl(url, width = 900) {
  if (!url) return ''
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
  }
  return url
}

export function isCloudinary(url) {
  return Boolean(url && url.includes('res.cloudinary.com'))
}

export function isPdf(url) {
  return /\.pdf($|\?)/i.test(url || '') || (url || '').includes('/raw/upload/')
}
