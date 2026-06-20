import publicApiClient from '../config/publicApiClient'
import { normalizeDayKey } from '../config/bookingConstants'

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
}

export async function fetchPublicBusiness(slug) {
  const resp = await publicApiClient.get(
    `/public/business/${encodeURIComponent(slug)}`,
  )
  return resp?.data?.data || null
}

export async function searchPublicBusinesses({ q = '', page = 1, limit = 20 } = {}) {
  const resp = await publicApiClient.get('/public/businesses', {
    params: {
      q: q.trim() || undefined,
      page,
      limit,
    },
  })
  const data = resp?.data?.data || resp?.data || {}
  return {
    businesses: Array.isArray(data.businesses) ? data.businesses : [],
    pagination: data.pagination || { page, limit, total: 0, totalPages: 1 },
  }
}

export function normalizePublicBusinessData(data) {
  if (!data?.business) return null

  const services = (Array.isArray(data.services) ? data.services : [])
    .map((s) => ({ ...s, serviceOrder: Number(s?.serviceOrder) || 0 }))
    .sort((a, b) => {
      const orderA = Number(a.serviceOrder) || 0
      const orderB = Number(b.serviceOrder) || 0
      if (orderA !== orderB) return orderA - orderB
      return String(a.name || '').localeCompare(String(b.name || ''))
    })

  const staff = (Array.isArray(data.staff) ? data.staff : []).map((s) => ({
    id: s.id,
    name: s.name || s.fullName || s.firstName || '',
    fullName: s.fullName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
    isActive: s.isActive !== false,
    image: s.image || null,
    imageUrl: s.image || s.imageUrl || null,
    workingHours: s.workingHours || null,
    serviceIds: Array.isArray(s.serviceIds)
      ? s.serviceIds
      : (s.staffServices || [])
          .map((ss) => ss.serviceId || ss.service?.id)
          .filter(Boolean),
  }))

  const rawHours = data.businessOperatingHours
  let businessOperatingHours = null
  if (rawHours && typeof rawHours === 'object' && Object.keys(rawHours).length > 0) {
    businessOperatingHours = {}
    Object.entries(rawHours).forEach(([dayKey, cfg]) => {
      const key = normalizeDayKey(dayKey)
      if (key && cfg) {
        businessOperatingHours[key] = {
          startTime: cfg.startTime ?? null,
          endTime: cfg.endTime ?? null,
          active: cfg.active !== false,
        }
      }
    })
  }

  const rawPermissions = data.clientPermissions
  const clientPermissions =
    rawPermissions && typeof rawPermissions === 'object'
      ? {
          ...rawPermissions,
          allowOnlineBooking: rawPermissions.allowOnlineBooking !== false,
          allowChooseTeamMember: rawPermissions.allowChooseTeamMember === true,
        }
      : { allowOnlineBooking: true, allowChooseTeamMember: false }

  return {
    business: data.business,
    services,
    staff,
    businessOperatingHours,
    clientPermissions,
    schedulingTimezone: data.schedulingTimezone || null,
    gallery: data.gallery || [],
  }
}

export async function createPublicAppointment(slug, payload) {
  const resp = await publicApiClient.post(
    `/public/business/${encodeURIComponent(slug)}/appointments`,
    payload,
  )
  return resp?.data
}

export async function fetchStaffDayAppointments(slug, staffId, start, end) {
  const resp = await publicApiClient.get(
    `/public/business/${encodeURIComponent(slug)}/appointments`,
    {
      params: {
        staffId,
        start: start.toISOString(),
        end: end.toISOString(),
        limit: 1000,
      },
    },
  )
  const raw = resp?.data?.data?.appointments || resp?.data?.data || []
  return Array.isArray(raw) ? raw : []
}

export async function fetchStaffDayBreaks(slug, staffId, startDate) {
  const resp = await publicApiClient.get(
    `/public/business/${encodeURIComponent(slug)}/break-times`,
    {
      params: { staffId, startDate },
    },
  )
  const raw = resp?.data?.data || resp?.data || []
  return Array.isArray(raw) ? raw : []
}
