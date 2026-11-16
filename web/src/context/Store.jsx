import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useCatalog } from './Catalog'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const { cars } = useCatalog()
  const [compare, setCompare] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('amason-compare') || '[]')
    } catch {
      return []
    }
  })
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('amason-saved') || '[]')
    } catch {
      return []
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('amason-compare', JSON.stringify(compare))
  }, [compare])

  useEffect(() => {
    localStorage.setItem('amason-saved', JSON.stringify(saved))
  }, [saved])

  const value = useMemo(() => {
    const compareCars = compare.map((slug) => cars.find((c) => c.slug === slug)).filter(Boolean)

    const toggleCompare = (slug) => {
      setCompare((prev) => {
        if (prev.includes(slug)) return prev.filter((s) => s !== slug)
        if (prev.length >= 3) return [...prev.slice(1), slug]
        return [...prev, slug]
      })
    }

    const toggleSaved = (slug) => {
      setSaved((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
    }

    return {
      compare,
      compareCars,
      toggleCompare,
      clearCompare: () => setCompare([]),
      saved,
      toggleSaved,
      menuOpen,
      setMenuOpen,
    }
  }, [compare, saved, menuOpen, cars])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
