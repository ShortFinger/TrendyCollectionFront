const PAGE_KEY_SEGMENT = /^[a-z0-9_-]{1,64}$/

/** 成功返回规范化路径，失败返回 null */
export function normalizeAppPageUrl(raw: string): string | null {
  let t = raw.trim()
  if (!t) return null
  if (t.startsWith('/')) t = t.slice(1)
  while (t.endsWith('/')) t = t.slice(0, -1)
  if (!t.startsWith('pages/')) return null
  const rest = t.slice('pages/'.length)
  if (!rest) return null
  const parts = t.split('/')
  for (const p of parts) {
    if (!p) return null
    if (p === '..') return null
  }
  return t
}

/** 从已规范化路径取 pages/ 后第一段 */
export function derivePageKeyFromNormalizedPath(normalized: string): string | null {
  const rest = normalized.slice('pages/'.length)
  const first = rest.split('/')[0] ?? ''
  const seg = first.trim().toLowerCase()
  if (!PAGE_KEY_SEGMENT.test(seg)) return null
  return seg
}
