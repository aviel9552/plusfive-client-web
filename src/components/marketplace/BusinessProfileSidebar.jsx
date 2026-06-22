import { useState } from 'react'
import { FiChevronDown, FiClock, FiMapPin } from 'react-icons/fi'
import {
  buildOpeningHoursRows,
  getOpenStatus,
} from '../../utils/marketplace/businessProfileHelpers'

export default function BusinessProfileSidebar({
  name,
  allowBooking,
  showBookingUnavailable = false,
  bookNowLabel,
  bookLabel,
  bookingUnavailableLabel,
  businessOperatingHours,
  address,
  locationLink,
  language,
  t,
  onBook,
  className = '',
}) {
  const [hoursOpen, setHoursOpen] = useState(false)
  const openStatus = getOpenStatus(businessOperatingHours, language, t)
  const hoursRows = buildOpeningHoursRows(businessOperatingHours, language)

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#111111] ${className}`}
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h2>

      {allowBooking ? (
        <button
          type="button"
          onClick={() => onBook()}
          className="mt-4 w-full rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900"
        >
          {bookNowLabel}
        </button>
      ) : showBookingUnavailable ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{bookingUnavailableLabel}</p>
      ) : null}

      {openStatus.label ? (
        <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setHoursOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 text-left text-sm text-gray-800 dark:text-gray-200"
          >
            <span className="inline-flex items-center gap-2">
              <FiClock className="shrink-0 text-gray-500" />
              {openStatus.isOpen ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {openStatus.label}
                </span>
              ) : (
                openStatus.label
              )}
            </span>
            <FiChevronDown
              className={`shrink-0 transition-transform ${hoursOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {hoursOpen && hoursRows.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {hoursRows.map((row) => (
                <li key={row.dayKey} className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {row.isClosed ? '—' : row.hours}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {address ? (
        <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
          <FiMapPin className="mt-0.5 shrink-0 text-gray-500" />
          <div>
            <p className="text-gray-800 dark:text-gray-200">{address}</p>
            {locationLink ? (
              <a
                href={locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {t.getDirections}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {allowBooking ? (
        <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {t.instantConfirmation}
        </p>
      ) : null}
    </div>
  )
}
