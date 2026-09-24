import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Vehicles from './pages/Vehicles'
import Services from './pages/Services'
import Payments from './pages/Payments'
import Invoices from './pages/Invoices'
import Login from './pages/Login'
import './App.css'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/vehicles': 'Vehicles',
  '/services': 'Services',
  '/payments': 'Payments',
  '/invoices': 'Invoices',
}

const AUTH_KEY = 'garage_admin_auth'
const DARK_MODE_KEY = 'garage_dark_mode'

function AppContent({ isLoggedIn, onLogin, onLogout, isDarkMode, onToggleDarkMode }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Navbar
          title={title}
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/services" element={<Services />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem(AUTH_KEY)
    return saved === 'true'
  })

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(DARK_MODE_KEY)
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, String(isLoggedIn))
  }, [isLoggedIn])

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode))
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <BrowserRouter>
      <AppContent
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((value) => !value)}
      />
    </BrowserRouter>
  )
}

export default App
