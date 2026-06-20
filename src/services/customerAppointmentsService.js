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

export { getErrorMessage }
