import request from '@/utils/request'
import type { Result } from '@/types/api'
import type {
  ActivitySkuLevelItemRequest,
  ActivitySkuLevelReplaceRequest,
  ActivitySkuLevelVO,
} from '@/types/skuLevel'

export function listSkuLevels(activityId: string) {
  return request.get<any, Result<ActivitySkuLevelVO[]>>(`/order-admin-api/activities/${activityId}/sku-levels`)
}

export function replaceSkuLevels(activityId: string, items: ActivitySkuLevelItemRequest[]) {
  const body: ActivitySkuLevelReplaceRequest = { items }
  return request.put<any, Result<void>>(`/order-admin-api/activities/${activityId}/sku-levels`, body)
}
