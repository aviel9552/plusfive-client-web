import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resolveSchedulingWallDateKey } from '../utils/datetimeUtc'
import { bookingQueryKeys } from '../queries/bookingQueries'
import { fetchBookingTimeSlots } from '../queries/fetchBookingTimeSlots'

export default function useBookingTimeSlots({
  businessSlug,
  selectedDate,
  selectedStaffId,
  setSelectedStaffId,
  selectedServiceId,
  selectedTime,
  setSelectedTime,
  services,
  staff,
  businessOperatingHours,
  clientPermissions,
  allowChooseTeamMember,
  schedulingTimezone,
  enabled = true,
}) {
  const dateKey = selectedDate
    ? resolveSchedulingWallDateKey(selectedDate, schedulingTimezone)
    : null

  const slotsQuery = useQuery({
    queryKey: bookingQueryKeys.timeSlots({
      businessSlug,
      dateKey,
      selectedStaffId: allowChooseTeamMember ? selectedStaffId : 'auto',
      selectedServiceId,
      allowChooseTeamMember,
      schedulingTimezone,
    }),
    queryFn: () =>
      fetchBookingTimeSlots({
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
      }),
    enabled: Boolean(enabled && businessSlug && selectedDate && selectedServiceId),
    staleTime: 30 * 1000,
  })

  const availableTimeSlots = useMemo(
    () => slotsQuery.data?.slots ?? [],
    [slotsQuery.data?.slots],
  )

  const defaultStaffId = slotsQuery.data?.defaultStaffId ?? null

  useEffect(() => {
    if (!defaultStaffId) return
    setSelectedStaffId(defaultStaffId)
  }, [defaultStaffId, setSelectedStaffId])

  useEffect(() => {
    if (!selectedTime || !availableTimeSlots.length) return
    const stillValid = availableTimeSlots.some((slot) => slot.id === selectedTime)
    if (!stillValid) {
      setSelectedTime(null)
    }
  }, [availableTimeSlots, selectedTime, setSelectedTime])

  return {
    availableTimeSlots,
    isLoadingTimeSlots: slotsQuery.isPending && !slotsQuery.data,
    isFetchingTimeSlots: slotsQuery.isFetching,
  }
}
