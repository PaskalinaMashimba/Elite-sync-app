import { useEffect, useState } from 'react'
import BusinessProfile from './BusinessProfile'

const API = 'https://elitesync-backend.onrender.com/api'

const CATEGORIES = [
  { name: 'All Services', icon: '🌟' },
  { name: 'Fitness & Sports', icon: '🏋️' },
  { name: 'Beauty & Wellness', icon: '💆' },
  { name: 'Education & Tutoring', icon: '📚' },
  { name: 'Modeling & Creative', icon: '🎨' },
  { name: 'Health & Medical', icon: '🏥' },
  { name: 'Consulting & Business', icon: '💼' },
  { name: 'Other', icon: '✨' },
]

export default function Dashboard({ user, token, onLogout, onBook, onProfile }: any) {
  const [services, setServices] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [activePage, setActivePage] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('All Services')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/services`).then(r => r.json()),
      fetch(`${API}/bookings/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([svcs, bkgs]) => {
      if (Array.isArray(svcs)) setServices(svcs)
      if (Array.isArray(bkgs)) setBookings(bkgs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  if (selectedBusiness) return (
    <BusinessProfile
      businessId={selectedBusiness}
      token={token}
      onBack={() => setSelectedBusiness(null)}
      onBook={onBook}
    />
  )

  const filteredServices = services.filter(s => {
    const matchCat = selectedCategory === 'All Services' || s.business?.category === selectedCategory
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.business?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const statusColor: any = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── SIDEBAR ── */}
      <div className="w-64 bg-blue-950 flex flex-col py-6 px-4 fixed h-full overflow-y-auto">
        <div className="bg-blue-900 rounded-xl px-3 py-3 mb-2">
          <span className="text-white font-bold text-xl">EliteSync</span>
        </div>
        <p className="text-blue-400 text-xs px-1 mb-5">Client Portal</p>

        {/* Navigation */}
        <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest px-1 mb-2">Navigation</p>
        {[
          { key: 'home', label: 'Home', icon: '🏠' },
          { key: 'services', label: 'Browse Services', icon: '🔍' },
          { key: 'bookings', label: 'My Bookings', icon: '📅' },
        ].map(item => (
          <button key={item.key} onClick={() => setActivePage(item.key)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 text-sm text-left transition ${activePage === item.key ? 'bg-blue-600 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-blue-900'}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Search */}
        <div className="mt-5 mb-4">
          <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest px-1 mb-2">Quick Search</p>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setActivePage('services') }}
              placeholder="Search services..."
              className="w-full bg-blue-900 text-white placeholder-blue-400 text-sm rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-800"
            />
          </div>
        </div>

        {/* Categories */}
        <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest px-1 mb-2">Categories</p>
        {CATEGORIES.map(cat => (
          <button key={cat.name}
            onClick={() => { setSelectedCategory(cat.name); setActivePage('services') }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 text-sm text-left transition ${selectedCategory === cat.name && activePage === 'services' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-blue-900'}`}>
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}

        {/* Bottom actions */}
        <div className="mt-auto pt-4 border-t border-blue-900">
          <div className="flex items-center gap-2 mb-3 px-1">
            {user?.imageUrl ? (
              <img src={user.imageUrl} className="w-8 h-8 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
              <p className="text-blue-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={onProfile} className="w-full text-left flex items-center gap-2 px-3 py-2 text-gray-400 text-sm hover:text-white hover:bg-blue-900 rounded-lg transition mb-1">
            <span>👤</span><span>My Profile</span>
          </button>
          <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 text-sm hover:text-red-300 hover:bg-blue-900 rounded-lg transition">
            <span>🚪</span><span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 ml-64 p-8">

        {/* ── HOME PAGE ── */}
        {activePage === 'home' && (
          <div>
            {/* Welcome header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-full opacity-10 text-9xl flex items-center justify-center">📅</div>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
              <p className="text-blue-200 mb-6">Find and book services from top professionals near you.</p>
              <div className="flex gap-3">
                <button onClick={() => setActivePage('services')}
                  className="bg-white text-blue-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">
                  🔍 Browse Services
                </button>
                <button onClick={onBook}
                  className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-500 transition text-sm border border-blue-500">
                  + Quick Book
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'My Bookings', value: bookings.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📅' },
                { label: 'Available Services', value: services.length, color: 'text-green-600', bg: 'bg-green-50', icon: '⚙️' },
                { label: 'Pending Approvals', value: bookings.filter((b: any) => b.status === 'PENDING').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: '⏳' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{stat.icon}</div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Browse by category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Browse by Category</h2>
              <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.filter(c => c.name !== 'All Services').map(cat => {
                  const count = services.filter(s => s.business?.category === cat.name).length
                  return (
                    <button key={cat.name}
                      onClick={() => { setSelectedCategory(cat.name); setActivePage('services') }}
                      className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-transparent rounded-xl transition group">
                      <span className="text-3xl mb-2">{cat.icon}</span>
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 text-center leading-tight">{cat.name}</span>
                      <span className="text-xs text-gray-400 mt-1">{count} service{count !== 1 ? 's' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Featured services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800 text-lg">Featured Services</h2>
                <button onClick={() => setActivePage('services')} className="text-blue-600 text-sm hover:underline">View all →</button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {services.slice(0, 6).map((s: any) => (
                    <div key={s.id}
                      onClick={() => setSelectedBusiness(s.businessId || s.business?.id)}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition cursor-pointer group">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} className="w-full h-24 object-cover group-hover:opacity-90 transition" alt={s.name} />
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-3xl">⚙️</div>
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{s.name}</h3>
                        {s.staffName && <p className="text-blue-500 text-xs mt-0.5">👤 {s.staffName}</p>}
                        <p className="text-gray-500 text-xs mt-1">{s.business?.name}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-blue-600 font-bold text-sm">{s.price} PLN</span>
                          <span className="text-gray-400 text-xs">{s.durationMin} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BROWSE SERVICES PAGE ── */}
        {activePage === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedCategory === 'All Services' ? 'All Services' : selectedCategory}
                </h1>
                <p className="text-gray-500 text-sm">{filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available</p>
              </div>
              {/* Search bar on page */}
              <div className="relative w-72">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, business..."
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">✕</button>
                )}
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-gray-700 mb-1">No services found</p>
                <p className="text-gray-400 text-sm">Try a different category or search term</p>
                <button onClick={() => { setSelectedCategory('All Services'); setSearchQuery('') }}
                  className="mt-4 text-blue-600 text-sm hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {filteredServices.map((s: any) => (
                  <div key={s.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition cursor-pointer group">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} className="w-full h-36 object-cover group-hover:opacity-90 transition" alt={s.name} />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-5xl">⚙️</div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight flex-1">{s.name}</h3>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">{s.durationMin}m</span>
                      </div>
                      {s.staffName && <p className="text-blue-500 text-xs mb-1">👤 {s.staffName}</p>}
                      {s.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{s.description}</p>}
                      <p className="text-gray-400 text-xs mb-3">{s.business?.name} • {s.business?.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-bold">{s.price} PLN</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedBusiness(s.businessId || s.business?.id)}
                            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-blue-300 hover:text-blue-600 transition">
                            View
                          </button>
                          <button
                            onClick={() => onBook(s)}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MY BOOKINGS PAGE ── */}
        {activePage === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
                <p className="text-gray-500 text-sm">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={onBook} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                + New Booking
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
              {['All', 'PENDING', 'APPROVED', 'CANCELLED'].map(status => {
                const count = status === 'All' ? bookings.length : bookings.filter((b: any) => b.status === status).length
                return (
                  <button key={status}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition">
                    {status} ({count})
                  </button>
                )
              })}
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <p className="text-6xl mb-4">📅</p>
                <p className="font-semibold text-gray-700 text-lg mb-2">No bookings yet</p>
                <p className="text-gray-400 text-sm mb-6">Browse services and book your first session</p>
                <button onClick={() => setActivePage('services')}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
                  Browse Services →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:border-blue-200 transition">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📅</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">{b.service?.name}</h3>
                      <p className="text-gray-500 text-sm">{b.service?.business?.name}</p>
                      {b.service?.staffName && <p className="text-blue-500 text-xs">👤 {b.service.staffName}</p>}
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className="font-semibold text-gray-800 text-sm">{new Date(b.bookingDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</p>
                      <p className="text-gray-500 text-xs">{new Date(b.startTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                    </div>
                    <button onClick={() => setSelectedBusiness(b.service?.businessId || b.service?.business?.id)}
                      className="text-blue-600 text-xs hover:underline flex-shrink-0">
                      View Business →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}