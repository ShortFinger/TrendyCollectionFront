import type { SlotTypeCatalogEntry } from '@/types/appCms'

export function findCatalogEntry(
  catalog: SlotTypeCatalogEntry[] | undefined,
  code: string,
): SlotTypeCatalogEntry | undefined {
  return catalog?.find((e) => e.code === code)
}

export function slotLabelFromCatalog(catalog: SlotTypeCatalogEntry[] | undefined, code: string): string {
  return findCatalogEntry(catalog, code)?.label ?? code
}

export function defaultContentTypeForSlot(
  catalog: SlotTypeCatalogEntry[] | undefined,
  code: string,
): string | undefined {
  return findCatalogEntry(catalog, code)?.defaultContentType
}

export function isEnabledCatalogSlot(
  catalog: SlotTypeCatalogEntry[] | undefined,
  code: string,
): boolean {
  const e = findCatalogEntry(catalog, code)
  return !!e?.enabled
}

export function activityItemModeFromCatalog(
  catalog: SlotTypeCatalogEntry[] | undefined,
  slotType: string,
  itemContentType?: string | null,
): boolean {
  if (itemContentType === 'activity_card_ref') return true
  const e = findCatalogEntry(catalog, slotType)
  if (e?.editorProfile === 'activity_card_ref') return true
  return e?.defaultContentType === 'activity_card_ref'
}

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
  tag?: string
  squareThumb?: string
  longThumb?: string
  lowerLeftCornerMark?: string
  upperLeftCornerMark?: string
  lowerRightCornerMark?: string
  upperRightCornerMark?: string
  images?: string
}

/** Form state for editor (string fields for inputs) */
export type ActivityCardRefEditorForm = {
  activityId: string
  title: string
  tag: string
  squareThumb: string
  longThumb: string
  lowerLeftCornerMark: string
  upperLeftCornerMark: string
  lowerRightCornerMark: string
  upperRightCornerMark: string
  images: string
}

export function defaultActivityCardRefPayload(): ActivityCardRefEditorForm {
  return {
    activityId: '',
    title: '',
    tag: '',
    squareThumb: '',
    longThumb: '',
    lowerLeftCornerMark: '',
    upperLeftCornerMark: '',
    lowerRightCornerMark: '',
    upperRightCornerMark: '',
    images: '',
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
  const tag = pick(form.tag)
  if (tag) out.tag = tag
  const squareThumb = pick(form.squareThumb)
  if (squareThumb) out.squareThumb = squareThumb
  const longThumb = pick(form.longThumb)
  if (longThumb) out.longThumb = longThumb
  const lowerLeftCornerMark = pick(form.lowerLeftCornerMark)
  if (lowerLeftCornerMark) out.lowerLeftCornerMark = lowerLeftCornerMark
  const upperLeftCornerMark = pick(form.upperLeftCornerMark)
  if (upperLeftCornerMark) out.upperLeftCornerMark = upperLeftCornerMark
  const lowerRightCornerMark = pick(form.lowerRightCornerMark)
  if (lowerRightCornerMark) out.lowerRightCornerMark = lowerRightCornerMark
  const upperRightCornerMark = pick(form.upperRightCornerMark)
  if (upperRightCornerMark) out.upperRightCornerMark = upperRightCornerMark
  const images = pick(form.images)
  if (images) out.images = images
  return JSON.stringify(out)
}

export function parseActivityCardRefPayload(payload: string | undefined | null): ActivityCardRefEditorForm {
  const empty = defaultActivityCardRefPayload()
  if (!payload || !payload.trim()) return empty
  try {
    const o = JSON.parse(payload) as Partial<ActivityCardRefPayload>
    const activityId = typeof o.activityId === 'string' ? o.activityId : ''
    return {
      activityId,
      title: typeof o.title === 'string' ? o.title : '',
      tag: typeof o.tag === 'string' ? o.tag : '',
      squareThumb: typeof o.squareThumb === 'string' ? o.squareThumb : '',
      longThumb: typeof o.longThumb === 'string' ? o.longThumb : '',
      lowerLeftCornerMark: typeof o.lowerLeftCornerMark === 'string' ? o.lowerLeftCornerMark : '',
      upperLeftCornerMark: typeof o.upperLeftCornerMark === 'string' ? o.upperLeftCornerMark : '',
      lowerRightCornerMark: typeof o.lowerRightCornerMark === 'string' ? o.lowerRightCornerMark : '',
      upperRightCornerMark: typeof o.upperRightCornerMark === 'string' ? o.upperRightCornerMark : '',
      images: typeof o.images === 'string' ? o.images : '',
    }
  } catch {
    return empty
  }
}

export function validateActivityCardRefPayload(form: ActivityCardRefEditorForm): string | null {
  if (!form.activityId?.trim()) return '请选择活动或填写 activityId'
  return null
}
