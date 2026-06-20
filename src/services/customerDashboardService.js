import apiClient from '../config/apiClient'
import { getErrorMessage } from './customerAuthService'

export async function getCustomerDashboard() {
  const { data } = await apiClient.get('/customer-auth/dashboard')
  return data?.data ?? data
}

export { getErrorMessage }
