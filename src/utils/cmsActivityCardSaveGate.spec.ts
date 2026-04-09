import { describe, it, expect } from 'vitest'
import { messageIfActivityInvalidForCmsCardRef } from './cmsActivityCardSaveGate'
import type { ActivityVO } from '@/types/activity'

describe('messageIfActivityInvalidForCmsCardRef', () => {
  it('returns message when activity is off shelf', () => {
    const row = { status: 'OFF_SHELF' } as ActivityVO
    expect(messageIfActivityInvalidForCmsCardRef(row)).toBe(
      '活动未上架，请上架后保存或更换为已上架活动',
    )
  })

  it('returns null when on shelf', () => {
    const row = { status: 'ON_SHELF' } as ActivityVO
    expect(messageIfActivityInvalidForCmsCardRef(row)).toBeNull()
  })
})
