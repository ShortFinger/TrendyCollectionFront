import type { PageResult } from '@/types/api'

export type { PageResult }

export interface MediaTagVO {
  id: string
  name: string
}

export interface MediaAssetVO {
  id: string
  objectKey: string
  previewUrl: string
  originalFilename: string
  byteSize: number
  contentType?: string
  width?: number
  height?: number
  tags: MediaTagVO[]
  createTime: string
}

export interface MediaAssetRegisterBody {
  objectKey: string
  originalFilename: string
  byteSize: number
  contentType?: string
  width?: number
  height?: number
  tagIds?: string[]
  tagNames?: string[]
}

export interface MediaAssetUpdateBody {
  tagIds?: string[]
  tagNames?: string[]
}

export interface MediaAssetQuery {
  page?: number
  size?: number
  tagId?: string
  keyword?: string
  sort?: 'create_time_desc' | 'create_time_asc'
}
