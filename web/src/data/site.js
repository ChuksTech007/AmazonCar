export const SITE = {
  name: 'Amason Car Sales',
  shortName: 'Amason',
  tagline: 'Your dream car, delivered to your door.',
  tagline2: 'Import it with us.',
  phone: '+254 722 906978',
  phoneRaw: '254722906978',
  whatsapp: '254722906978',
  email: 'sales@amasoncarsales.co.ke',
  currency: 'KES',
  country: 'Kenya',
  city: 'Nairobi',
  port: 'Mombasa',
  hours: 'Mon – Sat, 8:00am – 6:00pm EAT',
  usdKes: 129,
}

export const WHATSAPP_URL = (text = '') => {
  const msg = text || 'Hello Amason Car Sales, I would like to enquire about importing a car to Kenya.'
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`
}

export const TEL_URL = `tel:+${SITE.phoneRaw}`

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/stock', label: 'Stock' },
  { to: '/import', label: 'How to Import' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
