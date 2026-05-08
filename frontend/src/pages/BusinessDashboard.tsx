import { useState, useEffect } from 'react'
import Analytics from './Analytics'
import CalendarControl from './CalendarControl'
import Payments from './Payments'

const API = 'https://elitesync-backend.onrender.com/api'

export default function BusinessDashboard({ user, token, onLogout }: any) {
  const [tab, setTab] = useState('overview')
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [msg, setMsg] = useState('')

  const [bizForm, setBizForm] = useState({ name: '', description: '', category: '' })
  const [svcForm, setSvcForm] = useState({ name: '', description: '', durationMin: '', price: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const r1 = await fetch(`${API}/businesses/mine`, { headers: { Authorization: `Bearer ${token}` } })
      if (r1.ok) {
        const biz = await r1.json()
        setBusiness(biz)
        setBizForm({ name: biz.name, description: biz.description || '', category: biz.category })
        const r2 = await fetch(`${API}/services?businessId=${biz.id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (r2.ok) setServices(await r2.json())
        const r3 = await fetch(`${API}/bookings/business`, { headers: { Authorization: `Bearer ${token}` } })
        if (r3.ok) setBookings(await r3.json())
      }
    } catch (e) {}
  }

  const createBusiness = async (e: any) => {
    e.preventDefault(); setMsg('')
    try {
      const res = await fetch(`${API}/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bizForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBusiness(data); setMsg('Business profile created! ✓')
    } catch (err: any) { setMsg(err.message) }
  }

  const updateBusiness = async (e: any) => {
    e.preventDefault(); setMsg('')
    try {
      const res = await fetch(`${API}/businesses/${business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bizForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBusiness(data); setMsg('Profile updated! ✓')
    } catch (err: any) { setMsg(err.message) }
  }

  const addService = async (e: any) => {
    e.preventDefault(); setMsg('')
    try {
      const res = await fetch(`${API}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...svcForm,
          durationMin: parseInt(svcForm.durationMin),
          price: parseFloat(svcForm.price),
          businessId: business.id
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setServices((prev: any) => [...prev, data])
      setSvcForm({ name: '', description: '', durationMin: '', price: '' })
      setMsg('Service added! ✓')
    } catch (err: any) { setMsg(err.message) }
  }

  const deleteService = async (id: string) => {
    await fetch(`${API}/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setServices((prev: any) => prev.filter((s: any) => s.id !== id))
  }

  const updateBookingStatus = async (id: string, status: string) => {
    const res = await fetch(`${API}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    if (res.ok) setBookings((prev: any) => prev.map((b: any) => b.id === id ? { ...b, status } : b))
  }

  const statusColor: any = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-blue-950 flex flex-col py-6 px-4">
        <div className="bg-blue-900 rounded-lg px-3 py-2 mb-1">
          <span className="text-white font-bold text-lg">EliteSync</span>
        </div>
        <p className="text-blue-400 text-xs px-1 mb-6">Business Portal</p>

        {[
          { key: 'overview',  label: '📊 Overview' },
          { key: 'profile',   label: '🏢 My Business' },
          { key: 'services',  label: '⚙️ Services' },
          { key: 'bookings',  label: '📅 Bookings' },
          { key: 'analytics', label: '📈 Analytics' },
          { key: 'calendar',  label: '🗓️ Calendar' },
          { key: 'payments',  label: '💰 Payments' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg mb-1 text-sm text-left transition ${tab === t.key ? 'bg-blue-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}

        <div className="mt-auto">
          <p className="text-gray-500 text-xs px-1 mb-2 truncate">{user?.fullName}</p>
          <button onClick={onLogout} className="w-full text-left px-3 py-2 text-red-400 text-sm hover:text-red-300">Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Business Dashboard</h1>
            <p className="text-gray-500 text-sm mb-6">Welcome back, {user?.fullName}</p>
            {!business ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-2xl mb-2">🏢</p>
                <p className="font-semibold text-gray-800 mb-1">No business profile yet</p>
                <p className="text-gray-500 text-sm mb-4">Create your business profile first to start adding services and accepting bookings.</p>
                <button onClick={() => setTab('profile')} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Create Business Profile →
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Bookings', value: bookings.length, color: 'text-blue-600' },
                    { label: 'Active Services', value: services.filter((s: any) => s.isActive).length, color: 'text-green-600' },
                    { label: 'Pending Approvals', value: bookings.filter((b: any) => (b as any).status === 'PENDING').length, color: 'text-yellow-600' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Pending Bookings — Action Required</h2>
                  {bookings.filter((b: any) => b.status === 'PENDING').length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No pending bookings.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.filter((b: any) => b.status === 'PENDING').map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{b.user?.fullName}</p>
                            <p className="text-gray-500 text-xs">{b.service?.name} — {new Date(b.bookingDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-700">Approve</button>
                            <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{business ? 'Edit Business Profile' : 'Create Business Profile'}</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-xl">
              <form onSubmit={business ? updateBusiness : createBusiness} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input value={bizForm.name} onChange={e => setBizForm({ ...bizForm, name: e.target.value })} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Elite Boxing Academy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={bizForm.category} onChange={e => setBizForm({ ...bizForm, category: e.target.value })} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select a category</option>
                    {['Fitness & Sports','Beauty & Wellness','Education & Tutoring','Modeling & Creative','Health & Medical','Consulting & Business','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={bizForm.description} onChange={e => setBizForm({ ...bizForm, description: e.target.value })} rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell clients what you offer..." />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
                  {business ? 'Save Changes' : 'Create Business Profile'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SERVICES */}
        {tab === 'services' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Services</h1>
            {!business ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                Create a business profile first.
                <button onClick={() => setTab('profile')} className="ml-2 underline font-semibold">Create profile →</button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 max-w-xl">
                  <h2 className="font-semibold text-gray-800 mb-4">Add New Service</h2>
                  <form onSubmit={addService} className="space-y-3">
                    <input value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Service name (e.g. Boxing Training)" />
                    <input value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Short description (optional)" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" value={svcForm.durationMin} onChange={e => setSvcForm({ ...svcForm, durationMin: e.target.value })} required min="1"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Duration (minutes)" />
                      <input type="number" value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} required min="0" step="0.01"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price (PLN)" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">
                      + Add Service
                    </button>
                  </form>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {services.length === 0 ? (
                    <p className="text-gray-400 text-sm col-span-2 text-center py-8">No services yet.</p>
                  ) : services.map((s: any) => (
                    <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{s.name}</h3>
                          {s.description && <p className="text-gray-500 text-xs mt-1">{s.description}</p>}
                          <div className="flex gap-3 mt-2">
                            <span className="text-blue-600 font-bold text-sm">{s.price} PLN</span>
                            <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded">{s.durationMin} min</span>
                          </div>
                        </div>
                        <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {bookings.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <p className="text-4xl mb-3">📅</p>
                  <p>No bookings yet.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Client', 'Service', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{b.user?.fullName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.service?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {b.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">✓</button>
                              <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">✗</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* NEW TABS */}
        {tab === 'analytics' && <Analytics token={token} onBack={() => setTab('overview')} />}
        {tab === 'calendar' && <CalendarControl token={token} businessId={business?.id} onBack={() => setTab('overview')} />}
        {tab === 'payments' && <Payments token={token} onBack={() => setTab('overview')} />}
      </div>
    </div>
  )
}