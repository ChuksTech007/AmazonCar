import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import CompareBar from './components/CompareBar'
import Home from './pages/Home'
import Stock from './pages/Stock'
import CarDetail from './pages/CarDetail'
import ImportGuide from './pages/ImportGuide'
import About from './pages/About'
import Contact from './pages/Contact'
import Enquire from './pages/Enquire'
import Cruises from './pages/Cruises'
import CruiseDetail from './pages/CruiseDetail'
import AdminApp from './admin/AdminApp'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PublicSite() {
  return (
    <div className="min-h-screen bg-[#f7f5f1]">
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/stock/:slug" element={<CarDetail />} />
          <Route path="/import" element={<ImportGuide />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enquire" element={<Enquire />} />
          <Route path="/cruises" element={<Cruises />} />
          <Route path="/cruises/:slug" element={<CruiseDetail />} />
        </Routes>
      </main>
      <Footer />
      <CompareBar />
      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return <AdminApp />
  return <PublicSite />
}
