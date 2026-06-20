import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

publicApiClient.interceptors.request.use(
  (config) => {
    if (config?.headers?.Authorization) delete config.headers.Authorization
    if (config?.headers?.authorization) delete config.headers.authorization
    return config
  },
  (error) => Promise.reject(error),
)

export default publicApiClient
