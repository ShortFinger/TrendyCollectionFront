import type { PageQuery } from '@/types/api'

export interface VirtualUserVO {
  id: string
  nickname: string
  avatar?: string | null
  gender?: number | null
  tags?: string | null
  status: number
  profileSource?: string | null
  paidMoneyTotal: number
  paidScoreTotal: number
  scoreBalance: number
  scoreTotalEarned: number
  scoreTotalDeducted: number
  luckyScore: number
  mithrilBalance: number
  mithrilTotalEarned: number
  mithrilTotalDeducted: number
  createTime: string
  updateTime: string
}

export interface VirtualUserQuery extends PageQuery {
  keyword?: string
  status?: number
  createStartTime?: string
  createEndTime?: string
}

export interface VirtualUserCreateBody {
  nickname: string
  avatar?: string
  gender?: number
  tags?: string
  status?: number
  profileSource?: string
  paidMoneyTotal?: number
  paidScoreTotal?: number
  scoreBalance?: number
  scoreTotalEarned?: number
  scoreTotalDeducted?: number
  luckyScore?: number
  mithrilBalance?: number
  mithrilTotalEarned?: number
  mithrilTotalDeducted?: number
}

export type VirtualUserUpdateBody = Partial<VirtualUserCreateBody>

export interface VirtualUserBatchGenerateBody {
  count: number
  nicknamePrefix: string
  status?: number
  avatar?: string
  paidMoneyTotal?: number
  paidScoreTotal?: number
  scoreBalance?: number
  scoreTotalEarned?: number
  scoreTotalDeducted?: number
  luckyScore?: number
  luckyScoreMaxInclusive?: number
  mithrilBalance?: number
  mithrilTotalEarned?: number
  mithrilTotalDeducted?: number
}

export interface VirtualUserBatchGenerateResultVO {
  created: number
  ids: string[]
}

export interface VirtualUserCampaignRuleVO {
  id: string
  campaignId: string
  ruleName: string
  userSelectType: string
  userSelectConfig: string
  startTime: string
  endTime: string
  activeHours?: string | null
  joinProbability: number
  intervalMinSeconds: number
  intervalMaxSeconds: number
  dailyCapPerUser: number
  eventTypeConfig: string
  status: number
  priority: number
  createTime: string
  updateTime: string
}

export interface VirtualUserCampaignRuleQuery extends PageQuery {
  campaignId?: string
  status?: number
  keyword?: string
}

export interface VirtualUserCampaignRuleCreateBody {
  campaignId: string
  ruleName: string
  userSelectType: string
  userSelectConfig: string
  startTime: string
  endTime: string
  activeHours?: string
  joinProbability?: number
  intervalMinSeconds?: number
  intervalMaxSeconds?: number
  dailyCapPerUser?: number
  eventTypeConfig: string
  status?: number
  priority?: number
}

export type VirtualUserCampaignRuleUpdateBody = Partial<VirtualUserCampaignRuleCreateBody>

export interface VirtualUserCampaignRuleStatusBody {
  status: number
}

export interface VirtualUserActionLogVO {
  id: string
  campaignId: string
  virtualUserId: string
  ruleId: string
  eventType: string
  eventPayload?: string | null
  executeStatus: string
  skipOrFailReason?: string | null
  executeTime: string
  dedupBucket: string
  createTime: string
}

export interface VirtualUserActionLogQuery extends PageQuery {
  campaignId?: string
  virtualUserId?: string
  ruleId?: string
  executeStatus?: string
  executeStartTime?: string
  executeEndTime?: string
}
