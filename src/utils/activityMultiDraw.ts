import type { ActivitySaveRequest, ActivityVO, MultiDrawTierItem } from '@/types/activity'

export function defaultMultiDrawTiers(): MultiDrawTierItem[] {
  return [
    { drawCount: 1, moneyDiscount: 0, scoreDiscount: 0 },
    { drawCount: 5, moneyDiscount: 0, scoreDiscount: 0 },
    { drawCount: 10, moneyDiscount: 0, scoreDiscount: 0 },
  ]
}

export function formatTierSummary(row: { multiDrawTiers?: MultiDrawTierItem[] }): string {
  const t = row.multiDrawTiers
  if (!t?.length) return '-'
  return [...t]
    .map((x) => x.drawCount)
    .filter((n) => typeof n === 'number')
    .sort((a, b) => a - b)
    .join('/')
}

export function cloneTiersForSave(tiers: MultiDrawTierItem[] | undefined): MultiDrawTierItem[] {
  const src = tiers?.length ? tiers : defaultMultiDrawTiers()
  return src.map((t) => ({
    drawCount: t.drawCount,
    moneyDiscount: t.moneyDiscount,
    scoreDiscount: t.scoreDiscount,
    sortOrder: t.sortOrder,
  }))
}

/** 从活动详情组装更新请求；可用 patch 覆盖部分字段（如仅更新 multiDrawTiers） */
export function activityVoToSaveRequest(vo: ActivityVO, patch?: Partial<ActivitySaveRequest>): ActivitySaveRequest {
  const categoryId =
    vo.categoryId != null && String(vo.categoryId).trim() !== '' ? String(vo.categoryId).trim() : undefined
  return {
    title: vo.title,
    activityType: vo.activityType,
    squareThumb: vo.squareThumb || undefined,
    longThumb: vo.longThumb || undefined,
    lowerLeftCornerMark: vo.lowerLeftCornerMark || undefined,
    upperLeftCornerMark: vo.upperLeftCornerMark || undefined,
    upperRightCornerMark: vo.upperRightCornerMark || undefined,
    lowerRightCornerMark: vo.lowerRightCornerMark || undefined,
    images: vo.images || undefined,
    moneyPrice: vo.moneyPrice,
    scorePrice: vo.scorePrice,
    profitRate: vo.profitRate,
    perUserLimit: vo.perUserLimit,
    multiDrawTiers: cloneTiersForSave(vo.multiDrawTiers),
    openBoxAnimation: vo.openBoxAnimation || undefined,
    tags: vo.tags || undefined,
    boxCount: vo.boxCount,
    finalPrizeSkuId:
      vo.finalPrizeSkuId != null && String(vo.finalPrizeSkuId).trim() !== ''
        ? String(vo.finalPrizeSkuId).trim()
        : undefined,
    rank: vo.rank === 1 ? 1 : 0,
    amountLimit: vo.amountLimit ?? 0,
    categoryId,
    isRandomRewardEnabled: vo.isRandomRewardEnabled === 1 ? 1 : 0,
    ...patch,
  }
}
