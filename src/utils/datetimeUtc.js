/**
 * UTC storage + Israel (Asia/Jerusalem) timezone for the entire app.
 * - Persist instants as UTC (ISO).
 * - Parse/display calendar wall-clock in APP_TIMEZONE (DST-aware).
 */

export const APP_TIMEZONE =
  import.meta.env.VITE_APP_TIMEZONE || 'Asia/Jerusalem';

/** @deprecated Use APP_TIMEZONE */
export const DEFAULT_SCHEDULING_TIMEZONE = APP_TIMEZONE;

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * @param {Date|string|number|null|undefined} value
 * @returns {Date|null}
 */
export function parseUtcInstant(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {Date|string|number|null|undefined} value
 * @returns {string|null}
 */
export function toUtcIsoString(value) {
  const d = parseUtcInstant(value);
  return d ? d.toISOString() : null;
}

/**
 * HH:mm wall-clock in APP_TIMEZONE (24h).
 * @param {Date|string|number|null|undefined} value
 * @param {string} [timeZone]
 */
export function wallClockTimeLabelInTimeZone(value, timeZone = APP_TIMEZONE) {
  const d = parseUtcInstant(value);
  if (!d) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  let hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  if (hour === '24') hour = '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

/**
 * Wall-clock HH:mm in APP_TIMEZONE (24h).
 * @param {Date|string|number|null|undefined} value
 */
export function formatLocalTime24(value) {
  return wallClockTimeLabelInTimeZone(value, APP_TIMEZONE);
}

/**
 * Localized time label in APP_TIMEZONE (DST-aware).
 * @param {Date|string|number|null|undefined} value
 * @param {{ locale?: string, hour12?: boolean, timeZone?: string }} [options]
 */
export function formatLocalTime(value, options = {}) {
  const d = parseUtcInstant(value);
  if (!d) return '';
  const { locale, hour12 = false, timeZone = APP_TIMEZONE, ...rest } = options;
  return d.toLocaleTimeString(locale ?? undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
    timeZone,
    ...rest,
  });
}

/**
 * Localized date label in APP_TIMEZONE (DST-aware).
 * @param {Date|string|number|null|undefined} value
 * @param {{ locale?: string, dateStyle?: string, timeZone?: string }} [options]
 */
export function formatLocalDate(value, options = {}) {
  const d = parseUtcInstant(value);
  if (!d) return '';
  const { locale, timeZone = APP_TIMEZONE, ...rest } = options;
  return d.toLocaleDateString(locale ?? undefined, { timeZone, ...rest });
}

/**
 * YYYY-MM-DD for a UTC instant in APP_TIMEZONE.
 */
export function calendarDateKeyInTimeZone(value, timeZone = APP_TIMEZONE) {
  const d = parseUtcInstant(value);
  if (!d) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    return null;
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

/**
 * Current wall-clock in APP_TIMEZONE.
 * @returns {{ dateKey: string, time24: string, hours: number, minutes: number }}
 */
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Day index 0=Sun … 6=Sat in APP_TIMEZONE. */
export function getAppDayOfWeekIndex(timeZone = APP_TIMEZONE) {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(new Date());
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
}

/** Weekday key e.g. "sunday" for a date in APP_TIMEZONE. */
export function getAppWeekdayKey(date = new Date(), timeZone = APP_TIMEZONE) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return 'sunday';
  const name = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' })
    .format(d)
    .toLowerCase();
  return WEEKDAY_KEYS.includes(name) ? name : 'sunday';
}

/** Wall YYYY-MM-DD from calendar cell (year, monthIndex 0–11, day 1–31). */
export function wallCalendarDateKeyFromParts(year, monthIndex, dayOfMonth) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(dayOfMonth)}`;
}

/** Wall YYYY-MM-DD from a Date using its local Y/M/D parts (the number shown on the grid). */
export function wallCalendarDateKeyFromDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return wallCalendarDateKeyFromParts(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Weekday for a wall calendar date (API availableDays keys), at noon in timeZone.
 * Avoids wrong day when the Date object is local midnight and TZ would shift the weekday.
 */
export function getWeekdayKeyForWallCalendarDate(date, timeZone = APP_TIMEZONE) {
  const dateKey =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)
      ? date.slice(0, 10)
      : wallCalendarDateKeyFromDate(date);
  if (!dateKey) return 'sunday';
  const noon = zonedWallClockToUtc(dateKey, '12:00', timeZone);
  if (!noon) return 'sunday';
  return getAppWeekdayKey(noon, timeZone);
}

/** Stable Date for a wall calendar day (noon in business TZ). */
export function dateAtNoonInTimeZone(dateKeyOrDate, timeZone = APP_TIMEZONE) {
  const dateKey =
    typeof dateKeyOrDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateKeyOrDate)
      ? dateKeyOrDate.slice(0, 10)
      : wallCalendarDateKeyFromDate(dateKeyOrDate);
  if (!dateKey) return null;
  return zonedWallClockToUtc(dateKey, '12:00', timeZone);
}

export function getAppWallClockNow(timeZone = APP_TIMEZONE) {
  const now = new Date();
  const dateKey = calendarDateKeyInTimeZone(now, timeZone) || '';
  const time24 = wallClockTimeLabelInTimeZone(now, timeZone) || '00:00';
  const [hours, minutes] = time24.split(':').map((n) => parseInt(n, 10));
  return {
    dateKey,
    time24,
    hours: Number.isFinite(hours) ? hours : 0,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

/** UTC instant for current wall-clock in the business scheduling timezone. */
export function getSchedulingNowInstant(timeZone = APP_TIMEZONE) {
  const { dateKey, time24 } = getAppWallClockNow(timeZone);
  const inst = zonedWallClockToUtc(dateKey, time24, timeZone);
  return inst || new Date();
}

/** YYYY-MM-DD wall key for a selected calendar day in the scheduling timezone. */
export function resolveSchedulingWallDateKey(dateInput, timeZone = APP_TIMEZONE) {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    return dateInput.slice(0, 10);
  }
  return calendarDateKeyInTimeZone(dateInput, timeZone) || wallCalendarDateKeyFromDate(dateInput) || '';
}

/**
 * Wall-clock HH:mm in a timezone → UTC Date.
 */
export function zonedWallClockToUtc(dateStr, timeStr, timeZone = APP_TIMEZONE) {
  if (!dateStr || !timeStr) return null;
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  if ([y, mo, d, hh, mm].some((n) => Number.isNaN(n))) return null;

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const readParts = (ms) => {
    const parts = dtf.formatToParts(new Date(ms));
    const pick = (type) => parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
    return {
      y: pick('year'),
      mo: pick('month'),
      d: pick('day'),
      hh: pick('hour'),
      mm: pick('minute'),
    };
  };

  let ms = Date.UTC(y, mo - 1, d, hh, mm, 0);
  for (let i = 0; i < 3; i += 1) {
    const got = readParts(ms);
    const desiredMs = Date.UTC(y, mo - 1, d, hh, mm, 0);
    const gotMs = Date.UTC(got.y, got.mo - 1, got.d, got.hh, got.mm, 0);
    ms += desiredMs - gotMs;
  }
  return new Date(ms);
}

/**
 * Calendar day + HH:mm in APP_TIMEZONE → UTC instant.
 */
export function addDaysToDateKey(dateStr, days) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const next = new Date(Date.UTC(y, mo - 1, d + days));
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

/** UTC bounds [dayStart, dayEnd) for a wall calendar day in a timezone. */
export function dayBoundsUtcInTimeZone(dateInput, timeZone = APP_TIMEZONE) {
  const dateKey =
    typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)
      ? dateInput.slice(0, 10)
      : wallCalendarDateKeyFromDate(dateInput) ||
        calendarDateKeyInTimeZone(dateInput, timeZone);
  if (!dateKey) return null;
  const dayStart = zonedWallClockToUtc(dateKey, '00:00', timeZone);
  const dayEnd = zonedWallClockToUtc(addDaysToDateKey(dateKey, 1), '00:00', timeZone);
  if (!dayStart || !dayEnd) return null;
  return { dayStart, dayEnd, dateKey };
}

export function combineSchedulingDateAndTime(dateInput, timeHHMM, timeZone = APP_TIMEZONE) {
  const dateKey =
    typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)
      ? dateInput.slice(0, 10)
      : wallCalendarDateKeyFromDate(dateInput) ||
        calendarDateKeyInTimeZone(dateInput, timeZone);
  if (!dateKey) return null;
  return zonedWallClockToUtc(dateKey, timeHHMM, timeZone);
}

/**
 * Calendar day + wall-clock HH:mm in APP_TIMEZONE → UTC instant.
 */
export function combineLocalDateAndTime(dateInput, timeHHMM) {
  return combineSchedulingDateAndTime(dateInput, timeHHMM, APP_TIMEZONE);
}

/**
 * UTC instant for a waitlist / booking row (prefers startDateTime).
 */
export function getSchedulingUtcInstant(item) {
  if (!item) return null;
  return parseUtcInstant(item.startDateTime ?? item.requestedDate);
}

/**
 * Display time for waitlist/booking in APP_TIMEZONE.
 */
export function getSchedulingDisplayTime(item, options = {}) {
  const legacy = item?.time;
  if (!legacy || String(legacy).toLowerCase() === 'any') return '';
  if (item?.startDateTime) {
    const instant = getSchedulingUtcInstant(item);
    if (instant) {
      return options.useLocaleFormat
        ? formatLocalTime(instant, options)
        : formatLocalTime24(instant);
    }
  }
  return String(legacy);
}

/**
 * YYYY-MM-DD in APP_TIMEZONE (for calendar grouping).
 */
export function getLocalCalendarDateKey(value) {
  return calendarDateKeyInTimeZone(value, APP_TIMEZONE);
}

/**
 * Build booking/waitlist payload fields from date + time in APP_TIMEZONE.
 */
/** Waitlist create: date only, no specific time (chosen when booking from waitlist). */
export function buildWaitlistDateOnlyPayload(dateInput, timeZone = APP_TIMEZONE) {
  const dateKey =
    resolveSchedulingWallDateKey(dateInput, timeZone) ||
    calendarDateKeyInTimeZone(dateInput, timeZone);
  if (!dateKey) return null;
  const dayStart = zonedWallClockToUtc(dateKey, '00:00', timeZone);
  const iso = toUtcIsoString(dayStart);
  if (!iso) return null;
  return {
    requestedDate: iso,
    startDateTime: null,
    time: 'any',
  };
}

export function buildUtcSchedulingPayload(dateInput, timeHHMM, timeZone = APP_TIMEZONE) {
  if (!timeHHMM || String(timeHHMM).trim().toLowerCase() === 'any') {
    return buildWaitlistDateOnlyPayload(dateInput, timeZone);
  }
  const instant = combineSchedulingDateAndTime(dateInput, timeHHMM, timeZone);
  if (!instant) return null;
  const iso = instant.toISOString();
  return {
    requestedDate: iso,
    startDateTime: iso,
    time: wallClockTimeLabelInTimeZone(instant, timeZone),
  };
}

/** First/last YYYY-MM-DD of the wall month containing centerDateKey (APP_TIMEZONE). */
export function wallMonthBoundsFromCenterKey(centerDateKey, timeZone = APP_TIMEZONE) {
  if (!centerDateKey || !/^\d{4}-\d{2}-\d{2}/.test(centerDateKey)) {
    return { startDateKey: null, endDateKey: null };
  }
  const key = centerDateKey.slice(0, 10);
  const [y, mo] = key.split('-').map(Number);
  const startDateKey = `${y}-${pad2(mo)}-01`;
  const nextMonthKey = mo === 12 ? `${y + 1}-01-01` : `${y}-${pad2(mo + 1)}-01`;
  const endDateKey = addDaysToDateKey(nextMonthKey, -1);
  return { startDateKey, endDateKey };
}

/**
 * UTC ISO bounds for appointment list APIs (inclusive end ms).
 */
export function buildSchedulingApiRangeIso(
  { startDateKey, endDateKey },
  timeZone = APP_TIMEZONE
) {
  const startBounds = dayBoundsUtcInTimeZone(startDateKey, timeZone);
  const endBounds = dayBoundsUtcInTimeZone(endDateKey, timeZone);
  if (!startBounds || !endBounds) return null;
  const endInclusive = new Date(endBounds.dayEnd.getTime() - 1);
  return {
    startISO: toUtcIsoString(startBounds.dayStart),
    endISO: toUtcIsoString(endInclusive),
    startInstant: startBounds.dayStart,
    endInstantExclusive: endBounds.dayEnd,
  };
}
