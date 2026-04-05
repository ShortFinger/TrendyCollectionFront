import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { StsTokenResponse } from '@/types/oss'

export function getStsToken(dir: string) {
  return request.post<any, Result<StsTokenResponse>>(
    '/admin-api/oss/sts-token',
    null,
    { params: { dir } }
  )
}

export function getCmsStsToken(pageKey: string) {
  return request.post<any, Result<StsTokenResponse>>(
    '/admin-api/app-cms/oss/sts-token',
    null,
    { params: { pageKey } }
  )
}
