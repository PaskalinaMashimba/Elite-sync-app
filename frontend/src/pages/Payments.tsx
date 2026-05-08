import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function Payments({ token, onBack }: any) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API}/bookings/business`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBookings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const markPaid = async (id: string, amount: number) => {
    setMsg('')
    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus: 'paid', paymentAmount: amount })
      })
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'paid', paymentAmount: amount } : b))
        setMsg('Payment recorded! ✓')
      }
    } catch (e) { setMsg('Error updating payment') }
  }

  const filtered = bookings.filter(b => {
    if (filter === 'all') return b.status === 'APPROVED'
    if (filter === 'unpaid') return b.status === 'APPROVED' && b.paymentStatus !== 'paid'
    if (filter === 'paid') return b.paymentStatus === 'paid'
    return true
  })

  const totalEarned = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.paymentAmount || b.service?.price || 0), 0)
  const totalPending = bookings.filter(b => b.status === 'APPROVED' && b.paymentStatus !== 'paid').reduce((s, b) => s + (b.service?.price || 0), 0)
  const totalExpected = bookings.filter(b => b.status === 'APPROVED').reduce((s, b) => s + (b.service?.price || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm mb-1">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">Payment Tracking</h1>
          <p className="text-gray-500 text-sm">Track payments for all approved bookings</p>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Earned', value: `${Math.round(totalEarned)} PLN`, sub: 'Paid invoices', color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
            { label: 'Awaiting Payment', value: `${Math.round(totalPending)} PLN`, sub: 'Approved, not yet paid', color: 'text-amber-600', bg: 'bg-amber-50', icon: '⏳' },
            { label: 'Total Expected', value: `${Math.round(totalExpected)} PLN`, sub: 'All approved sessions', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
              <p className="text-gray-500 text-xs">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              <p className="text-gray-400 text-xs mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Collection rate bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Collection Rate</span>
            <span className="text-gray-500">{totalExpected > 0 ? Math.round((totalEarned / totalExpected) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${totalExpected > 0 ? (totalEarned / totalExpected) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{Math.round(totalEarned)} PLN collected</span>
            <span>{Math.round(totalExpected)} PLN total</span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['all', 'unpaid', 'paid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
              {f === 'all' ? 'All Approved' : f === 'unpaid' ? '⏳ Unpaid' : '✅ Paid'}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p className="text-3xl mb-3">💳</p>
              <p>No payments in this category.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Client', 'Service', 'Date', 'Amount', 'Payment', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{b.user?.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{b.service?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{b.service?.price} PLN</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {b.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.paymentStatus !== 'paid' && (
                        <button onClick={() => markPaid(b.id, b.service?.price || 0)}
                          className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}