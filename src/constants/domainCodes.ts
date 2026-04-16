/** Backend VARCHAR enum codes — keep in sync with SQL migrations / Java enums. */

export const ActivityListingStatus = {
  OFF_SHELF: 'OFF_SHELF',
  ON_SHELF: 'ON_SHELF',
} as const

export const ActivityTypeCode = {
  LUCKY_BAG: 'LUCKY_BAG',
  COMBO_DRAW: 'COMBO_DRAW',
  EUROPEAN: 'EUROPEAN',
  ENERGY_POOL: 'ENERGY_POOL',
  CARD: 'CARD',
  ICHIBAN: 'ICHIBAN',
  UNLIMITED: 'UNLIMITED',
} as const

export const MithrilBizTypeCode = {
  PAY: 'PAY',
  REFUND: 'REFUND',
  PRIZE_SMELT: 'PRIZE_SMELT',
} as const

export const ScoreBizTypeCode = {
  ORDER_PAY_DEDUCT: 'ORDER_PAY_DEDUCT',
  REFUND_CREDIT: 'REFUND_CREDIT',
  ADMIN_GRANT: 'ADMIN_GRANT',
  ADMIN_DEDUCT: 'ADMIN_DEDUCT',
} as const

export const BoxStatusCode = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SOLD_OUT: 'SOLD_OUT',
} as const

export const SkuMarketActivityType = {
  LOTTERY: 'LOTTERY',
  BLIND_BOX: 'BLIND_BOX',
} as const

export const SkuListingStatus = {
  OFF_SHELF: 'OFF_SHELF',
  ON_SHELF: 'ON_SHELF',
  PENDING_LISTING: 'PENDING_LISTING',
} as const

export const ProductListingStatus = {
  OFF_SHELF: 'OFF_SHELF',
  ON_SHELF: 'ON_SHELF',
  PENDING_LISTING: 'PENDING_LISTING',
} as const

export const CategoryEnableStatus = {
  DISABLED: 'DISABLED',
  ENABLED: 'ENABLED',
} as const

export const PermissionTypeCode = {
  MENU: 'MENU',
  PAGE: 'PAGE',
  BUTTON: 'BUTTON',
} as const

export const PayStatusCode = {
  UNPAID: 'UNPAID',
  PAYMENT_CONFIRMING: 'PAYMENT_CONFIRMING',
  PAID: 'PAID',
  NO_PAYMENT_REQUIRED: 'NO_PAYMENT_REQUIRED',
} as const

export const DeliverStatusCode = {
  PENDING_SHIPMENT: 'PENDING_SHIPMENT',
  STOCKING: 'STOCKING',
  PARTIALLY_SHIPPED: 'PARTIALLY_SHIPPED',
  SHIPPED: 'SHIPPED',
  OFFLINE_VERIFIED: 'OFFLINE_VERIFIED',
  NO_SHIPMENT_REQUIRED: 'NO_SHIPMENT_REQUIRED',
} as const

export const OrderStatusCode = {
  UNCONFIRMED: 'UNCONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  CANCEL_PENDING_UNSHIPPED: 'CANCEL_PENDING_UNSHIPPED',
  AFTERSALE_PENDING: 'AFTERSALE_PENDING',
  AFTERSALE_DONE: 'AFTERSALE_DONE',
  PENDING_PROCESS: 'PENDING_PROCESS',
  RESOLD: 'RESOLD',
  COMPLETED: 'COMPLETED',
} as const

const PAY_STATUS_LABELS: Record<string, string> = {
  [PayStatusCode.UNPAID]: '未支付',
  [PayStatusCode.PAYMENT_CONFIRMING]: '确认中',
  [PayStatusCode.PAID]: '已付款',
  [PayStatusCode.NO_PAYMENT_REQUIRED]: '免支付',
}

