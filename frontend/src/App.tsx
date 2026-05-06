import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BookingPage from './pages/BookingPage'

export default function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setPage('dashboard')
    }
  }, [])

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setPage('login')
  }

  if (page === 'login') return <Login onLogin={handleLogin} onRegister={() => setPage('register')} />
  if (page === 'register') return <Register onLogin={handleLogin} onBack={() => setPage('login')} />
  if (page === 'booking') return <BookingPage token={token} user={user} onBack={() => setPage('dashboard')} />
  return <Dashboard user={user} token={token} onLogout={handleLogout} onBook={() => setPage('booking')} />
}