import { useNavigate } from 'react-router-dom'
import { FiPlus, FiCheck } from 'react-icons/fi'
import { useBooking } from '../../context/BookingContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerBookingTranslations } from '../../utils/translations'
import { BRAND_COLOR } from '../../utils/constants'
import BookingSummarySidebar from '../../components/booking/BookingSummarySidebar'
import BookingStepShell from '../../components/booking/BookingStepShell'
import {
  bookingPageTitleClass,
  bookingCardButtonClass,
  bookingSelectedCardClass,
  bookingDefaultCardClass,
} from '../../components/booking/bookingStyles'
import { BookingStepGuard } from './BookingLayout'

function ServicesStepContent() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = getCustomerBookingTranslations(language)
  const locale = language === 'he' ? 'he-IL' : 'en-US'
  const {
    catalog,
    selectedServiceId,
    setSelectedServiceId,
    setSelectedStaffId,
    setSelectedDate,
    setSelectedTime,
    allowChooseTeamMember,
  } = useBooking()

  const services = catalog?.services || []
  const showPrices = catalog?.clientPermissions?.showServicePrices !== false
  const showDuration = catalog?.clientPermissions?.showServiceDuration !== false

  const handleSelect = (serviceId) => {
    setSelectedServiceId(String(serviceId))
    setSelectedStaffId(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleContinue = () => {
    if (!selectedServiceId) return
    navigate(allowChooseTeamMember ? '/client/book/staff' : '/client/book/datetime')
  }

  const formatDuration = (minutes) => {
    const n = Number(minutes) || 0
    if (n <= 0) return ''
    if (n < 60) return `${n} ${t.minutes}`
    const h = Math.floor(n / 60)
    const m = n % 60
    if (m === 0) return `${h} ${h === 1 ? t.hour : t.hours}`
    return `${h} ${t.hour} ${m} ${t.minutes}`
  }

  const sidebar = (
    <BookingSummarySidebar
      t={t}
      locale={locale}
      continueDisabled={!selectedServiceId}
      onContinue={handleContinue}
    />
  )

  return (
    <BookingStepShell
      sidebar={sidebar}
      onContinue={handleContinue}
      continueDisabled={!selectedServiceId}
      continueLabel={t.continue}
    >
      <h1 className={`mb-4 sm:mb-6 ${bookingPageTitleClass}`}>{t.selectServices}</h1>

      {services.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">{t.noServices}</p>
      ) : (
        <ul className="space-y-2.5 sm:space-y-3">
          {services.map((service) => {
            const isSelected = String(selectedServiceId) === String(service.id)
            return (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(service.id)}
                  className={`${bookingCardButtonClass} ${
                    isSelected ? bookingSelectedCardClass : bookingDefaultCardClass
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className="mt-0.5 h-9 w-1 shrink-0 rounded-full sm:mt-1 sm:h-10"
                      style={{ backgroundColor: service.color || BRAND_COLOR }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {service.name}
                      </p>
                      {showDuration && service.duration && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                          {formatDuration(service.duration)}
                        </p>
                      )}
                      {service.notes && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                          {service.notes}
                        </p>
                      )}
                      {showPrices && service.price != null && (
                        <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100 sm:hidden">
                          ₪{service.price}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    {showPrices && service.price != null && (
                      <span className="hidden font-semibold text-gray-900 dark:text-gray-100 sm:inline">
                        ₪{service.price}
                      </span>
                    )}
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-customPink bg-customPink text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {isSelected ? <FiCheck /> : <FiPlus />}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </BookingStepShell>
  )
}

export default function ServicesStep() {
  return (
    <BookingStepGuard requireBusiness>
      <ServicesStepContent />
    </BookingStepGuard>
  )
}
