/** 与 Admin SysSettingVO 对齐 */
export interface SysSettingVO {
  id: number
  settingType: string
  settingConfig: string
  remark: string | null
  createTime: string
  updateTime: string
}

export interface SysSettingUpdateRequest {
  settingConfig: string
  remark?: string | null
}
