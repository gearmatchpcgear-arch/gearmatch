import type { Gadget } from "@/lib/gadgets"
import {
  getKeyboardInternalStructureFilterValue,
  matchesKeyboardInternalStructureFilterLabel,
  EXCLUDED_INTERNAL_STRUCTURE_FILTER_LABELS,
  KEYBOARD_INTERNAL_STRUCTURE_FILTER_LABELS,
} from "@/lib/keyboard-filter-tags"

/** スプレッドシート由来の動的絞り込み filter ID（kb-sheet-{key}） */
export type KeyboardSpreadsheetFilterId = `kb-sheet-${string}`

export const KEYBOARD_SPREADSHEET_FILTER_PREFIX = "kb-sheet-"

export function isKeyboardSpreadsheetFilterId(id: string): id is KeyboardSpreadsheetFilterId {
  return id.startsWith(KEYBOARD_SPREADSHEET_FILTER_PREFIX) && id.length > KEYBOARD_SPREADSHEET_FILTER_PREFIX.length
}

export function keyboardSpreadsheetFilterId(key: string): KeyboardSpreadsheetFilterId {
  return `${KEYBOARD_SPREADSHEET_FILTER_PREFIX}${key}`
}

export function keyboardSpreadsheetFilterKeyFromId(id: KeyboardSpreadsheetFilterId): string {
  return id.slice(KEYBOARD_SPREADSHEET_FILTER_PREFIX.length)
}

function isEmptySpreadsheetValue(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "-" || t === "—" || t === "未記載"
}

export {
  findFirstInternalStructureOpenParen,
  stripInternalStructureParens,
} from "@/lib/keyboard-filter-tags"

/** 表記揺れで slug が衝突しないよう、正規化済み全文から安定ハッシュを生成 */
function hashFilterLabel(label: string): string {
  const text = label.normalize("NFKC").trim()
  let h = 2_166_136_261
  for (let i = 0; i < text.length; i++) {
    h ^= text.codePointAt(i) ?? 0
    h = Math.imul(h, 1_677_761_9)
  }
  return (h >>> 0).toString(36)
}

function uniqueSpreadsheetFilterKey(prefix: string, label: string): string {
  return `${prefix}-${hashFilterLabel(label)}`
}

function dedupeSpreadsheetFilterOptions(
  options: KeyboardSpreadsheetFilterOption[],
): KeyboardSpreadsheetFilterOption[] {
  const seen = new Set<string>()
  return options.filter((option) => {
    if (seen.has(option.id)) return false
    seen.add(option.id)
    return true
  })
}

export function parseKeyboardPollingRateHz(raw: string | undefined | null): number | null {
  if (isEmptySpreadsheetValue(raw)) return null
  const t = raw!.trim().normalize("NFKC").replace(/,/g, "")

  const kMatch = t.match(/(\d+(?:\.\d+)?)\s*[kK]\b/)
  if (kMatch) {
    const num = Number(kMatch[1]) * 1000
    if (Number.isFinite(num) && num > 0) return Math.round(num)
  }

  const hzMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:Hz|HZ|hz)\b/)
  if (hzMatch) {
    const num = Number(hzMatch[1])
    if (Number.isFinite(num) && num > 0) return Math.round(num)
  }

  return null
}

export function normalizeKeyboardPollingRate(raw: string | undefined | null): string | null {
  const hz = parseKeyboardPollingRateHz(raw)
  if (hz === null) return null
  return `${hz}Hz`
}

export function parseKeyboardSpreadsheetGaming(raw: string | undefined | null): boolean | null {
  if (isEmptySpreadsheetValue(raw)) return null
  const t = raw!.trim().normalize("NFKC")
  if (/ゲーミング/i.test(t)) return true
  if (/^(いいえ|否|no|n)$/i.test(t)) return false
  return null
}

export function parseKeyboardSpreadsheetRapidTrigger(raw: string | undefined | null): boolean | null {
  if (isEmptySpreadsheetValue(raw)) return null
  const t = raw!.trim().normalize("NFKC")
  if (/ラピッドトリガー/i.test(t)) return true
  if (/^(いいえ|否|no|n)$/i.test(t)) return false
  return null
}

export function parseKeyboardSpreadsheetFeatures(raw: string | undefined | null): string[] {
  if (isEmptySpreadsheetValue(raw)) return []
  return [
    ...new Set(
      raw!
        .split(/[、,/／|]/)
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ]
}

function readSpecRow(gadget: Gadget, label: string): string {
  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === label)
    if (row?.value && row.value !== "—" && row.value.trim()) return row.value.trim()
  }
  return ""
}

