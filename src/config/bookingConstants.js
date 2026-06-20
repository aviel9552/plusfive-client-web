export const DAYS_OF_WEEK = [
  { key: 'sunday', label: 'ראשון' },
  { key: 'monday', label: 'שני' },
  { key: 'tuesday', label: 'שלישי' },
  { key: 'wednesday', label: 'רביעי' },
  { key: 'thursday', label: 'חמישי' },
  { key: 'friday', label: 'שישי' },
  { key: 'saturday', label: 'שבת' },
]

export const DAYS_OF_WEEK_KEYS = DAYS_OF_WEEK.map((d) => d.key)

export const JS_DAY_TO_HEBREW = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"]

export const HEBREW_TO_DAY_KEY = Object.fromEntries(
  JS_DAY_TO_HEBREW.map((h, i) => [h, DAYS_OF_WEEK_KEYS[i]]),
)

const DAY_LABEL_TO_KEY = Object.fromEntries(
  DAYS_OF_WEEK.map((d) => [d.label, d.key]),
)

export function normalizeDayKey(day) {
  if (day == null || day === '') return null
  const d = String(day).trim()
  const lower = d.toLowerCase()
  if (DAYS_OF_WEEK_KEYS.includes(lower)) return lower
  if (HEBREW_TO_DAY_KEY[d]) return HEBREW_TO_DAY_KEY[d]
  if (DAY_LABEL_TO_KEY[d]) return DAY_LABEL_TO_KEY[d]
  return lower
}

export const TIME_OPTIONS = (() => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  return times
})()

export const CLIENT_PERMISSIONS_TIME_SLOT_INTERVAL_OPTIONS = [
  { value: '5-minutes', label: '5 דקות', stepMinutes: 5 },
  { value: '15-minutes', label: '15 דקות', stepMinutes: 15 },
  { value: '20-minutes', label: '20 דקות', stepMinutes: 20 },
  { value: '30-minutes', label: '30 דקות', stepMinutes: 30 },
  { value: 'hour', label: 'שעה', stepMinutes: 60 },
]

export const CLIENT_PERMISSIONS_DEFAULT_TIME_SLOT_STEP_MINUTES = 20

export function normalizeClientPermissionsTimeSlotInterval(value) {
  const v = String(value || '').trim()
  return v === 'half-hour' ? '30-minutes' : v
}

export function getClientPermissionsTimeSlotStepMinutes(
  intervalValueOrPermissions,
  fallbackMinutes = CLIENT_PERMISSIONS_DEFAULT_TIME_SLOT_STEP_MINUTES,
) {
  const raw =
    intervalValueOrPermissions != null && typeof intervalValueOrPermissions === 'object'
      ? intervalValueOrPermissions.timeSlotInterval
      : intervalValueOrPermissions
  const v = normalizeClientPermissionsTimeSlotInterval(String(raw || '').trim())
  const opt = CLIENT_PERMISSIONS_TIME_SLOT_INTERVAL_OPTIONS.find((o) => o.value === v)
  const n = opt?.stepMinutes
  return typeof n === 'number' && n > 0 ? n : fallbackMinutes
}
