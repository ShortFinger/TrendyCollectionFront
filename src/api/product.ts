import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ProductQueryRequest, ProductVO, ProductSaveRequest } from '@/types/product'

export function listProducts(params: ProductQueryRequest) {
  return request.get<any, Result<PageResult<ProductVO>>>('/order-admin-api/products', { params })
}

export function getProduct(id: string) {
  return request.get<any, Result<ProductVO>>(`/order-admin-api/products/${id}`)
}

export function createProduct(data: ProductSaveRequest) {
  return request.post<any, Result<string>>('/order-admin-api/products', data)
}

export function updateProduct(id: string, data: ProductSaveRequest) {
  return request.put<any, Result<void>>(`/order-admin-api/products/${id}`, data)
}

export function deleteProduct(id: string) {
  return request.delete<any, Result<void>>(`/order-admin-api/products/${id}`)
}
