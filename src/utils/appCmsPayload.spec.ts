import { describe, it, expect } from 'vitest'
import { buildPayload, parsePayload, validateVisualPayload } from './appCmsPayload'

describe('appCmsPayload', () => {
  it('roundtrips payload json', () => {
    const json = buildPayload({ imageUrl: 'https://a.com/x.png', linkUrl: '/p', title: 't' })
    expect(parsePayload(json)).toEqual({
      imageUrl: 'https://a.com/x.png',
      linkUrl: '/p',
      title: 't',
    })
  })

  it('validates image url', () => {
    expect(validateVisualPayload({ imageUrl: '', linkUrl: '', title: '' })).toMatch(/图片/)
    expect(
      validateVisualPayload({
        imageUrl: 'https://b.com/i.jpg',
        linkUrl: '',
        title: '',
      }),
    ).toBeNull()
    expect(
      validateVisualPayload({
        imageUrl: 'pages/home/550e8400-e29b-41d4-a716-446655440000.png',
        linkUrl: '',
        title: '',
      }),
    ).toBeNull()
    expect(
      validateVisualPayload({
        imageUrl: 'not a url',
        linkUrl: '',
        title: '',
      }),
    ).toBeNull()
    expect(
      validateVisualPayload({
        imageUrl: 'javascript:alert(1)',
        linkUrl: '',
        title: '',
      }),
    ).toBe('图片 URL 格式不正确')
    expect(
      validateVisualPayload({
        imageUrl: 'data:image/png;base64,xxx',
        linkUrl: '',
        title: '',
      }),
    ).toBe('图片 URL 格式不正确')
  })
})
