import { useEffect, useMemo, useRef } from 'react'
import {
  isCalendarDateBlockedByMinAdvance,
  isDateWithinMaxAdvanceBooking,
} from '../../utils/clientPermissionsBookingWindow'
import {
  dateAtNoonInTimeZone,
  getSchedulingNowInstant,
  resolveSchedulingWallDateKey,
  DEFAULT_SCHEDULING_TIMEZONE,
} from '../../utils/datetimeUtc'

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(12, 0, 0, 0)
  return d
}

function resolveTimezone(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_SCHEDULING_TIMEZONE
}

function resolveVisibleDays(clientPermissions) {
  const maxAdvance = Number(clientPermissions?.maxAdvanceBookingMinutes) || 30240
  const days = Math.ceil(maxAdvance / (24 * 60)) + 1
  return Math.min(Math.max(days, 21), 90)
}

export default function DateStrip({
  selectedDate,
  onSelectDate,
  clientPermissions,
  schedulingTimezone,
  locale,
  t,
}) {
  const timeZone = resolveTimezone(schedulingTimezone)
  const scrollRef = useRef(null)
  const selectedButtonRef = useRef(null)

  const dates = useMemo(() => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const minAdvance = Number(clientPermissions?.minAdvanceBookingMinutes) || 10
    const maxAdvance = Number(clientPermissions?.maxAdvanceBookingMinutes) || 30240
    const now = getSchedulingNowInstant(timeZone)
    const visibleDays = resolveVisibleDays(clientPermissions)

    return Array.from({ length: visibleDays }, (_, i) => {
      const date = addDays(today, i)
      const cellDateKey = resolveSchedulingWallDateKey(date, timeZone)
      const blockedByMin = isCalendarDateBlockedByMinAdvance(
        cellDateKey,
        minAdvance,
        timeZone,
        now,
      )
      const cellAtNoon = dateAtNoonInTimeZone(cellDateKey, timeZone) || date
      const withinMax = isDateWithinMaxAdvanceBooking(
        cellAtNoon,
        maxAdvance,
        now,
        timeZone,
      )
      return { date, disabled: blockedByMin || !withinMax }
    })
  }, [clientPermissions, timeZone])

  useEffect(() => {
    selectedButtonRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedDate])

  return (
    <div className="min-w-0">
      <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t.selectDate}</p>
      <div
        ref={scrollRef}
        className="flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto scroll-smooth pb-2 pt-1 snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600"
      >
        {dates.map(({ date, disabled }) => {
          const isSelected =
            selectedDate && date.toDateString() === selectedDate.toDateString()
          const weekday = date.toLocaleDateString(locale, { weekday: 'short' })
          const dayNum = date.getDate()
          const month = date.toLocaleDateString(locale, { month: 'short' })

          return (
            <button
              key={date.toISOString()}
              ref={isSelected ? selectedButtonRef : null}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              className={`flex w-[72px] min-w-[72px] shrink-0 snap-start flex-col items-center rounded-xl border px-3 py-3 text-center transition sm:w-[76px] sm:min-w-[76px] ${
                disabled
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-800'
                  : isSelected
                    ? 'border-customPink bg-customPink/10 text-customPink'
                    : 'border-gray-200 bg-white hover:border-customPink/50 dark:border-commonBorder dark:bg-[#181818]'
              }`}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">{weekday}</span>
              <span className="text-lg font-bold">{dayNum}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{month}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
