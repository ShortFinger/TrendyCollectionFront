import type { PageQuery } from './api'

export interface AdminQueryRequest extends PageQuery {
  username?: string
  realName?: string
  phone?: string
  roleId?: string
  isEnabled?: number
}

export interface AdminCreateRequest {
  username: string
  password: string
  realName?: string
  phone?: string
  email?: string
  avatar?: string
  roleId: string
}

export interface AdminUpdateRequest {
  id: string
  realName?: string
  phone?: string
  email?: string
  avatar?: string
  roleId?: string
  isEnabled?: number
}
