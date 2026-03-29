import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { LoginRequest, LoginResponse, AdminVO, PasswordUpdateRequest, PermissionVO } from '@/types/auth'

export function getPublicKey() {
  return request.get<any, Result<{ publicKey: string }>>('/admin-api/auth/public-key')
}

export function login(data: LoginRequest) {
  return request.post<any, Result<LoginResponse>>('/admin-api/auth/login', data)
}

export function getCurrentAdmin() {
  return request.get<any, Result<AdminVO>>('/admin-api/auth/me')
}

export function getMenu() {
  return request.get<any, Result<PermissionVO[]>>('/admin-api/auth/menu')
}

export function updatePassword(data: PasswordUpdateRequest) {
  return request.put<any, Result<void>>('/admin-api/auth/password', data)
}
