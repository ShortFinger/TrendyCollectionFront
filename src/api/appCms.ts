import request from '@/utils/request'
import type { EditorPageSummary, EditorStateResponse } from '@/types/appCms'
import type { Result } from '@/types/api'

const BASE = '/admin-api/app-cms'

function encPage(pageKey: string) {
  return encodeURIComponent(pageKey)
}

export function listPages() {
  return request.get<any, Result<EditorPageSummary[]>>(`${BASE}/pages`)
}

export function createAppPage(data: { pageKey: string; title: string }) {
  return request.post<any, Result<EditorPageSummary>>(`${BASE}/pages`, data)
}

export function fetchEditorState(pageKey: string) {
  return request.get<any, Result<EditorStateResponse>>(
    `${BASE}/pages/${encPage(pageKey)}/editor-state`,
  )
}

export function forkDraft(pageKey: string) {
  return request.post<any, Result<void>>(`${BASE}/pages/${encPage(pageKey)}/draft/fork`, {})
}

export function publishPage(pageKey: string) {
  return request.post<any, Result<void>>(`${BASE}/pages/${encPage(pageKey)}/publish`, {})
}

export function createSlot(pageKey: string, data: { slotType: string; sortOrder: number }) {
  return request.post<any, Result<Record<string, unknown>>>(
    `${BASE}/pages/${encPage(pageKey)}/slots`,
    data,
  )
}

export function updateSlot(
  pageKey: string,
  slotId: number,
  data: { slotType?: string; sortOrder?: number },
) {
  return request.put<any, Result<void>>(`${BASE}/pages/${encPage(pageKey)}/slots/${slotId}`, data)
}

export function createItem(
  pageKey: string,
  slotId: number,
  body: Record<string, unknown>,
) {
  return request.post<any, Result<Record<string, unknown>>>(
    `${BASE}/pages/${encPage(pageKey)}/slots/${slotId}/items`,
    body,
  )
}

export function updateItem(itemId: number, body: Record<string, unknown>) {
  return request.put<any, Result<void>>(`${BASE}/items/${itemId}`, body)
}
