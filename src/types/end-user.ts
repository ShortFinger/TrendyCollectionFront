import type { PageQuery } from './api'

export interface EndUserVO {
  id: string
  nickname?: string
  phone?: string
  balance: number
  createTime?: string
}

export interface EndUserQueryRequest extends PageQuery {
  keyword?: string
  userId?: string
  registerStartTime?: string
  registerEndTime?: string
}
