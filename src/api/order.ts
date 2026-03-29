import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { OrderQueryRequest, OrderVO, OrderDetailVO, OrderDeliverRequest, OrderCloseRequest, OrderStatusCountVO } from '@/types/order'

export function listOrders(params: OrderQueryRequest) {
  return request.get<any, Result<PageResult<OrderVO>>>('/order-admin-api/orders', { params })
}

export function getOrderDetail(id: string) {
  return request.get<any, Result<OrderDetailVO>>(`/order-admin-api/orders/${id}`)
}

export function deliverOrder(id: string, data?: OrderDeliverRequest) {
  return request.post<any, Result<void>>(`/order-admin-api/orders/${id}/deliver`, data || {})
}

export function closeOrder(id: string, data?: OrderCloseRequest) {
  return request.post<any, Result<void>>(`/order-admin-api/orders/${id}/close`, data || {})
}

export function getOrderStatusCounts() {
  return request.get<any, Result<OrderStatusCountVO>>('/order-admin-api/orders/counts')
}

export function exportOrders(params: OrderQueryRequest) {
  return request.get('/order-admin-api/orders/export', {
    params,
    responseType: 'blob',
  })
}
