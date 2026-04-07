import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { SysSettingCreateRequest, SysSettingUpdateRequest, SysSettingVO } from '@/types/sysSetting'

export function listSysSettings() {
  return request.get<any, Result<SysSettingVO[]>>('/admin-api/sys-settings')
}

export function getSysSetting(id: number) {
  return request.get<any, Result<SysSettingVO>>(`/admin-api/sys-settings/${id}`)
}

export function updateSysSetting(id: number, data: SysSettingUpdateRequest) {
  return request.put<any, Result<void>>(`/admin-api/sys-settings/${id}`, data)
}

export function createSysSetting(data: SysSettingCreateRequest) {
  return request.post<any, Result<void>>('/admin-api/sys-settings', data)
}
