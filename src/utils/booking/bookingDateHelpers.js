import {
  isCalendarDateBlockedByMinAdvance,
  isDateWithinMaxAdvanceBooking,
} from '../clientPermissionsBookingWindow'
import {
  dateAtNoonInTimeZone,
  getSchedulingNowInstant,
  resolveSchedulingWallDateKey,
  DEFAULT_SCHEDULING_TIMEZONE,
} from '../datetimeUtc'

export function resolveBookingTimezone(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_SCHEDULING_TIMEZONE
}

export function isBookingDateSelectable(date, clientPermissions, timeZone) {
  const tz = resolveBookingTimezone(timeZone)
  const minAdvance = Number(clientPermissions?.minAdvanceBookingMinutes) || 10
  const maxAdvance = Number(clientPermissions?.maxAdvanceBookingMinutes) || 30240
  const now = getSchedulingNowInstant(tz)
  const cellDateKey = resolveSchedulingWallDateKey(date, tz)
  if (!cellDateKey) return false

  const blockedByMin = isCalendarDateBlockedByMinAdvance(cellDateKey, minAdvance, tz, now)
  const cellAtNoon = dateAtNoonInTimeZone(cellDateKey, tz) || date
  const withinMax = isDateWithinMaxAdvanceBooking(cellAtNoon, maxAdvance, now, tz)
  return !blockedByMin && withinMax
}

export function getBookingMonthMatrix(viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1, 12, 0, 0, 0)
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7
  const start = new Date(firstOfMonth)
  start.setDate(firstOfMonth.getDate() - mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    day.setHours(12, 0, 0, 0)
    return day
  })
}

export function isSameCalendarDay(a, b) {
  if (!a || !b) return false
  return a.toDateString() === b.toDateString()
}

export function isDateInMonth(date, viewDate) {
  return date.getFullYear() === viewDate.getFullYear() && date.getMonth() === viewDate.getMonth()
}
