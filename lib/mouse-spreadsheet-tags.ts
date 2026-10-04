import type { Gadget } from "@/lib/gadgets"

/** スプレッドシート K列（用途/その他の仕様）の正規化タグ */
export type MouseSpreadsheetUsageTag =
  | "gaming"
  | "ergonomic"
  | "silent"
  | "trackball"
  | "side-button"
  | "scanner"
  | "pen-mouse"

export const MOUSE_SPREADSHEET_USAGE_TAGS: MouseSpreadsheetUsageTag[] = [
  "gaming",
  "ergonomic",
  "silent",
  "trackball",
  "side-button",
  "scanner",
  "pen-mouse",
]

/** 絞り込み UI に出す主要タグ（K列 + 名称/スペックから同期） */
export const MOUSE_USAGE_SPEC_PRIMARY_TAGS: MouseSpreadsheetUsageTag[] = [
  "gaming",
  "ergonomic",
  "silent",
  "trackball",
  "side-button",
]

export const MOUSE_USAGE_SPEC_FILTER_LABELS: Record<MouseSpreadsheetUsageTag, string> = {
  gaming: "ゲーミング",
  ergonomic: "エルゴノミクス",
  silent: "静音仕様",
  trackball: "トラックボール",
  "side-button": "サイドボタン付き",
  scanner: "スキャナー機能",
  "pen-mouse": "ペン型マウス",
}

export type MouseUsageSpecFilterId = `mouse-usage-${MouseSpreadsheetUsageTag}`

export function mouseUsageSpecFilterId(tag: MouseSpreadsheetUsageTag): MouseUsageSpecFilterId {
  return `mouse-usage-${tag}`
}

export function isMouseUsageSpecFilterId(id: string): id is MouseUsageSpecFilterId {
  return id.startsWith("mouse-usage-")
}

export function mouseUsageSpecFilterTagFromId(id: MouseUsageSpecFilterId): MouseSpreadsheetUsageTag {
  return id.slice("mouse-usage-".length) as MouseSpreadsheetUsageTag
}

function isEmptySpreadsheetValue(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "-" || t === "—"
}

export type MouseSpreadsheetRowInput = {
  kColumn?: string | null
  name?: string | null
  fullTitle?: string | null
  reading?: string | null
  buttons?: string | null
}

/** CSV 行（K列 + 名称/スペック）から用途タグを抽出 */
export function extractMouseSpreadsheetUsageTags(
  input: MouseSpreadsheetRowInput,
): MouseSpreadsheetUsageTag[] {
  const kCol = input.kColumn?.trim() ?? ""
  const text = [kCol, input.name, input.fullTitle, input.reading, input.buttons]
    .filter((v) => v && !isEmptySpreadsheetValue(v))
    .join(" ")
    .normalize("NFKC")

  const tags = new Set<MouseSpreadsheetUsageTag>()

  if (/ゲーミング/i.test(kCol) || /ゲーミング|gaming\s*mouse|e-?sports|esports/i.test(text)) {
    tags.add("gaming")
  }
  if (/エルゴノミ/i.test(text) || /ergonomic/i.test(text)) tags.add("ergonomic")
  if (/静音|サイレント|silent\s*click|quiet\s*click/i.test(text)) tags.add("silent")
  if (/トラックボール|trackball/i.test(text)) tags.add("trackball")
  if (/サイドボタン|side\s*button|thumb\s*button|[5-9５-９]\s*ボタン|[5-9５-９]ボタン/i.test(text)) {
    tags.add("side-button")
  }
  if (/スキャナー/i.test(kCol)) tags.add("scanner")
  if (/ペン型/i.test(kCol)) tags.add("pen-mouse")

  return MOUSE_SPREADSHEET_USAGE_TAGS.filter((tag) => tags.has(tag))
}

export function getMouseSpreadsheetUsageTags(gadget: Gadget): MouseSpreadsheetUsageTag[] {
  if (gadget.category !== "mouse") return []
  const explicit = gadget.mouseSpreadsheetUsageSpecs ?? []
  return MOUSE_SPREADSHEET_USAGE_TAGS.filter((tag) => explicit.includes(tag))
}

export function hasMouseSpreadsheetUsageTag(
  gadget: Gadget,
  tag: MouseSpreadsheetUsageTag,
): boolean {
  return getMouseSpreadsheetUsageTags(gadget).includes(tag)
}

export function matchesMouseUsageSpecFilterId(
  gadget: Gadget,
  id: MouseUsageSpecFilterId,
): boolean {
  if (gadget.category !== "mouse") return false
  return hasMouseSpreadsheetUsageTag(gadget, mouseUsageSpecFilterTagFromId(id))
}
