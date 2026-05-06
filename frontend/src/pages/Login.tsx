import { useState } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function Login({ onLogin, onRegister }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      onLogin(data.user, data.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 bg-blue-900 flex-col justify-center px-16">
        <h1 className="text-5xl font-bold text-white mb-4">EliteSync</h1>
        <p className="text-blue-300 text-xl mb-8">Booking & Scheduling Platform</p>
        <div className="space-y-3">
          <p className="text-green-400">● Multi-role access</p>
          <p className="text-green-400">● Real-time availability</p>
          <p className="text-green-400">● Admin dashboard</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
          <p className="text-gray-500 text-sm mb-8">Welcome back to EliteSync</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-6 text-center">
            Don't have an account?{' '}
            <button onClick={onRegister} className="text-blue-600 font-semibold hover:underline">Register</button>
          </p>
        </div>
      </div>
    </div>
  )
}