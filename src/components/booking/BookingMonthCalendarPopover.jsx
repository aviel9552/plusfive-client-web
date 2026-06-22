import { useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import {
  getBookingMonthMatrix,
  isBookingDateSelectable,
  isDateInMonth,
  isSameCalendarDay,
  resolveBookingTimezone,
} from '../../utils/booking/bookingDateHelpers'

const WEEKDAY_ANCHOR = new Date(2024, 0, 1)

export default function BookingMonthCalendarPopover({
  isOpen,
  onClose,
  anchorRef,
  selectedDate,
  onSelectDate,
  clientPermissions,
  schedulingTimezone,
  locale,
  openCalendarLabel,
  prevMonthLabel,
  nextMonthLabel,
}) {
  const timeZone = resolveBookingTimezone(schedulingTimezone)
  const popoverRef = useRef(null)
  const [viewMonth, setViewMonth] = useState(() => selectedDate || new Date())

  useEffect(() => {
    if (isOpen && selectedDate) {
      setViewMonth(new Date(selectedDate))
    }
  }, [isOpen, selectedDate])

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (popoverRef.current?.contains(event.target)) return
      if (anchorRef?.current?.contains(event.target)) return
      onClose?.()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const day = new Date(WEEKDAY_ANCHOR)
        day.setDate(WEEKDAY_ANCHOR.getDate() + index)
        return day.toLocaleDateString(locale, { weekday: 'short' })
      }),
    [locale],
  )

  const monthDays = useMemo(() => getBookingMonthMatrix(viewMonth), [viewMonth])

  const monthLabel = viewMonth.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  })

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="absolute end-0 top-full z-50 mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-commonBorder dark:bg-[#111111]"
      role="dialog"
      aria-label={openCalendarLabel}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1, 12, 0, 0, 0))
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-50 dark:border-commonBorder dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label={prevMonthLabel}
        >
          <FiChevronLeft />
        </button>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{monthLabel}</p>
        <button
          type="button"
          onClick={() =>
            setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1, 12, 0, 0, 0))
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-50 dark:border-commonBorder dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label={nextMonthLabel}
        >
          <FiChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((label) => (
          <div
            key={label}
            className="py-1 text-[11px] font-medium uppercase tracking-wide text-gray-400"
          >
            {label}
          </div>
        ))}

        {monthDays.map((day) => {
          const inMonth = isDateInMonth(day, viewMonth)
          const selectable = isBookingDateSelectable(day, clientPermissions, timeZone)
          const isSelected = isSameCalendarDay(day, selectedDate)
          const isToday = isSameCalendarDay(day, new Date())

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!selectable}
              onClick={() => {
                if (!selectable) return
                onSelectDate(day)
                onClose?.()
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                !inMonth
                  ? 'text-gray-300 dark:text-gray-600'
                  : !selectable
                    ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                    : isSelected
                      ? 'bg-customPink font-semibold text-white'
                      : isToday
                        ? 'bg-gray-100 font-semibold text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
