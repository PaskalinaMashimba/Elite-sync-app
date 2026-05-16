import { useState } from 'react'
import ImageUpload from '../components/ImageUpload'

const API = 'https://elitesync-backend.onrender.com/api'

export default function Profile({ user, token, onBack, onUpdate, onLogout }: any) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    imageUrl: user?.imageUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'info' | 'password' | 'danger'>('info')

  const saveInfo = async (e: any) => {
    e.preventDefault(); setLoading(true); setMsg('')
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone, imageUrl: form.imageUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(data)
      setMsg('Profile updated! ✓')
    } catch (err: any) { setMsg(err.message) }
    setLoading(false)
  }

  const changePassword = async (e: any) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setMsg('Passwords do not match'); return }
    if (form.newPassword.length < 6) { setMsg('Password must be at least 6 characters'); return }
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword, fullName: form.fullName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg('Password changed! ✓')
      setForm(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err: any) { setMsg(err.message) }
    setLoading(false)
  }

  const deleteAccount = async () => {
    if (!deletePassword) { setMsg('Enter your password to confirm deletion'); return }
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`${API}/auth/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: deletePassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Log out after deletion
      onLogout()
    } catch (err: any) { setMsg(err.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm mb-6">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-6">
          <ImageUpload
            currentUrl={form.imageUrl}
            onUpload={url => setForm(p => ({ ...p, imageUrl: url }))}
            size="lg"
            shape="circle"
            label="Change Photo"
          />
          <div>
            <p className="font-bold text-gray-800 text-lg">{form.fullName}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`text-xs font-medium px-3 py-1 rounded-full mt-2 inline-block ${user?.role === 'BUSINESS_OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'info', label: 'Personal Info' },
            { key: 'password', label: 'Change Password' },
            { key: 'danger', label: '⚠️ Account' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? (t.key === 'danger' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white') : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Personal Info */}
        {tab === 'info' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={saveInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal text-xs">(cannot be changed)</span></label>
                <input value={user?.email} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+48 123 456 789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL <span className="text-gray-400 font-normal text-xs">(or use the upload button above)</span></label>
                <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Change Password */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your current password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat new password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        {tab === 'danger' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-700 mb-1">⚠️ Delete Account</h3>
              <p className="text-red-600 text-sm mb-4">
                This will permanently delete your account and all your data. This action cannot be undone.
                {user?.role === 'BUSINESS_OWNER' && ' Your business profile and all services will also be deleted.'}
              </p>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition">
                  I want to delete my account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-700 text-sm font-medium">Enter your password to confirm:</p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full border border-red-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword('') }}
                      className="flex-1 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button onClick={deleteAccount} disabled={loading || !deletePassword}
                      className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
                      {loading ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}