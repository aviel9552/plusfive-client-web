import apiClient from '../config/apiClient'

function getErrorMessage(error, fallback = 'Request failed') {
  return error?.response?.data?.message || error?.message || fallback
}

export async function sendCustomerOtp(email) {
  const { data } = await apiClient.post('/customer-auth/send-otp', { email })
  return data
}

export async function verifyCustomerOtp(email, code) {
  const { data } = await apiClient.post('/customer-auth/verify-otp', { email, code })
  return data
}

export async function selectCustomerBusiness(sessionToken, businessId) {
  const { data } = await apiClient.post('/customer-auth/select-business', {
    sessionToken,
    businessId,
  })
  return data
}

export async function switchCustomerBusiness(businessId) {
  const { data } = await apiClient.post('/customer-auth/switch-business', { businessId })
  return data
}

export async function getCustomerMe() {
  const { data } = await apiClient.get('/customer-auth/me')
  return data
}

export { getErrorMessage }
