import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { SkuQueryRequest, SkuVO, SkuSaveRequest } from '@/types/sku'

export function listSkus(activityId: string, params: SkuQueryRequest) {
  return request.get<any, Result<PageResult<SkuVO>>>(`/order-admin-api/activities/${activityId}/skus`, { params })
}

export function getSku(activityId: string, id: string) {
  return request.get<any, Result<SkuVO>>(`/order-admin-api/activities/${activityId}/skus/${id}`)
}

export function createSku(activityId: string, data: SkuSaveRequest) {
  return request.post<any, Result<string>>(`/order-admin-api/activities/${activityId}/skus`, data)
}

export function updateSku(activityId: string, id: string, data: SkuSaveRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/activities/${activityId}/skus/${id}`, data)
}

export function deleteSku(activityId: string, id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/activities/${activityId}/skus/${id}`)
}
