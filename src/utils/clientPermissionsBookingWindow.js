import {
  addDaysToDateKey,
  APP_TIMEZONE,
  dayBoundsUtcInTimeZone,
  getAppWallClockNow,
  getSchedulingNowInstant,
  resolveSchedulingWallDateKey,
  wallClockTimeLabelInTimeZone,
} from './datetimeUtc';

/** Minutes in one calendar day (matches CLIENT_PERMISSIONS_TIME_OPTIONS day multiples). */
export const MINUTES_PER_CALENDAR_DAY = 1440;

/**
 * Day-based limits (יום, 3 ימים, שבוע, …) are stored as N × 1440 minutes.
 * Treat those as N selectable calendar dates starting today (inclusive).
 */
export function isWholeDayAdvanceLimit(maxAdvanceMinutes) {
  const minutes = Number(maxAdvanceMinutes);
  return Number.isFinite(minutes) && minutes >= MINUTES_PER_CALENDAR_DAY && minutes % MINUTES_PER_CALENDAR_DAY === 0;
}

export function alignMinutesUpToGridStep(minutes, step) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return 0;
  if (!step || step <= 0) return minutes;
  return Math.ceil(minutes / step) * step;
}

/** Last millisecond of a wall calendar day in the scheduling timezone. */
export function getEndInstantForWallDateKey(dateKey, schedulingTimezone = APP_TIMEZONE) {
  const bounds = dayBoundsUtcInTimeZone(dateKey, schedulingTimezone);
  if (!bounds?.dayEnd) return null;
  return new Date(bounds.dayEnd.getTime() - 1);
}

/** Last millisecond of the scheduling calendar day that contains `now`. */
export function getEndOfSchedulingWallDayInstant(now = new Date(), schedulingTimezone = APP_TIMEZONE) {
  const todayKey = resolveSchedulingWallDateKey(now, schedulingTimezone);
  return getEndInstantForWallDateKey(todayKey, schedulingTimezone);
}

/** Last allowed wall date (YYYY-MM-DD) for day/week advance limits, inclusive from today. */
export function getLastAllowedWallDateKey(
  maxAdvanceMinutes,
  now = new Date(),
  schedulingTimezone = APP_TIMEZONE,
) {
  const minutes = Number(maxAdvanceMinutes);
  const calendarDays = minutes / MINUTES_PER_CALENDAR_DAY;
  const todayKey = resolveSchedulingWallDateKey(now, schedulingTimezone);
  if (!todayKey || !Number.isFinite(calendarDays) || calendarDays < 1) return todayKey || '';
  return addDaysToDateKey(todayKey, calendarDays - 1);
}

/**
 * Latest moment a customer may book (end of last allowed calendar day, or rolling instant).
 * Hour-based limits (< 24h) stay on today's wall calendar day in the scheduling TZ only.
 */
export function getLatestAllowedBookingInstant(
  maxAdvanceMinutes,
  now = new Date(),
  schedulingTimezone = APP_TIMEZONE,
) {
  const minutes = Number(maxAdvanceMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return getLatestAllowedBookingInstant(30240, now, schedulingTimezone);
  }

  if (isWholeDayAdvanceLimit(minutes)) {
    const lastDayKey = getLastAllowedWallDateKey(minutes, now, schedulingTimezone);
    const endInstant = getEndInstantForWallDateKey(lastDayKey, schedulingTimezone);
    if (endInstant) return endInstant;
    const rolling = new Date(now.getTime() + minutes * 60000);
    return rolling;
  }

  const rolling = new Date(now.getTime() + minutes * 60000);
  const endOfToday = getEndOfSchedulingWallDayInstant(now, schedulingTimezone);
  if (!endOfToday) return rolling;
  return rolling.getTime() <= endOfToday.getTime() ? rolling : endOfToday;
}

/** Whether a calendar date (any time that day) is within the max advance window. */
export function isDateWithinMaxAdvanceBooking(
  date,
  maxAdvanceMinutes,
  now = new Date(),
  schedulingTimezone = APP_TIMEZONE,
) {
  if (isWholeDayAdvanceLimit(maxAdvanceMinutes)) {
    const cellKey = resolveSchedulingWallDateKey(date, schedulingTimezone);
    const { dateKey: todayKey } = getAppWallClockNow(schedulingTimezone);
    const lastKey = getLastAllowedWallDateKey(maxAdvanceMinutes, now, schedulingTimezone);
    if (!cellKey || !todayKey || !lastKey) return false;
    return cellKey >= todayKey && cellKey <= lastKey;
  }

  const cellKey = resolveSchedulingWallDateKey(date, schedulingTimezone);
  const { dateKey: todayKey } = getAppWallClockNow(schedulingTimezone);
  if (!cellKey || !todayKey || cellKey !== todayKey) return false;

  const latest = getLatestAllowedBookingInstant(maxAdvanceMinutes, now, schedulingTimezone);
  return now.getTime() <= latest.getTime();
}

/** Whether a specific slot datetime is within the max advance window. */
export function isSlotWithinMaxAdvanceBooking(
  slotDateTime,
  maxAdvanceMinutes,
  now = new Date(),
  schedulingTimezone = APP_TIMEZONE,
) {
  return (
    slotDateTime.getTime()
    <= getLatestAllowedBookingInstant(maxAdvanceMinutes, now, schedulingTimezone).getTime()
  );
}

