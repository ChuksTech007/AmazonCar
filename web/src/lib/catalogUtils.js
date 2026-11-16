export const PRICE_OPTIONS = [
  { value: '2500000', label: 'KES 2.5M' },
  { value: '4000000', label: 'KES 4M' },
  { value: '6000000', label: 'KES 6M' },
  { value: '9000000', label: 'KES 9M' },
  { value: '12000000', label: 'KES 12M' },
  { value: '20000000', label: 'KES 20M' },
]

export const MILEAGE_OPTIONS = [
  { value: '30000', label: 'Up to 30,000 km' },
  { value: '50000', label: 'Up to 50,000 km' },
  { value: '80000', label: 'Up to 80,000 km' },
  { value: '100000', label: 'Up to 100,000 km' },
  { value: '150000', label: 'Up to 150,000 km' },
]

export const EQUIPMENT_PACKS = {
  family: ['Power steering', 'Power windows', 'Air conditioning', 'ABS', 'Airbags', 'Alloy wheels', 'Reverse camera', 'Keyless entry', 'Fog lights', 'Navigation'],
  luxury: ['Leather seats', 'Sunroof', '360 camera', 'Adaptive cruise', 'Heated seats', 'Premium audio', 'LED headlights', 'Parking sensors', 'Keyless go', 'Climate control'],
  suv: ['4WD', 'Roof rails', 'Hill descent', 'Traction control', 'Rear wiper', 'Fog lights', 'Alloy wheels', 'Reverse camera', 'ABS', 'Airbags'],
  work: ['Air conditioning', 'Power steering', 'ABS', 'Airbags', 'Bed liner ready', 'Tow bar ready', 'Central locking', 'Radio'],
}

export const derive = (cars) => {
  const list = cars || []
  return {
    makes: [...new Set(list.map((c) => c.make))].sort(),
    bodies: [...new Set(list.map((c) => c.body))].sort(),
    fuels: [...new Set(list.map((c) => c.fuel))].sort(),
    years: [...new Set(list.map((c) => c.year))].sort((a, b) => b - a),
    transmissions: [...new Set(list.map((c) => c.transmission))].sort(),
    sources: [...new Set(list.map((c) => c.source))].sort(),
  }
}

export const modelsFor = (cars, make) =>
  [...new Set((cars || []).filter((c) => !make || c.make === make).map((c) => c.model))].sort()

export const whatsappUrl = (site, text = '') => {
  const msg = text || `Hello ${site?.name || 'Amason Car Sales'}, I would like to enquire about importing a car to Kenya.`
  return `https://wa.me/${site?.whatsapp}?text=${encodeURIComponent(msg)}`
}

export const telUrl = (site) => `tel:+${site?.phoneRaw || ''}`
