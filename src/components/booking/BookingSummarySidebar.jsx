import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiStar } from 'react-icons/fi'
import { useBooking } from '../../context/BookingContext'
import { BRAND_COLOR } from '../../utils/constants'

function formatDuration(minutes, t) {
  const n = Number(minutes) || 0
  if (n <= 0) return ''
  if (n < 60) return `${n} ${t.minutes}`
  const h = Math.floor(n / 60)
  const m = n % 60
  if (m === 0) return `${h} ${h === 1 ? t.hour : t.hours}`
  return `${h} ${t.hour} ${m} ${t.minutes}`
}

export default function BookingSummarySidebar({
  t,
  locale,
  continueTo,
  continueDisabled,
  onContinue,
  hideAction = false,
}) {
  const {
    catalog,
    selectedBusinessMeta,
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTime,
    allowChooseTeamMember,
  } = useBooking()

  const business = catalog?.business || (selectedBusinessMeta?.businessName
    ? {
        businessName: selectedBusinessMeta.businessName,
        image: selectedBusinessMeta.profileImage,
      }
    : null)
  const showPrices = catalog?.clientPermissions?.showServicePrices !== false
  const showDuration = catalog?.clientPermissions?.showServiceDuration !== false

  const formattedDate = useMemo(() => {
    if (!selectedDate) return ''
    return selectedDate.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }, [selectedDate, locale])

  const formattedTime = useMemo(() => {
    if (!selectedTime || !selectedDate || !selectedService) return ''
    const duration = Number(selectedService.duration) || 60
    const [h, m] = selectedTime.split(':').map(Number)
    const start = new Date(selectedDate)
    start.setHours(h, m, 0, 0)
    const end = new Date(start.getTime() + duration * 60000)
    const startStr = start.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const endStr = end.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${startStr}–${endStr} (${duration} ${t.minutes})`
  }, [selectedTime, selectedService, selectedDate, locale, t.minutes])

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-commonBorder dark:bg-[#181818] sm:p-5 lg:sticky lg:top-24">
      {business && (
        <div className="mb-4 flex gap-3 border-b border-gray-100 pb-4 dark:border-commonBorder">
          {(business.image || business.coverImage) && (
            <img
              src={business.image || business.coverImage}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
              {business.businessName || business.name}
            </h3>
            {business.rating != null && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <FiStar className="text-amber-500" />
                {Number(business.rating).toFixed(1)}
              </p>
            )}
            {business.address && (
              <p className="mt-1 flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">
                <FiMapPin className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm">
        {selectedService && (
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedService.name}</p>
            {showDuration && (
              <p className="text-gray-500 dark:text-gray-400">
                {formatDuration(selectedService.duration, t)}
                {selectedStaff
                  ? ` · ${t.withStaff.replace('{{name}}', selectedStaff.fullName || selectedStaff.name)}`
                  : allowChooseTeamMember
                    ? ''
                    : ` · ${t.anyProfessional}`}
              </p>
            )}
            {showPrices && selectedService.price != null && (
              <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                ₪{selectedService.price}
              </p>
            )}
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
            <p className="font-medium text-gray-900 dark:text-gray-100">{formattedDate}</p>
            <p className="break-words text-gray-600 dark:text-gray-300">{formattedTime}</p>
          </div>
        )}

        {!selectedService && (
          <p className="text-gray-500 dark:text-gray-400">{t.summaryEmpty}</p>
        )}
      </div>

      {selectedService && showPrices && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-commonBorder">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.total}</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ₪{selectedService.price ?? 0}
          </span>
        </div>
      )}

      {!hideAction && onContinue ? (
        <button
          type="button"
          disabled={continueDisabled}
          onClick={onContinue}
          className={`mt-4 hidden w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition lg:block ${
            continueDisabled
              ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600'
              : 'hover:opacity-90'
          }`}
          style={continueDisabled ? undefined : { backgroundColor: BRAND_COLOR }}
        >
          {t.continue}
        </button>
      ) : !hideAction && continueTo ? (
        <Link
          to={continueTo}
          className={`mt-4 hidden w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition lg:flex ${
            continueDisabled
              ? 'pointer-events-none bg-gray-300 dark:bg-gray-600'
              : 'hover:opacity-90'
          }`}
          style={continueDisabled ? undefined : { backgroundColor: BRAND_COLOR }}
          onClick={(e) => {
            if (continueDisabled) e.preventDefault()
          }}
        >
          {t.continue}
        </Link>
      ) : null}
    </aside>
  )
}
