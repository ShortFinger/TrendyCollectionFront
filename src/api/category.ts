import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { CategoryQueryRequest, CategoryVO, CategorySaveRequest } from '@/types/category'

export function listCategories(params: CategoryQueryRequest) {
  return request.get<any, Result<PageResult<CategoryVO>>>('/order-admin-api/categories', { params })
}

export function getCategory(id: string) {
  return request.get<any, Result<CategoryVO>>(`/order-admin-api/categories/${id}`)
}

export function createCategory(data: CategorySaveRequest) {
  return request.post<any, Result<string>>('/order-admin-api/categories', data)
}

export function updateCategory(id: string, data: CategorySaveRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/categories/${id}`, data)
}

export function deleteCategory(id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/categories/${id}`)
}
