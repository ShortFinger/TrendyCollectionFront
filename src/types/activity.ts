import type { PageQuery } from './api'

export interface ActivityQueryRequest extends PageQuery {
  keyword?: string
  status?: number
  activityType?: number
}

export interface ActivityVO {
  id: string
  uuid: string
  title: string
  squareThumb: string
  longThumb: string
  lowerLeftCornerMark: string
  upperLeftCornerMark: string
  lowerRightCornerMark: string
  images: string
  moneyPrice: number
  scorePrice: number
  profitRate: number
  visitTotal: number
  perUserLimit: number
  sales: number
  status: number
  multiBuyDiscount: number
  openBoxAnimation: string
  tags: string
  joinUserTotal: number
  isRandomRewardEnabled: number
  activityType: number
  boxCount: number
  /** 是否开启榜单 0/1 */
  rank: number
  amountLimit: number
  specialAreaId: string
  createTime: string
  updateTime: string
}

export interface ActivitySaveRequest {
  title: string
  squareThumb?: string
  longThumb?: string
  lowerLeftCornerMark?: string
  upperLeftCornerMark?: string
  lowerRightCornerMark?: string
  images?: string
  moneyPrice: number
  scorePrice: number
  profitRate?: number
  perUserLimit: number
  multiBuyDiscount?: number
  openBoxAnimation?: string
  tags?: string
  activityType?: number
  boxCount?: number
  rank?: number
  amountLimit?: number
  specialAreaId?: string
  isRandomRewardEnabled?: number
}

export interface ActivityStatusUpdateRequest {
  status: number
}
