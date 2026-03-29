import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ActivityQueryRequest, ActivityVO, ActivitySaveRequest, ActivityStatusUpdateRequest } from '@/types/activity'

export function listActivities(params: ActivityQueryRequest) {
  return request.get<any, Result<PageResult<ActivityVO>>>('/order-admin-api/activities', { params })
}

export function getActivity(id: string) {
  return request.get<any, Result<ActivityVO>>(`/order-admin-api/activities/${id}`)
}

export function createActivity(data: ActivitySaveRequest) {
  return request.post<any, Result<string>>('/order-admin-api/activities', data)
}

export function updateActivity(id: string, data: ActivitySaveRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/activities/${id}`, data)
}

export function updateActivityStatus(id: string, data: ActivityStatusUpdateRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/activities/${id}/status`, data)
}

export function deleteActivity(id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/activities/${id}`)
}
