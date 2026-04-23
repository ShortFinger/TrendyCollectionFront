import type { PageQuery } from './api'

export interface CabinetShipOrderQueryRequest extends PageQuery {
  shipOrderId?: string
  orderNo?: string
  userId?: string
  status?: string
  createdFrom?: string
  createdTo?: string
}

export interface CabinetShipOrderItem {
  shipOrderId: string
  orderNo: string
  userId: string
  status: string
  assetCount: number
  remark?: string
  expressCompany?: string
  trackingNo?: string
  shipRemark?: string
  shippedAt?: string
  shipOperatorId?: string
  shipOperatorName?: string
  createTime: string
  updateTime: string
}

export interface CabinetShipConfirmRequest {
  expressCompany: string
  trackingNo: string
  shipRemark?: string
}

export interface CabinetShipConfirmResponse {
  shipOrderId: string
  orderNo: string
  status: string
  expressCompany: string
  trackingNo: string
  shipRemark?: string
  shippedAt?: string
}

export type CabinetShipActivityType = 'ICHIBAN' | 'UNLIMITED' | 'CARD' | (string & {})

export interface CabinetShipOrderItemDetail {
  skuCode: string
  skuName: string
  skuImage?: string
  quantity: number
  recyclePrice?: number
  originalPrice?: number
  activityId?: string
  activityName?: string
  activityType?: CabinetShipActivityType
}
