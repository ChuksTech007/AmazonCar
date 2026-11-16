export async function api(path, opts = {}) {
  const isForm = typeof FormData !== 'undefined' && opts.body instanceof FormData
  const headers = {
    ...(!isForm && opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...opts.headers,
  }
  const res = await fetch(path, { credentials: 'include', ...opts, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed')
  return data
}

export function clientWhatsApp(phone, text = '') {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`
  if (digits.length === 9) digits = `254${digits}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
