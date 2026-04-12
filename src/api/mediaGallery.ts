import request from '@/utils/request'
import type { Result } from '@/types/api'
import type {
  MediaAssetQuery,
  MediaAssetRegisterBody,
  MediaAssetUpdateBody,
  MediaAssetVO,
  MediaTagVO,
  PageResult,
} from '@/types/mediaGallery'

export function registerMediaAsset(data: MediaAssetRegisterBody) {
  return request.post<any, Result<MediaAssetVO>>('/admin-api/media-assets', data)
}

export function fetchMediaAssets(params: MediaAssetQuery) {
  return request.get<any, Result<PageResult<MediaAssetVO>>>('/admin-api/media-assets', { params })
}

export function fetchMediaTags() {
  return request.get<any, Result<MediaTagVO[]>>('/admin-api/media-tags')
}

export function updateMediaAsset(id: string, data: MediaAssetUpdateBody) {
  return request.patch<any, Result<MediaAssetVO>>(`/admin-api/media-assets/${id}`, data)
}

export function deleteMediaAsset(id: string) {
  return request.delete<any, Result<void>>(`/admin-api/media-assets/${id}`)
}
