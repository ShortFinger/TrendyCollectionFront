export interface RewardLevelVO {
  id: string
  activityId: string
  title: string
  icon?: string
  openBoxAnimation?: string
  sortOrder: number
  tierWeight: number
  /** NORMAL | FINAL，一番赏必有唯一 FINAL */
  levelRole?: string
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
  levelRole?: string
}

/** PUT `/activities/{activityId}/reward-levels` body */
export interface RewardLevelReplaceRequest {
  items: RewardLevelItemRequest[]
}
