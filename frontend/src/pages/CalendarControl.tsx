import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarControl({ token, businessId, onBack }: any) {
  const [availability, setAvailability] = useState<any[]>(
    DAYS.map((_, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '17:00', isOpen: i >= 1 && i <= 5 }))
  )
  const [blockedDates, setBlockedDates] = useState<any[]>([])
  const [newBlock, setNewBlock] = useState({ date: '', reason: '' })
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'hours' | 'blocked'>('hours')

  useEffect(() => {
    if (!businessId) return
    fetch(`${API}/availability/${businessId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailability(prev => prev.map(d => {
            const found = data.find((a: any) => a.dayOfWeek === d.dayOfWeek)
            return found || d
          }))
        }
      }).catch(() => {})

    fetch(`${API}/availability/${businessId}/blocked`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBlockedDates(data) })
      .catch(() => {})
  }, [businessId])

  const saveDay = async (day: any) => {
    setMsg('')
    try {
      const res = await fetch(`${API}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(day)
      })
      if (res.ok) setMsg('Schedule saved! ✓')
    } catch (e) { setMsg('Error saving') }
  }

  const saveAll = async () => {
    setMsg('')
    for (const day of availability) {
      await fetch(`${API}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(day)
      })
    }
    setMsg('All hours saved! ✓')
  }

  const addBlockedDate = async (e: any) => {
    e.preventDefault()
    setMsg('')
    try {
      const res = await fetch(`${API}/availability/blocked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBlock)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBlockedDates(prev => [...prev, data])
      setNewBlock({ date: '', reason: '' })
      setMsg('Date blocked! ✓')
    } catch (err: any) { setMsg(err.message) }
  }

  const removeBlockedDate = async (id: string) => {
    await fetch(`${API}/availability/blocked/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setBlockedDates(prev => prev.filter(b => b.id !== id))
  }

  const updateDay = (dayOfWeek: number, field: string, value: any) => {
    setAvailability(prev => prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm mb-1">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">Calendar Control</h1>
          <p className="text-gray-500 text-sm">Set your opening hours and block dates when you're unavailable</p>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.includes('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('hours')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'hours' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
            🕐 Opening Hours
          </button>
          <button onClick={() => setTab('blocked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'blocked' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
            🚫 Blocked Dates
          </button>
        </div>

        {/* OPENING HOURS */}
        {tab === 'hours' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-6">Set the days and hours clients can book with you. Toggle off days when you don't work.</p>
            <div className="space-y-3">
              {availability.map(day => (
                <div key={day.dayOfWeek} className={`flex items-center gap-4 p-3 rounded-xl transition ${day.isOpen ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
                  {/* Toggle */}
                  <button onClick={() => updateDay(day.dayOfWeek, 'isOpen', !day.isOpen)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${day.isOpen ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>

                  {/* Day name */}
                  <span className={`w-24 text-sm font-medium ${day.isOpen ? 'text-gray-800' : 'text-gray-400'}`}>
                    {DAYS[day.dayOfWeek]}
                  </span>

                  {day.isOpen ? (
                    <>
                      <input type="time" value={day.startTime}
                        onChange={e => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={day.endTime}
                        onChange={e => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-green-600 text-xs font-medium ml-auto">Open</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm ml-2">Closed</span>
                  )}
                </div>
              ))}
            </div>

            <button onClick={saveAll}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
              Save All Hours
            </button>
          </div>
        )}

        {/* BLOCKED DATES */}
        {tab === 'blocked' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4">Block a Date</h2>
              <p className="text-sm text-gray-500 mb-4">Block specific dates for holidays, vacations, or any reason. Clients won't be able to book on these days.</p>
              <form onSubmit={addBlockedDate} className="flex gap-3">
                <input type="date" value={newBlock.date}
                  onChange={e => setNewBlock({ ...newBlock, date: e.target.value })} required
                  min={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={newBlock.reason}
                  onChange={e => setNewBlock({ ...newBlock, reason: e.target.value })}
                  placeholder="Reason (e.g. Christmas, Holiday)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                  Block Date
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Blocked Dates</h2>
              {blockedDates.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No blocked dates. You're available every open day.</p>
              ) : (
                <div className="space-y-2">
                  {blockedDates.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {new Date(b.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {b.reason && <p className="text-red-500 text-xs">🚫 {b.reason}</p>}
                      </div>
                      <button onClick={() => removeBlockedDate(b.id)}
                        className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-100">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}