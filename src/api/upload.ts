import request from '@/utils/request'
import type { Result } from '@/types/api'

export function uploadImage(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post<any, Result<{ url: string }>>('/admin-api/files/upload', fd)
}
