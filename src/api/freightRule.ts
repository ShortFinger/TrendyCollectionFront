import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type {
  FreightRuleGroupVO,
  FreightRuleGroupSaveRequest,
  FreightCalcPreviewRequest,
  FreightCalcPreviewVO,
} from '@/types/freightRule'

export function listFreightRuleGroups(params: { page?: number; size?: number; keyword?: string }) {
  return request.get<any, Result<PageResult<FreightRuleGroupVO>>>('/order-admin-api/freight-rule-groups', { params })
}

export function createFreightRuleGroup(data: FreightRuleGroupSaveRequest) {
  return request.post<any, Result<string>>('/order-admin-api/freight-rule-groups', data)
}

export function getFreightRuleGroup(id: string) {
  return request.get<any, Result<FreightRuleGroupVO>>(`/order-admin-api/freight-rule-groups/${id}`)
}

export function updateFreightRuleGroup(id: string, data: FreightRuleGroupSaveRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/freight-rule-groups/${id}`, data)
}

export function calcFreightPreview(data: FreightCalcPreviewRequest) {
  return request.post<any, Result<FreightCalcPreviewVO>>('/order-admin-api/freight/calc-preview', data)
}
