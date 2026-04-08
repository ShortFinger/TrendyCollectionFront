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

/** 私有桶：对象 key → 带 Expires/Signature 的可访问 URL（与商品图 VO 一致） */
export function getOssViewUrl(key: string) {
  return request.get<any, Result<{ url: string }>>('/admin-api/oss/view-url', {
    params: { key },
  })
}

export function getCmsStsToken(pageKey: string) {
  return request.post<any, Result<StsTokenResponse>>(
    '/admin-api/app-cms/oss/sts-token',
    null,
    { params: { pageKey } }
  )
}

export interface OssMoveRequest {
  tempId: string
  targetDir: string
  fields: string[]
}

export interface OssMoveResponse {
  movedKeys: Record<string, string>
  errors: Record<string, string>
}

export function moveFiles(data: OssMoveRequest) {
  return request.post<any, Result<OssMoveResponse>>(
    '/admin-api/oss/move',
    data
  )
}
