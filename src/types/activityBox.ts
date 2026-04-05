import type { PageQuery } from './api'

export interface ActivityBoxQueryRequest extends PageQuery {
  boxStatus?: string
}

export interface ActivityBoxVO {
  id: string
  activityId: string
  boxNumber: number
  activityType: string
  boxStatus: string
  boxSkuCount: number
  boxItemCount: number
  boxItemLeft: number
  createTime: string
  updateTime: string
}

export interface ActivityBoxSaveRequest {
  /** 已废弃，由后端自动递增分配 */
  boxNumber?: number
  /** 已废弃：服务端根据签位推导，传入无效 */
  boxStatus?: number
}
