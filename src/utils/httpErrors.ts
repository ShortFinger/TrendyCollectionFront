import axios from 'axios'

export function isRequestTimeoutError(e: unknown): boolean {
  if (!axios.isAxiosError(e)) return false
  const msg = e.message ?? ''
  return e.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')
}

export function axiosErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: string } | undefined
    return data?.message || e.message || '网络错误'
  }
  if (e instanceof Error) return e.message
  return '网络错误'
}
