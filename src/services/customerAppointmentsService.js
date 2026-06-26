import apiClient from '../config/apiClient'
import { getErrorMessage } from './customerAuthService'

export async function getCustomerAppointments({
  tab = 'upcoming',
  status = 'all',
  page = 1,
  limit = 10,
} = {}) {
  const { data } = await apiClient.get('/customer-auth/appointments', {
    params: { tab, status, page, limit },
  })
  return data?.data ?? data
}

/**
 * Fetch a paid appointment's Tranzila invoice/receipt PDF as a blob URL.
 * Caller must URL.revokeObjectURL(url) when done.
 */
export async function fetchAppointmentInvoiceBlobUrl(appointmentId, { language } = {}) {
  const id = appointmentId != null ? String(appointmentId).trim() : ''
  if (!id) throw new Error('appointmentId is required')

  const langRaw = language != null ? String(language).trim().toLowerCase() : ''
  const lang = langRaw === 'en' || langRaw === 'eng' || langRaw === 'english' ? 'en' : 'he'

  const response = await apiClient.get(
    `/customer-auth/appointments/${encodeURIComponent(id)}/invoice`,
    {
      params: { language: lang, _: Date.now() },
      responseType: 'blob',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    },
  )

  const raw = response.data
  const blob =
    raw instanceof Blob && raw.type && raw.type !== 'application/octet-stream'
      ? raw
      : new Blob([raw], { type: 'application/pdf' })

  const header = await blob.slice(0, 5).text()
  if (!header.startsWith('%PDF')) {
    let message = 'Server did not return a PDF'
    try {
      const json = JSON.parse(await blob.text())
      if (json?.message) message = String(json.message)
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  return URL.createObjectURL(blob)
}

export { getErrorMessage }
