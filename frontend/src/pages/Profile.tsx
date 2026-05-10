import { useState } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function Profile({ user, token, onBack, onUpdate }: any) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    imageUrl: user?.imageUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'info' | 'password'>('info')

  const saveInfo = async (e: any) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone, imageUrl: form.imageUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(data)
      setMsg('Profile updated successfully! ✓')
    } catch (err: any) { setMsg(err.message) }
    setLoading(false)
  }

  const changePassword = async (e: any) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setMsg('New passwords do not match'); return
    }
    if (form.newPassword.length < 6) {
      setMsg('New password must be at least 6 characters'); return
    }
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword, fullName: form.fullName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg('Password changed successfully! ✓')
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err: any) { setMsg(err.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm mb-4">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        {/* Avatar preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-4">
          {form.imageUrl ? (
            <img src={form.imageUrl} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" alt="Profile" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {form.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{form.fullName}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'BUSINESS_OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('info')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'info' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            Personal Info
          </button>
          <button onClick={() => setTab('password')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'password' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            Change Password
          </button>
        </div>

        {tab === 'info' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={saveInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={user?.email} disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+48 123 456 789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/your-photo.jpg" />
                <p className="text-gray-400 text-xs mt-1">Paste a direct image URL from imgur.com or any image host</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat new password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}