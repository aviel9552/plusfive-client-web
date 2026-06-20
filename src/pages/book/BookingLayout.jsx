import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiX } from 'react-icons/fi'
import { BookingProvider, useBooking } from '../../context/BookingContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerBookingTranslations } from '../../utils/translations'
import BookingProgress from '../../components/booking/BookingProgress'
import CommonLoader from '../../components/commonComponent/CommonLoader'

function BookingLayoutInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguage()
  const t = getCustomerBookingTranslations(language)
  const isRtl = language === 'he'
  const {
    loading,
    loadError,
    allowOnlineBooking,
    catalog,
    allowChooseTeamMember,
    selectedBusinessSlug,
  } = useBooking()

  const isBusinessStep = location.pathname.includes('/book/business')

  if (!isBusinessStep && !selectedBusinessSlug) {
    return <Navigate to="/client/book/business" replace />
  }

  if (!isBusinessStep && loading && !catalog) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <CommonLoader />
      </div>
    )
  }

  if (!isBusinessStep && loadError === 'not_found') {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-lg py-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">{t.businessNotFound}</p>
        <button
          type="button"
          onClick={() => navigate('/client/book/business')}
          className="mt-4 text-sm font-medium text-customPink hover:underline"
        >
          {t.changeBusiness}
        </button>
      </div>
    )
  }

  if (!isBusinessStep && loadError && loadError !== 'not_found') {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-lg py-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">{loadError}</p>
      </div>
    )
  }

  if (!isBusinessStep && !allowOnlineBooking && catalog) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-lg py-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">{t.onlineBookingDisabled}</p>
        <button
          type="button"
          onClick={() => navigate('/client/book/business')}
          className="mt-4 text-sm font-medium text-customPink hover:underline"
        >
          {t.changeBusiness}
        </button>
      </div>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-6xl">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <button
          type="button"
          onClick={() => {
            const path = location.pathname
            if (path.includes('/services')) {
              navigate('/client/book/business')
            } else if (path.includes('/staff')) {
              navigate('/client/book/services')
            } else if (path.includes('/datetime')) {
              navigate(
                allowChooseTeamMember ? '/client/book/staff' : '/client/book/services',
              )
            } else if (path.includes('/confirm')) {
              navigate('/client/book/datetime')
            } else if (path.includes('/business')) {
              navigate('/client/home')
            } else {
              navigate('/client/home')
            }
          }}
          className="flex items-center gap-1.5 rounded-lg px-1.5 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:gap-2 sm:px-2"
        >
          <FiArrowLeft className="shrink-0" />
          <span className="sr-only sm:not-sr-only">{t.back}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/client/home')}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label={t.close}
        >
          <FiX className="text-xl" />
        </button>
      </div>

      <BookingProgress t={t} />
      <Outlet />
    </div>
  )
}

export default function BookingLayout() {
  return (
    <BookingProvider>
      <BookingLayoutInner />
    </BookingProvider>
  )
}

export function BookingStepGuard({
  requireBusiness,
  requireService,
  requireStaff,
  requireDateTime,
  children,
}) {
  const {
    selectedBusinessSlug,
    selectedServiceId,
    selectedStaffId,
    selectedDate,
    selectedTime,
    allowChooseTeamMember,
  } = useBooking()

  if (requireBusiness && !selectedBusinessSlug) {
    return <Navigate to="/client/book/business" replace />
  }

  if (requireService && !selectedServiceId) {
    return <Navigate to="/client/book/services" replace />
  }

  if (requireStaff && allowChooseTeamMember && !selectedStaffId) {
    return <Navigate to="/client/book/staff" replace />
  }

  if (requireDateTime && (!selectedDate || !selectedTime || !selectedStaffId || selectedStaffId === 'any')) {
    return <Navigate to="/client/book/datetime" replace />
  }

  return children
}
