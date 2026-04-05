import type { PageQuery } from './api'

export interface OrderQueryRequest extends PageQuery {
  status?: string
  payStatus?: string
  deliverStatus?: string
  orderType?: string
  keyword?: string
  startTime?: string
  endTime?: string
  minAmount?: number
  maxAmount?: number
}

export interface OrderVO {
  id: string
  number: string
  userId: string
  status: string
  payStatus: string
  deliverStatus: string
  aftersaleStatus: string
  payType: string
  paySubType: string
  productType: string
  orderType: string
  productTotal: number
  skuTotal: number
  productMoneyPrice: number
  productScorePrice: number
  carriage: number
  orderMoneyPrice: number
  orderScorePrice: number
  payMoneyPrice: number
  payScorePrice: number
  createTime: string
  moneyPaidAt: string
  deliveredAt: string
  completedAt: string
  closedAt: string
}

export interface OrderDetailVO extends OrderVO {
  deliverType: number
  remark: string
  scoreDiscount: number
  redpackDiscount: number
  couponDiscount: number
  otherDiscount: number
  otherDiscountRemark: string
  multiBuyMoneyDiscount: number
  multiBuyScoreDiscount: number
  exchangeMoneyDiscount: number
  exchangeScoreDiscount: number
  payNumber: string
  payNumberThird: string
  transactionId: string
  refundedMoney: number
  scoreUsed: number
  couponId: number
  couponType: number
  activityId: number
  activityType: string
  skuTotalAmount: number
  skuTotalScore: number
  confirmedAt: string
  scorePaidAt: string
  commentedAt: string
  autoClosedAt: string
  autoCompletedAt: string
  updateTime: string
}

export interface OrderStatusCountVO {
  unpaidCount: number
  paidCount: number
  shippedCount: number
}

export interface OrderDeliverRequest {
  expressCompany?: string
  expressNo?: string
}

export interface OrderCloseRequest {
  reason?: string
}
