import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck } from 'react-icons/fi'
import { ChevronsUpDown } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getAuthTranslations } from '../../utils/translations'
import {
  getErrorMessage,
  switchCustomerBusiness,
} from '../../services/customerAuthService'
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

function BusinessAvatar({ name, profileImage, size = 'md' }) {
  const initial = (name || 'B').charAt(0).toUpperCase()
  const sizeClass = size === 'sm' ? 'h-7 w-7 rounded-md text-xs' : 'h-8 w-8 rounded-lg text-sm'
  const imageUrl = profileImage ? withCacheBuster(profileImage) : null

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
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

export default function BusinessSwitcher({ className = '', placement = 'header' }) {
  const { user, businesses, updateSession } = useAuth()
  const { language } = useLanguage()
  const t = getAuthTranslations(language)
  const isRtl = language === 'he'

  const [open, setOpen] = useState(false)
  const [switchingId, setSwitchingId] = useState(null)
  const [menuStyle, setMenuStyle] = useState({})
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const activeId = user?.businessId
  const list = businesses?.length
    ? businesses
    : user?.businessName
      ? [
          {
            businessId: user.businessId,
            businessName: user.businessName,
            profileImage: user.businessProfileImage || null,
          },
        ]
      : []

  const activeBusiness = list.find((b) => b.businessId === activeId) || list[0]
  const canSwitch = list.length > 1

  useEffect(() => {
    if (!open) return undefined

    const updatePosition = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const menuWidth = 280
      const menuHeight = menuRef.current?.offsetHeight || 200
      const left = isRtl
        ? Math.max(8, rect.right - menuWidth)
        : Math.min(rect.left, window.innerWidth - menuWidth - 8)

      let top = rect.bottom + 8
      if (window.innerHeight - rect.bottom < menuHeight + 16) {
        top = Math.max(8, rect.top - menuHeight - 8)
      }

      setMenuStyle({
        position: 'fixed',
        top,
        left,
        width: menuWidth,
        zIndex: 2147483646,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, isRtl, list.length])

  useEffect(() => {
    if (!open) return undefined

    const handleOutside = (event) => {
      if (
        rootRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  if (!activeBusiness?.businessName) return null

  const handleSelect = async (business) => {
    if (!business?.businessId || business.businessId === activeId) {
      setOpen(false)
      return
    }

    setSwitchingId(business.businessId)
    try {
      const res = await switchCustomerBusiness(business.businessId)
      const payload = res?.data || res
      updateSession(payload.token, payload.user, payload.businesses || list)
      toast.success(t.toastBusinessSwitched)
      setOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, t.switchBusinessFailed))
    } finally {
      setSwitchingId(null)
    }
  }

  const triggerClass =
    placement === 'header'
      ? 'h-10 shrink-0 gap-1 rounded-lg border border-gray-200/80 bg-white px-2 py-1.5 shadow-sm hover:bg-gray-50 md:max-w-[280px] md:gap-2 md:px-2.5 dark:border-commonBorder dark:bg-[#141414] dark:hover:bg-[#1c1c1c]'
      : 'min-w-[200px] gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-commonBorder dark:bg-[#111]'

  const menu = open && canSwitch ? (
    createPortal(
      <>
        <div className="fixed inset-0 z-[2147483645]" onClick={() => setOpen(false)} aria-hidden />
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          dir={isRtl ? 'rtl' : 'ltr'}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)] dark:border-commonBorder dark:bg-[#111]"
        >
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {t.switchBusinessTitle}
          </p>
          <div className="max-h-[280px] overflow-y-auto px-1.5">
            {list.map((business) => {
              const isActive = business.businessId === activeId
              const isLoading = switchingId === business.businessId

              return (
                <button
                  key={business.businessId}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={Boolean(switchingId)}
                  onClick={() => handleSelect(business)}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start transition last:mb-0 ${
                    isActive
                      ? 'bg-gray-100 dark:bg-[#1f1f1f]'
                      : 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <BusinessAvatar
                    name={business.businessName}
                    profileImage={business.profileImage}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-white">
                    {business.businessName || t.businessFallback}
                  </span>
                  {isLoading ? (
                    <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-customPink" />
                  ) : isActive ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-customPink">
                      <FiCheck className="text-[10px] text-white" />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </>,
      document.body,
    )
  ) : null

  return (
    <div ref={rootRef} className={`relative ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => canSwitch && setOpen((prev) => !prev)}
        disabled={Boolean(switchingId) || !canSwitch}
        className={`flex items-center text-start transition disabled:cursor-default ${triggerClass} ${
          canSwitch ? 'cursor-pointer' : ''
        }`}
        aria-haspopup={canSwitch ? 'listbox' : undefined}
        aria-expanded={open}
        aria-label={`${t.switchBusinessTitle}: ${activeBusiness.businessName || t.businessFallback}`}
      >
        <BusinessAvatar
          name={activeBusiness.businessName}
          profileImage={activeBusiness.profileImage || user?.businessProfileImage}
          size="sm"
        />
        <span className="hidden min-w-0 flex-1 md:block">
          <span className="block truncate text-sm font-semibold leading-tight text-gray-900 dark:text-white">
            {activeBusiness.businessName || t.businessFallback}
          </span>
        </span>
        {placement === 'header' ? (
          <span className="hidden shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-[#222] dark:text-gray-400 lg:inline">
            {t.activeBusiness}
          </span>
        ) : null}
        {canSwitch ? (
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400 md:h-4 md:w-4" aria-hidden />
        ) : null}
      </button>
      {menu}
    </div>
  )
}