/** Earliest instant a customer may start a booking (now + min advance). */
export function getEarliestAllowedBookingInstant(minAdvanceMinutes, now = new Date()) {
  const lead = Number(minAdvanceMinutes);
  const mins = Number.isFinite(lead) && lead >= 0 ? lead : 0;
  return new Date(now.getTime() + mins * 60000);
}

/**
 * Whole calendar day unavailable: earliest bookable instant falls on a later wall date.
 * e.g. min 1440 (1 day) → today disabled; tomorrow+ may still be selectable.
 */
export function isCalendarDateBlockedByMinAdvance(
  wallDateKey,
  minAdvanceMinutes,
  schedulingTimezone = APP_TIMEZONE,
  now = new Date(),
) {
  const lead = Number(minAdvanceMinutes);
  if (!Number.isFinite(lead) || lead <= 0 || !wallDateKey) return false;

  const nowInst = getSchedulingNowInstant(schedulingTimezone);
  const earliest = getEarliestAllowedBookingInstant(lead, nowInst);
  const earliestKey = resolveSchedulingWallDateKey(earliest, schedulingTimezone);
  if (!earliestKey) return false;

  return earliestKey > wallDateKey;
}

export function getSchedulingWallMinutesNow(schedulingTimezone = APP_TIMEZONE) {
  const { dateKey: todayKey, hours, minutes } = getAppWallClockNow(schedulingTimezone);
  return {
    todayKey,
    nowMin: (hours || 0) * 60 + (minutes || 0),
  };
}

export function isSelectedDayTodayInSchedulingTz(selectedWallDateKey, schedulingTimezone = APP_TIMEZONE) {
  const { todayKey } = getSchedulingWallMinutesNow(schedulingTimezone);
  return Boolean(selectedWallDateKey && todayKey && selectedWallDateKey === todayKey);
}

/** Slot start is before current wall-clock on the selected day (today only). */
export function isSlotWallTimeInPastOnToday(startMin, selectedWallDateKey, schedulingTimezone = APP_TIMEZONE) {
  if (typeof startMin !== 'number' || !isSelectedDayTodayInSchedulingTz(selectedWallDateKey, schedulingTimezone)) {
    return false;
  }
  const { nowMin } = getSchedulingWallMinutesNow(schedulingTimezone);
  return startMin < nowMin;
}

/**
 * On "today" in the scheduling TZ: earliest bookable slot start (wall minutes, aligned to grid step).
 * Returns null when the selected day is not today (use UTC instant compare per slot).
 */
export function getEarliestBookableWallMinuteToday(
  selectedWallDateKey,
  minAdvanceMinutes,
  schedulingTimezone = APP_TIMEZONE,
  stepMinutes = 5,
) {
  if (!isSelectedDayTodayInSchedulingTz(selectedWallDateKey, schedulingTimezone)) {
    return null;
  }
  const lead = Number(minAdvanceMinutes);
  const mins = Number.isFinite(lead) && lead >= 0 ? lead : 0;
  const { nowMin } = getSchedulingWallMinutesNow(schedulingTimezone);
  return alignMinutesUpToGridStep(nowMin + mins, stepMinutes);
}

/**
 * Min-advance only: blocks slots in [now, now + minAdvance) on today (not past times).
 * Past slots should be hidden via isSlotWallTimeInPastOnToday, not labeled "too soon".
 */
export function isSlotStartBlockedByMinAdvance({
  startMin,
  slotDateTime,
  minAdvanceMinutes,
  selectedWallDateKey,
  schedulingTimezone = APP_TIMEZONE,
  stepMinutes = 5,
}) {
  if (typeof startMin === 'number' && isSlotWallTimeInPastOnToday(startMin, selectedWallDateKey, schedulingTimezone)) {
    return false;
  }

  const earliestWall = getEarliestBookableWallMinuteToday(
    selectedWallDateKey,
    minAdvanceMinutes,
    schedulingTimezone,
    stepMinutes,
  );
  if (earliestWall != null && typeof startMin === 'number') {
    const { nowMin } = getSchedulingWallMinutesNow(schedulingTimezone);
    if (startMin < nowMin) return false;
    return startMin < earliestWall;
  }
  if (!slotDateTime || Number.isNaN(slotDateTime.getTime())) return true;
  const nowInst = getSchedulingNowInstant(schedulingTimezone);
  const lead = Number(minAdvanceMinutes);
  const mins = Number.isFinite(lead) && lead >= 0 ? lead : 0;
  return slotDateTime.getTime() < nowInst.getTime() + mins * 60000;
}

/** UTC instant compare fallback when wall-minute path is unavailable. */
export function isSlotBlockedByMinAdvanceBooking(
  slotDateTime,
  minAdvanceMinutes,
  schedulingTimezone = APP_TIMEZONE,
) {
  if (!slotDateTime || Number.isNaN(slotDateTime.getTime())) return true;
  const wallDate = resolveSchedulingWallDateKey(slotDateTime, schedulingTimezone);
  const time24 = wallClockTimeLabelInTimeZone(slotDateTime, schedulingTimezone);
  const [hh, mm] = (time24 || '00:00').split(':').map((x) => parseInt(x, 10));
  const startMin = (hh || 0) * 60 + (mm || 0);
  return isSlotStartBlockedByMinAdvance({
    startMin,
    slotDateTime,
    minAdvanceMinutes,
    selectedWallDateKey: wallDate,
    schedulingTimezone,
  });
}
