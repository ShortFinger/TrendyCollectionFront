import { describe, it, expect } from 'vitest'
import {
  buildPayload,
  parsePayload,
  validateVisualPayload,
  CONTENT_TYPE_BY_SLOT,
} from './appCmsPayload'

describe('appCmsPayload', () => {
  it('maps slot types to content types', () => {
    expect(CONTENT_TYPE_BY_SLOT.banner_row).toBe('banner_slide')
    expect(CONTENT_TYPE_BY_SLOT.icon_grid).toBe('icon_entry')
  })

  it('roundtrips payload json', () => {
    const json = buildPayload({ imageUrl: 'https://a.com/x.png', linkUrl: '/p', title: 't' })
    expect(parsePayload(json)).toEqual({
      imageUrl: 'https://a.com/x.png',
      linkUrl: '/p',
      title: 't',
    })
  })

  it('validates image url', () => {
    expect(validateVisualPayload({ imageUrl: '', linkUrl: '', title: '' })).toMatch(/圖片/)
    expect(
      validateVisualPayload({
        imageUrl: 'https://b.com/i.jpg',
        linkUrl: '',
        title: '',
      }),
    ).toBeNull()
  })
})
