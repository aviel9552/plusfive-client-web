import { Route, Routes } from 'react-router-dom'
import { CommonToastify, Layout, RouteLoader } from './components'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import CustomerRoutes from './routes/customerRoutes'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoutes from './routes/publicRoutes'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CommonToastify />
          <RouteLoader loadTime={100}>
            <Routes>
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CustomerRoutes />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="/*" element={<PublicRoutes />} />
            </Routes>
          </RouteLoader>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
