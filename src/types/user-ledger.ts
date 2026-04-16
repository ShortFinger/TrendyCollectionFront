import type { PageQuery } from '@/types/api'

export interface LedgerListQuery extends PageQuery {
  userId?: string
  bizType?: string
  startTime?: string
  endTime?: string
  keyword?: string
}

export interface LedgerEntryVO {
  id: string
  userId: string
  orderId?: string | null
  bizType: string
  bizNo: string
  changeAmount: number
  beforeBalance: number
  afterBalance: number
  remark?: string | null
  createTime: string
}
