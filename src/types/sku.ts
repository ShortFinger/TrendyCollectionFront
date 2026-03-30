import type { PageQuery } from './api'

export interface SkuQueryRequest extends PageQuery {
  keyword?: string
  status?: number
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
  activityType: number
  boxId?: string
  skuLevelId?: string
  skuLevelName?: string
  skuLevelSortOrder?: number
  name: string
  specAttributes: string
  rewardProbability: number
  specialRewardProbability: number
  costPrice: number
  recyclePrice: number
  originalPrice: number
  stockQuantity: number
  imageUrl: string
  status: number
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
  activityType?: number
  /** 传入时按 stockQuantity 在 activity_box_item 中生成对应条数 */
  boxId?: string
  skuLevelId?: string
  name: string
  specAttributes?: string
  rewardProbability: number
  specialRewardProbability: number
  costPrice?: number
  recyclePrice?: number
  originalPrice?: number
  stockQuantity: number
  imageUrl?: string
  status?: number
  openBoxAnimation?: string
  frontImage?: string
  backImage?: string
  leftImage?: string
  rightImage?: string
  topImage?: string
  bottomImage?: string
}
