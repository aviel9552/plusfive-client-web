import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DEFAULT_SCHEDULING_TIMEZONE } from '../utils/datetimeUtc'
import {
  bookingQueryKeys,
  fetchBookingCatalog,
  getCatalogQueryError,
} from '../queries/bookingQueries'

const BookingContext = createContext(null)
const BOOKING_DRAFT_KEY = 'client_booking_draft'

function readBookingDraft() {
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeBookingDraft(draft) {
  try {
    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

function clearBookingDraft() {
  try {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY)
  } catch {
    // ignore
  }
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) {
    throw new Error('useBooking must be used within BookingProvider')
  }
  return ctx
}

export function BookingProvider({ children }) {
  const queryClient = useQueryClient()
  const initialDraft = useMemo(() => readBookingDraft(), [])
  const previousBusinessSlugRef = useRef(initialDraft?.selectedBusinessSlug ?? null)

  const [selectedBusinessSlug, setSelectedBusinessSlugState] = useState(
    () => initialDraft?.selectedBusinessSlug ?? null,
  )
  const [selectedBusinessMeta, setSelectedBusinessMeta] = useState(() => ({
    businessId: initialDraft?.selectedBusinessId ?? null,
    businessName: initialDraft?.selectedBusinessName ?? null,
    profileImage: initialDraft?.selectedBusinessImage ?? null,
    isAssigned: initialDraft?.selectedBusinessIsAssigned ?? false,
  }))

  const [selectedServiceId, setSelectedServiceIdState] = useState(
    () => initialDraft?.selectedServiceId ?? null,
  )
  const [selectedStaffId, setSelectedStaffIdState] = useState(
    () => initialDraft?.selectedStaffId ?? null,
  )
  const [selectedDate, setSelectedDateState] = useState(() => {
    const iso = initialDraft?.selectedDate
    return iso ? new Date(iso) : null
  })
  const [selectedTime, setSelectedTimeState] = useState(
    () => initialDraft?.selectedTime ?? null,
  )
  const [notes, setNotesState] = useState(() => initialDraft?.notes ?? '')

  const catalogQuery = useQuery({
    queryKey: bookingQueryKeys.catalog(selectedBusinessSlug),
    queryFn: () => fetchBookingCatalog(selectedBusinessSlug),
    enabled: Boolean(selectedBusinessSlug),
    staleTime: 5 * 60 * 1000,
  })

  const catalog = catalogQuery.data ?? null
  const loading = catalogQuery.isPending && !catalog
  const loadError = catalogQuery.isError ? getCatalogQueryError(catalogQuery.error) : null

  const setSelectedBusiness = useCallback((business) => {
    if (!business?.slug) return
    setSelectedBusinessSlugState(String(business.slug))
    setSelectedBusinessMeta({
      businessId: business.businessId ?? null,
      businessName: business.businessName ?? null,
      profileImage: business.profileImage ?? null,
      isAssigned: Boolean(business.isAssigned),
    })
  }, [])

  const setSelectedServiceId = useCallback((value) => {
    setSelectedServiceIdState(value != null ? String(value) : null)
  }, [])

  const setSelectedStaffId = useCallback((value) => {
    setSelectedStaffIdState(value != null ? String(value) : null)
  }, [])

  const setSelectedDate = useCallback((value) => {
    setSelectedDateState(value ?? null)
  }, [])

  const setSelectedTime = useCallback((value) => {
    setSelectedTimeState(value ?? null)
  }, [])

  const setNotes = useCallback((value) => {
    setNotesState(value ?? '')
  }, [])

  const resetSelection = useCallback(() => {
    setSelectedServiceIdState(null)
    setSelectedStaffIdState(null)
    setSelectedDateState(null)
    setSelectedTimeState(null)
    setNotesState('')
  }, [])

  const resetAll = useCallback(() => {
    const slug = selectedBusinessSlug
    setSelectedBusinessSlugState(null)
    setSelectedBusinessMeta({
      businessId: null,
      businessName: null,
      profileImage: null,
      isAssigned: false,
    })
    resetSelection()
    clearBookingDraft()
    if (slug) {
      queryClient.removeQueries({ queryKey: bookingQueryKeys.catalog(slug) })
    }
  }, [resetSelection, queryClient, selectedBusinessSlug])

  const reloadCatalog = useCallback(() => {
    if (!selectedBusinessSlug) return Promise.resolve()
    return queryClient.invalidateQueries({
      queryKey: bookingQueryKeys.catalog(selectedBusinessSlug),
    })
  }, [queryClient, selectedBusinessSlug])

  useEffect(() => {
    const previousSlug = previousBusinessSlugRef.current
    if (previousSlug != null && previousSlug !== selectedBusinessSlug) {
      resetSelection()
    }
    previousBusinessSlugRef.current = selectedBusinessSlug
  }, [selectedBusinessSlug, resetSelection])

  useEffect(() => {
    if (!catalog?.business?.businessName || selectedBusinessMeta.businessName) return
    setSelectedBusinessMeta((prev) => ({
      ...prev,
      businessName: catalog.business.businessName || catalog.business.name,
      profileImage: prev.profileImage || catalog.business.image || null,
    }))
  }, [catalog, selectedBusinessMeta.businessName])

  useEffect(() => {
    writeBookingDraft({
      selectedBusinessSlug,
      selectedBusinessId: selectedBusinessMeta.businessId,
      selectedBusinessName: selectedBusinessMeta.businessName,
      selectedBusinessImage: selectedBusinessMeta.profileImage,
      selectedBusinessIsAssigned: selectedBusinessMeta.isAssigned,
      selectedServiceId,
      selectedStaffId,
      selectedDate: selectedDate?.toISOString?.() ?? null,
      selectedTime,
      notes,
    })
  }, [
    selectedBusinessSlug,
    selectedBusinessMeta,
    selectedServiceId,
    selectedStaffId,
    selectedDate,
    selectedTime,
    notes,
  ])

  const selectedService = useMemo(
    () =>
      catalog?.services?.find((s) => String(s.id) === String(selectedServiceId)) || null,
    [catalog?.services, selectedServiceId],
  )

  const selectedStaff = useMemo(
    () =>
      catalog?.staff?.find((s) => String(s.id) === String(selectedStaffId)) || null,
    [catalog?.staff, selectedStaffId],
  )

  const allowChooseTeamMember = catalog?.clientPermissions?.allowChooseTeamMember === true
  const allowOnlineBooking = catalog?.clientPermissions?.allowOnlineBooking !== false
  const schedulingTimezone =
    typeof catalog?.schedulingTimezone === 'string' && catalog.schedulingTimezone.trim()
      ? catalog.schedulingTimezone.trim()
      : DEFAULT_SCHEDULING_TIMEZONE

  const value = useMemo(
    () => ({
      loading,
      isFetchingCatalog: catalogQuery.isFetching,
      loadError,
      catalog,
      businessSlug: selectedBusinessSlug,
      selectedBusinessSlug,
      selectedBusinessMeta,
      setSelectedBusiness,
      selectedServiceId,
      setSelectedServiceId,
      selectedStaffId,
      setSelectedStaffId,
      selectedDate,
      setSelectedDate,
      selectedTime,
      setSelectedTime,
      notes,
      setNotes,
      selectedService,
      selectedStaff,
      allowChooseTeamMember,
      allowOnlineBooking,
      schedulingTimezone,
      resetSelection,
      resetAll,
      reloadCatalog,
    }),
    [
      loading,
      catalogQuery.isFetching,
      loadError,
      catalog,
      selectedBusinessSlug,
      selectedBusinessMeta,
      setSelectedBusiness,
      selectedServiceId,
      selectedStaffId,
      selectedDate,
      selectedTime,
      notes,
      selectedService,
      selectedStaff,
      allowChooseTeamMember,
      allowOnlineBooking,
      schedulingTimezone,
      resetSelection,
      resetAll,
      reloadCatalog,
    ],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
