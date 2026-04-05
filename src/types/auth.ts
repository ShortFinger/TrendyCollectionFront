export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: AdminVO
}

export interface AdminVO {
  id: string
  uuid: string
  username: string
  realName: string
  phone: string
  email: string
  avatar: string
  roleId: string
  roleName: string
  isEnabled: number
  lastLoginTime: string
  lastLoginIp: string
  createTime: string
}

export interface PasswordUpdateRequest {
  oldPassword: string
  newPassword: string
}

export interface PermissionVO {
  id: string
  uuid: string
  parentId: string
  name: string
  code: string
  type: string
  path: string
  icon: string
  sortOrder: number
  isEnabled: number
  createTime: string
  children?: PermissionVO[]
}
