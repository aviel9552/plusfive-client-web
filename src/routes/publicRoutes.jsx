import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginPage from '../pages/auth/login'
import VerifyOtpPage from '../pages/auth/verifyOtp'
import NotFoundPage from '../pages/404'

function PublicRouteGuard({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/client/home" replace />
  }

  return children
}

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRouteGuard>
            <LoginPage />
          </PublicRouteGuard>
        }
      />
      <Route
        path="/login/verify"
        element={
          <PublicRouteGuard>
            <VerifyOtpPage />
          </PublicRouteGuard>
        }
      />
      <Route
        path="/login/select-business"
        element={<Navigate to="/login" replace />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