export function getKeyboardSpreadsheetGaming(gadget: Gadget): boolean | null {
  if (gadget.category !== "keyboard") return null
  if (gadget.keyboardSpreadsheetGaming !== undefined) return gadget.keyboardSpreadsheetGaming
  return null
}

export function getKeyboardPollingRate(gadget: Gadget): string | null {
  if (gadget.category !== "keyboard") return null
  const fromField = gadget.keyboardPollingRate
  if (fromField && !isEmptySpreadsheetValue(fromField)) {
    const normalized = normalizeKeyboardPollingRate(fromField)
    if (normalized) return normalized
  }
  const fromSpec = readSpecRow(gadget, "ポーリングレート")
  return fromSpec ? normalizeKeyboardPollingRate(fromSpec) : null
}

export function formatKeyboardPollingRateFilterLabel(rate: string): string {
  return `ポーリングレート ${rate}`
}

/** フィルター表示ラベル（例: ポーリングレート 1000Hz）→ 正規化Hz値 */
export function normalizeKeyboardPollingRateFilterLabel(label: string): string | null {
  const stripped = label.replace(/^ポーリングレート\s+/u, "").trim()
  return normalizeKeyboardPollingRate(stripped)
}

export function matchesKeyboardPollingRateFilterLabel(
  gadget: Gadget,
  filterLabel: string,
): boolean {
  const rate = getKeyboardPollingRate(gadget)
  const target = normalizeKeyboardPollingRateFilterLabel(filterLabel)
  if (!rate || !target) return false
  return rate === target
}

export function getKeyboardSpreadsheetRapidTrigger(gadget: Gadget): boolean | null {
  if (gadget.category !== "keyboard") return null
  if (gadget.keyboardSpreadsheetRapidTrigger !== undefined) {
    return gadget.keyboardSpreadsheetRapidTrigger
  }
  return null
}

export function getKeyboardLayoutArray(gadget: Gadget): string {
  if (gadget.category !== "keyboard") return "—"
  const fromField = gadget.keyboardLayoutArray
  if (fromField && !isEmptySpreadsheetValue(fromField)) return fromField.trim()
  const fromHighlight = gadget.highlights.find((h) => h.label === "配列")?.value
  if (fromHighlight && !isEmptySpreadsheetValue(fromHighlight)) return fromHighlight.trim()
  const fromSpec = readSpecRow(gadget, "配列")
  if (fromSpec) return fromSpec
  return "—"
}

export function getKeyboardSpreadsheetFeatures(gadget: Gadget): string[] {
  if (gadget.category !== "keyboard") return []
  const explicit = gadget.keyboardSpreadsheetFeatures ?? []
  if (explicit.length > 0) return explicit
  const fromSpec = readSpecRow(gadget, "特徴")
  return fromSpec ? parseKeyboardSpreadsheetFeatures(fromSpec) : []
}

export function keyboardInternalStructureFilterKey(value: string): string {
  return uniqueSpreadsheetFilterKey("structure", value)
}

export function keyboardLayoutArrayFilterKey(value: string): string {
  return uniqueSpreadsheetFilterKey("layout", value)
}

export function keyboardPollingRateFilterKey(value: string): string {
  return uniqueSpreadsheetFilterKey("poll", value)
}

export function keyboardFeatureFilterKey(value: string): string {
  return uniqueSpreadsheetFilterKey("feature", value)
}

export function matchesKeyboardSpreadsheetFilterId(
  gadget: Gadget,
  filterId: KeyboardSpreadsheetFilterId,
): boolean {
  const key = keyboardSpreadsheetFilterKeyFromId(filterId)

  if (key.startsWith("structure-")) {
    for (const label of KEYBOARD_INTERNAL_STRUCTURE_FILTER_LABELS) {
      if (keyboardInternalStructureFilterKey(label) === key) {
        return matchesKeyboardInternalStructureFilterLabel(gadget, label)
      }
    }
    return false
  }

  if (key.startsWith("layout-")) {
    const layout = getKeyboardLayoutArray(gadget)
    if (layout === "—") return false
    return keyboardLayoutArrayFilterKey(layout) === key
  }

  if (key.startsWith("poll-")) {
    const rate = getKeyboardPollingRate(gadget)
    if (!rate) return false
    return keyboardPollingRateFilterKey(rate) === key
  }

  if (key.startsWith("feature-")) {
    const features = getKeyboardSpreadsheetFeatures(gadget)
    return features.some((feature) => keyboardFeatureFilterKey(feature) === key)
  }

  return false
}

