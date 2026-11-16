import { useCatalog } from '../context/Catalog'
import { useStore } from '../context/Store'

export default function WhatsAppButton() {
  const { compare } = useStore()
  const { WHATSAPP_URL } = useCatalog()
  return (
    <a
      className="wa-float"
      style={compare.length ? { bottom: 108 } : undefined}
      href={WHATSAPP_URL()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      title="WhatsApp Amason Car Sales"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.47c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
        <path d="M16.02 3C9.39 3 4 8.39 4 15.02c0 2.12.55 4.1 1.52 5.83L4 29l8.3-1.49A12 12 0 0 0 16.02 27C22.65 27 28 21.61 28 14.98 28 8.39 22.65 3 16.02 3zm0 21.82c-1.95 0-3.76-.52-5.32-1.43l-.38-.23-4.93.89.93-4.8-.25-.4a9.8 9.8 0 0 1-1.5-5.23c0-5.43 4.42-9.85 9.85-9.85s9.85 4.42 9.85 9.85-4.42 9.85-9.85 9.85z" />
      </svg>
    </a>
  )
}
