import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginPage from '../pages/auth/login'
import VerifyOtpPage from '../pages/auth/verifyOtp'
import NotFoundPage from '../pages/404'
import PublicMarketplaceLayout from '../components/marketplace/PublicMarketplaceLayout'
import LandingPage from '../pages/marketplace/LandingPage'
import BrowsePage from '../pages/marketplace/BrowsePage'
import BusinessProfilePage from '../pages/marketplace/BusinessProfilePage'

function PublicRouteGuard({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicMarketplaceLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/business/:slug" element={<BusinessProfilePage />} />
      </Route>

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
