export interface FreightRuleGroupVO {
  id: string
  groupName: string
  baseFreightCent: number
  tiersJson: string
  status?: number
  createTime?: string
  updateTime?: string
}

export interface FreightRuleGroupSaveRequest {
  groupName: string
  baseFreightCent: number
  tiersJson: string
  status?: number
}

export interface FreightCalcPreviewRequest {
  skuId: string
  buyQty: number
}

export interface FreightCalcPreviewVO {
  freightCent: number
  ruleGroupId: string
  matchedThresholdQty?: number | null
}
