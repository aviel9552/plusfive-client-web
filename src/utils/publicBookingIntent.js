const BOOKING_DRAFT_KEY = 'client_booking_draft'

export function primeBookingDraftFromPublic({
  slug,
  businessName,
  profileImage,
  businessId,
  serviceId = null,
}) {
  if (!slug) return
  try {
    const draft = {
      selectedBusinessSlug: slug,
      selectedBusinessName: businessName || null,
      selectedBusinessImage: profileImage || null,
      selectedBusinessId: businessId || null,
      selectedBusinessIsAssigned: false,
      selectedServiceId: serviceId || null,
    }
    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

export function getBusinessOwnerAppUrl() {
  const url = String(import.meta.env.VITE_BUSINESS_APP_URL || import.meta.env.VITE_APP_URL || 'https://app.plusfive.io').trim()
  return url.replace(/\/$/, '')
}

const DEFAULT_REGISTER_PATH = '/אקדמיית-מולר'

export function getBusinessRegisterUrl() {
  const configured = String(import.meta.env.VITE_BUSINESS_REGISTER_URL || '').trim()
  if (configured) return configured
  return `${getBusinessOwnerAppUrl()}${DEFAULT_REGISTER_PATH}`
}
