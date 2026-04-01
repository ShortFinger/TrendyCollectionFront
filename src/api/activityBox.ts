import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ActivityBoxQueryRequest, ActivityBoxVO, ActivityBoxSaveRequest } from '@/types/activityBox'

export function listBoxes(activityId: string, params: ActivityBoxQueryRequest) {
  return request.get<any, Result<PageResult<ActivityBoxVO>>>(`/order-admin-api/activities/${activityId}/boxes`, { params })
}

export function getBox(activityId: string, id: string) {
  return request.get<any, Result<ActivityBoxVO>>(`/order-admin-api/activities/${activityId}/boxes/${id}`)
}

export function createBox(activityId: string, data: ActivityBoxSaveRequest) {
  return request.post<any, Result<string>>(`/order-admin-api/activities/${activityId}/boxes`, data)
}

export function updateBox(activityId: string, id: string, data: ActivityBoxSaveRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/activities/${activityId}/boxes/${id}`, data)
}

export function deleteBox(activityId: string, id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/activities/${activityId}/boxes/${id}`)
}

export function linkSkuToBox(activityId: string, boxId: string, skuId: string, stockQuantity: number) {
  return request.post<any, Result<void>>(`/order-admin-api/activities/${activityId}/boxes/${boxId}/link-sku`, {
    skuId,
    stockQuantity,
  })
}

export function copySkuToBox(activityId: string, boxId: string, sourceSkuId: string, stockQuantity: number) {
  return request.post<any, Result<string>>(`/order-admin-api/activities/${activityId}/boxes/${boxId}/copy-sku`, {
    sourceSkuId,
    stockQuantity,
  })
}

export function duplicateBox(activityId: string, sourceBoxId: string) {
  return request.post<any, Result<string>>(
    `/order-admin-api/activities/${activityId}/boxes/${sourceBoxId}/duplicate`
  )
}
