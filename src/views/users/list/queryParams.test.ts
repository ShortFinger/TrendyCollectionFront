import { describe, expect, it } from 'vitest'
import { toUserListQueryParams } from './queryParams'

describe('toUserListQueryParams', () => {
  it('maps page filters and register date range', () => {
    const result = toUserListQueryParams({
      page: 2,
      size: 20,
      keyword: '  alice ',
      userId: '  u1001  ',
      registerTimeRange: ['2026-04-01', '2026-04-14'],
    })

    expect(result).toEqual({
      page: 2,
      size: 20,
      keyword: 'alice',
      userId: 'u1001',
      registerStartTime: '2026-04-01 00:00:00',
      registerEndTime: '2026-04-14 23:59:59',
    })
  })

  it('keeps only pagination when filters are empty', () => {
    const result = toUserListQueryParams({
      page: 1,
      size: 10,
      keyword: '   ',
      userId: '',
      registerTimeRange: null,
    })

    expect(result).toEqual({
      page: 1,
      size: 10,
    })
  })
})
