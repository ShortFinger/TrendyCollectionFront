import type { PageQuery } from './api'

export interface CategoryQueryRequest extends PageQuery {
  keyword?: string
}

export interface CategoryVO {
  id: string
  parentId?: string | null
  title: string
  squareThumb?: string
  longThumb?: string
  upperLeftCornerMark?: string
  upperRightCornerMark?: string
  lowerLeftCornerMark?: string
  lowerRightCornerMark?: string
  images: string
  status: string
  createTime: string
  updateTime: string
}

export interface CategorySaveRequest {
  title: string
  parentId?: string | null
  squareThumb?: string
  longThumb?: string
  upperLeftCornerMark?: string
  upperRightCornerMark?: string
  lowerLeftCornerMark?: string
  lowerRightCornerMark?: string
  images?: string
  status?: string
}
