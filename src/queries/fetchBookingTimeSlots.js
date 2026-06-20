import publicApiClient from '../config/publicApiClient'
import { TIME_OPTIONS, getClientPermissionsTimeSlotStepMinutes } from '../config/bookingConstants'
import {
  fetchStaffDayAppointments,
  fetchStaffDayBreaks,
} from '../services/publicBookingService'
import {
  isSlotStartBlockedByMinAdvance,
  isSlotWallTimeInPastOnToday,
  isSlotWithinMaxAdvanceBooking,
  alignMinutesUpToGridStep,
} from '../utils/clientPermissionsBookingWindow'
import {
  buildMergedAutoStaffTimeSlots,
  classifyStaffBreakSlotBlock,
  fetchStaffDayAppointments as fetchStaffApptsUtil,
  fetchStaffDayBreaks as fetchStaffBreaksUtil,
  filterStaffForService,
  getStaffWorkingOnDate,
  mapAppointmentsToConflictRanges,
  pickDefaultAutoStaffForDay,
} from '../utils/calendar/publicAutoStaffBooking'
import { timeToMinutes, minutesToTime } from '../utils/calendar/timeUtils'
import {
  dayBoundsUtcInTimeZone,
  getSchedulingNowInstant,
  getWeekdayKeyForWallCalendarDate,
  resolveSchedulingWallDateKey,
  wallCalendarDateKeyFromDate,
  wallClockTimeLabelInTimeZone,
  zonedWallClockToUtc,
} from '../utils/datetimeUtc'

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart

function resolveMinAdvanceBookingMinutes(permissions) {
  const raw = Number(permissions?.minAdvanceBookingMinutes)
  return Number.isFinite(raw) && raw >= 0 ? raw : 10
}

function resolveMaxAdvanceBookingMinutes(permissions) {
  const raw = Number(permissions?.maxAdvanceBookingMinutes)
  return Number.isFinite(raw) && raw > 0 ? raw : 30240
}

async function fetchAutoStaffSlots({
  businessSlug,
  selectedDate,
  selectedServiceId,
  services,
  staff,
  businessOperatingHours,
  clientPermissions,
  schedulingTimezone,
}) {
  const service = (services || []).find((s) => s.id === selectedServiceId) || null
  const durationMinutes = Number(service?.duration || 0) || 0
  const slotDuration = durationMinutes > 0 ? durationMinutes : 60

  const working = getStaffWorkingOnDate(staff, selectedDate, schedulingTimezone)
  const candidateStaff = filterStaffForService(working, selectedServiceId)

  if (!candidateStaff.length) {
    return { slots: [], defaultStaffId: null }
  }

  const appointmentsByStaffId = new Map()
  const breaksByStaffId = new Map()

  await Promise.all(
    candidateStaff.map(async (staffMember) => {
      const staffKey = String(staffMember.id)
      const [appts, breaks] = await Promise.all([
        fetchStaffApptsUtil({
          bookingApi: publicApiClient,
          isPublic: true,
          businessPublicSlug: businessSlug,
          staffId: staffMember.id,
          selectedDate,
        }),
        fetchStaffBreaksUtil({
          bookingApi: publicApiClient,
          isPublic: true,
          businessPublicSlug: businessSlug,
          staffId: staffMember.id,
          selectedDate,
          schedulingTimezone,
        }),
      ])
      appointmentsByStaffId.set(staffKey, mapAppointmentsToConflictRanges(appts))
      breaksByStaffId.set(staffKey, breaks)
    }),
  )

  const slots = buildMergedAutoStaffTimeSlots({
    candidateStaff,
    selectedDate,
    businessOperatingHours,
    appointmentsByStaffId,
    breaksByStaffId,
    bookingClientPermissions: clientPermissions,
    slotDuration,
    schedulingTimezone,
    service,
  })

  const defaultStaffId = pickDefaultAutoStaffForDay({
    candidateStaff,
    appointmentsByStaffId,
    slots,
  })

  return {
    slots: slots.filter((s) => !s.disabled),
    defaultStaffId: defaultStaffId || null,
  }
}

