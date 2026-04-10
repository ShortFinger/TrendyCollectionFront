import { describe, it, expect } from 'vitest'
import type { SlotTypeCatalogEntry } from '@/types/appCms'
import type { CategoryVO } from '@/types/category'
import {
  buildPayload,
  parsePayload,
  validateVisualPayload,
  activityItemModeFromCatalog,
  categoryRefItemModeFromCatalog,
  defaultContentTypeForSlot,
  findCatalogEntry,
  isEnabledCatalogSlot,
  slotLabelFromCatalog,
  buildActivityCardRefPayload,
  parseActivityCardRefPayload,
  buildCategoryRefPayload,
  categoryVoToCategoryRefEditorForm,
  parseCategoryRefPayload,
  validateCategoryRefPayload,
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
  {
    code: 'category_list',
    label: '分类列表',
    defaultContentType: 'category_ref',
    sortOrder: 25,
    enabled: true,
    editorProfile: 'category_ref',
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
    expect(categoryRefItemModeFromCatalog(sampleCatalog, 'category_list')).toBe(true)
    expect(categoryRefItemModeFromCatalog(sampleCatalog, 'banner_row')).toBe(false)
    expect(categoryRefItemModeFromCatalog(undefined, 'x', 'category_ref')).toBe(true)
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
      tag: '',
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

  it('maps CategoryVO to category ref form for payload build', () => {
    const vo: CategoryVO = {
      id: 'cid-1',
      title: ' 潮玩  ',
      squareThumb: ' https://a/x.png ',
      longThumb: '',
      upperLeftCornerMark: '',
      upperRightCornerMark: '',
      lowerLeftCornerMark: '',
      lowerRightCornerMark: '',
      images: '[]',
      status: 'ENABLED',
      createTime: '',
      updateTime: '',
      parentId: null,
    }
    const json = buildCategoryRefPayload(categoryVoToCategoryRefEditorForm(vo))
    const parsed = JSON.parse(json) as { categoryId: string; title?: string; squareThumb?: string }
    expect(parsed.categoryId).toBe('cid-1')
    expect(parsed.title).toBe('潮玩')
    expect(parsed.squareThumb).toBe('https://a/x.png')
  })

  it('roundtrips category_ref overlay fields', () => {
    const json = buildCategoryRefPayload({
      categoryId: 'c1',
      title: 'T',
      squareThumb: 'pages/c/sq.png',
      longThumb: '',
      upperLeftCornerMark: '',
      upperRightCornerMark: '',
      lowerLeftCornerMark: 'pages/c/ll.png',
      lowerRightCornerMark: '',
      images: '',
    })
    expect(parseCategoryRefPayload(json)).toMatchObject({
      categoryId: 'c1',
      title: 'T',
      squareThumb: 'pages/c/sq.png',
      lowerLeftCornerMark: 'pages/c/ll.png',
    })
    expect(validateCategoryRefPayload(parseCategoryRefPayload(json))).toBeNull()
  })

  it('validateCategoryRefPayload rejects long fields', () => {
    const long = 'x'.repeat(2049)
    expect(
      validateCategoryRefPayload({
        categoryId: 'ok',
        title: long,
        squareThumb: '',
        longThumb: '',
        upperLeftCornerMark: '',
        upperRightCornerMark: '',
        lowerLeftCornerMark: '',
        lowerRightCornerMark: '',
        images: '',
      }),
    ).toMatch(/title/)
  })

  it('parse ignores legacy keys on activity_card_ref', () => {
    const raw =
      '{"activityId":"a1","desc":"old","author":"x","likes":3,"jumpType":"page","jumpUrl":"/p","title":"T"}'
    const parsed = parseActivityCardRefPayload(raw)
    expect(parsed.activityId).toBe('a1')
    expect(parsed.title).toBe('T')
    expect(Object.keys(parsed)).not.toContain('desc')
    expect(Object.keys(parsed)).not.toContain('author')
  })
})
