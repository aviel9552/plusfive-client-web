import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext()

const USER_STORAGE_KEY = 'client_user'
const BUSINESSES_STORAGE_KEY = 'client_businesses'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readStoredBusinesses() {
  try {
    const raw = localStorage.getItem(BUSINESSES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser())
  const [businesses, setBusinesses] = useState(() => readStoredBusinesses())
  const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid())

  const login = useCallback((token, nextUser, nextBusinesses = []) => {
    localStorage.setItem('token', token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(nextBusinesses || []))
    setUser(nextUser)
    setBusinesses(nextBusinesses || [])
    setIsAuthenticated(true)
  }, [])

  const updateSession = useCallback((token, nextUser, nextBusinesses) => {
    localStorage.setItem('token', token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    if (nextBusinesses) {
      localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(nextBusinesses))
      setBusinesses(nextBusinesses)
    }
    setUser(nextUser)
    setIsAuthenticated(true)
  }, [])

  const setBusinessList = useCallback((list) => {
    const safe = Array.isArray(list) ? list : []
    localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(safe))
    setBusinesses(safe)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(BUSINESSES_STORAGE_KEY)
    sessionStorage.removeItem('customer_session_token')
    setUser(null)
    setBusinesses([])
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      businesses,
      isAuthenticated,
      login,
      updateSession,
      setBusinessList,
      logout,
    }),
    [user, businesses, isAuthenticated, login, updateSession, setBusinessList, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