const DELIVER_STATUS_LABELS: Record<string, string> = {
  [DeliverStatusCode.PENDING_SHIPMENT]: '待发货',
  [DeliverStatusCode.STOCKING]: '备货中',
  [DeliverStatusCode.PARTIALLY_SHIPPED]: '部分发货',
  [DeliverStatusCode.SHIPPED]: '已发货',
  [DeliverStatusCode.OFFLINE_VERIFIED]: '线下核销',
  [DeliverStatusCode.NO_SHIPMENT_REQUIRED]: '无需发货',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  [OrderStatusCode.UNCONFIRMED]: '未确认',
  [OrderStatusCode.IN_PROGRESS]: '进行中',
  [OrderStatusCode.CLOSED]: '已关闭',
  [OrderStatusCode.CANCEL_PENDING_UNSHIPPED]: '取消待发货',
  [OrderStatusCode.AFTERSALE_PENDING]: '售后处理中',
  [OrderStatusCode.AFTERSALE_DONE]: '售后完成',
  [OrderStatusCode.PENDING_PROCESS]: '待处理',
  [OrderStatusCode.RESOLD]: '已转售',
  [OrderStatusCode.COMPLETED]: '已完成',
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  [ActivityTypeCode.LUCKY_BAG]: '福袋',
  [ActivityTypeCode.COMBO_DRAW]: '连击赏',
  [ActivityTypeCode.EUROPEAN]: '欧皇',
  [ActivityTypeCode.ENERGY_POOL]: '能量池',
  [ActivityTypeCode.CARD]: '卡牌',
  [ActivityTypeCode.ICHIBAN]: '一番赏',
  [ActivityTypeCode.UNLIMITED]: '无限赏',
}

export const MITHRIL_BIZ_TYPE_LABELS: Record<string, string> = {
  [MithrilBizTypeCode.PAY]: '支付入账',
  [MithrilBizTypeCode.REFUND]: '退款扣减',
  [MithrilBizTypeCode.PRIZE_SMELT]: '奖品熔炼',
}

export const SCORE_BIZ_TYPE_LABELS: Record<string, string> = {
  [ScoreBizTypeCode.ORDER_PAY_DEDUCT]: '订单支付扣减',
  [ScoreBizTypeCode.REFUND_CREDIT]: '退款返还',
  [ScoreBizTypeCode.ADMIN_GRANT]: '后台发放',
  [ScoreBizTypeCode.ADMIN_DEDUCT]: '后台扣减',
}

const MANUAL_DELIVER = new Set<string>([
  DeliverStatusCode.PENDING_SHIPMENT,
  DeliverStatusCode.STOCKING,
  DeliverStatusCode.PARTIALLY_SHIPPED,
])

export function isActivityOnShelf(status: string | undefined | null): boolean {
  return status === ActivityListingStatus.ON_SHELF
}

export function isKujiActivityFamily(activityType: string | undefined | null): boolean {
  return activityType === ActivityTypeCode.ICHIBAN || activityType === ActivityTypeCode.UNLIMITED
}

export function isUnlimitedActivity(activityType: string | undefined | null): boolean {
  return activityType === ActivityTypeCode.UNLIMITED
}

export function canManualDeliver(deliverStatus: string | undefined | null): boolean {
  return deliverStatus != null && MANUAL_DELIVER.has(String(deliverStatus))
}

export function payStatusText(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return '未知'
  return PAY_STATUS_LABELS[String(s)] ?? String(s)
}

export function payStatusType(s: string | number | undefined | null): 'warning' | 'info' | 'success' {
  const k = String(s)
  if (k === PayStatusCode.UNPAID) return 'warning'
  if (k === PayStatusCode.PAID) return 'success'
  if (k === PayStatusCode.PAYMENT_CONFIRMING) return 'info'
  if (k === PayStatusCode.NO_PAYMENT_REQUIRED) return 'info'
  return 'info'
}

export function deliverStatusText(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return '未知'
  return DELIVER_STATUS_LABELS[String(s)] ?? String(s)
}

