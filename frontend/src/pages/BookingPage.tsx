import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function BookingPage({ token, onBack }: any) {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/services`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setServices(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetch(`${API}/bookings/slots?serviceId=${selectedService.id}&date=${selectedDate}`)
        .then(r => r.json())
        .then(data => setAvailableSlots(data.availableSlots || []))
        .catch(() => {})
    }
  }, [selectedService, selectedDate])

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Please select a service, date, and time slot')
      return
    }
    setLoading(true)
    setError('')
    try {
      const startTime = new Date(`${selectedDate}T${selectedSlot}:00`)
      const endTime = new Date(startTime.getTime() + selectedService.durationMin * 60000)
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: selectedService.id,
          bookingDate: selectedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 mb-6">Your booking is pending approval.</p>
        <button onClick={onBack} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 mr-4">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">Book a Session</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-6 text-sm">{error}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">1. Select a Service</h2>
          <div className="grid grid-cols-3 gap-4">
            {services.map((s: any) => (
              <div key={s.id} onClick={() => setSelectedService(s)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition ${selectedService?.id === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <h3 className="font-semibold text-gray-800 text-sm">{s.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{s.business?.name}</p>
                <p className="text-blue-600 font-bold text-sm mt-2">{s.price} PLN</p>
                <p className="text-gray-400 text-xs">{s.durationMin} min</p>
              </div>
            ))}
          </div>
          {services.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No services available yet.</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">2. Pick a Date</h2>
          <input type="date" value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }}
            min={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {selectedDate && selectedService && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">3. Choose a Time Slot</h2>
            <div className="grid grid-cols-4 gap-3">
              {availableSlots.length === 0
                ? <p className="text-gray-400 text-sm col-span-4">No available slots for this date.</p>
                : availableSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`py-3 rounded-lg text-sm font-medium transition ${selectedSlot === slot ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                    {slot}
                  </button>
                ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">4. Notes (optional)</h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special requests..." />
        </div>
        <button onClick={handleConfirm} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition disabled:opacity-50">
          {loading ? 'Confirming...' : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  )
}