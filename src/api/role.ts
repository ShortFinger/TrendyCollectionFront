import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { RoleVO, RoleCreateRequest, RoleUpdateRequest } from '@/types/role'

export function listRoles() {
  return request.get<any, Result<RoleVO[]>>('/admin-api/roles')
}

export function getRoleDetail(id: string) {
  return request.get<any, Result<RoleVO>>(`/admin-api/roles/${id}`)
}

export function createRole(data: RoleCreateRequest) {
  return request.post<any, Result<void>>('/admin-api/roles', data)
}

export function updateRole(data: RoleUpdateRequest) {
  return request.put<any, Result<void>>('/admin-api/roles', data)
}

export function deleteRole(id: string) {
  return request.delete<any, Result<void>>(`/admin-api/roles/${id}`)
}
