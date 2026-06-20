import { TIME_OPTIONS, getClientPermissionsTimeSlotStepMinutes } from '../../config/bookingConstants';
import { timeToMinutes } from './timeUtils';
import {
  alignMinutesUpToGridStep,
  isSlotStartBlockedByMinAdvance,
  isSlotWallTimeInPastOnToday,
  isSlotWithinMaxAdvanceBooking,
} from '../clientPermissionsBookingWindow';
import {
  formatLocalTime24,
  getSchedulingNowInstant,
  getWeekdayKeyForWallCalendarDate,
  parseUtcInstant,
  resolveSchedulingWallDateKey,
  zonedWallClockToUtc,
  APP_TIMEZONE,
} from '../datetimeUtc';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/**
 * Staff break vs service-duration overlap (public Choose time labels).
 * - startsDuringBreak: slot start is inside break → "Staff break — unavailable"
 * - serviceDurationOverlapsBreak: start before break but end extends into break → short "Overlaps"
 */
export function classifyStaffBreakSlotBlock(startMin, endMin, breakConflicts) {
  if (!breakConflicts?.length) {
    return {
      hasBreakBlock: false,
      startsDuringBreak: false,
      serviceDurationOverlapsBreak: false,
    };
  }

  let overlapsBreak = false;
  let startsDuringBreak = false;

  for (const c of breakConflicts) {
    if (!overlaps(startMin, endMin, c.startMin, c.endMin)) continue;
    overlapsBreak = true;
    if (startMin >= c.startMin && startMin < c.endMin) {
      startsDuringBreak = true;
    }
  }

  return {
    hasBreakBlock: overlapsBreak,
    startsDuringBreak,
    serviceDurationOverlapsBreak: overlapsBreak && !startsDuringBreak,
  };
}

/** @deprecated Use alignMinutesUpToGridStep from clientPermissionsBookingWindow */
export function alignMinutesUpToStep(minutes, step) {
  return alignMinutesUpToGridStep(minutes, step);
}

export function getStaffWorkingOnDate(staffList, date, timeZone) {
  if (!date) return [];
  const dayKey = getWeekdayKeyForWallCalendarDate(date, timeZone);
  return (staffList || []).filter((s) => {
    const wh = s?.workingHours?.[dayKey];
    return Boolean(wh && wh.active !== false && wh.startTime && wh.endTime);
  });
}

export function filterStaffForService(staffList, serviceId) {
  if (!serviceId) return staffList || [];
  return (staffList || []).filter((s) => {
    const ids = s?.serviceIds;
    if (!Array.isArray(ids) || ids.length === 0) return false;
    return ids.some((id) => String(id) === String(serviceId));
  });
}

/** Wall-clock minute ranges for staff breaks on a single day (public booking). */
export function mapBreakRowsToConflictRanges(breakRows, wallDateKey) {
  const dateKey = wallDateKey ? String(wallDateKey).slice(0, 10) : null;
  if (!dateKey) return [];

  return (breakRows || [])
    .filter((row) => {
      const rowDate = row?.breakDate || row?.date;
      if (!rowDate) return false;
      const key = typeof rowDate === 'string' ? rowDate.slice(0, 10) : String(rowDate).slice(0, 10);
      return key === dateKey && row.startTime && row.endTime;
    })
    .map((row) => ({
      startMin: timeToMinutes(row.startTime),
      endMin: timeToMinutes(row.endTime),
      isBreak: true,
    }))
    .filter((c) => c.endMin > c.startMin);
}

