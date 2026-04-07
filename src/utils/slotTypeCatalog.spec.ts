import { describe, it, expect } from 'vitest'
import type { SlotTypeCatalogEntry } from '@/types/appCms'
import {
  catalogLabel,
  enabledCatalogForSelect,
  pickDefaultNewSlotType,
} from './slotTypeCatalog'

const sample: SlotTypeCatalogEntry[] = [
  {
    code: 'banner_row',
    label: '轮播行',
    defaultContentType: 'banner_slide',
    sortOrder: 10,
    enabled: true,
  },
  {
    code: 'legacy',
    label: 'Legacy',
    defaultContentType: 'icon_entry',
    sortOrder: 5,
    enabled: false,
  },
  {
    code: 'icon_grid',
    label: '图标宫格',
    defaultContentType: 'icon_entry',
    sortOrder: 20,
    enabled: true,
  },
]

describe('slotTypeCatalog', () => {
  it('enabledCatalogForSelect filters and sorts', () => {
    const rows = enabledCatalogForSelect(sample)
    expect(rows.map((r) => r.code)).toEqual(['banner_row', 'icon_grid'])
  })

  it('catalogLabel falls back to code', () => {
    expect(catalogLabel(sample, 'icon_grid')).toBe('图标宫格')
    expect(catalogLabel(sample, 'unknown')).toBe('unknown')
  })

  it('pickDefaultNewSlotType picks first enabled by sortOrder', () => {
    expect(pickDefaultNewSlotType(sample)).toBe('banner_row')
  })
})
