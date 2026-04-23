import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type {
  CabinetShipOrderItem,
  CabinetShipOrderQueryRequest,
  CabinetShipConfirmRequest,
  CabinetShipConfirmResponse,
} from '@/types/cabinetShip'

export function listCabinetShipOrders(params: CabinetShipOrderQueryRequest) {
  return request.get<any, Result<PageResult<CabinetShipOrderItem>>>('/order-admin-api/cabinet-ship-orders', { params })
}

export function confirmCabinetShipOrder(shipOrderId: string, data: CabinetShipConfirmRequest) {
  return request.post<any, Result<CabinetShipConfirmResponse>>(`/order-admin-api/cabinet-ship-orders/${shipOrderId}/ship`, data)
}
