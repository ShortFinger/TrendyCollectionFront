import type { SlotTypeCatalogEntry } from '@/types/appCms'

export function catalogEntry(
  catalog: SlotTypeCatalogEntry[] | undefined | null,
  code: string,
): SlotTypeCatalogEntry | undefined {
  if (!catalog?.length) return undefined
  return catalog.find((e) => e.code === code)
}

export function catalogLabel(
  catalog: SlotTypeCatalogEntry[] | undefined | null,
  code: string,
): string {
  return catalogEntry(catalog, code)?.label?.trim() || code
}

export function enabledCatalogForSelect(
  catalog: SlotTypeCatalogEntry[] | undefined | null,
): SlotTypeCatalogEntry[] {
  if (!catalog?.length) return []
  return [...catalog]
    .filter((e) => e.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
}

export function pickDefaultNewSlotType(catalog: SlotTypeCatalogEntry[] | undefined | null): string {
  const first = enabledCatalogForSelect(catalog)[0]
  return first?.code ?? ''
}

export function defaultContentTypeForSlot(
  catalog: SlotTypeCatalogEntry[] | undefined | null,
  slotType: string,
): string | undefined {
  return catalogEntry(catalog, slotType)?.defaultContentType
}

export function isKnownCatalogCode(
  catalog: SlotTypeCatalogEntry[] | undefined | null,
  code: string,
): boolean {
  return catalogEntry(catalog, code) != null
}
