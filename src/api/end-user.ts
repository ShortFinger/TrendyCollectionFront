import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { EndUserQueryRequest, EndUserVO } from '@/types/end-user'

export function listEndUsers(params: EndUserQueryRequest) {
  return request.get<any, Result<PageResult<EndUserVO>>>('/order-admin-api/users', { params })
}
