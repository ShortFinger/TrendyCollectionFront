import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { PermissionVO } from '@/types/auth'
import type { PermissionCreateRequest, PermissionUpdateRequest } from '@/types/permission'

export function listPermissions() {
  return request.get<any, Result<PermissionVO[]>>('/admin-api/permissions')
}

export function getPermissionTree() {
  return request.get<any, Result<PermissionVO[]>>('/admin-api/permissions/tree')
}

export function getPermissionsByRoleId(roleId: string) {
  return request.get<any, Result<PermissionVO[]>>(`/admin-api/permissions/role/${roleId}`)
}

export function createPermission(data: PermissionCreateRequest) {
  return request.post<any, Result<void>>('/admin-api/permissions', data)
}

export function updatePermission(data: PermissionUpdateRequest) {
  return request.put<any, Result<void>>('/admin-api/permissions', data)
}

export function deletePermission(id: string) {
  return request.delete<any, Result<void>>(`/admin-api/permissions/${id}`)
}
