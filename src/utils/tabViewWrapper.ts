import { defineComponent, h, type Component } from 'vue'

const wrapperByFullPath = new Map<string, Component>()
const nameByFullPath = new Map<string, string>()

let seq = 0

/** Call from router `afterEach` when registering a new tab so `KeepAlive` `include` has a stable name. */
export function allocateCacheName(fullPath: string): string {
  const existing = nameByFullPath.get(fullPath)
  if (existing) return existing
  seq += 1
  const name = `AdminTab_${seq}`
  nameByFullPath.set(fullPath, name)
  return name
}

/** Only from Layout `router-view` slot; `Inner` must match the resolved page component. */
export function getOrCreateTabWrapper(fullPath: string, Inner: Component): Component {
  let w = wrapperByFullPath.get(fullPath)
  if (w) return w
  const cacheName = nameByFullPath.get(fullPath)
  if (!cacheName) {
    throw new Error('[tabViewWrapper] allocateCacheName must run before getOrCreateTabWrapper')
  }
  w = defineComponent({
    name: cacheName,
    setup() {
      return () => h(Inner)
    },
  })
  wrapperByFullPath.set(fullPath, w)
  return w
}

export function getCacheNameForPath(fullPath: string): string | undefined {
  return nameByFullPath.get(fullPath)
}

export function destroyTabWrapper(fullPath: string): string | undefined {
  const name = nameByFullPath.get(fullPath)
  wrapperByFullPath.delete(fullPath)
  nameByFullPath.delete(fullPath)
  return name
}

export function destroyAllTabWrappers(): void {
  wrapperByFullPath.clear()
  nameByFullPath.clear()
  seq = 0
}

export function registeredCacheNames(): string[] {
  return [...nameByFullPath.values()]
}
