import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function BookingAuthPromptModal({
  isOpen,
  onClose,
  onLogin,
  onContinueWithoutLogin,
}) {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)
  const isRtl = language === 'he'
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  const panel = (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111111] sm:p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800 end-4"
        aria-label={t.cancel}
      >
        <FiX className="h-5 w-5" />
      </button>

      <h2 className="pe-10 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
        {t.bookingAuthTitle}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {t.bookingAuthMessage}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onLogin}
          className="flex-1 rounded-full bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900"
        >
          {t.bookingAuthLogin}
        </button>
        <button
          type="button"
          onClick={onContinueWithoutLogin}
          className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-900"
        >
          {t.bookingAuthContinueWithoutLogin}
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {t.cancel}
      </button>
    </div>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center sm:justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
        <div className="relative z-10 w-full rounded-t-2xl sm:rounded-2xl">{panel}</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10">{panel}</div>
    </div>
  )
}
