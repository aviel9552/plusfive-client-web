import {
  fetchPublicBusiness,
  getErrorMessage,
  normalizePublicBusinessData,
  searchPublicBusinesses,
} from '../services/publicBookingService'

export const bookingQueryKeys = {
  catalog: (slug) => ['booking', 'catalog', slug],
  exploreBusinesses: (search, assignedKey = '') => [
    'booking',
    'exploreBusinesses',
    search,
    assignedKey,
  ],
  timeSlots: (params) => ['booking', 'timeSlots', params],
}

export async function fetchBookingCatalog(slug) {
  const raw = await fetchPublicBusiness(slug)
  const normalized = normalizePublicBusinessData(raw)
  if (!normalized) {
    const error = new Error('not_found')
    error.code = 'not_found'
    throw error
  }
  return normalized
}

export function getCatalogQueryError(error) {
  if (error?.code === 'not_found' || error?.response?.status === 404) {
    return 'not_found'
  }
  return getErrorMessage(error)
}

export async function fetchExploreBusinesses(search, assignedBusinesses = []) {
  const result = await searchPublicBusinesses({
    q: search,
    page: 1,
    limit: 30,
  })

  const assignedIds = new Set(assignedBusinesses.map((b) => b.businessId))
  const assignedSlugs = new Set(assignedBusinesses.map((b) => b.businessSlug))

  return (result.businesses || []).filter(
    (b) => !assignedIds.has(b.businessId) && !assignedSlugs.has(b.businessSlug),
  )
}
