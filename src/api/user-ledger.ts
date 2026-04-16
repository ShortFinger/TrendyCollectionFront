import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { LedgerEntryVO, LedgerListQuery } from '@/types/user-ledger'

export function listScoreLedgers(params: LedgerListQuery) {
  return request.get<any, Result<PageResult<LedgerEntryVO>>>('/order-admin-api/score-ledgers', { params })
}

export function listMithrilLedgers(params: LedgerListQuery) {
  return request.get<any, Result<PageResult<LedgerEntryVO>>>('/order-admin-api/mithril-ledgers', { params })
}
