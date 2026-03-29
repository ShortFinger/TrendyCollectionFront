import type { PageQuery } from './api'

export interface ActivityRecordQueryRequest extends PageQuery {
  activityId?: string
  keyword?: string
  isReceived?: number
  isContinuousDraw?: number
  startTime?: string
  endTime?: string
}

export interface ActivityRecordVO {
  id: string
  activityId: string
  activityTitle: string
  activityType: number
  userId: string
  skuId: string
  skuName: string
  orderId: string
  price: number
  isContinuousDraw: number
  continuousDrawCount: number
  isReceived: number
  receiveTime: string
  createTime: string
}
