import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import { useRouter } from 'vue-router'
import {
  allocateCacheName,
  destroyAllTabWrappers,
  destroyTabWrapper,
} from '@/utils/tabViewWrapper'
import { fallbackPathForRouteName } from '@/utils/tabCloseFallback'

export const MAX_TABS = 20

export interface AdminTabItem {
  fullPath: string
  title: string
  cacheName: string
}

function titleFromRoute(route: RouteLocationNormalized): string {
  const t = route.meta?.title
  if (typeof t === 'string' && t.trim()) return t.trim()
  if (typeof route.name === 'string' && route.name) return route.name
  return route.fullPath
}

function shouldTrackRoute(route: RouteLocationNormalized): boolean {
  if (route.meta?.public) return false
  if (route.matched.length < 2) return false
  return true
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<AdminTabItem[]>([])
  const router = useRouter()

  const includeNames = computed(() => tabs.value.map((t) => t.cacheName))

  function has(fullPath: string): boolean {
    return tabs.value.some((t) => t.fullPath === fullPath)
  }

  function syncFromRoute(route: RouteLocationNormalized) {
    if (!shouldTrackRoute(route)) return
    const fp = route.fullPath
    if (tabs.value.some((t) => t.fullPath === fp)) return

    const cacheName = allocateCacheName(fp)
    tabs.value.push({
      fullPath: fp,
      title: titleFromRoute(route),
      cacheName,
    })
  }

  function updateTitle(route: RouteLocationNormalized) {
    if (!shouldTrackRoute(route)) return
    const item = tabs.value.find((t) => t.fullPath === route.fullPath)
    if (item) item.title = titleFromRoute(route)
  }

  function clear() {
    tabs.value = []
    destroyAllTabWrappers()
  }

  function removeTabEntry(fullPath: string) {
    destroyTabWrapper(fullPath)
    const idx = tabs.value.findIndex((t) => t.fullPath === fullPath)
    if (idx !== -1) tabs.value.splice(idx, 1)
  }

  /** Drop wrapper + tab row so `afterEach` can re-register (used by「刷新」). */
  function purgeTabForRemount(fullPath: string) {
    removeTabEntry(fullPath)
  }

  /** Spec §4.5: close current → prefer right neighbor tab, else left, else dashboard. */
  async function navigateAfterClosingCurrent(closedIdx: number) {
    const right = tabs.value[closedIdx]
    const left = tabs.value[closedIdx - 1]
    const next = right ?? left
    if (next) {
      await router.push(next.fullPath)
      return
    }
    await router.push('/dashboard')
  }

  async function closeByFullPath(fullPath: string) {
    const idx = tabs.value.findIndex((t) => t.fullPath === fullPath)
    if (idx === -1) return

    const currentFp = router.currentRoute.value.fullPath
    const closingCurrent = currentFp === fullPath

    removeTabEntry(fullPath)

    if (!closingCurrent) return

    await navigateAfterClosingCurrent(idx)
  }

  /**
   * Current page has `meta.hidden`: prefer `back()`, then fallback replace (spec §4.6).
   * Removes the closed tab entry after navigation.
   */
  async function closeCurrentHiddenTab() {
    const fp = router.currentRoute.value.fullPath
    const routeName = router.currentRoute.value.name

    await router.back()
    await nextTick()

    if (router.currentRoute.value.fullPath === fp) {
      await router.replace(fallbackPathForRouteName(routeName))
    }

    removeTabEntry(fp)
  }

  return {
    tabs,
    includeNames,
    has,
    MAX_TABS,
    syncFromRoute,
    updateTitle,
    clear,
    closeByFullPath,
    closeCurrentHiddenTab,
    purgeTabForRemount,
  }
})