export function mapAppointmentsToConflictRanges(appts) {
  return (appts || [])
    .filter((a) => String(a.appointmentStatus || '').toLowerCase() !== 'cancelled')
    .map((a) => {
      const s = parseUtcInstant(a.startDate);
      if (!s) return null;
      const e = parseUtcInstant(a.endDate);
      const dur = Number(a.duration || 0) || 0;
      const endInstant =
        e ||
        (dur ? new Date(s.getTime() + dur * 60000) : new Date(s.getTime() + 60 * 60000));
      const startLabel = formatLocalTime24(s);
      const endLabel = formatLocalTime24(endInstant);
      const startMin = timeToMinutes(startLabel);
      let endMin = timeToMinutes(endLabel);
      if (dur > 0) {
        endMin = Math.max(endMin, startMin + dur);
      }
      return {
        startMin,
        endMin,
      };
    })
    .filter(Boolean);
}

function countBookedMinutes(conflicts) {
  return (conflicts || []).reduce((sum, c) => sum + Math.max(0, c.endMin - c.startMin), 0);
}

/**
 * Union of times across staff; each slot stores staffId (least booked that day).
 * Blocked slots are included as disabled (same UX as manual staff selection).
 */
export function buildMergedAutoStaffTimeSlots({
  candidateStaff,
  selectedDate,
  businessOperatingHours,
  appointmentsByStaffId,
  breaksByStaffId = new Map(),
  bookingClientPermissions,
  slotDuration,
  schedulingTimezone = APP_TIMEZONE,
  service,
}) {
  if (!selectedDate || !candidateStaff?.length) return [];

  const dayKey = getWeekdayKeyForWallCalendarDate(selectedDate, schedulingTimezone);
  const biz = businessOperatingHours?.[dayKey];
  if (!biz || biz.active === false || !biz.startTime || !biz.endTime) return [];

  const durationMinutes = slotDuration > 0 ? slotDuration : 60;
  const minLead = Number(bookingClientPermissions?.minAdvanceBookingMinutes) || 0;
  const maxLead = Number(bookingClientPermissions?.maxAdvanceBookingMinutes) || 30240;
  const step = getClientPermissionsTimeSlotStepMinutes(bookingClientPermissions);
  const nowForWindow = getSchedulingNowInstant(schedulingTimezone);
  const selectedWallDateKey = resolveSchedulingWallDateKey(selectedDate, schedulingTimezone);

  const svcDay = service?.workingHours?.[dayKey];
  let serviceStartMin = 0;
  let serviceEndMin = 24 * 60;
  if (svcDay?.startTime && svcDay?.endTime && svcDay.active !== false) {
    serviceStartMin = alignMinutesUpToStep(timeToMinutes(svcDay.startTime), step);
    serviceEndMin = timeToMinutes(svcDay.endTime);
  }

  const staffWindows = [];
  let unionStart = 24 * 60;
  let unionEnd = 0;

  for (const staffMember of candidateStaff) {
    const staffWH = staffMember?.workingHours?.[dayKey];
    if (!staffWH || staffWH.active === false || !staffWH.startTime || !staffWH.endTime) continue;

    const startWindow = Math.max(
      timeToMinutes(biz.startTime),
      timeToMinutes(staffWH.startTime),
      serviceStartMin,
    );
    const endWindow = Math.min(
      timeToMinutes(biz.endTime),
      timeToMinutes(staffWH.endTime),
      serviceEndMin,
    );
    if (endWindow <= startWindow) continue;

    unionStart = Math.min(unionStart, startWindow);
    unionEnd = Math.max(unionEnd, endWindow);

    const apptConflicts = appointmentsByStaffId.get(String(staffMember.id)) || [];
    const breakConflicts = breaksByStaffId.get(String(staffMember.id)) || [];
    staffWindows.push({
      staffMember,
      startWindow,
      endWindow,
      apptConflicts,
      breakConflicts,
      bookedMinutes: countBookedMinutes(apptConflicts),
    });
  }

  if (!staffWindows.length || unionEnd <= unionStart) return [];

  const wallDateKey = selectedWallDateKey;

  const slotMap = new Map();

  for (const timeStr of TIME_OPTIONS) {
    const startMin = timeToMinutes(timeStr);
    if (startMin % step !== 0) continue;
    if (startMin < unionStart || startMin + durationMinutes > unionEnd) continue;
    if (isSlotWallTimeInPastOnToday(startMin, selectedWallDateKey, schedulingTimezone)) continue;

    const slotDate = zonedWallClockToUtc(wallDateKey, timeStr, schedulingTimezone);
    if (!slotDate) continue;

    const endMin = startMin + durationMinutes;
    const isDisabledByMinAdvance = isSlotStartBlockedByMinAdvance({
      startMin,
      slotDateTime: slotDate,
      minAdvanceMinutes: minLead,
      selectedWallDateKey,
      schedulingTimezone,
      stepMinutes: step,
    });
    if (isDisabledByMinAdvance) continue;

    const isDisabledByMaxAdvance = !isSlotWithinMaxAdvanceBooking(
      slotDate,
      maxLead,
      nowForWindow,
      schedulingTimezone,
    );

    let bestAvailable = null;
    let anyStaffInWindow = false;
    let anyConflict = false;
    let anyOccupied = false;

    for (const {
      staffMember,
      startWindow,
      endWindow,
      apptConflicts,
      breakConflicts,
      bookedMinutes,
    } of staffWindows) {
      if (startMin < startWindow || startMin + durationMinutes > endWindow) continue;
      anyStaffInWindow = true;

      if (isDisabledByMaxAdvance) continue;

      const startsInsideOrAtEnd = apptConflicts.some(
        (c) => startMin >= c.startMin && startMin <= c.endMin
      );
      const hasApptConflict =
        startsInsideOrAtEnd ||
        apptConflicts.some((c) => overlaps(startMin, endMin, c.startMin, c.endMin));
      const breakBlock = classifyStaffBreakSlotBlock(startMin, endMin, breakConflicts);
      const hasBreakConflict = breakBlock.hasBreakBlock;
      const hasConflict = hasApptConflict || hasBreakConflict;

      if (!hasConflict) {
        if (!bestAvailable || bookedMinutes < bestAvailable.bookedMinutes) {
          bestAvailable = { staffId: String(staffMember.id), bookedMinutes };
        }
        continue;
      }

      anyConflict = true;
      if (startsInsideOrAtEnd) anyOccupied = true;
    }

    if (!anyStaffInWindow) continue;

    if (bestAvailable) {
      slotMap.set(timeStr, {
        id: timeStr,
        time: timeStr,
        display: timeStr,
        staffId: bestAvailable.staffId,
        bookedMinutes: bestAvailable.bookedMinutes,
        disabled: false,
        disabledByMinAdvance: false,
        disabledByMaxAdvance: false,
        disabledByConflict: false,
        disabledByOccupied: false,
      });
      continue;
    }

    let disabledByBreak = false;
    let disabledByBreakDurationOverlap = false;
    let disabledByConflict = false;
    if (!isDisabledByMaxAdvance && anyConflict) {
      for (const { breakConflicts, apptConflicts, startWindow, endWindow } of staffWindows) {
        if (startMin < startWindow || startMin + durationMinutes > endWindow) continue;
        const breakBlock = classifyStaffBreakSlotBlock(startMin, endMin, breakConflicts);
        if (breakBlock.startsDuringBreak) disabledByBreak = true;
        if (breakBlock.serviceDurationOverlapsBreak) disabledByBreakDurationOverlap = true;
        if (apptConflicts.some((c) => overlaps(startMin, endMin, c.startMin, c.endMin))) {
          disabledByConflict = true;
        }
      }
    }
    const hasBreakLabel = disabledByBreak || disabledByBreakDurationOverlap;
    const disabledByOccupied =
      disabledByConflict && anyOccupied && !hasBreakLabel;

    slotMap.set(timeStr, {
      id: timeStr,
      time: timeStr,
      display: timeStr,
      staffId: null,
      bookedMinutes: null,
      disabled: isDisabledByMaxAdvance || anyConflict,
      disabledByMinAdvance: false,
      disabledByMaxAdvance: isDisabledByMaxAdvance,
      disabledByBreak,
      disabledByBreakDurationOverlap,
      disabledByConflict: disabledByConflict && !hasBreakLabel,
      disabledByOccupied: disabledByOccupied,
    });
  }

  return [...slotMap.values()].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

/** Pick one staff for the day (fewest booked minutes; must have slots if possible). */
export function pickDefaultAutoStaffForDay({ candidateStaff, appointmentsByStaffId, slots }) {
  if (!candidateStaff?.length) return null;

  const bookedFor = (staffId) =>
    countBookedMinutes(appointmentsByStaffId.get(String(staffId)) || []);

  const bookableSlots = (slots || []).filter((s) => !s.disabled && s.staffId);

  if (bookableSlots.length) {
    const staffWithSlots = new Set(bookableSlots.map((s) => String(s.staffId)));
    let bestId = null;
    let bestBooked = Infinity;
    for (const s of candidateStaff) {
      const id = String(s.id);
      if (!staffWithSlots.has(id)) continue;
      const booked = bookedFor(id);
      if (booked < bestBooked) {
        bestBooked = booked;
        bestId = id;
      }
    }
    if (bestId) return bestId;
    return String(bookableSlots[0].staffId);
  }

  let bestId = String(candidateStaff[0].id);
  let bestBooked = bookedFor(bestId);
  for (const s of candidateStaff) {
    const id = String(s.id);
    const booked = bookedFor(id);
    if (booked < bestBooked) {
      bestBooked = booked;
      bestId = id;
    }
  }
  return bestId;
}

export async function fetchStaffDayAppointments({
  bookingApi,
  isPublic,
  businessPublicSlug,
  staffId,
  selectedDate,
}) {
  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  if (isPublic) {
    const apptResp = await bookingApi.get(
      `/public/business/${encodeURIComponent(businessPublicSlug)}/appointments`,
      {
        params: {
          staffId,
          start: dayStart.toISOString(),
          end: dayEnd.toISOString(),
          limit: 1000,
        },
      }
    );
    const apptsRaw = apptResp?.data?.data?.appointments || apptResp?.data?.data || [];
    return Array.isArray(apptsRaw) ? apptsRaw : [];
  }

  const apptResp = await bookingApi.get('/webhooks/appointments', {
    params: {
      staffId,
      start: dayStart.toISOString(),
      end: dayEnd.toISOString(),
      limit: 1000,
    },
  });
  const apptsRaw = apptResp?.data?.data?.appointments || apptResp?.data?.data || [];
  return Array.isArray(apptsRaw) ? apptsRaw : [];
}

export async function fetchStaffDayBreaks({
  bookingApi,
  isPublic,
  businessPublicSlug,
  staffId,
  selectedDate,
  schedulingTimezone = APP_TIMEZONE,
}) {
  const wallDateKey = resolveSchedulingWallDateKey(selectedDate, schedulingTimezone);
  if (!wallDateKey || !staffId) return [];

  try {
    if (isPublic) {
      const resp = await bookingApi.get(
        `/public/business/${encodeURIComponent(businessPublicSlug)}/break-times`,
        {
          params: {
            staffId,
            startDate: wallDateKey,
            endDate: wallDateKey,
          },
        }
      );
      const rows = resp?.data?.data?.breakTimes ?? resp?.data?.breakTimes ?? [];
      return mapBreakRowsToConflictRanges(Array.isArray(rows) ? rows : [], wallDateKey);
    }

    const resp = await bookingApi.get('/staff/break-times', {
      params: {
        staffId,
        startDate: wallDateKey,
        endDate: wallDateKey,
      },
    });
    const rows = resp?.data?.data?.breakTimes ?? resp?.data?.breakTimes ?? [];
    return mapBreakRowsToConflictRanges(Array.isArray(rows) ? rows : [], wallDateKey);
  } catch (err) {
    console.error('fetchStaffDayBreaks error:', err);
    return [];
  }
}
