import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type {
  CouponTemplateQueryRequest,
  CouponTemplateVO,
  CouponTemplateSaveRequest,
  CouponDistributeRequest,
  CouponRecordVO,
} from '@/types/coupon'

export function listCouponTemplates(params: CouponTemplateQueryRequest) {
  return request.get<any, Result<PageResult<CouponTemplateVO>>>('/admin-api/coupon/template/page', { params })
}

export function getCouponTemplate(id: number) {
  return request.get<any, Result<CouponTemplateVO>>(`/admin-api/coupon/template/${id}`)
}

export function createCouponTemplate(data: CouponTemplateSaveRequest) {
  return request.post<any, Result<void>>('/admin-api/coupon/template', data)
}

export function updateCouponTemplate(id: number, data: CouponTemplateSaveRequest) {
  return request.put<any, Result<void>>(`/admin-api/coupon/template/${id}`, data)
}

export function updateCouponTemplateStatus(id: number, status: string) {
  return request.put<any, Result<void>>(`/admin-api/coupon/template/${id}/status`, null, { params: { status } })
}

export function distributeCoupon(data: CouponDistributeRequest) {
  return request.post<any, Result<void>>('/admin-api/coupon/distribute', data)
}

export function listCouponRecords(params: { templateId?: number; page?: number; size?: number }) {
  return request.get<any, Result<PageResult<CouponRecordVO>>>('/admin-api/coupon/record/page', { params })
}
