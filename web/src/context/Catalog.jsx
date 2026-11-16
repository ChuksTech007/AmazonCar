import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CARS } from '../data/cars'
import { CRUISES } from '../data/cruises'
import { SITE } from '../data/site'
import { derive, modelsFor as modelsForCars, telUrl, whatsappUrl } from '../lib/catalogUtils'
import { setUsdKes } from '../lib/format'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [cars, setCars] = useState(CARS)
  const [cruises, setCruises] = useState(CRUISES)
  const [site, setSite] = useState(SITE)
  const [kenyaMinYear, setKenyaMinYear] = useState(new Date().getFullYear() - 7)
  const [ready, setReady] = useState(false)

  const reload = () =>
    fetch('/api/public/catalog')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.cars)) setCars(data.cars)
        if (Array.isArray(data.cruises)) setCruises(data.cruises)
        if (data.site) {
          setSite({ ...SITE, ...data.site })
          setUsdKes(data.site.usdKes)
        }
        if (data.kenyaMinYear) setKenyaMinYear(data.kenyaMinYear)
      })
      .catch(() => {})
      .finally(() => setReady(true))

  useEffect(() => {
    reload()
    const onFocus = () => reload()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const value = useMemo(() => {
    const stats = derive(cars)
    return {
      cars,
      cruises,
      site,
      kenyaMinYear,
      ready,
      reload,
      ...stats,
      modelsFor: (make) => modelsForCars(cars, make),
      getCar: (slug) => cars.find((c) => c.slug === slug),
      getCruise: (slug) => cruises.find((c) => c.slug === slug),
      similarCars: (car, n = 3) =>
        cars.filter((c) => c.slug !== car.slug && (c.body === car.body || c.make === car.make)).slice(0, n),
      featuredCars: cars.filter((c) => c.featured),
      featuredCruises: cruises.filter((c) => c.featured),
      availableCount: cars.filter((c) => c.status !== 'sold').length,
      WHATSAPP_URL: (text) => whatsappUrl(site, text),
      TEL_URL: telUrl(site),
    }
  }, [cars, cruises, site, kenyaMinYear, ready])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => useContext(CatalogContext)
