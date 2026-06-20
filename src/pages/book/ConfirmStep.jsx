import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerBookingTranslations } from '../../utils/translations'
import { createPublicAppointment, getErrorMessage } from '../../services/publicBookingService'
import { formatPhoneForBackend } from '../../utils/phoneHelpers'
import { combineSchedulingDateAndTime } from '../../utils/datetimeUtc'
import { BRAND_COLOR } from '../../utils/constants'
import BookingSummarySidebar from '../../components/booking/BookingSummarySidebar'
import BookingStepShell from '../../components/booking/BookingStepShell'
import { bookingPageTitleClass } from '../../components/booking/bookingStyles'
import { BookingStepGuard } from './BookingLayout'

function ConfirmStepContent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = getCustomerBookingTranslations(language)
  const locale = language === 'he' ? 'he-IL' : 'en-US'
  const [submitting, setSubmitting] = useState(false)
  const {
    businessSlug,
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTime,
    selectedStaffId,
    notes,
    setNotes,
    schedulingTimezone,
    resetAll,
  } = useBooking()

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedStaffId || !businessSlug) {
      toast.error(t.missingDetails)
      return
    }

    const name = user?.fullName || user?.name || ''
    const phoneForBackend = formatPhoneForBackend(user?.phone || '')

    if (!name.trim()) {
      toast.error(t.missingName)
      return
    }
    if (!phoneForBackend) {
      toast.error(t.missingPhone)
      return
    }

    const durationMinutes = Number(selectedService.duration || 0) || 60
    const start = combineSchedulingDateAndTime(selectedDate, selectedTime, schedulingTimezone)
    if (!start) {
      toast.error(t.missingDetails)
      return
    }
    const end = new Date(start.getTime() + durationMinutes * 60000)

    setSubmitting(true)
    try {
      const result = await createPublicAppointment(businessSlug, {
        customerPhone: phoneForBackend,
        customerFullName: name.trim(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        duration: String(durationMinutes),
        staffId: selectedStaffId,
        serviceId: selectedService.id,
        source: 'calendar',
        customerNote: notes.trim() || null,
      })

      toast.success(result?.message || t.bookingSuccess)
      resetAll()
      navigate('/client/appointments', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, t.bookingFailed))
    } finally {
      setSubmitting(false)
    }
  }

  const sidebar = <BookingSummarySidebar t={t} locale={locale} hideAction />

  return (
    <BookingStepShell
      sidebar={sidebar}
      onContinue={handleConfirm}
      continueDisabled={submitting}
      continueLabel={submitting ? t.confirming : t.confirmBooking}
    >
      <h1 className={`mb-2 ${bookingPageTitleClass}`}>{t.confirmTitle}</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 sm:mb-6 sm:text-base">
        {t.confirmSubtitle}
      </p>

      <div className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-commonBorder sm:p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{t.labelService}</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedService?.name}</p>
        </div>
        {selectedStaff && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{t.labelStaff}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {selectedStaff.fullName || selectedStaff.name}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{t.labelWhen}</p>
          <p className="break-words font-medium text-gray-900 dark:text-gray-100">
            {selectedDate?.toLocaleDateString(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            · {selectedTime}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{t.labelCustomer}</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {user?.fullName || user?.name}
          </p>
          <p className="break-all text-sm text-gray-500">{user?.phone}</p>
        </div>
        <div>
          <label htmlFor="booking-notes" className="text-xs uppercase tracking-wide text-gray-500">
            {t.notesLabel}
          </label>
          <textarea
            id="booking-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-commonBorder dark:bg-[#181818] dark:text-gray-100"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={submitting}
        onClick={handleConfirm}
        className="mt-6 hidden w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:min-w-[200px] lg:inline-block lg:w-auto"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        {submitting ? t.confirming : t.confirmBooking}
      </button>
    </BookingStepShell>
  )
}

export default function ConfirmStep() {
  return (
    <BookingStepGuard requireBusiness requireService requireDateTime>
      <ConfirmStepContent />
    </BookingStepGuard>
  )
}