export type KeyboardSpreadsheetFilterOption = {
  id: KeyboardSpreadsheetFilterId
  label: string
  count: number
  match: (gadget: Gadget) => boolean
}

export function buildKeyboardInternalStructureFilters(
  gadgets: Gadget[],
  minCount = 3,
): KeyboardSpreadsheetFilterOption[] {
  const keyboards = gadgets.filter((gadget) => gadget.category === "keyboard")

  return dedupeSpreadsheetFilterOptions(
    KEYBOARD_INTERNAL_STRUCTURE_FILTER_LABELS.filter(
      (label) => !EXCLUDED_INTERNAL_STRUCTURE_FILTER_LABELS.has(label),
    )
      .map((label) => {
        const count = keyboards.filter((gadget) =>
          matchesKeyboardInternalStructureFilterLabel(gadget, label),
        ).length
        return { label, count }
      })
      .filter(({ label, count }) => count >= minCount)
      .sort((a, b) => a.label.localeCompare(b.label, "ja"))
      .map(({ label, count }) => {
        const key = keyboardInternalStructureFilterKey(label)
        const id = keyboardSpreadsheetFilterId(key)
        return {
          id,
          label,
          count,
          match: (gadget: Gadget) => matchesKeyboardInternalStructureFilterLabel(gadget, label),
        }
      }),
  )
}

export function buildKeyboardLayoutArrayFilters(
  gadgets: Gadget[],
  minCount = 3,
): KeyboardSpreadsheetFilterOption[] {
  const counts = new Map<string, number>()

  for (const gadget of gadgets) {
    if (gadget.category !== "keyboard") continue
    const value = getKeyboardLayoutArray(gadget)
    if (value === "—") continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return dedupeSpreadsheetFilterOptions(
    [...counts.entries()]
      .filter(([, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
      .map(([value, count]) => {
        const key = keyboardLayoutArrayFilterKey(value)
        const id = keyboardSpreadsheetFilterId(key)
        return {
          id,
          label: value,
          count,
          match: (gadget: Gadget) => matchesKeyboardSpreadsheetFilterId(gadget, id),
        }
      }),
  )
}

export function buildKeyboardPollingRateFilters(
  gadgets: Gadget[],
  minCount = 3,
): KeyboardSpreadsheetFilterOption[] {
  const counts = new Map<string, number>()

  for (const gadget of gadgets) {
    if (gadget.category !== "keyboard") continue
    const value = getKeyboardPollingRate(gadget)
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return dedupeSpreadsheetFilterOptions(
    [...counts.entries()]
      .filter(([, count]) => count >= minCount)
      .sort((a, b) => {
        const aNum = Number(a[0].replace(/[^\d]/g, "")) || 0
        const bNum = Number(b[0].replace(/[^\d]/g, "")) || 0
        return bNum - aNum || a[0].localeCompare(b[0], "ja")
      })
      .map(([value, count]) => {
        const key = keyboardPollingRateFilterKey(value)
        const id = keyboardSpreadsheetFilterId(key)
        return {
          id,
          label: formatKeyboardPollingRateFilterLabel(value),
          count,
          match: (gadget: Gadget) => matchesKeyboardPollingRateFilterLabel(gadget, value),
        }
      }),
  )
}

export function buildKeyboardFeatureFilters(
  gadgets: Gadget[],
  minCount = 3,
): KeyboardSpreadsheetFilterOption[] {
  const counts = new Map<string, number>()

  for (const gadget of gadgets) {
    if (gadget.category !== "keyboard") continue
    for (const feature of getKeyboardSpreadsheetFeatures(gadget)) {
      counts.set(feature, (counts.get(feature) ?? 0) + 1)
    }
  }

  return dedupeSpreadsheetFilterOptions(
    [...counts.entries()]
      .filter(([, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
      .map(([value, count]) => {
        const key = keyboardFeatureFilterKey(value)
        const id = keyboardSpreadsheetFilterId(key)
        return {
          id,
          label: value,
          count,
          match: (gadget: Gadget) => matchesKeyboardSpreadsheetFilterId(gadget, id),
        }
      }),
  )
}
