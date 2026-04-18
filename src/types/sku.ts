import type { PageQuery } from './api'

export interface SkuQueryRequest extends PageQuery {
  keyword?: string
  status?: string
  /** 一番赏：按箱子筛选 SKU */
  boxId?: string
  /** 仅未绑定箱子的 SKU（box_id 为空） */
  unassignedToBox?: boolean
}

export interface SkuVO {
  id: string
  skuCode: string
  productIds: string
  activityId: string
  activityType: string
  boxId?: string
  rewardLevelId?: string
  rewardLevelTitle?: string
  rewardLevelSortOrder?: number
  rewardLevelIcon?: string
  rewardLevelOpenBoxAnimation?: string
  name: string
  specAttributes: string
  rewardProbability: number
  recyclePrice: number
  originalPrice: number
  stockQuantity: number
  isUnlimitedStock?: boolean
  imageUrl: string
  status: string
  isDisplayItem?: boolean
  openBoxAnimation: string
  frontImage: string
  backImage: string
  leftImage: string
  rightImage: string
  topImage: string
  bottomImage: string
  createTime: string
  updateTime: string
}

export interface SkuSaveRequest {
  skuCode?: string
  productIds?: string
  activityType?: string
  /** 传入时按 stockQuantity 在 activity_box_item 中生成对应条数 */
  boxId?: string
  rewardLevelId?: string
  name: string
  specAttributes?: string
  rewardProbability: number
  recyclePrice?: number
  originalPrice?: number
  stockQuantity: number
  isUnlimitedStock?: boolean
  imageUrl?: string
  status?: string
  openBoxAnimation?: string
  frontImage?: string
  backImage?: string
  leftImage?: string
  rightImage?: string
  topImage?: string
  bottomImage?: string
}
