import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

function BarChart({ data, valueKey, color }: any) {
  const max = Math.max(...data.map((d: any) => d[valueKey]), 1)
  return (
    <div className="flex items-end gap-2 h-32 mt-2">
      {data.map((d: any, i: number) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-500 mb-1">{d[valueKey]}</span>
          <div className="w-full rounded-t-md transition-all" style={{ height: `${(d[valueKey] / max) * 100}%`, backgroundColor: color, minHeight: d[valueKey] > 0 ? '4px' : '0' }} />
          <span className="text-xs text-gray-400 mt-1">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: any) {
  const total = data.reduce((s: number, d: any) => s + d.value, 0)
  const colors = ['#2563EB', '#16A34A', '#DC2626', '#D97706']
  let cumulative = 0
  const segments = data.map((d: any, i: number) => {
    const pct = total > 0 ? (d.value / total) * 100 : 0
    const start = cumulative
    cumulative += pct
    return { ...d, pct, start, color: colors[i] }
  })

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3" />
          {segments.map((s: any, i: number) => (
            <circle key={i} cx="18" cy="18" r="15.9" fill="none"
              stroke={s.color} strokeWidth="3"
              strokeDasharray={`${s.pct} ${100 - s.pct}`}
              strokeDashoffset={-(s.start)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-gray-600">{s.label}</span>
            <span className="text-sm font-semibold text-gray-800 ml-auto pl-4">{s.value}</span>
            <span className="text-xs text-gray-400">({Math.round(s.pct)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Analytics({ token, onBack }: any) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'bookings' | 'revenue'>('bookings')

  useEffect(() => {
    fetch(`${API}/analytics/business`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading analytics...</p>
      </div>
    </div>
  )

  if (!data || data.error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">No analytics data yet. Create a business profile and start accepting bookings.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline text-sm">← Back to Dashboard</button>
      </div>
    </div>
  )

  const statusData = [
    { label: 'Pending', value: data.byStatus.find((s: any) => s.status === 'PENDING')?._count?.status || 0 },
    { label: 'Approved', value: data.byStatus.find((s: any) => s.status === 'APPROVED')?._count?.status || 0 },
    { label: 'Cancelled', value: data.byStatus.find((s: any) => s.status === 'CANCELLED')?._count?.status || 0 },
  ]

  const approvalRate = data.totalBookings > 0
    ? Math.round((statusData[1].value / data.totalBookings) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm mb-1">← Back</button>
            <h1 className="text-2xl font-bold text-gray-800">Analytics & Insights</h1>
            <p className="text-gray-500 text-sm">Track your business performance</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: data.totalBookings, sub: 'All time', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📅' },
            { label: 'This Month', value: data.thisMonthBookings, sub: 'Bookings', color: 'text-green-600', bg: 'bg-green-50', icon: '📆' },
            { label: 'Total Revenue', value: `${data.totalRevenue} PLN`, sub: 'Approved only', color: 'text-purple-600', bg: 'bg-purple-50', icon: '💰' },
            { label: 'Approval Rate', value: `${approvalRate}%`, sub: 'Of all bookings', color: 'text-amber-600', bg: 'bg-amber-50', icon: '✅' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{card.icon}</div>
              <p className="text-gray-500 text-xs">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-gray-400 text-xs mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Monthly Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Last 6 Months</h2>
              <div className="flex gap-2">
                <button onClick={() => setView('bookings')}
                  className={`text-xs px-3 py-1 rounded-full transition ${view === 'bookings' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  Bookings
                </button>
                <button onClick={() => setView('revenue')}
                  className={`text-xs px-3 py-1 rounded-full transition ${view === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  Revenue
                </button>
              </div>
            </div>
            <BarChart
              data={data.monthlyData}
              valueKey={view === 'bookings' ? 'bookings' : 'revenue'}
              color={view === 'bookings' ? '#2563EB' : '#7C3AED'}
            />
          </div>

          {/* Booking Status Donut */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Bookings by Status</h2>
            <DonutChart data={statusData} />
            {/* Progress bars */}
            <div className="mt-6 space-y-3">
              {statusData.map((s, i) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500']
                const pct = data.totalBookings > 0 ? Math.round((s.value / data.totalBookings) * 100) : 0
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{s.label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[i]} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Most Booked Services</h2>
          {data.topServices.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topServices.map((s: any, i: number) => {
                const max = data.topServices[0]?.count || 1
                const pct = Math.round((s.count / max) * 100)
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{s.name}</span>
                        <span className="text-gray-500">{s.count} bookings</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}