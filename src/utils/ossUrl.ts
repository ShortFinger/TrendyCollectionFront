import type { StsTokenResponse } from '@/types/oss'

export function buildPublicUrl(sts: StsTokenResponse, objectKey: string): string {
  const key = objectKey.startsWith('/') ? objectKey.slice(1) : objectKey
  return `https://${sts.bucket}.${sts.region}.aliyuncs.com/${key}`
}
