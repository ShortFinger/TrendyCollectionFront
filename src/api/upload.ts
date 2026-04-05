import request from '@/utils/request'
import type { Result } from '@/types/api'

/**
 * @deprecated 请使用 src/utils/oss.ts 中的 uploadFile 或 uploadCmsFile
 */
export function uploadImage(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post<any, Result<{ url: string }>>('/admin-api/files/upload', fd)
}
