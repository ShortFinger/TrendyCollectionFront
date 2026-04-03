export interface EditorPageSummary {
  pageKey: string
  title: string
  pageUrl?: string | null
  publishedRevision: number | null
  draftRevision: number | null
}

export interface EditorItemRow {
  id: number
  sortOrder: number
  contentType: string
  payload: string
  startTime?: string | null
  endTime?: string | null
  channel?: string | null
  minAppVersion?: string | null
  maxAppVersion?: string | null
}

export interface EditorSlotRow {
  id: number
  slotType: string
  sortOrder: number
  items: EditorItemRow[]
}

export interface EditorStateResponse {
  page: EditorPageSummary
  slots: EditorSlotRow[]
}
