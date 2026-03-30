export interface RewardLevelVO {
  id: string
  activityId: string
  title: string
  icon?: string
  openBoxAnimation?: string
  sortOrder: number
  tierWeight: number
  createTime?: string
  updateTime?: string
}

export interface RewardLevelItemRequest {
  id?: string
  title: string
  icon?: string
  openBoxAnimation?: string
  sortOrder: number
  tierWeight: number
}

/** PUT `/activities/{activityId}/reward-levels` body */
export interface RewardLevelReplaceRequest {
  items: RewardLevelItemRequest[]
}
