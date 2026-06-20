import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiLogOut,
  FiMail,
  FiMoon,
  FiPhone,
  FiSun,
  FiUser,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import CommonConfirmModel from '../../components/commonComponent/CommonConfirmModel'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import {
  getAuthTranslations,
  getCustomerProfileTranslations,
  getSettingsPanelTranslations,
} from '../../utils/translations'
import { getCustomerMe, getErrorMessage } from '../../services/customerAuthService'
import { withCacheBuster } from '../../utils/imageUrl'

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
]

function colorForName(name = '') {
  const code = (name || '').charCodeAt(0) || 0
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function ProfileAvatar({ name, imageUrl, size = 'lg' }) {
  const initial = (name || 'C').charAt(0).toUpperCase()
  const sizeClass =
    size === 'lg'
      ? 'h-20 w-20 rounded-2xl text-2xl ring-4 ring-white dark:ring-customBrown'
      : 'h-9 w-9 rounded-lg text-sm'

  if (imageUrl) {
    return (
      <img
        src={withCacheBuster(imageUrl)}
        alt=""
        className={`shrink-0 object-cover ${sizeClass}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br font-bold text-white ${sizeClass} ${colorForName(name)}`}
    >
      {initial}
    </span>
  )
}

function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-customGray2 bg-white p-5 dark:border-commonBorder dark:bg-customBrown sm:p-6 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-16 font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-13 text-customBoldTextColor dark:text-customGray2">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#fafafa] p-4 dark:border-commonBorder/60 dark:bg-[#0a0a0a]">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-11 font-semibold uppercase tracking-[0.06em] text-customBoldTextColor dark:text-customGray2">
          {label}
        </p>
        <p className="mt-0.5 break-words text-15 font-medium text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

function PillToggle({ active, children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`inline-flex h-8 items-center justify-center rounded-full px-3.5 text-13 font-semibold transition-colors duration-200 ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-commonBorder dark:text-gray-300 dark:hover:bg-[#1a1a1a]'
      }`}
    >
      {children}
    </button>
  )
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a]" />
        <div className="h-64 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a]" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, businesses, logout } = useAuth()
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const { language, changeLanguage } = useLanguage()
  const t = getCustomerProfileTranslations(language)
  const panelT = getSettingsPanelTranslations(language)
  const authT = getAuthTranslations(language)
  const isRtl = language === 'he'

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await getCustomerMe()
        if (!cancelled) setProfile(res?.data ?? res)
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, t.loadError))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [t.loadError, user?.businessId])

  const display = profile || user
  const displayName = display?.fullName || display?.name || display?.firstName || '—'
  const email = display?.email || '—'
  const phone = display?.phone || t.notProvided
  const activeBusinessId = display?.businessId || user?.businessId

  const businessList = useMemo(() => {
    if (businesses?.length) return businesses
    if (display?.businessName) {
      return [
        {
          businessId: display.businessId,
          businessName: display.businessName,
          profileImage: display.businessProfileImage || null,
        },
      ]
    }
    return []
  }, [businesses, display])

  const activeBusiness =
    businessList.find((b) => b.businessId === activeBusinessId) || businessList[0]

  const handleLogout = () => {
    logout()
    toast.success(authT.toastLogoutSuccess)
    navigate('/login', { replace: true })
  }

  const emptyValue = '—'

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-white">{t.subtitle}</p>
        </div>
        <Link
          to="/client/appointments"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-commonBorder dark:bg-customBrown dark:text-white dark:hover:bg-[#1a1a1a]"
        >
          <FiCalendar className="h-4 w-4" aria-hidden />
          {t.viewAppointments}
        </Link>
      </div>

      {loading && !display ? (
        <ProfileSkeleton />
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-customGray2 bg-white dark:border-commonBorder dark:bg-customBrown">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-customPink/10 via-transparent to-customViolet/10"
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-start">
              <ProfileAvatar
                name={displayName}
                imageUrl={display?.profileImage}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-11 font-semibold uppercase tracking-[0.08em] text-customPink">
                  {t.customerAccount}
                </p>
                <h2 className="mt-1 truncate text-22 font-black text-gray-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="mt-1 truncate text-14 text-customBoldTextColor dark:text-customGray2">
                  {email}
                </p>
                {activeBusiness?.businessName ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-customPink/20 bg-customPink/5 px-3 py-1 text-12 font-semibold text-customPink">
                    <FiBriefcase className="h-3.5 w-3.5" aria-hidden />
                    {activeBusiness.businessName}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title={t.accountDetails}>
              <div className="space-y-3">
                <InfoRow
                  icon={FiUser}
                  label={t.name}
                  value={displayName || emptyValue}
                  accent="bg-pink-500/10 text-customPink"
                />
                <InfoRow
                  icon={FiMail}
                  label={t.email}
                  value={email || emptyValue}
                  accent="bg-violet-500/10 text-customViolet"
                />
                <InfoRow
                  icon={FiPhone}
                  label={t.phone}
                  value={phone}
                  accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </SectionCard>

            <SectionCard title={t.activeBusiness} subtitle={t.activeBusinessHint}>
              {activeBusiness ? (
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#fafafa] p-4 dark:border-commonBorder/60 dark:bg-[#0a0a0a]">
                  <ProfileAvatar
                    name={activeBusiness.businessName}
                    imageUrl={activeBusiness.profileImage}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-16 font-bold text-gray-900 dark:text-white">
                      {activeBusiness.businessName}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-12 font-semibold text-emerald-600 dark:text-emerald-400">
                      <FiCheck className="h-3.5 w-3.5" aria-hidden />
                      {t.active}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-14 text-customBoldTextColor dark:text-customGray2">
                  {t.noBusiness}
                </p>
              )}

              {businessList.length > 1 ? (
                <div className="mt-5 border-t border-gray-100 pt-5 dark:border-commonBorder">
                  <p className="mb-3 text-12 font-semibold uppercase tracking-[0.06em] text-customBoldTextColor dark:text-customGray2">
                    {t.linkedBusinesses}
                  </p>
                  <ul className="space-y-2">
                    {businessList.map((business) => {
                      const isActive = business.businessId === activeBusinessId
                      return (
                        <li
                          key={business.businessId}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                            isActive
                              ? 'border-customPink/30 bg-customPink/5'
                              : 'border-gray-100 bg-[#fafafa] dark:border-commonBorder/60 dark:bg-[#0a0a0a]'
                          }`}
                        >
                          <ProfileAvatar
                            name={business.businessName}
                            imageUrl={business.profileImage}
                            size="sm"
                          />
                          <span className="min-w-0 flex-1 truncate text-14 font-medium text-gray-900 dark:text-white">
                            {business.businessName}
                          </span>
                          {isActive ? (
                            <span className="shrink-0 rounded-full bg-customPink/10 px-2 py-0.5 text-10 font-bold uppercase tracking-wide text-customPink">
                              {t.active}
                            </span>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </SectionCard>
          </div>

          <SectionCard title={t.preferences}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2.5 text-12 font-semibold uppercase tracking-[0.06em] text-customBoldTextColor dark:text-customGray2">
                  {t.language}
                </p>
                <div className="flex flex-wrap gap-2">
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
              <div>
                <p className="mb-2.5 text-12 font-semibold uppercase tracking-[0.06em] text-customBoldTextColor dark:text-customGray2">
                  {t.theme}
                </p>
                <div className="flex flex-wrap gap-2">
                  <PillToggle
                    active={!isDarkMode}
                    onClick={() => {
                      if (isDarkMode) toggleTheme()
                    }}
                    ariaLabel={panelT.lightMode}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <FiSun className="h-3.5 w-3.5" aria-hidden />
                      {panelT.lightMode}
                    </span>
                  </PillToggle>
                  <PillToggle
                    active={isDarkMode}
                    onClick={() => {
                      if (!isDarkMode) toggleTheme()
                    }}
                    ariaLabel={panelT.darkMode}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <FiMoon className="h-3.5 w-3.5" aria-hidden />
                      {panelT.darkMode}
                    </span>
                  </PillToggle>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-5 dark:border-red-900/40 dark:bg-red-950/20 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-15 font-bold text-gray-900 dark:text-white">{panelT.logOut}</p>
                <p className="mt-1 text-13 text-customBoldTextColor dark:text-customGray2">
                  {t.logoutHint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
              >
                <FiLogOut className="h-4 w-4" aria-hidden />
                {panelT.logOut}
              </button>
            </div>
          </div>
        </>
      )}

      <CommonConfirmModel
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={panelT.logoutConfirm}
        message={panelT.logoutMessage}
        confirmText={panelT.logOut}
      />
    </div>
  )
}
