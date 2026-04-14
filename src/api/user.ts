import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { UserListQueryRequest, UserVO } from '@/types/user'

export function listUsers(params: UserListQueryRequest) {
  return request.get<any, Result<PageResult<UserVO>>>('/api/users', { params })
}
