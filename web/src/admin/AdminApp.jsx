import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { api } from './api'
import Login from './Login'
import Dashboard from './Dashboard'
import StockList from './StockList'
import StockEdit from './StockEdit'
import Enquiries from './Enquiries'
import Settings from './Settings'
import CruiseList from './CruiseList'
import CruiseEdit from './CruiseEdit'

function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState('')
  const [newLeads, setNewLeads] = useState(0)

  useEffect(() => {
    api('/api/admin/session')
      .then((data) => setUser(data.username))
      .catch(() => navigate('/admin/login', { replace: true }))
  }, [navigate, location.pathname])

  useEffect(() => {
    api('/api/admin/dashboard')
      .then((data) => setNewLeads(data.counts?.newEnquiries || 0))
      .catch(() => {})
  }, [location.pathname])

  const logout = async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {})
    navigate('/admin/login', { replace: true })
  }

  const item = ({ isActive }) =>
    `rounded-sm px-3 py-2 text-sm font-semibold tracking-wide ${
      isActive ? 'bg-gold text-navy' : 'text-white/80 hover:bg-white/10'
    }`

  return (
    <div className="min-h-screen bg-[#f4f1ea] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-navy text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <img src="/logo.png" alt="Amason" className="logo-glow h-14 w-auto" />
          <p className="mt-3 text-[11px] font-semibold tracking-[0.22em] text-gold-2 uppercase">Sales desk</p>
          <p className="text-xs text-white/50">{user}</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <NavLink to="/admin" end className={item}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/stock" className={item}>
            Stock desk
          </NavLink>
          <NavLink to="/admin/cruises" className={item}>
            Cruise desk
          </NavLink>
          <NavLink to="/admin/enquiries" className={item}>
            Enquiries
            {newLeads > 0 && (
              <span className="ml-2 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-navy">{newLeads}</span>
            )}
          </NavLink>
          <NavLink to="/admin/settings" className={item}>
            Sales settings
          </NavLink>
        </nav>
        <div className="p-3">
          <Link to="/" target="_blank" className="block px-3 py-2 text-xs text-white/60 hover:text-gold-2">
            View public site
          </Link>
          <button type="button" onClick={logout} className="px-3 py-2 text-xs text-white/60 hover:text-gold-2">
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<StockList />} />
        <Route path="stock/new" element={<StockEdit />} />
        <Route path="stock/:id" element={<StockEdit />} />
        <Route path="cruises" element={<CruiseList />} />
        <Route path="cruises/new" element={<CruiseEdit />} />
        <Route path="cruises/:id" element={<CruiseEdit />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
