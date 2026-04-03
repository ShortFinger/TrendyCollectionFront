export type SlotType = 'banner_row' | 'icon_grid'

export const CONTENT_TYPE_BY_SLOT: Record<SlotType, string> = {
  banner_row: 'banner_slide',
  icon_grid: 'icon_entry',
}

export const SLOT_TYPE_LABEL: Record<SlotType, string> = {
  banner_row: '輪播行',
  icon_grid: '圖標宮格',
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

export function validateVisualPayload(form: VisualPayload): string | null {
  if (!form.imageUrl?.trim()) return '請填寫圖片或上傳'
  try {
    new URL(form.imageUrl)
  } catch {
    return '圖片 URL 格式不正確'
  }
  return null
}

export function isSlotType(s: string): s is SlotType {
  return s === 'banner_row' || s === 'icon_grid'
}
