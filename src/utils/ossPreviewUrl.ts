import { getOssViewUrl } from '@/api/oss'

/**
 * 管理端图片预览：对象 key → 后端签名 URL（私有 OSS 与商品管理一致）；
 * 已是 http(s) 的地址（含签名参数）则直接使用。
 */
export async function resolveOssObjectToPublicUrl(objectKeyOrUrl: string): Promise<string> {
  const r = objectKeyOrUrl.trim()
  if (!r) return ''
  if (/^https?:\/\//i.test(r)) return r
  const res = await getOssViewUrl(r)
  return res.data?.url?.trim() ?? ''
}
