import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { AdminVO } from '@/types/auth'
import type { AdminQueryRequest, AdminCreateRequest, AdminUpdateRequest } from '@/types/admin'

export function listAdmins(params: AdminQueryRequest) {
  return request.get<any, Result<PageResult<AdminVO>>>('/admin-api/admins', { params })
}

export function getAdminDetail(id: string) {
  return request.get<any, Result<AdminVO>>(`/admin-api/admins/${id}`)
}

export function createAdmin(data: AdminCreateRequest) {
  return request.post<any, Result<void>>('/admin-api/admins', data)
}

export function updateAdmin(data: AdminUpdateRequest) {
  return request.put<any, Result<void>>('/admin-api/admins', data)
}

export function deleteAdmin(id: string) {
  return request.delete<any, Result<void>>(`/admin-api/admins/${id}`)
}
