import type { PageQuery } from './api'

export interface ActivityQueryRequest extends PageQuery {
  keyword?: string
  status?: number
  activityType?: number
}

export interface ActivityVO {
  id: string
  uuid: string
  title: string
  squareThumb: string
  longThumb: string
  lowerLeftCornerMark: string
  upperLeftCornerMark: string
  lowerRightCornerMark: string
  images: string
  moneyPrice: number
  scorePrice: number
  profitRate: number
  visitTotal: number
  perUserLimit: number
  sales: number
  status: number
  multiBuyDiscount: number
  openBoxAnimation: string
  tags: string
  joinUserTotal: number
  isRandomRewardEnabled: number
  activityType: number
  boxCount: number
  /** 一番赏最终赏 SKU，空表示不开启 */
  finalPrizeSkuId?: string | null
  /** 是否开启榜单 0/1 */
  rank: number
  amountLimit: number
  specialAreaId: string
  createTime: string
  updateTime: string
}

export interface ActivitySaveRequest {
  title: string
  squareThumb?: string
  longThumb?: string
  lowerLeftCornerMark?: string
  upperLeftCornerMark?: string
  lowerRightCornerMark?: string
  images?: string
  moneyPrice: number
  scorePrice: number
  profitRate?: number
  perUserLimit: number
  multiBuyDiscount?: number
  openBoxAnimation?: string
  tags?: string
  activityType?: number
  boxCount?: number
  /** 一番赏最终赏 SKU，空表示不开启 */
  finalPrizeSkuId?: string | null
  rank?: number
  amountLimit?: number
  specialAreaId?: string
  isRandomRewardEnabled?: number
}

export interface LotterySimulationRequest {
  participantCount: number
  drawsPerPerson: number
  seed?: number | null
  boxId?: string | null
}

export interface LotterySimulationSkuStat {
  skuId: string
  name?: string | null
  count: number
  ratio: number
}

export interface LotterySimulationLevelStat {
  levelId: string
  title?: string | null
  count: number
  ratio: number
}

export interface LotterySimulationPerUser {
  minWins: number
  maxWins: number
  meanWins: number
}

export interface LotterySimulationResponse {
  activityId: string
  activityType: number
  participantCount: number
  drawsPerPerson: number
  totalDraws: number
  seed: number
  durationMs: number
  successCount: number
  failureCount: number
  /** 一番赏：抽空普通签后自动发放最终赏的次数 */
  finalPrizeGrantCount?: number
  /** 7/8 时服务端解析后的箱子 ID */
  resolvedBoxId?: string | null
  skuStats: LotterySimulationSkuStat[]
  levelStats: LotterySimulationLevelStat[]
  perUser: LotterySimulationPerUser
}

export interface ActivityStatusUpdateRequest {
  status: number
}
