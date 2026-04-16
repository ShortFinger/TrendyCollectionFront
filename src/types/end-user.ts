import type { PageQuery } from './api'

export interface EndUserVO {
  id: string
  nickname?: string
  phone?: string
  paidMoneyTotal?: number
  scoreBalance?: number
  mithrilBalance?: number
  luckyScore?: number
  createTime?: string
  lastActiveTime?: string
}

export interface EndUserQueryRequest extends PageQuery {
  keyword?: string
  userId?: string
  registerStartTime?: string
  registerEndTime?: string
  lastActiveStartTime?: string
  lastActiveEndTime?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}
