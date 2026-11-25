import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('medibook_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      sessionStorage.getItem('medibook_token')
    ) {
      sessionStorage.removeItem('medibook_token')
      sessionStorage.removeItem('medibook_user')
      window.dispatchEvent(new Event('medibook:unauthorized'))
    }

    return Promise.reject(error)
  },
)
