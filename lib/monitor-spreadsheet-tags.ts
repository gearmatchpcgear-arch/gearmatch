import type { Gadget } from "@/lib/gadgets"

/** スプレッドシート L列（追加絞り込みタグ）の正規化ラベル */
export type MonitorSpreadsheetLTag = "曲面"

export const MONITOR_SPREADSHEET_L_TAGS: MonitorSpreadsheetLTag[] = ["曲面"]

export const MONITOR_SPREADSHEET_L_TAG_LABELS: Record<MonitorSpreadsheetLTag, string> = {
  曲面: "曲面",
}

const L_FILTER_IDS: Record<MonitorSpreadsheetLTag, `mon-sheet-l-${string}`> = {
  曲面: "mon-sheet-l-curved",
}

export type MonitorSpreadsheetLFilterId = (typeof L_FILTER_IDS)[MonitorSpreadsheetLTag]
export type MonitorSpreadsheetFilterId = MonitorSpreadsheetLFilterId

export function monitorSpreadsheetLFilterId(tag: MonitorSpreadsheetLTag): MonitorSpreadsheetLFilterId {
  return L_FILTER_IDS[tag]
}

export function isMonitorSpreadsheetFilterId(id: string): id is MonitorSpreadsheetFilterId {
  return id.startsWith("mon-sheet-l-")
}

function isEmptyTag(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "-" || t === "—"
}

/** スプレッドシート L列の生値 → 正規化タグ（空・「-」は除外） */
export function normalizeMonitorSpreadsheetLTag(
  raw: string | undefined | null,
): MonitorSpreadsheetLTag | null {
  if (isEmptyTag(raw)) return null
  const t = raw.trim().normalize("NFKC")
  if (/曲面|curved/i.test(t)) return "曲面"
  return null
}

export function getMonitorSpreadsheetLTags(gadget: Gadget): MonitorSpreadsheetLTag[] {
  if (gadget.category !== "monitor") return []
  const explicit = gadget.monitorSpreadsheetLTags ?? []
  return MONITOR_SPREADSHEET_L_TAGS.filter((t) => explicit.includes(t))
}

export function hasMonitorSpreadsheetLTag(gadget: Gadget, tag: MonitorSpreadsheetLTag): boolean {
  return getMonitorSpreadsheetLTags(gadget).includes(tag)
}

export function monitorSpreadsheetFilterMatch(
  gadget: Gadget,
  id: MonitorSpreadsheetFilterId,
): boolean {
  if (gadget.category !== "monitor") return false
  if (id === "mon-sheet-l-curved") return hasMonitorSpreadsheetLTag(gadget, "曲面")
  return false
}
