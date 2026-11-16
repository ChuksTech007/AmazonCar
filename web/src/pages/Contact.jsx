import PageHero from '../components/PageHero'
import EnquiryForm from '../components/EnquiryForm'
import { useCatalog } from '../context/Catalog'
import Seo from '../components/Seo'

export default function Contact() {
  const { site, TEL_URL, WHATSAPP_URL } = useCatalog()
  return (
    <div>
      <Seo title="Contact" path="/contact" />
      <PageHero
        kicker="Contact"
        title="Talk to Amason"
        subtitle="Call, WhatsApp or send a brief. We quote in Kenyan Shillings and work Kenya hours."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl text-navy">Sales desk</h2>
          <div className="gold-line mt-4 mb-6" />
          <a href={TEL_URL} className="block font-display text-4xl text-navy">
            {site.phone}
          </a>
          <a href={WHATSAPP_URL()} className="mt-2 block text-gold-3" target="_blank" rel="noreferrer">
            WhatsApp {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="mt-2 block text-muted">
            {site.email}
          </a>
          <p className="mt-6 text-sm text-muted">
            {site.city}, Kenya
            <br />
            Vehicles clear at {site.port} Port
            <br />
            {site.hours}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm bg-navy p-5 text-white">
              <p className="text-xs tracking-widest text-gold-2 uppercase">Call</p>
              <p className="mt-2 text-sm">Direct line to sales. Have a stock number ready if you can.</p>
            </div>
            <div className="rounded-sm bg-cream p-5">
              <p className="text-xs tracking-widest text-gold-3 uppercase">Visit brief</p>
              <p className="mt-2 text-sm text-muted">Tell us the car, year and budget. We reply with a KES landed estimate.</p>
            </div>
          </div>
        </div>
        <div className="rounded-sm bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-2xl text-navy">Send a message</h2>
          <EnquiryForm />
        </div>
      </section>
    </div>
  )
}
