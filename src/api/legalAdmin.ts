import request from '@/utils/request'
import type { Result } from '@/types/api'

const BASE = '/admin-api/legal-admin'

export interface LegalDocumentRow {
  id: string
  docType: string
  version: number
  title: string
  body: string
  status: number
  effectiveTime?: string
  createTime?: string
  updateTime?: string
}

export function listLegalDocuments() {
  return request.get<any, Result<LegalDocumentRow[]>>(`${BASE}/documents`)
}

export function createLegalDraft(data: { docType: string; title: string; body: string }) {
  return request.post<any, Result<LegalDocumentRow>>(`${BASE}/documents`, data)
}

export function updateLegalDraft(id: string, data: { title: string; body: string }) {
  return request.put<any, Result<void>>(`${BASE}/documents/${encodeURIComponent(id)}`, data)
}

export function publishLegalDocument(id: string) {
  return request.post<any, Result<void>>(`${BASE}/documents/${encodeURIComponent(id)}/publish`, {})
}
