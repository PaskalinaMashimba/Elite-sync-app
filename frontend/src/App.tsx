import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BookingPage from './pages/BookingPage'
import BusinessDashboard from './pages/BusinessDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'

export default function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      const u = JSON.parse(savedUser)
      setToken(savedToken)
      setUser(u)
      setPage(u.role === 'SUPER_ADMIN' ? 'admin' : u.role === 'BUSINESS_OWNER' ? 'business' : 'dashboard')
    }
  }, [])

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setPage(userData.role === 'SUPER_ADMIN' ? 'admin' : userData.role === 'BUSINESS_OWNER' ? 'business' : 'dashboard')
  }

  const handleLogout = () => {
    setUser(null); setToken('')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setPage('login')
  }

  const handleProfileUpdate = (updatedUser: any) => {
    const newUser = { ...user, ...updatedUser }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  if (page === 'login')    return <Login onLogin={handleLogin} onRegister={() => setPage('register')} />
  if (page === 'register') return <Register onLogin={handleLogin} onBack={() => setPage('login')} />
  if (page === 'profile')  return <Profile user={user} token={token} onBack={() => setPage(user?.role === 'BUSINESS_OWNER' ? 'business' : 'dashboard')} onUpdate={handleProfileUpdate} />
  if (page === 'admin')    return <AdminDashboard user={user} token={token} onLogout={handleLogout} />
  if (page === 'business') return <BusinessDashboard user={user} token={token} onLogout={handleLogout} onProfile={() => setPage('profile')} />
  if (page === 'booking')  return <BookingPage token={token} user={user} onBack={() => setPage('dashboard')} />
  return <Dashboard user={user} token={token} onLogout={handleLogout} onBook={() => setPage('booking')} onProfile={() => setPage('profile')} />
}