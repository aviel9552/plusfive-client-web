import { useState } from 'react'
import { FiCalendar, FiHome, FiLogOut, FiMoon, FiPlus, FiSun, FiUser } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CommonConfirmModel from '../commonComponent/CommonConfirmModel'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import {
  getAuthTranslations,
  getLayoutTranslations,
  getSettingsPanelTranslations,
} from '../../utils/translations'

const PROFILE_MENU_CARD_CLASS =
  'w-[min(100vw-24px,300px)] rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.12)] dark:border-commonBorder dark:bg-[#0f0f0f] font-ttcommons'

function PillToggle({ active, children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`inline-flex h-7 min-w-0 items-center justify-center rounded px-2.5 text-[13px] font-medium leading-none transition-colors duration-200 ${
        active
          ? 'border border-transparent bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'border border-gray-200 bg-transparent text-gray-900 hover:border-gray-300 dark:border-commonBorder dark:bg-transparent dark:text-gray-100 dark:hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  )
}

export default function ProfileDropdownMenu({ onClose, variant = 'default' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const { language, changeLanguage } = useLanguage()
  const t = getLayoutTranslations(language)
  const authT = getAuthTranslations(language)
  const panelP = getSettingsPanelTranslations(language)
  const isRtl = language === 'he'
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const showClientNavLinks = variant === 'marketplace'
  const useCompactNavLinks = variant === 'marketplace'

  const displayName = user?.fullName || user?.name || user?.firstName || 'Client'
  const email = user?.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    onClose?.()
    toast.success(authT.toastLogoutSuccess)
    navigate('/login', { replace: true })
  }

  const clientNavItems = [
    { to: '/client/home', icon: FiHome, label: t.navHome },
    { to: '/client/book/business', icon: FiPlus, label: t.navBook },
    { to: '/client/appointments', icon: FiCalendar, label: t.navAppointments },
    { to: '/client/profile', icon: FiUser, label: t.navProfile },
  ]

  const handleNavClick = () => {
    onClose?.()
  }

  return (
    <>
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${PROFILE_MENU_CARD_CLASS} w-full`}
      role="menu"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-black text-base font-bold text-white dark:border-customBorderColor dark:bg-black">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-snug text-gray-900 dark:text-white">
            {displayName}
          </p>
          {email ? (
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{email}</p>
          ) : null}
        </div>
      </div>

      <hr className="mb-4 border-0 border-t border-gray-200 dark:border-commonBorder" />

      {showClientNavLinks ? (
        <>
          <nav className={useCompactNavLinks ? 'mb-4 space-y-0' : 'mb-4 space-y-1'}>
            {clientNavItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={handleNavClick}
                className={
                  useCompactNavLinks
                    ? 'block rounded-lg px-2 py-2 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-[#1a1a1a]'
                    : 'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-[#1a1a1a]'
                }
              >
                {useCompactNavLinks ? (
                  label
                ) : (
                  <>
                    <Icon className="h-[18px] w-[18px] shrink-0 text-gray-500 dark:text-gray-400" />
                    <span>{label}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>
          <hr className="mb-4 border-0 border-t border-gray-200 dark:border-commonBorder" />
        </>
      ) : null}

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
          {t.profileMenuLanguage}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <PillToggle
            active={language === 'he'}
            onClick={() => changeLanguage('he')}
            ariaLabel="עברית"
          >
            עברית
          </PillToggle>
          <PillToggle
            active={language === 'en'}
            onClick={() => changeLanguage('en')}
            ariaLabel="English"
          >
            English
          </PillToggle>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
          {t.profileMenuTheme}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <PillToggle
            active={!isDarkMode}
            onClick={() => {
              if (isDarkMode) toggleTheme()
            }}
            ariaLabel={panelP.lightMode}
          >
            <span className="inline-flex items-center gap-1">
              <FiSun className="h-3 w-3 shrink-0" aria-hidden />
              {panelP.lightMode}
            </span>
          </PillToggle>
          <PillToggle
            active={isDarkMode}
            onClick={() => {
              if (!isDarkMode) toggleTheme()
            }}
            ariaLabel={panelP.darkMode}
          >
            <span className="inline-flex items-center gap-1">
              <FiMoon className="h-3 w-3 shrink-0" aria-hidden />
              {panelP.darkMode}
            </span>
          </PillToggle>
        </div>
      </div>

      <hr className="my-3 border-0 border-t border-gray-200 dark:border-commonBorder" />

      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <FiLogOut className="h-[18px] w-[18px] flex-shrink-0" />
        <span className="text-start">{panelP.logOut}</span>
      </button>
    </div>

    <CommonConfirmModel
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleLogout}
      title={panelP.logoutConfirm}
      message={panelP.logoutMessage}
      confirmText={panelP.logOut}
    />
    </>
  )
}
