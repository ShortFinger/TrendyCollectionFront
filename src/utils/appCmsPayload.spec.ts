import { describe, it, expect } from 'vitest'
import type { SlotTypeCatalogEntry } from '@/types/appCms'
import {
  buildPayload,
  parsePayload,
  validateVisualPayload,
  activityItemModeFromCatalog,
  defaultContentTypeForSlot,
  findCatalogEntry,
  isEnabledCatalogSlot,
  slotLabelFromCatalog,
  buildActivityCardRefPayload,
  parseActivityCardRefPayload,
} from './appCmsPayload'

const sampleCatalog: SlotTypeCatalogEntry[] = [
  {
    code: 'banner_row',
    label: '轮播行',
    defaultContentType: 'banner_slide',
    sortOrder: 10,
    enabled: true,
    editorProfile: 'visual_payload',
  },
  {
    code: 'activity_card_grid',
    label: '活动卡片网格',
    defaultContentType: 'activity_card_ref',
    sortOrder: 30,
    enabled: false,
    editorProfile: 'activity_card_ref',
  },
]

describe('appCmsPayload', () => {
  it('catalog lookups respect enabled and labels', () => {
    expect(slotLabelFromCatalog(sampleCatalog, 'banner_row')).toBe('轮播行')
    expect(slotLabelFromCatalog(sampleCatalog, 'unknown')).toBe('unknown')
    expect(defaultContentTypeForSlot(sampleCatalog, 'banner_row')).toBe('banner_slide')
    expect(isEnabledCatalogSlot(sampleCatalog, 'activity_card_grid')).toBe(false)
    expect(findCatalogEntry(sampleCatalog, 'activity_card_grid')?.label).toBe('活动卡片网格')
    expect(activityItemModeFromCatalog(sampleCatalog, 'banner_row')).toBe(false)
    expect(activityItemModeFromCatalog(sampleCatalog, 'activity_card_grid')).toBe(true)
    expect(activityItemModeFromCatalog(undefined, 'x', 'activity_card_ref')).toBe(true)
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

  it('roundtrips activity_card_ref asset fields', () => {
    const json = buildActivityCardRefPayload({
      activityId: 'a1',
      title: '',
      coverUrl: '',
      tag: '',
      desc: '',
      author: '',
      likes: '',
      jumpType: '',
      jumpUrl: '',
      squareThumb: 'pages/a/square.png',
      longThumb: 'pages/a/long.png',
      lowerLeftCornerMark: 'pages/a/ll.png',
      upperLeftCornerMark: 'pages/a/ul.png',
      lowerRightCornerMark: 'pages/a/lr.png',
      upperRightCornerMark: 'pages/a/ur.png',
      images: 'pages/a/video.mp4',
    })
    expect(parseActivityCardRefPayload(json)).toMatchObject({
      activityId: 'a1',
      squareThumb: 'pages/a/square.png',
      longThumb: 'pages/a/long.png',
      lowerLeftCornerMark: 'pages/a/ll.png',
      upperLeftCornerMark: 'pages/a/ul.png',
      lowerRightCornerMark: 'pages/a/lr.png',
      upperRightCornerMark: 'pages/a/ur.png',
      images: 'pages/a/video.mp4',
    })
  })
})
