import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

function Bar({ data, k1, k2, c1, c2 }: any) {
  const max = Math.max(...data.map((d: any) => Math.max(d[k1] || 0, d[k2] || 0)), 1)
  return (
    <div className="flex items-end gap-1 h-28 mt-2">
      {data.map((d: any, i: number) => (
        <div key={i} className="flex items-end gap-0.5 flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className="w-full rounded-t" style={{ height: `${(d[k1]/max)*100}%`, backgroundColor: c1, minHeight: d[k1]>0?'3px':'0' }} />
          </div>
          {k2 && (
            <div className="flex flex-col items-center flex-1">
              <div className="w-full rounded-t" style={{ height: `${(d[k2]/max)*100}%`, backgroundColor: c2, minHeight: d[k2]>0?'3px':'0' }} />
            </div>
          )}
          <div className="w-full text-center" style={{ position: 'absolute' }}></div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard({ user, token, onLogout }: any) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const toggleUser = async (id: string) => {
    const res = await fetch(`${API}/admin/users/${id}/toggle`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const updated = await res.json()
      setData((prev: any) => ({
        ...prev,
        recentUsers: prev.recentUsers.map((u: any) => u.id === id ? { ...u, isActive: updated.isActive } : u)
      }))
      setMsg('User status updated! ✓')
    }
  }

  const toggleBusiness = async (id: string) => {
    const res = await fetch(`${API}/admin/businesses/${id}/toggle`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const updated = await res.json()
      setData((prev: any) => ({
        ...prev,
        businesses: prev.businesses.map((b: any) => b.id === id ? { ...b, isActive: updated.isActive } : b)
      }))
      setMsg('Business status updated! ✓')
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
      {/* Sidebar */}
      <div className="w-56 bg-slate-900 flex flex-col py-6 px-4">
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
      <div className="flex-1 p-8 overflow-y-auto">
        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">{msg}</div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && data && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Platform Overview</h1>
            <p className="text-gray-500 text-sm mb-6">All EliteSync platform statistics</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Users', value: data.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
                { label: 'Business Owners', value: data.totalOwners, color: 'text-purple-600', bg: 'bg-purple-50', icon: '🏢' },
                { label: 'Total Bookings', value: data.totalBookings, color: 'text-green-600', bg: 'bg-green-50', icon: '📅' },
                { label: 'App Success Rate', value: `${successRate}%`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '🎯' },
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
                { label: 'Active Businesses', value: data.businesses?.filter((b: any) => b.isActive).length, color: 'text-green-600' },
                { label: 'Total Services Listed', value: data.totalServices, color: 'text-purple-600' },
                { label: 'Pending Bookings', value: data.pendingBookings, color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{s.label}</span>
                  <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Success metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">App Success Metrics</h2>
              {[
                { label: 'Booking Approval Rate', value: successRate, color: 'bg-green-500' },
                { label: 'Platform Utilisation (Businesses with Bookings)', value: data.totalBusinesses > 0 ? Math.min(100, Math.round((data.totalBookings / (data.totalBusinesses * 10)) * 100)) : 0, color: 'bg-blue-500' },
                { label: 'Service Coverage (Services per Business)', value: data.totalBusinesses > 0 ? Math.min(100, Math.round((data.totalServices / data.totalBusinesses) * 20)) : 0, color: 'bg-purple-500' },
              ].map(m => (
                <div key={m.label} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{m.label}</span>
                    <span className="font-semibold text-gray-800">{m.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${m.color} transition-all`} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUSINESSES */}
        {tab === 'businesses' && data && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Businesses ({data.businesses?.length})</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {data.businesses?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No businesses registered yet.</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Business', 'Owner', 'Category', 'Services', 'Status', 'Action'].map(h => (
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
                            {b.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleBusiness(b.id)}
                            className={`text-xs px-3 py-1 rounded-lg transition ${b.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {b.isActive ? 'Suspend' : 'Reactivate'}
                          </button>
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Recent Users ({data.totalUsers} total)</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
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
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'SUPER_ADMIN' && (
                          <button onClick={() => toggleUser(u.id)}
                            className={`text-xs px-3 py-1 rounded-lg ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-1">New Users Per Month</h2>
                <p className="text-gray-400 text-xs mb-4">How many people joined EliteSync each month</p>
                <div className="flex items-end gap-2 h-32">
                  {data.monthlySignups?.map((m: any, i: number) => {
                    const max = Math.max(...data.monthlySignups.map((d: any) => d.users), 1)
                    return (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <span className="text-xs text-gray-500 mb-1">{m.users}</span>
                        <div className="w-full rounded-t-md bg-blue-500" style={{ height: `${(m.users/max)*100}%`, minHeight: m.users > 0 ? '4px' : '0' }} />
                        <span className="text-xs text-gray-400 mt-1">{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-1">Bookings Per Month</h2>
                <p className="text-gray-400 text-xs mb-4">Total bookings made across all businesses</p>
                <div className="flex items-end gap-2 h-32">
                  {data.monthlySignups?.map((m: any, i: number) => {
                    const max = Math.max(...data.monthlySignups.map((d: any) => d.bookings), 1)
                    return (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <span className="text-xs text-gray-500 mb-1">{m.bookings}</span>
                        <div className="w-full rounded-t-md bg-green-500" style={{ height: `${(m.bookings/max)*100}%`, minHeight: m.bookings > 0 ? '4px' : '0' }} />
                        <span className="text-xs text-gray-400 mt-1">{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Platform health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Platform Health Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Registered Users', value: data.totalUsers, icon: '👥', color: 'text-blue-600' },
                  { label: 'Business Owners', value: data.totalOwners, icon: '🏢', color: 'text-purple-600' },
                  { label: 'Client Accounts', value: data.totalClients, icon: '👤', color: 'text-green-600' },
                  { label: 'Active Businesses', value: data.businesses?.filter((b: any) => b.isActive).length, icon: '✅', color: 'text-green-600' },
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