import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ActivityRecordQueryRequest, ActivityRecordVO } from '@/types/activityRecord'

export function listActivityRecords(params: ActivityRecordQueryRequest) {
  return request.get<any, Result<PageResult<ActivityRecordVO>>>('/order-admin-api/activity-records', { params })
}
