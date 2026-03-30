import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { ActivitySkuLevelItemRequest, ActivitySkuLevelVO } from '@/types/skuLevel'

export function listSkuLevels(activityId: string) {
  return request.get<any, Result<ActivitySkuLevelVO[]>>(`/order-admin-api/activities/${activityId}/sku-levels`)
}

export function replaceSkuLevels(activityId: string, items: ActivitySkuLevelItemRequest[]) {
  return request.put<any, Result<void>>(`/order-admin-api/activities/${activityId}/sku-levels`, { items })
}
