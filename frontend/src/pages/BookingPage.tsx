import { useState, useEffect } from 'react'

const API = 'https://elitesync-backend.onrender.com/api'

export default function BookingPage({ token, user, onBack, preSelectedService }: any) {
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(preSelectedService || null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(preSelectedService ? 2 : 1)

  useEffect(() => {
    if (!preSelectedService) {
      fetch(`${API}/services`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setServices(data) })
        .catch(() => {})
    }
  }, [preSelectedService])

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
      setError('Please complete all required steps')
      return
    }
    setLoading(true); setError('')
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
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 mb-2">Your booking for <strong>{selectedService?.name}</strong> is pending approval from the business.</p>
        <p className="text-gray-400 text-sm mb-8">You will be notified once it is approved.</p>
        <button onClick={onBack} className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  const CATEGORIES = ['All', 'Fitness & Sports', 'Beauty & Wellness', 'Education & Tutoring', 'Modeling & Creative', 'Health & Medical', 'Consulting & Business', 'Other']
  const [filterCat, setFilterCat] = useState('All')
  const [searchQ, setSearchQ] = useState('')
  const filtered = services.filter(s => {
    const mc = filterCat === 'All' || s.business?.category === filterCat
    const ms = !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) || (s.business?.name || '').toLowerCase().includes(searchQ.toLowerCase())
    return mc && ms
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition">
          ← Back
        </button>
        <div className="h-5 w-px bg-gray-300" />
        <h1 className="text-lg font-bold text-gray-800">Book a Service</h1>
        {/* Step indicators */}
        <div className="ml-auto flex items-center gap-2">
          {[
            { n: 1, label: 'Select Service' },
            { n: 2, label: 'Pick Date & Time' },
            { n: 3, label: 'Confirm' }
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${step >= s.n ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s.n}</div>
                <span className="text-xs font-medium hidden md:block">{s.label}</span>
              </div>
              {i < 2 && <div className={`w-8 h-px ${step > s.n ? 'bg-blue-600' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        {/* STEP 1 — SELECT SERVICE */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">What service are you looking for?</h2>
            <p className="text-gray-500 text-sm mb-6">Search or browse by category to find the perfect service</p>

            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-3 text-gray-400">🔍</span>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by service name or business..."
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            {/* Category filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterCat === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Service grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🔍</p>
                <p>No services match your search. Try a different term or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map((s: any) => (
                  <div key={s.id}
                    onClick={() => { setSelectedService(s); setStep(2) }}
                    className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition cursor-pointer group">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} className="w-full h-28 object-cover" alt={s.name} />
                    ) : (
                      <div className="w-full h-28 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-4xl">⚙️</div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{s.name}</h3>
                      {s.staffName && <p className="text-blue-500 text-xs mb-1">👤 {s.staffName}</p>}
                      {s.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{s.description}</p>}
                      <p className="text-gray-400 text-xs mb-3">{s.business?.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-bold">{s.price} PLN</span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s.durationMin} min</span>
                      </div>
                      <button className="w-full mt-3 bg-blue-600 text-white text-xs py-2 rounded-lg group-hover:bg-blue-700 transition font-semibold">
                        Select This Service →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — DATE & TIME */}
        {step === 2 && selectedService && (
          <div>
            {/* Selected service summary card */}
            <div className="bg-white rounded-2xl border border-blue-200 p-5 mb-8 flex items-center gap-4">
              {selectedService.imageUrl ? (
                <img src={selectedService.imageUrl} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt={selectedService.name} />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⚙️</div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Selected</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{selectedService.name}</h3>
                {selectedService.staffName && <p className="text-blue-500 text-sm">👤 {selectedService.staffName}</p>}
                <p className="text-gray-500 text-sm">{selectedService.business?.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-blue-600">{selectedService.price} PLN</p>
                <p className="text-gray-400 text-sm">{selectedService.durationMin} min session</p>
              </div>
              {!preSelectedService && (
                <button onClick={() => { setSelectedService(null); setStep(1) }}
                  className="text-gray-400 hover:text-gray-600 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 ml-2">
                  Change
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Date picker */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">📅 Pick a Date</h3>
                <input type="date" value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {selectedDate && (
                  <p className="text-green-600 text-xs mt-2 font-medium">
                    ✓ {new Date(selectedDate).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                  </p>
                )}
              </div>

              {/* Time slots */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">🕐 Available Times</h3>
                {!selectedDate ? (
                  <p className="text-gray-400 text-sm text-center py-4">Select a date first to see available times</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No available slots for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition ${selectedSlot === slot ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">📝 Additional Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></h3>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any special requests, preferences, or information the business should know..." />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {!preSelectedService && (
                <button onClick={() => { setStep(1); setSelectedService(null) }}
                  className="px-6 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  ← Back
                </button>
              )}
              <button onClick={() => { if (selectedDate && selectedSlot) setStep(3); else setError('Please select a date and time slot') }}
                disabled={!selectedDate || !selectedSlot}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 text-sm">
                Continue to Confirm →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — CONFIRM */}
        {step === 3 && selectedService && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Confirm Your Booking</h2>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-white font-bold text-lg">{selectedService.name}</h3>
                <p className="text-blue-200 text-sm">{selectedService.business?.name}</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Service', value: selectedService.name },
                  { label: 'Provider', value: selectedService.business?.name },
                  { label: 'Trainer / Staff', value: selectedService.staffName || 'Not specified' },
                  { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                  { label: 'Time', value: selectedSlot },
                  { label: 'Duration', value: `${selectedService.durationMin} minutes` },
                  { label: 'Price', value: `${selectedService.price} PLN` },
                  ...(notes ? [{ label: 'Notes', value: notes }] : []),
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-500 text-sm">{row.label}</span>
                    <span className="font-semibold text-gray-800 text-sm text-right max-w-xs">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
              ⏳ Your booking will be <strong>Pending</strong> until the business approves it. You will see the status update in your bookings page.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={handleConfirm} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50">
                {loading ? 'Confirming...' : '✓ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}