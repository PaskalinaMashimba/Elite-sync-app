import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function BusinessProfile({ businessId, token, onBack, onBook }: any) {
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/businesses/${businessId}`)
      .then(r => r.json())
      .then(data => { setBusiness(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [businessId])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!business) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Business not found.</p>
        <button onClick={onBack} className="text-blue-600 hover:underline">← Back</button>
      </div>
    </div>
  )

  const socialLinks = [
    { key: 'facebook',  icon: '📘', label: 'Facebook',  color: 'text-blue-600' },
    { key: 'instagram', icon: '📷', label: 'Instagram', color: 'text-pink-600' },
    { key: 'twitter',   icon: '🐦', label: 'Twitter',   color: 'text-sky-500' },
    { key: 'whatsapp',  icon: '💬', label: 'WhatsApp',  color: 'text-green-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-900 to-blue-700">
        {business.imageUrl && (
          <img src={business.imageUrl} className="w-full h-full object-cover opacity-30" alt={business.name} />
        )}
        <div className="absolute inset-0 flex items-end px-8 pb-0">
          <div className="flex items-end gap-5 mb-0">
            {business.imageUrl ? (
              <img src={business.imageUrl} className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg translate-y-12" alt={business.name} />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-blue-200 flex items-center justify-center text-4xl shadow-lg translate-y-12">
                🏢
              </div>
            )}
          </div>
        </div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-black bg-opacity-30 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-opacity-50 transition">
          ← Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-8 pt-16 pb-12">
        {/* Business name and category */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{business.name}</h1>
            <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-0.5 rounded-full">
              {business.category}
            </span>
          </div>
          <button onClick={onBook}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm">
            Book Now →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left column — main info */}
          <div className="col-span-2 space-y-6">

            {/* About */}
            {business.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{business.description}</p>
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Services Offered</h2>
              {business.services?.filter((s: any) => s.isActive).length === 0 ? (
                <p className="text-gray-400 text-sm">No services listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {business.services?.filter((s: any) => s.isActive).map((s: any) => (
                    <div key={s.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt={s.name} />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">⚙️</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{s.name}</h3>
                        {s.staffName && <p className="text-blue-500 text-xs">👤 {s.staffName}</p>}
                        {s.description && <p className="text-gray-500 text-sm mt-0.5">{s.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-blue-600">{s.price} PLN</p>
                        <p className="text-gray-400 text-xs">{s.durationMin} min</p>
                      </div>
                      <button onClick={onBook}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 flex-shrink-0">
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — contact info */}
          <div className="space-y-4">

            {/* Contact card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Contact</h2>
              <div className="space-y-3">
                {business.phone && (
                  <a href={`tel:${business.phone}`}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 transition group">
                    <span className="w-8 h-8 bg-green-50 group-hover:bg-green-100 rounded-lg flex items-center justify-center text-base transition">📞</span>
                    <span>{business.phone}</span>
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition group">
                    <span className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center text-base transition">✉️</span>
                    <span className="truncate">{business.email}</span>
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-purple-600 transition group">
                    <span className="w-8 h-8 bg-purple-50 group-hover:bg-purple-100 rounded-lg flex items-center justify-center text-base transition">🔗</span>
                    <span className="truncate">Visit Website</span>
                  </a>
                )}
                {business.address && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-red-500 transition group">
                    <span className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center text-base transition">📍</span>
                    <span>{business.address}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Social media */}
            {socialLinks.some(s => business[s.key]) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-800 mb-4">Follow Us</h2>
                <div className="space-y-2">
                  {socialLinks.filter(s => business[s.key]).map(s => (
                    <a key={s.key} href={business[s.key]} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-3 text-sm ${s.color} hover:underline`}>
                      <span className="text-lg">{s.icon}</span>
                      <span>{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Map embed */}
            {business.address && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                  target="_blank" rel="noreferrer">
                  <div className="bg-blue-50 h-32 flex flex-col items-center justify-center hover:bg-blue-100 transition cursor-pointer p-4 text-center">
                    <span className="text-3xl mb-2">🗺️</span>
                    <p className="text-blue-600 font-medium text-sm">View on Google Maps</p>
                    <p className="text-gray-500 text-xs mt-1">{business.address}</p>
                  </div>
                </a>
              </div>
            )}

            {/* Book CTA */}
            <button onClick={onBook}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-sm">
              📅 Book a Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}