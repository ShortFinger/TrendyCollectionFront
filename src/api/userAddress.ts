import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { UserAddressAdminVO, UserAddressQuery } from '@/types/userAddress'

export function listUserAddresses(params: UserAddressQuery) {
  return request.get<any, Result<PageResult<UserAddressAdminVO>>>('/admin-api/user-addresses', { params })
}

export function exportUserAddresses(params: UserAddressQuery) {
  return request.get('/admin-api/user-addresses/export', {
    params,
    responseType: 'blob',
  })
}
