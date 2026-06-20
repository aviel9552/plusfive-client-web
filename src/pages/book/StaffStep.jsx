import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerBookingTranslations } from '../../utils/translations'
import { filterStaffForService, getStaffWorkingOnDate } from '../../utils/calendar/publicAutoStaffBooking'
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

function StaffStepContent() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = getCustomerBookingTranslations(language)
  const locale = language === 'he' ? 'he-IL' : 'en-US'
  const {
    catalog,
    selectedServiceId,
    selectedStaffId,
    setSelectedStaffId,
    setSelectedDate,
    setSelectedTime,
    schedulingTimezone,
  } = useBooking()

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    return d
  }, [])

  const staffOptions = useMemo(() => {
    const working = getStaffWorkingOnDate(catalog?.staff || [], today, schedulingTimezone)
    return filterStaffForService(working, selectedServiceId)
  }, [catalog?.staff, today, schedulingTimezone, selectedServiceId])

  const handleSelect = (staffId) => {
    setSelectedStaffId(staffId)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleContinue = () => {
    if (!selectedStaffId) return
    navigate('/client/book/datetime')
  }

  const sidebar = (
    <BookingSummarySidebar
      t={t}
      locale={locale}
      continueDisabled={!selectedStaffId}
      onContinue={handleContinue}
    />
  )

  return (
    <BookingStepShell
      sidebar={sidebar}
      onContinue={handleContinue}
      continueDisabled={!selectedStaffId}
      continueLabel={t.continue}
    >
      <h1 className={`mb-4 sm:mb-6 ${bookingPageTitleClass}`}>{t.selectStaff}</h1>

      {staffOptions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">{t.noStaff}</p>
      ) : (
        <ul className="space-y-2.5 sm:space-y-3">
          <li>
            <button
              type="button"
              onClick={() => handleSelect('any')}
              className={`${bookingCardButtonClass} ${
                selectedStaffId === 'any' ? bookingSelectedCardClass : bookingDefaultCardClass
              }`}
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{t.noPreference}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  {t.maxAvailability}
                </p>
              </div>
            </button>
          </li>
          {staffOptions.map((member) => {
            const name = member.fullName || member.name
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            const isSelected = String(selectedStaffId) === String(member.id)

            return (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(member.id)}
                  className={`${bookingCardButtonClass} ${
                    isSelected ? bookingSelectedCardClass : bookingDefaultCardClass
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {member.imageUrl || member.image ? (
                      <img
                        src={member.imageUrl || member.image}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-bold sm:h-14 sm:w-14 sm:text-lg"
                        style={{ color: BRAND_COLOR }}
                      >
                        {initials}
                      </div>
                    )}
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
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

export default function StaffStep() {
  const { allowChooseTeamMember } = useBooking()

  if (!allowChooseTeamMember) {
    return <Navigate to="/client/book/datetime" replace />
  }

  return (
    <BookingStepGuard requireBusiness requireService>
      <StaffStepContent />
    </BookingStepGuard>
  )
}
