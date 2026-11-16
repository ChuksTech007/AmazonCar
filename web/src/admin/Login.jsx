import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('amason')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/api/admin/session')
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => {})
  }, [navigate])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-sm bg-navy-2 p-8 ring-1 ring-gold/30">
        <img src="/logo.png" alt="Amason Car Sales" className="logo-glow mx-auto mb-6 h-20 w-auto" />
        <p className="text-center text-xs font-semibold tracking-[0.28em] text-gold-2 uppercase">Stock desk</p>
        <h1 className="mt-2 text-center font-display text-3xl text-white">Sign in</h1>
        <p className="mt-2 text-center text-sm text-white/60">Japan / UK inventory, KES quotes and WhatsApp leads.</p>
        {error && <p className="mt-4 rounded-sm bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
        <label className="mt-6 block text-xs font-semibold tracking-widest text-gold-2 uppercase">Username</label>
        <input className="field mt-1" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        <label className="mt-4 block text-xs font-semibold tracking-widest text-gold-2 uppercase">Password</label>
        <input
          className="field mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button className="btn-gold mt-6 w-full" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Enter desk'}
        </button>
      </form>
    </div>
  )
}