export function deliverStatusType(s: string | number | undefined | null): 'warning' | 'info' | 'primary' | 'success' {
  const k = String(s)
  if (k === DeliverStatusCode.PENDING_SHIPMENT) return 'warning'
  if (k === DeliverStatusCode.STOCKING) return 'info'
  if (k === DeliverStatusCode.PARTIALLY_SHIPPED) return 'primary'
  if (k === DeliverStatusCode.SHIPPED || k === DeliverStatusCode.OFFLINE_VERIFIED || k === DeliverStatusCode.NO_SHIPMENT_REQUIRED)
    return 'success'
  return 'info'
}

export function orderStatusText(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return '未知'
  return ORDER_STATUS_LABELS[String(s)] ?? String(s)
}

export function orderStatusType(
  s: string | number | undefined | null
): 'info' | 'primary' | 'danger' | 'success' | 'warning' {
  const k = String(s)
  if (k === OrderStatusCode.UNCONFIRMED) return 'info'
  if (k === OrderStatusCode.IN_PROGRESS) return 'primary'
  if (k === OrderStatusCode.CLOSED) return 'danger'
  if (k === OrderStatusCode.COMPLETED) return 'success'
  if (k === OrderStatusCode.CANCEL_PENDING_UNSHIPPED || k === OrderStatusCode.AFTERSALE_PENDING) return 'warning'
  if (k === OrderStatusCode.AFTERSALE_DONE || k === OrderStatusCode.PENDING_PROCESS || k === OrderStatusCode.RESOLD)
    return 'info'
  return 'info'
}

export function activityTypeLabel(t: string | number | undefined | null): string {
  if (t === undefined || t === null) return '-'
  const key = String(t)
  return ACTIVITY_TYPE_LABELS[key] ?? key
}

export function mithrilBizTypeLabel(t: string | number | undefined | null): string {
  if (t === undefined || t === null) return '-'
  const key = String(t)
  return MITHRIL_BIZ_TYPE_LABELS[key] ?? key
}

export function scoreBizTypeLabel(t: string | number | undefined | null): string {
  if (t === undefined || t === null) return '-'
  const key = String(t)
  return SCORE_BIZ_TYPE_LABELS[key] ?? key
}

export function productListingStatusText(s: string | undefined | null): string {
  if (!s) return '未知'
  return (
    {
      [ProductListingStatus.OFF_SHELF]: '下架',
      [ProductListingStatus.ON_SHELF]: '上架',
      [ProductListingStatus.PENDING_LISTING]: '待上架',
    } as Record<string, string>
  )[s] ?? s
}

export function productListingTagType(s: string | undefined | null): 'info' | 'success' | 'warning' {
  if (s === ProductListingStatus.ON_SHELF) return 'success'
  if (s === ProductListingStatus.PENDING_LISTING) return 'warning'
  return 'info'
}

export function categoryStatusText(s: string | undefined | null): string {
  if (!s) return '未知'
  if (s === CategoryEnableStatus.ENABLED) return '启用'
  if (s === CategoryEnableStatus.DISABLED) return '停用'
  return s
}

export function skuListingOnShelf(status: string | undefined | null): boolean {
  return status === SkuListingStatus.ON_SHELF
}

export function boxStatusTag(status: string | number | undefined | null): { type: 'success' | 'info' | 'warning'; label: string } {
  const k = String(status)
  if (k === BoxStatusCode.IN_PROGRESS) return { type: 'success', label: '进行中' }
  if (k === BoxStatusCode.SOLD_OUT) return { type: 'info', label: '已抽完' }
  return { type: 'warning', label: '未开启' }
}

export function permissionTypeLabel(t: string | undefined | null): string {
  if (t === PermissionTypeCode.MENU) return '菜单'
  if (t === PermissionTypeCode.PAGE) return '页面'
  if (t === PermissionTypeCode.BUTTON) return '按钮'
  return t ?? '-'
}
