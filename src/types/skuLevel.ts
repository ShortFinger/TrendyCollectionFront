export interface ActivitySkuLevelVO {
  id: string
  activityId: string
  name: string
  sortOrder: number
  tierWeight: number
  createTime?: string
  updateTime?: string
}

export interface ActivitySkuLevelItemRequest {
  id?: string
  name: string
  sortOrder: number
  tierWeight: number
}
