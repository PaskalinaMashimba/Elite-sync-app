import { useState, useEffect } from 'react'
import Analytics from './Analytics'
import CalendarControl from './CalendarControl'
import Payments from './Payments'
import ImageUpload from '../components/ImageUpload'

const API = 'https://elitesync-backend.onrender.com/api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function BusinessDashboard({ user, token, onLogout, onProfile }: any) {
  const [tab, setTab] = useState('overview')
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [msg, setMsg] = useState('')

  const [bizForm, setBizForm] = useState({
    name: '', description: '', category: '',
    phone: '', email: '', website: '', address: '', imageUrl: '',
    facebook: '', instagram: '', twitter: '', whatsapp: ''
  })

  const [svcForm, setSvcForm] = useState({
    name: '', description: '', durationMin: '', price: '',
    imageUrl: '', staffName: '',
    availableFrom: '09:00', availableTo: '17:00',
    availableDays: '1,2,3,4,5'
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const r1 = await fetch(`${API}/businesses/mine`, { headers: { Authorization: `Bearer ${token}` } })
      if (r1.ok) {
        const biz = await r1.json()
        setBusiness(biz)
        setBizForm({
          name: biz.name || '', description: biz.description || '',
          category: biz.category || '', phone: biz.phone || '',
          email: biz.email || '', website: biz.website || '',
          address: biz.address || '', imageUrl: biz.imageUrl || '',
          facebook: biz.facebook || '', instagram: biz.instagram || '',
          twitter: biz.twitter || '', whatsapp: biz.whatsapp || ''
        })
        const r2 = await fetch(`${API}/services?businessId=${biz.id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (r2.ok) setServices(await r2.json())
        const r3 = await fetch(`${API}/bookings/business`, { headers: { Authorization: `Bearer ${token}` } })
        if (r3.ok) setBookings(await r3.json())
      }
    } catch (e) {}
  }

  const saveBusiness = async (e: any) => {
    e.preventDefault(); setMsg('')
    try {
      const url = business ? `${API}/businesses/${business.id}` : `${API}/businesses`
      const method = business ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bizForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBusiness(data); setMsg('Business profile saved! ✓')
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
      setSvcForm({ name: '', description: '', durationMin: '', price: '', imageUrl: '', staffName: '', availableFrom: '09:00', availableTo: '17:00', availableDays: '1,2,3,4,5' })
      setMsg('Service added! ✓')
    } catch (err: any) { setMsg(err.message) }
  }

  const removeService = async (id: string) => {
    await fetch(`${API}/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setServices((prev: any) => prev.filter((s: any) => s.id !== id))
    setMsg('Service removed ✓')
  }

  const updateStatus = async (id: string, status: string) => {
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

  const CATEGORIES = ['Fitness & Sports','Beauty & Wellness','Education & Tutoring','Modeling & Creative','Health & Medical','Consulting & Business','Other']

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-blue-950 flex flex-col py-6 px-4 fixed h-full overflow-y-auto">
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
          <button onClick={() => onProfile && onProfile()} className="w-full text-left px-3 py-2 text-gray-400 text-sm hover:text-white mb-1">👤 My Profile</button>
          <p className="text-gray-500 text-xs px-1 mb-1 truncate">{user?.fullName}</p>
          <button onClick={onLogout} className="w-full text-left px-3 py-2 text-red-400 text-sm hover:text-red-300">Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-56 p-8 overflow-y-auto">
        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Business Dashboard</h1>
            <p className="text-gray-500 text-sm mb-6">Welcome back, {user?.fullName}</p>
            {!business ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                <p className="text-3xl mb-3">🏢</p>
                <p className="font-semibold text-gray-800 mb-2">No business profile yet</p>
                <p className="text-gray-500 text-sm mb-4">Create your profile to start accepting bookings</p>
                <button onClick={() => setTab('profile')} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
                  Create Business Profile →
                </button>
              </div>
            ) : (
              <>
                {/* Business card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex gap-4 items-start">
                  {business.imageUrl ? (
                    <img src={business.imageUrl} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt={business.name} />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-800 text-lg">{business.name}</h2>
                    <p className="text-blue-600 text-xs font-medium">{business.category}</p>
                    {business.description && <p className="text-gray-500 text-sm mt-1">{business.description}</p>}
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {business.phone && <a href={`tel:${business.phone}`} className="text-green-600 text-xs hover:underline">📞 {business.phone}</a>}
                      {business.email && <a href={`mailto:${business.email}`} className="text-blue-600 text-xs hover:underline">✉️ {business.email}</a>}
                      {business.website && <a href={business.website} target="_blank" rel="noreferrer" className="text-purple-600 text-xs hover:underline">🔗 Website</a>}
                      {business.address && <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`} target="_blank" rel="noreferrer" className="text-red-500 text-xs hover:underline">📍 {business.address}</a>}
                    </div>
                  </div>
                  <button onClick={() => setTab('profile')} className="text-gray-400 hover:text-gray-600 text-xs border border-gray-200 px-3 py-1.5 rounded-lg">Edit</button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
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

                {/* Pending bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Pending Bookings — Action Required</h2>
                  {bookings.filter((b: any) => b.status === 'PENDING').length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No pending bookings.</p>
                  ) : bookings.filter((b: any) => b.status === 'PENDING').map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100 mb-2">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{b.user?.fullName}</p>
                        <p className="text-gray-500 text-xs">{b.service?.name} — {new Date(b.bookingDate).toLocaleDateString()} at {new Date(b.startTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
                        {b.notes && <p className="text-gray-400 text-xs italic">"{b.notes}"</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(b.id, 'APPROVED')} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">✓ Approve</button>
                        <button onClick={() => updateStatus(b.id, 'CANCELLED')} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600">✗ Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* BUSINESS PROFILE */}
        {tab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{business ? 'Edit Business Profile' : 'Create Business Profile'}</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">

              {/* Business photo upload */}
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <ImageUpload
                    currentUrl={bizForm.imageUrl}
                    onUpload={url => setBizForm({ ...bizForm, imageUrl: url })}
                    size="lg"
                    shape="square"
                    label="Upload Business Photo"
                  />
                  <p className="text-gray-500 text-xs mt-2">Business logo or cover photo</p>
                </div>
              </div>

              <form onSubmit={saveBusiness} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                    <input value={bizForm.name} onChange={e => setBizForm({ ...bizForm, name: e.target.value })} required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Elite Boxing Academy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select value={bizForm.category} onChange={e => setBizForm({ ...bizForm, category: e.target.value })} required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input value={bizForm.phone} onChange={e => setBizForm({ ...bizForm, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+48 123 456 789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                    <input type="email" value={bizForm.email} onChange={e => setBizForm({ ...bizForm, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@yourbusiness.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input value={bizForm.website} onChange={e => setBizForm({ ...bizForm, website: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourwebsite.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (links to Google Maps)</label>
                    <input value={bizForm.address} onChange={e => setBizForm({ ...bizForm, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ul. Przykładowa 12, Kielce, Poland" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={bizForm.description} onChange={e => setBizForm({ ...bizForm, description: e.target.value })} rows={3}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell clients what makes your business special..." />
                  </div>

                  {/* Social media */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Social Media Links</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'facebook', placeholder: 'Facebook page URL', icon: '📘' },
                        { key: 'instagram', placeholder: 'Instagram profile URL', icon: '📷' },
                        { key: 'twitter', placeholder: 'Twitter/X profile URL', icon: '🐦' },
                        { key: 'whatsapp', placeholder: 'WhatsApp number (e.g. +48123456789)', icon: '💬' },
                      ].map(social => (
                        <div key={social.key} className="flex items-center gap-2">
                          <span className="text-lg">{social.icon}</span>
                          <input
                            value={(bizForm as any)[social.key]}
                            onChange={e => setBizForm({ ...bizForm, [social.key]: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={social.placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Add New Service</h2>
                  <form onSubmit={addService} className="space-y-4">

                    {/* Service image upload */}
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <ImageUpload
                          currentUrl={svcForm.imageUrl}
                          onUpload={url => setSvcForm({ ...svcForm, imageUrl: url })}
                          size="md"
                          shape="square"
                          label="Service Photo"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <input value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} required
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Service name (e.g. Boxing Training Session)" />
                        <input value={svcForm.staffName} onChange={e => setSvcForm({ ...svcForm, staffName: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Trainer / Staff name (optional)" />
                        <textarea value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} rows={2}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="What does this service include?" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes) *</label>
                        <input type="number" value={svcForm.durationMin} onChange={e => setSvcForm({ ...svcForm, durationMin: e.target.value })} required min="1"
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price (PLN) *</label>
                        <input type="number" value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} required min="0" step="0.01"
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    {/* Service-specific hours */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">🕐 Service Availability Hours</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Available From</label>
                          <input type="time" value={svcForm.availableFrom} onChange={e => setSvcForm({ ...svcForm, availableFrom: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Available Until</label>
                          <input type="time" value={svcForm.availableTo} onChange={e => setSvcForm({ ...svcForm, availableTo: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Available Days</label>
                        <div className="flex gap-2 flex-wrap">
                          {DAYS.map((day, i) => {
                            const days = svcForm.availableDays.split(',').filter(Boolean)
                            const isSelected = days.includes(String(i))
                            return (
                              <button key={day} type="button"
                                onClick={() => {
                                  const current = svcForm.availableDays.split(',').filter(Boolean)
                                  const updated = isSelected ? current.filter(d => d !== String(i)) : [...current, String(i)]
                                  setSvcForm({ ...svcForm, availableDays: updated.sort().join(',') })
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                                {day}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700">
                      + Add Service
                    </button>
                  </form>
                </div>

                {/* Services list */}
                <div className="grid grid-cols-2 gap-4">
                  {services.length === 0 ? (
                    <p className="text-gray-400 text-sm col-span-2 text-center py-8">No services yet.</p>
                  ) : services.map((s: any) => (
                    <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {s.imageUrl && <img src={s.imageUrl} className="w-full h-28 object-cover" alt={s.name} />}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{s.name}</h3>
                            {s.staffName && <p className="text-blue-500 text-xs mt-0.5">👤 {s.staffName}</p>}
                            {s.description && <p className="text-gray-500 text-xs mt-1">{s.description}</p>}
                            <div className="flex gap-3 mt-2">
                              <span className="text-blue-600 font-bold text-sm">{s.price} PLN</span>
                              <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded">{s.durationMin} min</span>
                            </div>
                            {(s.availableFrom || s.availableTo) && (
                              <p className="text-green-600 text-xs mt-1">🕐 {s.availableFrom} — {s.availableTo}</p>
                            )}
                          </div>
                          <button onClick={() => removeService(s.id)}
                            className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50 ml-2 flex-shrink-0">
                            Remove
                          </button>
                        </div>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {bookings.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <p className="text-4xl mb-3">📅</p>
                  <p>No bookings yet.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Client', 'Service', 'Staff', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{b.user?.fullName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.service?.name}</td>
                        <td className="px-4 py-3 text-xs text-blue-500">{b.service?.staffName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.startTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {b.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <button onClick={() => updateStatus(b.id, 'APPROVED')} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">✓</button>
                              <button onClick={() => updateStatus(b.id, 'CANCELLED')} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">✗</button>
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

        {tab === 'analytics' && <Analytics token={token} onBack={() => setTab('overview')} />}
        {tab === 'calendar' && <CalendarControl token={token} businessId={business?.id} onBack={() => setTab('overview')} />}
        {tab === 'payments' && <Payments token={token} onBack={() => setTab('overview')} />}
      </div>
    </div>
  )
}