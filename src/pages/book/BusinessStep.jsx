import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiSearch } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerBookingTranslations } from '../../utils/translations'
import {
  fetchExploreBusinesses,
  bookingQueryKeys,
} from '../../queries/bookingQueries'
import { getErrorMessage } from '../../services/publicBookingService'
import BusinessPickerCard from '../../components/booking/BusinessPickerCard'
import BusinessSelectionSidebar from '../../components/booking/BusinessSelectionSidebar'
import BookingStepShell from '../../components/booking/BookingStepShell'
import CommonLoader from '../../components/commonComponent/CommonLoader'
import { useBooking } from '../../context/BookingContext'
import { bookingPageTitleClass } from '../../components/booking/bookingStyles'

function normalizeAssignedBusinesses(user, businesses) {
  const list = Array.isArray(businesses) && businesses.length
    ? businesses
    : user?.businessName
      ? [
          {
            businessId: user.businessId,
            businessName: user.businessName,
            businessSlug: user.businessSlug,
            profileImage: user.businessProfileImage || null,
          },
        ]
      : []

  return list
    .map((b) => ({
      businessId: b.businessId,
      businessName: b.businessName,
      businessSlug: b.businessSlug,
      profileImage: b.profileImage || null,
      address: b.address || null,
      isAssigned: true,
    }))
    .filter((b) => b.businessSlug)
}

export default function BusinessStep() {
  const navigate = useNavigate()
  const { user, businesses } = useAuth()
  const { language } = useLanguage()
  const t = getCustomerBookingTranslations(language)
  const {
    selectedBusinessSlug,
    selectedBusinessMeta,
    setSelectedBusiness,
    resetSelection,
  } = useBooking()

  const assignedBusinesses = useMemo(
    () => normalizeAssignedBusinesses(user, businesses),
    [user, businesses],
  )

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const assignedBusinessKey = useMemo(
    () => assignedBusinesses.map((b) => b.businessId || b.businessSlug).join('|'),
    [assignedBusinesses],
  )

  const exploreQuery = useQuery({
    queryKey: bookingQueryKeys.exploreBusinesses(debouncedSearch, assignedBusinessKey),
    queryFn: () => fetchExploreBusinesses(debouncedSearch, assignedBusinesses),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const exploreBusinesses = exploreQuery.data ?? []
  const exploreLoading = exploreQuery.isPending && exploreBusinesses.length === 0
  const exploreError = exploreQuery.isError
    ? getErrorMessage(exploreQuery.error, t.exploreLoadError)
    : null

  const handleSelect = (business) => {
    if (!business?.businessSlug) return
    resetSelection()
    setSelectedBusiness({
      slug: business.businessSlug,
      businessId: business.businessId,
      businessName: business.businessName,
      profileImage: business.profileImage || null,
      isAssigned: Boolean(business.isAssigned),
    })
  }

  const handleContinue = () => {
    if (!selectedBusinessSlug) {
      toast.error(t.selectBusinessFirst)
      return
    }
    navigate('/client/book/services')
  }

  const selectedBusiness =
    assignedBusinesses.find((b) => b.businessSlug === selectedBusinessSlug) ||
    exploreBusinesses.find((b) => b.businessSlug === selectedBusinessSlug) ||
    (selectedBusinessSlug && selectedBusinessMeta.businessName
      ? {
          businessId: selectedBusinessMeta.businessId,
          businessName: selectedBusinessMeta.businessName,
          profileImage: selectedBusinessMeta.profileImage,
          isAssigned: selectedBusinessMeta.isAssigned,
        }
      : null)

  const sidebar = (
    <BusinessSelectionSidebar
      t={t}
      selectedBusiness={selectedBusiness}
      onContinue={handleContinue}
      continueDisabled={!selectedBusinessSlug}
    />
  )

  return (
    <BookingStepShell
      sidebar={sidebar}
      onContinue={handleContinue}
      continueDisabled={!selectedBusinessSlug}
      continueLabel={t.continue}
    >
      <h1 className={`mb-2 ${bookingPageTitleClass}`}>{t.selectBusiness}</h1>
      <p className="mb-5 text-sm text-gray-600 dark:text-gray-300 sm:mb-6 sm:text-base">
        {t.selectBusinessSubtitle}
      </p>

      {assignedBusinesses.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t.yourBusinesses}
          </h2>
          <ul className="space-y-2.5 sm:space-y-3">
            {assignedBusinesses.map((business) => (
              <li key={business.businessId || business.businessSlug}>
                <BusinessPickerCard
                  business={business}
                  isSelected={selectedBusinessSlug === business.businessSlug}
                  onSelect={handleSelect}
                  badge={t.assignedBadge}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t.exploreBusinesses}
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchBusinessPlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm dark:border-commonBorder dark:bg-[#181818] dark:text-gray-100"
            />
          </div>
        </div>

        {exploreLoading ? (
          <div className="flex justify-center py-10">
            <CommonLoader />
          </div>
        ) : exploreError ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
            {exploreError}
          </p>
        ) : exploreBusinesses.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-300 sm:p-6">
            {debouncedSearch ? t.noBusinessSearchResults : t.noExploreBusinesses}
          </p>
        ) : (
          <ul className="space-y-2.5 sm:space-y-3">
            {exploreBusinesses.map((business) => (
              <li key={business.businessId || business.businessSlug}>
                <BusinessPickerCard
                  business={business}
                  isSelected={selectedBusinessSlug === business.businessSlug}
                  onSelect={handleSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </BookingStepShell>
  )
}
