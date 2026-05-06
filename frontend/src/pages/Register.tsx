import { useState } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function Register({ onLogin, onBack }: any) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CLIENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      onLogin(data.user, data.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-500 text-sm mb-8">Join EliteSync today</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="CLIENT">Client — I want to book services</option>
              <option value="BUSINESS_OWNER">Business Owner — I offer services</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <button onClick={onBack} className="text-blue-600 font-semibold hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  )
}