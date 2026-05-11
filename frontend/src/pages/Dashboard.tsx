import { useEffect, useState } from 'react'
import BusinessProfile from './BusinessProfile'

const API = 'https://elitesync-backend.onrender.com/api'

export default function Dashboard({ user, token, onLogout, onBook, onProfile }: any) {
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API}/bookings/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setBookings(data) }).catch(() => {})
    fetch(`${API}/services`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setServices(data) }).catch(() => {})
  }, [token])

  // Show business profile page
  if (selectedBusiness) return (
    <BusinessProfile
      businessId={selectedBusiness}
      token={token}
      onBack={() => setSelectedBusiness(null)}
      onBook={onBook}
    />
  )

  const statusColor: any = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-52 bg-blue-950 flex flex-col py-6 px-4">
        <div className="bg-blue-900 rounded-lg px-3 py-2 mb-8">
          <span className="text-white font-bold text-lg">EliteSync</span>
        </div>
        {['Dashboard', 'Bookings', 'Services'].map((item, i) => (
          <div key={item} className={`px-3 py-2 rounded-lg mb-1 text-sm cursor-pointer ${i === 0 ? 'bg-blue-700 text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>
            {item}
          </div>
        ))}
        <div className="mt-auto space-y-1">
          <button onClick={onProfile} className="w-full text-left px-3 py-2 text-gray-400 text-sm hover:text-white">
            👤 My Profile
          </button>
          <button onClick={onLogout} className="w-full text-left px-3 py-2 text-red-400 text-sm hover:text-red-300">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {user?.imageUrl ? (
              <img src={user.imageUrl} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 text-sm">Welcome back, {user?.fullName}</p>
            </div>
          </div>
          <button onClick={onBook} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            + New Booking
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'My Bookings', value: bookings.length, color: 'text-blue-600' },
            { label: 'Available Services', value: services.length, color: 'text-green-600' },
            { label: 'Pending', value: bookings.filter((b: any) => b.status === 'PENDING').length, color: 'text-yellow-600' }
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* My Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">My Bookings</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📅</p>
              <p>No bookings yet. Click "New Booking" to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Service', 'Business', 'Date', 'Time', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{b.service?.name}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedBusiness(b.service?.businessId)}
                        className="text-blue-600 hover:underline text-sm">
                        {b.service?.business?.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Available Services Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Available Services</h2>
          {services.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No services available yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {services.map((s: any) => (
                <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedBusiness(s.businessId)}>
                  {s.imageUrl && (
                    <img src={s.imageUrl} className="w-full h-28 object-cover" alt={s.name} />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm">{s.name}</h3>
                    {s.staffName && <p className="text-blue-500 text-xs mt-0.5">👤 {s.staffName}</p>}
                    <p className="text-gray-500 text-xs mt-1 hover:text-blue-600 transition">{s.business?.name} →</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-blue-600 font-bold text-sm">{s.price} PLN</span>
                      <span className="text-gray-400 text-xs">{s.durationMin} min</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); onBook(); }}
                      className="w-full mt-3 bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}