import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerBookingTranslations } from '../../utils/translations'
import useBookingTimeSlots from '../../hooks/useBookingTimeSlots'
import DateStrip from '../../components/booking/DateStrip'
import BookingSummarySidebar from '../../components/booking/BookingSummarySidebar'
import BookingStepShell from '../../components/booking/BookingStepShell'
import CommonLoader from '../../components/commonComponent/CommonLoader'
import { bookingPageTitleClass } from '../../components/booking/bookingStyles'
import { BookingStepGuard } from './BookingLayout'

function DateTimeStepContent() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = getCustomerBookingTranslations(language)
  const locale = language === 'he' ? 'he-IL' : 'en-US'
  const booking = useBooking()
  const {
    businessSlug,
    catalog,
    selectedServiceId,
    selectedStaffId,
    setSelectedStaffId,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    allowChooseTeamMember,
    schedulingTimezone,
  } = booking

  const useAutoStaff = !allowChooseTeamMember || selectedStaffId === 'any'

  const { availableTimeSlots, isLoadingTimeSlots } = useBookingTimeSlots({
    businessSlug,
    selectedDate,
    selectedStaffId: useAutoStaff ? null : selectedStaffId,
    setSelectedStaffId,
    selectedServiceId,
    selectedTime,
    setSelectedTime,
    services: catalog?.services,
    staff: catalog?.staff,
    businessOperatingHours: catalog?.businessOperatingHours,
    clientPermissions: catalog?.clientPermissions,
    allowChooseTeamMember: !useAutoStaff,
    schedulingTimezone,
    enabled: Boolean(selectedDate && selectedServiceId),
  })

  const selectedStaffMember = useMemo(() => {
    if (!allowChooseTeamMember || selectedStaffId === 'any') return null
    return catalog?.staff?.find((s) => String(s.id) === String(selectedStaffId)) || null
  }, [allowChooseTeamMember, selectedStaffId, catalog?.staff])

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return
    navigate('/client/book/confirm')
  }

  const sidebar = (
    <BookingSummarySidebar
      t={t}
      locale={locale}
      continueDisabled={!selectedDate || !selectedTime}
      onContinue={handleContinue}
    />
  )

  return (
    <BookingStepShell
      sidebar={sidebar}
      onContinue={handleContinue}
      continueDisabled={!selectedDate || !selectedTime}
      continueLabel={t.continue}
    >
      <div className="space-y-6 sm:space-y-8">
        <h1 className={bookingPageTitleClass}>{t.selectDateTime}</h1>

        {allowChooseTeamMember && selectedStaffMember && selectedStaffId !== 'any' && (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-commonBorder">
            {(selectedStaffMember.imageUrl || selectedStaffMember.image) && (
              <img
                src={selectedStaffMember.imageUrl || selectedStaffMember.image}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            )}
            <span className="truncate font-medium text-gray-900 dark:text-gray-100">
              {selectedStaffMember.fullName || selectedStaffMember.name}
            </span>
          </div>
        )}

        <DateStrip
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date)
            setSelectedTime(null)
          }}
          clientPermissions={catalog?.clientPermissions}
          schedulingTimezone={schedulingTimezone}
          locale={locale}
          t={t}
        />

        {selectedDate && (
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.selectTime}
            </p>
            {isLoadingTimeSlots ? (
              <div className="flex justify-center py-8">
                <CommonLoader />
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-300 sm:p-6 sm:text-base">
                {t.noSlotsAvailable}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {availableTimeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.id
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedTime(slot.id)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition sm:px-3 sm:py-3 sm:text-sm ${
                        isSelected
                          ? 'border-customPink bg-customPink/10 text-customPink ring-1 ring-customPink'
                          : 'border-gray-200 bg-white hover:border-customPink/50 dark:border-commonBorder dark:bg-[#181818]'
                      }`}
                    >
                      {slot.display || slot.time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </BookingStepShell>
  )
}

export default function DateTimeStep() {
  const { allowChooseTeamMember } = useBooking()

  return (
    <BookingStepGuard requireBusiness requireService requireStaff={allowChooseTeamMember}>
      <DateTimeStepContent />
    </BookingStepGuard>
  )
}
