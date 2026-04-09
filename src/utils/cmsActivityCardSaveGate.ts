import type { ActivityVO } from '@/types/activity'

/**
 * CMS 活动卡片内容项保存：活动详情已拉到，但非上架则返回提示文案。
 */
export function messageIfActivityInvalidForCmsCardRef(vo: ActivityVO): string | null {
  if (vo.status !== 'ON_SHELF') {
    return '活动未上架，请上架后保存或更换为已上架活动'
  }
  return null
}
