import type { PermissionVO } from './auth'

export type { PermissionVO }

export interface PermissionCreateRequest {
  parentId?: string
  name: string
  code: string
  type: string
  path?: string
  icon?: string
  sortOrder?: number
}

export interface PermissionUpdateRequest {
  id: string
  parentId?: string
  name?: string
  code?: string
  type?: string
  path?: string
  icon?: string
  sortOrder?: number
  isEnabled?: number
}
