import type { UserListQueryRequest } from '@/types/user'

export interface UserListPageQueryState {
  page: number
  size: number
  keyword: string
  userId: string
  registerTimeRange: [string, string] | null
}

function appendDayBoundary(date: string, endOfDay: boolean): string {
  return `${date} ${endOfDay ? '23:59:59' : '00:00:00'}`
}

export function toUserListQueryParams(state: UserListPageQueryState): UserListQueryRequest {
  const params: UserListQueryRequest = {
    page: state.page,
    size: state.size,
  }

  const keyword = state.keyword.trim()
  if (keyword) {
    params.keyword = keyword
  }

  const userId = state.userId.trim()
  if (userId) {
    params.userId = userId
  }

  if (state.registerTimeRange) {
    params.registerStartTime = appendDayBoundary(state.registerTimeRange[0], false)
    params.registerEndTime = appendDayBoundary(state.registerTimeRange[1], true)
  }

  return params
}
