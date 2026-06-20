import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { getCustomerMe } from '../../services/customerAuthService'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  const { language } = useLanguage()
  const { isAuthenticated, setBusinessList } = useAuth()
  const isRTL = language === 'he'

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let cancelled = false
    getCustomerMe()
      .then((res) => {
        const list = res?.data?.businesses
        if (!cancelled && Array.isArray(list) && list.length) {
          setBusinessList(list)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, setBusinessList])

  return (
    <div
      dir="ltr"
      className="flex h-screen overflow-x-hidden bg-[#fcfcfc] dark:bg-customBlack"
    >
      <Sidebar
        isCollapsed
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isRTL={isRTL}
      />

      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ${
          isMobile ? 'mx-0' : isRTL ? 'lg:mr-[72px]' : 'lg:ml-[72px]'
        }`}
      >
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

        <main
          dir={isRTL ? 'rtl' : 'ltr'}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 pt-[60px] sm:px-5 sm:py-5 sm:pt-[88px] lg:p-6 lg:pt-[88px]"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
