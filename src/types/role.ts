export interface RoleVO {
  id: string
  uuid: string
  name: string
  code: string
  description: string
  isEnabled: number
  permissionIds: string[]
  createTime: string
}

export interface RoleCreateRequest {
  name: string
  code: string
  description?: string
  permissionIds?: string[]
}

export interface RoleUpdateRequest {
  id: string
  name?: string
  description?: string
  isEnabled?: number
  permissionIds?: string[]
}
