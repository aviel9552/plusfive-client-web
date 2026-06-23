import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { getMarketplaceTranslations } from '../../utils/translations'
import { getBusinessOwnerAppUrl } from '../../utils/publicBookingIntent'
import ProfileDropdownMenu from '../layout/ProfileDropdownMenu'
import DarkLogo from '../../assets/DarkLogo.png'
import LightLogo from '../../assets/LightLogo.jpeg'

const MENU_WIDTH = 300
const MENU_GAP = 8
const VIEWPORT_PADDING = 12

function getDropdownPosition(triggerEl) {
  if (!triggerEl) return null

  const rect = triggerEl.getBoundingClientRect()
  const width = Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2)
  let left = rect.right - width
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING),
  )

  return {
    position: 'fixed',
    top: rect.bottom + MENU_GAP,
    left,
    width,
    zIndex: 9999,
  }
}

export default function PublicHeader() {
  const { isAuthenticated, user } = useAuth()
  const { language } = useLanguage()
  const { isDarkMode } = useTheme()
  const t = getMarketplaceTranslations(language)
  const ownerAppUrl = getBusinessOwnerAppUrl()
  const location = useLocation()
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)

  const displayName = user?.fullName || user?.name || user?.firstName || ''
  const initial = (displayName || 'C').charAt(0).toUpperCase()

  useEffect(() => {
    if (!showAccountMenu) {
      setMenuStyle(null)
      return undefined
    }

    const updatePosition = () => {
      setMenuStyle(getDropdownPosition(triggerRef.current))
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [showAccountMenu])

  useEffect(() => {
    function handleClickOutside(event) {
      const target = event.target
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setShowAccountMenu(false)
    }

    if (showAccountMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAccountMenu])

  useEffect(() => {
    setShowAccountMenu(false)
  }, [location.pathname])

  return (
    <header
      dir="ltr"
      className="sticky top-0 z-40 overflow-visible border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-[#0a0a0a]/95"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center"
          aria-label={t.brandName}
        >
          <img
            src={isDarkMode ? DarkLogo : LightLogo}
            alt={t.brandName}
            className="h-7 w-auto object-contain sm:h-8"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setShowAccountMenu((open) => !open)}
                aria-expanded={showAccountMenu}
                aria-haspopup="menu"
                className="inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 sm:pl-2 sm:pr-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
                  {initial}
                </span>
                <span className="hidden sm:inline">{t.myAccount}</span>
                <FiChevronDown
                  className={`hidden text-base transition-transform sm:block ${showAccountMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showAccountMenu && menuStyle
                ? createPortal(
                    <div ref={menuRef} style={menuStyle}>
                      <ProfileDropdownMenu
                        variant="marketplace"
                        onClose={() => setShowAccountMenu(false)}
                      />
                    </div>,
                    document.body,
                  )
                : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            >
              {t.logIn}
            </Link>
          )}

          <a
            href={ownerAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-300 dark:text-white dark:hover:bg-gray-900 max-sm:hidden sm:inline-block"
          >
            {t.listBusiness}
          </a>
        </div>
      </div>
    </header>
  )
}
