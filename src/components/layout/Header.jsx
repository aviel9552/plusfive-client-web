import { useEffect, useRef, useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { getLayoutTranslations } from '../../utils/translations'
import ProfileDropdownMenu from './ProfileDropdownMenu'
import BusinessSwitcher from './BusinessSwitcher'
import DarkLogo from '../../assets/DarkLogo.png'
import LightLogo from '../../assets/LightLogo.jpeg'

const SIDEBAR_WIDTH_PX = 72

export default function Header({ onMobileMenuToggle }) {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  const { language } = useLanguage()
  const t = getLayoutTranslations(language)
  const navigate = useNavigate()
  const location = useLocation()
  const profileMenuRef = useRef(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const userName = user?.fullName || user?.name || user?.firstName || 'Client'
  const initial = userName.charAt(0).toUpperCase()
  const isRTL = language === 'he'

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileMenu])

  useEffect(() => {
    setShowProfileMenu(false)
  }, [location.pathname])

  const menuButton = (
    <button
      type="button"
      onClick={onMobileMenuToggle}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-customIconBgColor lg:hidden"
      aria-label="Open sidebar"
    >
      <FiMenu size={22} />
    </button>
  )

  return (
    <header
      dir="ltr"
      className="fixed left-0 top-0 z-[40] h-14 w-full border-b border-gray-200 bg-white font-ttcommons dark:border-commonBorder dark:bg-customBlack sm:h-[72px] lg:h-[66px]"
    >
      {/* Profile — fixed over sidebar column */}
      <div
        ref={profileMenuRef}
        className={`fixed top-0 z-[41] flex h-14 items-center justify-center overflow-visible sm:h-[72px] lg:h-[66px] ${
          isRTL ? 'right-0' : 'left-0'
        }`}
        style={{ width: SIDEBAR_WIDTH_PX }}
      >
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-11 sm:w-11"
          aria-expanded={showProfileMenu}
          aria-haspopup="menu"
          aria-label={t.profile}
          onClick={() => setShowProfileMenu((open) => !open)}
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-black text-base font-bold text-white dark:border-customBorderColor dark:bg-black sm:h-11 sm:w-11 sm:text-[17px]">
            {initial}
          </div>
        </button>

        {showProfileMenu ? (
          <div
            className={`absolute top-full z-[1200] mt-1 sm:mt-2 ${isRTL ? 'right-0' : 'left-2'}`}
          >
            <ProfileDropdownMenu onClose={() => setShowProfileMenu(false)} />
          </div>
        ) : null}
      </div>

      {/* Main header — controls near profile, logo on opposite side */}
      <div
        className={`flex h-full w-full min-w-0 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6 ${
          isRTL ? 'flex-row-reverse' : ''
        }`}
        style={{
          [isRTL ? 'paddingRight' : 'paddingLeft']: SIDEBAR_WIDTH_PX,
        }}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {menuButton}
          <BusinessSwitcher placement="header" className="shrink-0 md:max-w-[280px]" />
        </div>

        <button
          type="button"
          onClick={() => navigate('/client/home')}
          className="flex h-full shrink-0 items-center"
          aria-label={t.plusFive}
        >
          <img
            src={isDarkMode ? DarkLogo : LightLogo}
            alt={t.plusFive}
            className="h-[22px] w-auto object-contain sm:h-[24px] lg:h-[32px]"
          />
        </button>
      </div>
    </header>
  )
}
