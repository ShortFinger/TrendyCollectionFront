import type { PageQuery } from './api'

export interface ProductQueryRequest extends PageQuery {
  keyword?: string
  status?: number
}

export interface ProductVO {
  id: string
  productCode: string
  name: string
  description?: string
  mainImageUrl?: string
  showImage?: string
  topImage?: string
  frontImage?: string
  backImage?: string
  bottomImage?: string
  leftImage?: string
  rightImage?: string
  status: number
  createTime: string
  updateTime: string
}

export interface ProductSaveRequest {
  productCode: string
  name: string
  description?: string
  categoryId?: number
  brandId?: number
  mainImageUrl?: string
  showImage?: string
  topImage?: string
  frontImage?: string
  backImage?: string
  bottomImage?: string
  leftImage?: string
  rightImage?: string
  status?: number
}
