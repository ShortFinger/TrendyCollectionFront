/** When `router.back()` is not suitable after closing a hidden tab, `replace` to this path. */
export function fallbackPathForRouteName(name: string | symbol | undefined | null): string {
  const n = name == null ? '' : String(name)
  const map: Record<string, string> = {
    IchibanBoxes: '/gameplay/ichiban',
    UnlimitedBoxes: '/gameplay/unlimited',
    GachaPrizes: '/gameplay/gacha',
    AppPageCreate: '/app-mgmt/global',
    AppPageEditor: '/app-mgmt/global',
    AppGlobalConfig: '/app-mgmt/global',
  }
  return map[n] ?? '/dashboard'
}
