import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function AdminDashboard({ user, token, onLogout }: any) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const loadData = () => {
    fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const toggleUser = async (id: string) => {
    const res = await fetch(`${API}/admin/users/${id}/toggle`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const updated = await res.json()
      setData((prev: any) => ({ ...prev, recentUsers: prev.recentUsers.map((u: any) => u.id === id ? { ...u, isActive: updated.isActive } : u) }))
      setMsg(`User ${updated.isActive ? 'enabled' : 'disabled'} ✓`)
    }
  }

  const deleteUser = async (id: string) => {
    const res = await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      setData((prev: any) => ({ ...prev, recentUsers: prev.recentUsers.filter((u: any) => u.id !== id) }))
      setMsg('User permanently deleted ✓')
      setConfirmDelete(null)
    } else {
      const d = await res.json()
      setMsg(d.error)
    }
  }

  const toggleBusiness = async (id: string) => {
    const res = await fetch(`${API}/admin/businesses/${id}/toggle`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const updated = await res.json()
      setData((prev: any) => ({ ...prev, businesses: prev.businesses.map((b: any) => b.id === id ? { ...b, isActive: updated.isActive } : b) }))
      setMsg(`Business ${updated.isActive ? 'reactivated' : 'suspended'} ✓`)
    }
  }

  const deleteBusiness = async (id: string) => {
    const res = await fetch(`${API}/admin/businesses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      setData((prev: any) => ({ ...prev, businesses: prev.businesses.filter((b: any) => b.id !== id) }))
      setMsg('Business permanently deleted ✓')
      setConfirmDelete(null)
    } else {
      const d = await res.json()
      setMsg(d.error)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const successRate = data?.totalBookings > 0 ? Math.round((data.approvedBookings / data.totalBookings) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <p className="text-4xl mb-2">⚠️</p>
              <h3 className="font-bold text-gray-800 text-lg">Confirm Permanent Deletion</h3>
              <p className="text-gray-500 text-sm mt-2">
                {confirmDelete.type === 'user'
                  ? `Delete user "${confirmDelete.name}"? All their bookings will also be deleted.`
                  : `Delete business "${confirmDelete.name}"? All services and bookings will also be deleted.`}
              </p>
              <p className="text-red-600 text-xs mt-2 font-medium">This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => confirmDelete.type === 'user' ? deleteUser(confirmDelete.id) : deleteBusiness(confirmDelete.id)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-56 bg-slate-900 flex flex-col py-6 px-4 fixed h-full">
        <div className="bg-slate-800 rounded-lg px-3 py-2 mb-1">
          <span className="text-white font-bold text-lg">EliteSync</span>
        </div>
        <p className="text-slate-400 text-xs px-1 mb-6">Super Admin Panel</p>
        {[
          { key: 'overview',   label: '📊 Platform Overview' },
          { key: 'businesses', label: '🏢 Businesses' },
          { key: 'users',      label: '👥 Users' },
          { key: 'growth',     label: '📈 Growth Charts' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg mb-1 text-sm text-left transition ${tab === t.key ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
        <div className="mt-auto">
          <p className="text-slate-500 text-xs px-1 mb-2 truncate">{user?.fullName}</p>
          <button onClick={onLogout} className="w-full text-left px-3 py-2 text-red-400 text-sm hover:text-red-300">Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-56 p-8 overflow-y-auto">
        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
            onClick={() => setMsg('')}>
            {msg} <span className="float-right cursor-pointer">✕</span>
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && data && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Platform Overview</h1>
            <p className="text-gray-500 text-sm mb-6">Full control of the EliteSync platform</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Users', value: data.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
                { label: 'Business Owners', value: data.totalOwners, color: 'text-purple-600', bg: 'bg-purple-50', icon: '🏢' },
                { label: 'Total Bookings', value: data.totalBookings, color: 'text-green-600', bg: 'bg-green-50', icon: '📅' },
                { label: 'Approval Rate', value: `${successRate}%`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '🎯' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
                  <p className="text-gray-500 text-xs">{c.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Client Accounts', value: data.totalClients, color: 'text-blue-600' },
                { label: 'Active Businesses', value: data.businesses?.filter((b: any) => b.isActive).length || 0, color: 'text-green-600' },
                { label: 'Suspended Businesses', value: data.businesses?.filter((b: any) => !b.isActive).length || 0, color: 'text-red-600' },
                { label: 'Pending Bookings', value: data.pendingBookings, color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{s.label}</span>
                  <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Platform Success Metrics</h2>
              {[
                { label: 'Booking Approval Rate', value: successRate, color: 'bg-green-500' },
                { label: 'Platform Utilisation', value: Math.min(100, Math.round(((data.totalBookings || 0) / Math.max(data.totalBusinesses * 5, 1)) * 100)), color: 'bg-blue-500' },
                { label: 'Business Coverage', value: Math.min(100, Math.round(((data.totalServices || 0) / Math.max(data.totalBusinesses * 3, 1)) * 100)), color: 'bg-purple-500' },
              ].map(m => (
                <div key={m.label} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{m.label}</span>
                    <span className="font-semibold text-gray-800">{m.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUSINESSES */}
        {tab === 'businesses' && data && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">All Businesses ({data.businesses?.length})</h1>
              <p className="text-sm text-gray-500">As admin you can suspend, reactivate, or permanently delete any business</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {data.businesses?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No businesses registered yet.</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Business', 'Owner', 'Category', 'Services', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.businesses.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm">{b.name}</p>
                          {b.email && <p className="text-gray-400 text-xs">{b.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.owner?.fullName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b._count?.services}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {b.isActive ? '✓ Active' : '✗ Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => toggleBusiness(b.id)}
                              className={`text-xs px-2 py-1 rounded-lg transition ${b.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                              {b.isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'business', id: b.id, name: b.name })}
                              className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && data && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">All Users ({data.totalUsers} total)</h1>
              <p className="text-sm text-gray-500">Enable, disable, or permanently delete any user account</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentUsers?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'BUSINESS_OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? '✓ Active' : '✗ Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'SUPER_ADMIN' && (
                          <div className="flex gap-1">
                            <button onClick={() => toggleUser(u.id)}
                              className={`text-xs px-2 py-1 rounded-lg transition ${u.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'user', id: u.id, name: u.fullName })}
                              className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GROWTH CHARTS */}
        {tab === 'growth' && data && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Platform Growth</h1>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {[
                { title: 'New Users Per Month', key: 'users', color: '#2563EB', desc: 'How many people joined EliteSync' },
                { title: 'Bookings Per Month', key: 'bookings', color: '#16A34A', desc: 'Total bookings across all businesses' },
              ].map(chart => (
                <div key={chart.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-800 mb-1">{chart.title}</h2>
                  <p className="text-gray-400 text-xs mb-4">{chart.desc}</p>
                  <div className="flex items-end gap-2 h-32">
                    {data.monthlySignups?.map((m: any, i: number) => {
                      const max = Math.max(...data.monthlySignups.map((d: any) => d[chart.key]), 1)
                      return (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <span className="text-xs text-gray-500 mb-1">{m[chart.key]}</span>
                          <div className="w-full rounded-t-md" style={{ height: `${(m[chart.key]/max)*100}%`, backgroundColor: chart.color, minHeight: m[chart.key] > 0 ? '4px' : '0' }} />
                          <span className="text-xs text-gray-400 mt-1">{m.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Platform Health Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Registered Users', value: data.totalUsers, icon: '👥', color: 'text-blue-600' },
                  { label: 'Business Owners', value: data.totalOwners, icon: '🏢', color: 'text-purple-600' },
                  { label: 'Client Accounts', value: data.totalClients, icon: '👤', color: 'text-green-600' },
                  { label: 'Active Businesses', value: data.businesses?.filter((b: any) => b.isActive).length || 0, icon: '✅', color: 'text-green-600' },
                  { label: 'Services Listed', value: data.totalServices, icon: '⚙️', color: 'text-amber-600' },
                  { label: 'Approval Rate', value: `${successRate}%`, icon: '🎯', color: 'text-blue-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-1">{s.icon}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}