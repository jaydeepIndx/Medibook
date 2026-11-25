import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const apiMessage = data?.message ?? data?.error
    if (apiMessage) return apiMessage

    switch (error.response?.status) {
      case 400:
        return 'Please check the information you entered and try again.'
      case 401:
        return 'Your session is invalid or has expired. Please sign in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested item could not be found.'
      case 409:
        return 'This action conflicts with the current state. Please review and try again.'
      default:
        return fallback
    }
  }
  return fallback
}