async function fetchManualStaffSlots({
  businessSlug,
  selectedDate,
  selectedStaffId,
  selectedServiceId,
  services,
  staff,
  businessOperatingHours,
  clientPermissions,
  schedulingTimezone,
}) {
  if (!selectedStaffId) {
    return { slots: [], defaultStaffId: null }
  }

  const service = (services || []).find((s) => s.id === selectedServiceId) || null
  const durationMinutes = Number(service?.duration || 0) || 0
  const slotDuration = durationMinutes > 0 ? durationMinutes : 60

  const dayKey = getWeekdayKeyForWallCalendarDate(selectedDate, schedulingTimezone)
  const biz = businessOperatingHours?.[dayKey]
  const staffMember = (staff || []).find((s) => s.id === selectedStaffId) || null
  const staffWH = staffMember?.workingHours?.[dayKey]

  if (!biz || biz.active === false || !biz.startTime || !biz.endTime) {
    return { slots: [], defaultStaffId: null }
  }
  if (!staffWH || staffWH.active === false || !staffWH.startTime || !staffWH.endTime) {
    return { slots: [], defaultStaffId: null }
  }

  const dayBounds =
    dayBoundsUtcInTimeZone(selectedDate, schedulingTimezone) ||
    dayBoundsUtcInTimeZone(wallCalendarDateKeyFromDate(selectedDate), schedulingTimezone)
  const dayStart = dayBounds?.dayStart ?? new Date(selectedDate)
  const dayEnd = dayBounds?.dayEnd ?? new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const appts = await fetchStaffDayAppointments(
    businessSlug,
    selectedStaffId,
    dayStart,
    dayEnd,
  )

  const wallDateKey = resolveSchedulingWallDateKey(selectedDate, schedulingTimezone)
  const breakRows = await fetchStaffDayBreaks(businessSlug, selectedStaffId, wallDateKey)
  const breakConflicts = breakRows
    .filter((row) => row.startTime && row.endTime)
    .map((row) => ({
      startMin: timeToMinutes(row.startTime),
      endMin: timeToMinutes(row.endTime),
      isBreak: true,
    }))
    .filter((c) => c.endMin > c.startMin)

  const apptConflicts = appts
    .filter((a) => String(a.appointmentStatus || '').toLowerCase() !== 'cancelled')
    .map((a) => {
      const s = a.startDate ? new Date(a.startDate) : null
      if (!s || Number.isNaN(s.getTime())) return null
      const e = a.endDate ? new Date(a.endDate) : null
      const dur = Number(a.duration || 0) || 0
      const end =
        e && !Number.isNaN(e.getTime())
          ? e
          : dur
            ? new Date(s.getTime() + dur * 60000)
            : new Date(s.getTime() + 60 * 60000)
      const startLabel = wallClockTimeLabelInTimeZone(s, schedulingTimezone)
      const endLabel = wallClockTimeLabelInTimeZone(end, schedulingTimezone)
      if (!startLabel || !endLabel) return null
      const startMin = timeToMinutes(startLabel)
      let endMin = timeToMinutes(endLabel)
      if (dur > 0) endMin = Math.max(endMin, startMin + dur)
      else if (endMin <= startMin) endMin = startMin + 15
      return { startMin, endMin }
    })
    .filter(Boolean)

  const step = getClientPermissionsTimeSlotStepMinutes(clientPermissions)
  const svcDay = service?.workingHours?.[dayKey]
  let serviceStartMin = 0
  let serviceEndMin = 24 * 60
  if (svcDay?.startTime && svcDay?.endTime && svcDay.active !== false) {
    serviceStartMin = alignMinutesUpToGridStep(timeToMinutes(svcDay.startTime), step)
    serviceEndMin = timeToMinutes(svcDay.endTime)
  }

  const startWindow = Math.max(
    timeToMinutes(biz.startTime),
    timeToMinutes(staffWH.startTime),
    serviceStartMin,
  )
  const endWindow = Math.min(
    timeToMinutes(biz.endTime),
    timeToMinutes(staffWH.endTime),
    serviceEndMin,
  )

  if (endWindow <= startWindow) {
    return { slots: [], defaultStaffId: null }
  }

  const minLead = resolveMinAdvanceBookingMinutes(clientPermissions)
  const maxLead = resolveMaxAdvanceBookingMinutes(clientPermissions)
  const nowForWindow = getSchedulingNowInstant(schedulingTimezone)
  const selectedWallDateKey = resolveSchedulingWallDateKey(selectedDate, schedulingTimezone)

  const slots = []
  for (const timeStr of TIME_OPTIONS) {
    const startMin = timeToMinutes(timeStr)
    if (startMin % step !== 0) continue
    if (startMin < startWindow || startMin + slotDuration > endWindow) continue
    if (isSlotWallTimeInPastOnToday(startMin, selectedWallDateKey, schedulingTimezone)) {
      continue
    }

    const timeLabel = minutesToTime(startMin)
    const slotDate = zonedWallClockToUtc(selectedWallDateKey, timeLabel, schedulingTimezone)
    if (!slotDate) continue

    const endMin = startMin + slotDuration
    const hasApptConflict = apptConflicts.some((c) =>
      overlaps(startMin, endMin, c.startMin, c.endMin),
    )
    const breakBlock = classifyStaffBreakSlotBlock(startMin, endMin, breakConflicts)
    const hasBreakConflict = breakBlock.hasBreakBlock
    const hasConflict = hasApptConflict || hasBreakConflict

    const isDisabledByMinAdvance = isSlotStartBlockedByMinAdvance({
      startMin,
      slotDateTime: slotDate,
      minAdvanceMinutes: minLead,
      selectedWallDateKey,
      schedulingTimezone,
      stepMinutes: step,
    })
    if (isDisabledByMinAdvance) continue

    const isDisabledByMaxAdvance = !isSlotWithinMaxAdvanceBooking(
      slotDate,
      maxLead,
      nowForWindow,
      schedulingTimezone,
    )

    if (!slots.some((s) => s.id === timeStr)) {
      slots.push({
        id: timeStr,
        time: timeStr,
        display: timeStr,
        disabled: isDisabledByMaxAdvance || hasConflict,
      })
    }
  }

  return {
    slots: slots.filter((s) => !s.disabled),
    defaultStaffId: null,
  }
}

export async function fetchBookingTimeSlots({
  businessSlug,
  selectedDate,
  selectedStaffId,
  selectedServiceId,
  services,
  staff,
  businessOperatingHours,
  clientPermissions,
  allowChooseTeamMember,
  schedulingTimezone,
}) {
  const payload = {
    businessSlug,
    selectedDate,
    selectedServiceId,
    services,
    staff,
    businessOperatingHours,
    clientPermissions,
    schedulingTimezone,
  }

  if (!allowChooseTeamMember) {
    return fetchAutoStaffSlots(payload)
  }

  return fetchManualStaffSlots({
    ...payload,
    selectedStaffId,
  })
}
