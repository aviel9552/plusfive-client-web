import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function isTokenValid() {
  try {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token.trim() === '') return false

    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return true

    return Date.now() < payload.exp * 1000
  } catch {
    return false
  }
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const tokenValid = isTokenValid()
  const isGuestBookingPath = location.pathname.startsWith('/client/book')

  if (!tokenValid) {
    if (isGuestBookingPath) {
      return children
    }
    return <Navigate to="/login" replace state={{ from: location, returnTo: location.pathname }} />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 font-inter">
        <div className="loader" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 font-inter">
        <div className="loader" />
      </div>
    )
  }

  return children
}

export default ProtectedRoute
