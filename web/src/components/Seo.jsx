import { useEffect } from 'react'
import { useCatalog } from '../context/Catalog'
import { mediaUrl } from '../lib/media'

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function Seo({ title, description, image, path = '' }) {
  const { site } = useCatalog()
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.tagline}`
  const desc =
    description ||
    `${site.tagline} ${site.tagline2} Japan and UK cars to Kenya, plus cruise packages. Priced in ${site.currency}. ${site.phone}.`

  useEffect(() => {
    document.title = fullTitle
    setMeta('description', desc)
    const origin = window.location.origin
    const url = `${origin}${path}`
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', url)
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', desc, 'property')
    setMeta('og:type', 'website', 'property')
    if (image) {
      const img = image.startsWith('http') ? image : `${origin}${mediaUrl(image, 1200)}`
      setMeta('og:image', img, 'property')
    }
  }, [fullTitle, desc, image, path])

  return null
}
