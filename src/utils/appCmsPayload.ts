export interface VisualPayload {
  imageUrl: string
  linkUrl: string
  title: string
}

export function defaultPayload(): VisualPayload {
  return { imageUrl: '', linkUrl: '', title: '' }
}

export function buildPayload(form: VisualPayload): string {
  return JSON.stringify(form)
}

export function parsePayload(payload: string | undefined | null): VisualPayload {
  if (!payload || !payload.trim()) return defaultPayload()
  try {
    const o = JSON.parse(payload) as Partial<VisualPayload>
    return {
      imageUrl: o.imageUrl ?? '',
      linkUrl: o.linkUrl ?? '',
      title: o.title ?? '',
    }
  } catch {
    return defaultPayload()
  }
}

const MAX_IMAGE_REF_LEN = 2048

/** Absolute http(s) URL, or OSS object key / path (MediaUpload stores objectKey, not full URL). */
function isValidImageRef(raw: string): boolean {
  const s = raw.trim()
  if (!s || s.length > MAX_IMAGE_REF_LEN) return false
  if (/[\r\n\u0000]/.test(s)) return false
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(s)
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase()
    if (scheme !== 'http' && scheme !== 'https') return false
    try {
      const u = new URL(s)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }
  // Object key or site-relative path: no URL scheme
  return true
}

export function validateVisualPayload(form: VisualPayload): string | null {
  if (!form.imageUrl?.trim()) return '请填写图片或上传'
  if (!isValidImageRef(form.imageUrl)) return '图片 URL 格式不正确'
  return null
}

/** activity_card_ref JSON — no price fields */
export interface ActivityCardRefPayload {
  activityId: string
  title?: string
  coverUrl?: string
  tag?: string
  desc?: string
  author?: string
  likes?: number
  jumpType?: string
  jumpUrl?: string
}

/** Form state for editor (string fields for inputs; likes as string) */
export type ActivityCardRefEditorForm = {
  activityId: string
  title: string
  coverUrl: string
  tag: string
  desc: string
  author: string
  likes: string
  jumpType: string
  jumpUrl: string
}

export function defaultActivityCardRefPayload(): ActivityCardRefEditorForm {
  return {
    activityId: '',
    title: '',
    coverUrl: '',
    tag: '',
    desc: '',
    author: '',
    likes: '',
    jumpType: '',
    jumpUrl: '',
  }
}

export function buildActivityCardRefPayload(form: ActivityCardRefEditorForm): string {
  const id = form.activityId.trim()
  const out: ActivityCardRefPayload = { activityId: id }
  const pick = (s: string) => {
    const t = s.trim()
    return t.length ? t : undefined
  }
  const title = pick(form.title)
  if (title) out.title = title
  const coverUrl = pick(form.coverUrl)
  if (coverUrl) out.coverUrl = coverUrl
  const tag = pick(form.tag)
  if (tag) out.tag = tag
  const desc = pick(form.desc)
  if (desc) out.desc = desc
  const author = pick(form.author)
  if (author) out.author = author
  const jumpType = pick(form.jumpType)
  if (jumpType) out.jumpType = jumpType
  const jumpUrl = pick(form.jumpUrl)
  if (jumpUrl) out.jumpUrl = jumpUrl
  const likesStr = form.likes.trim()
  if (likesStr) {
    const n = Number(likesStr)
    if (!Number.isNaN(n)) out.likes = n
  }
  return JSON.stringify(out)
}

export function parseActivityCardRefPayload(payload: string | undefined | null): ActivityCardRefEditorForm {
  const empty = defaultActivityCardRefPayload()
  if (!payload || !payload.trim()) return empty
  try {
    const o = JSON.parse(payload) as Partial<ActivityCardRefPayload>
    const activityId = typeof o.activityId === 'string' ? o.activityId : ''
    const likes =
      o.likes != null && !Number.isNaN(Number(o.likes)) ? String(Number(o.likes)) : ''
    return {
      activityId,
      title: typeof o.title === 'string' ? o.title : '',
      coverUrl: typeof o.coverUrl === 'string' ? o.coverUrl : '',
      tag: typeof o.tag === 'string' ? o.tag : '',
      desc: typeof o.desc === 'string' ? o.desc : '',
      author: typeof o.author === 'string' ? o.author : '',
      likes,
      jumpType: typeof o.jumpType === 'string' ? o.jumpType : '',
      jumpUrl: typeof o.jumpUrl === 'string' ? o.jumpUrl : '',
    }
  } catch {
    return empty
  }
}

export function validateActivityCardRefPayload(form: ActivityCardRefEditorForm): string | null {
  if (!form.activityId?.trim()) return '请选择活动或填写 activityId'
  return null
}
