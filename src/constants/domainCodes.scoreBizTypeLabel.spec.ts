import { describe, expect, it } from 'vitest'
import {
  ScoreBizTypeCode,
  SCORE_BIZ_TYPE_LABELS,
  scoreBizTypeLabel,
} from './domainCodes'

describe('scoreBizTypeLabel', () => {
  it('maps known biz types to Chinese', () => {
    expect(scoreBizTypeLabel(ScoreBizTypeCode.ORDER_PAY_DEDUCT)).toBe('订单支付扣减')
    expect(scoreBizTypeLabel(ScoreBizTypeCode.REFUND_CREDIT)).toBe('退款返还')
    expect(scoreBizTypeLabel(ScoreBizTypeCode.ADMIN_GRANT)).toBe('后台发放')
    expect(scoreBizTypeLabel(ScoreBizTypeCode.ADMIN_DEDUCT)).toBe('后台扣减')
  })

  it('exposes SCORE_BIZ_TYPE_LABELS aligned with codes', () => {
    expect(SCORE_BIZ_TYPE_LABELS[ScoreBizTypeCode.ORDER_PAY_DEDUCT]).toBe('订单支付扣减')
  })

  it('returns dash for nullish', () => {
    expect(scoreBizTypeLabel(undefined)).toBe('-')
    expect(scoreBizTypeLabel(null)).toBe('-')
  })

  it('falls back to raw string for unknown codes', () => {
    expect(scoreBizTypeLabel('FUTURE_TYPE')).toBe('FUTURE_TYPE')
  })
})
