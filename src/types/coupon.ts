import type { PageQuery } from './api'

export interface CouponTemplateQueryRequest extends PageQuery {
  name?: string
  couponType?: string
  status?: string
}

export interface CouponTemplateVO {
  id: number
  name: string
  couponType: string
  scopeType: string
  scopeIds?: string
  discountValue?: number
  discountCap?: number
  minSpend: number
  exchangeProductId?: number
  exchangeCode?: string
  validityType: string
  validStart?: string
  validEnd?: string
  validDays?: number
  totalCount: number
  claimedCount: number
  perUserLimit: number
  navigateType?: string
  navigatePreset?: string
  navigateUrl?: string
  navigateParams?: string
  status: string
  createTime: string
  updateTime: string
}

export interface CouponTemplateSaveRequest {
  name: string
  couponType: string
  scopeType: string
  scopeIds?: string
  discountValue?: number
  discountCap?: number
  minSpend?: number
  exchangeProductId?: number
  exchangeCode?: string
  validityType: string
  validStart?: string
  validEnd?: string
  validDays?: number
  totalCount: number
  perUserLimit?: number
  navigateType?: string
  navigatePreset?: string
  navigateUrl?: string
  navigateParams?: string
}

export interface CouponDistributeRequest {
  templateId: number
  userIds: string[]
}

export interface CouponRecordVO {
  id: number
  userId: string
  templateId: number
  templateName: string
  couponType: string
  status: string
  claimType: string
  claimTime: string
  validStart: string
  validEnd: string
  usedTime?: string
  orderId?: string
}
