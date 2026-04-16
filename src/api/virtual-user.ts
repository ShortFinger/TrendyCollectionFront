import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type {
  VirtualUserVO,
  VirtualUserQuery,
  VirtualUserCreateBody,
  VirtualUserUpdateBody,
  VirtualUserBatchGenerateBody,
  VirtualUserBatchGenerateResultVO,
  VirtualUserCampaignRuleVO,
  VirtualUserCampaignRuleQuery,
  VirtualUserCampaignRuleCreateBody,
  VirtualUserCampaignRuleUpdateBody,
  VirtualUserCampaignRuleStatusBody,
  VirtualUserActionLogVO,
  VirtualUserActionLogQuery,
} from '@/types/virtual-user'

export function listVirtualUsers(params: VirtualUserQuery) {
  return request.get<any, Result<PageResult<VirtualUserVO>>>('/order-admin-api/virtual-users', { params })
}

export function getVirtualUser(id: string) {
  return request.get<any, Result<VirtualUserVO>>(`/order-admin-api/virtual-users/${id}`)
}

export function createVirtualUser(data: VirtualUserCreateBody) {
  return request.post<any, Result<VirtualUserVO>>('/order-admin-api/virtual-users', data)
}

export function updateVirtualUser(id: string, data: VirtualUserUpdateBody) {
  return request.put<any, Result<VirtualUserVO>>(`/order-admin-api/virtual-users/${id}`, data)
}

export function deleteVirtualUser(id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/virtual-users/${id}`)
}

export function batchGenerateVirtualUsers(data: VirtualUserBatchGenerateBody) {
  return request.post<any, Result<VirtualUserBatchGenerateResultVO>>(
    '/order-admin-api/virtual-users/batch-generate',
    data,
  )
}

export function listVirtualUserCampaignRules(params: VirtualUserCampaignRuleQuery) {
  return request.get<any, Result<PageResult<VirtualUserCampaignRuleVO>>>(
    '/order-admin-api/virtual-user-campaign-rules',
    { params },
  )
}

export function getVirtualUserCampaignRule(id: string) {
  return request.get<any, Result<VirtualUserCampaignRuleVO>>(
    `/order-admin-api/virtual-user-campaign-rules/${id}`,
  )
}

export function createVirtualUserCampaignRule(data: VirtualUserCampaignRuleCreateBody) {
  return request.post<any, Result<VirtualUserCampaignRuleVO>>(
    '/order-admin-api/virtual-user-campaign-rules',
    data,
  )
}

export function updateVirtualUserCampaignRule(id: string, data: VirtualUserCampaignRuleUpdateBody) {
  return request.put<any, Result<VirtualUserCampaignRuleVO>>(
    `/order-admin-api/virtual-user-campaign-rules/${id}`,
    data,
  )
}

export function deleteVirtualUserCampaignRule(id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/virtual-user-campaign-rules/${id}`)
}

export function patchVirtualUserCampaignRuleStatus(id: string, data: VirtualUserCampaignRuleStatusBody) {
  return request.patch<any, Result<VirtualUserCampaignRuleVO>>(
    `/order-admin-api/virtual-user-campaign-rules/${id}/status`,
    data,
  )
}

export function listVirtualUserActionLogs(params: VirtualUserActionLogQuery) {
  return request.get<any, Result<PageResult<VirtualUserActionLogVO>>>(
    '/order-admin-api/virtual-user-action-logs',
    { params },
  )
}
