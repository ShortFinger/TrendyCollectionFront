import request from '@/utils/request'
import type { Result } from '@/types/api'
import type {
  RewardLevelItemRequest,
  RewardLevelReplaceRequest,
  RewardLevelVO,
} from '@/types/rewardLevel'

export function listRewardLevels(activityId: string) {
  return request.get<any, Result<RewardLevelVO[]>>(`/order-admin-api/activities/${activityId}/reward-levels`)
}

export function replaceRewardLevels(activityId: string, items: RewardLevelItemRequest[]) {
  const body: RewardLevelReplaceRequest = { items }
  return request.put<any, Result<void>>(`/order-admin-api/activities/${activityId}/reward-levels`, body)
}
