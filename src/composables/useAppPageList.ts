import { ref } from 'vue'
import { listPages } from '@/api/appCms'
import type { EditorPageSummary } from '@/types/appCms'

const pages = ref<EditorPageSummary[]>([])
const loadError = ref<string | null>(null)

function errMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const d = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    if (typeof d === 'string' && d) return d
  }
  if (e instanceof Error) return e.message
  return String(e)
}

export function useAppPageList() {
  async function fetchAppPages() {
    try {
      const res = await listPages()
      pages.value = res.data ?? []
      loadError.value = null
    } catch (e: unknown) {
      pages.value = []
      loadError.value = errMessage(e)
    }
  }

  return { pages, loadError, fetchAppPages }
}
