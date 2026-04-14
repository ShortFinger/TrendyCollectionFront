import type { PageQuery } from './api'

export interface UserListQueryRequest extends PageQuery {
  keyword?: string
  userId?: string
  registerStartTime?: string
  registerEndTime?: string
}

export interface UserVO {
  id: string
  nickname: string
  phone: string
  paidMoneyTotal: number
  createTime: string
}
