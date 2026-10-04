import type { Gadget } from "@/lib/gadgets"
import {
  normalizeMouseButtonCountLabel,
  normalizeMouseButtonCountStored,
} from "@/lib/spec-display-normalize"

const UNSPECIFIED = "—"

export const DEFAULT_MOUSE_BUTTON_COUNT = 3
export const DEFAULT_MOUSE_BUTTON_COUNT_LABEL = "3ボタン"

/** CSV H列などの生値 → { count, label }（全角数字対応） */
export function parseMouseButtonCount(
  rawVal: string | null | undefined,
  productName = "",
  tagline = "",
): { count: number; label: string } {
  const fromColumn = parseMouseButtonCountNumber(rawVal)
  if (fromColumn !== null) {
    return { count: fromColumn, label: `${fromColumn}ボタン` }
  }
  const hay = [productName, tagline].filter(Boolean).join(" ")
  const count = inferMouseButtonCountNumberFromText(hay)
  return { count, label: `${count}ボタン` }
}

/** 表示ラベル・生値 → 絞り込み用数値 */
export function parseMouseButtonCountNumber(raw?: string | null): number | null {
  const label = normalizeMouseButtonCountLabel(raw)
  if (label) {
    const n = Number(label.replace(/ボタン$/, ""))
    return Number.isFinite(n) ? n : null
  }
  const stored = normalizeMouseButtonCountStored(raw)
  if (stored) {
    const n = Number(stored)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** 名称・説明からボタン数を推定（未入力時のフォールバック） */
export function inferMouseButtonCountNumberFromText(text: string): number {
  const t = text.normalize("NFKC")
  const patterns = [
    /(\d+)\s*ボタン/i,
    /(\d+)\s*(?:programmable\s+)?buttons?/i,
    /(\d+)-button/i,
    /(\d+)個/i,
  ]
  for (const pattern of patterns) {
    const match = t.match(pattern)
    if (match) {
      const n = Number(match[1])
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return DEFAULT_MOUSE_BUTTON_COUNT
}

export function inferMouseButtonCountLabelFromText(text: string): string {
  return `${inferMouseButtonCountNumberFromText(text)}ボタン`
}

/** H列 → 表示ラベル（空の場合は名称等から推定） */
export function resolveMouseButtonCountLabelFromSpreadsheet(
  rawButtons: string | null | undefined,
  name: string | null | undefined,
  tagline: string | null | undefined,
): string {
  const fromColumn = normalizeMouseButtonCountLabel(rawButtons)
  if (fromColumn) return fromColumn
  return parseMouseButtonCount(rawButtons, name ?? "", tagline ?? "").label
}

/** 絞り込み・判定用のボタン数（H列優先 → スペック → 名称推定） */
export function resolveMouseButtonCountNumber(gadget: Gadget): number {
  if (gadget.category !== "mouse") return DEFAULT_MOUSE_BUTTON_COUNT

  const fromSpreadsheet = parseMouseButtonCountNumber(gadget.mouseSpreadsheetButtonCount)
  if (fromSpreadsheet !== null) return fromSpreadsheet

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "ボタン数")
    const fromSpec = parseMouseButtonCountNumber(row?.value)
    if (fromSpec !== null) return fromSpec
  }

  const fromHighlight = gadget.highlights.find((h) => h.label === "ボタン数")?.value
  const fromHighlightParsed = parseMouseButtonCountNumber(fromHighlight)
  if (fromHighlightParsed !== null) return fromHighlightParsed

  return inferMouseButtonCountNumberFromText([gadget.name, gadget.tagline].filter(Boolean).join(" "))
}

/** 一覧カード用のボタン数表示（H列と一致する "Nボタン" 表記） */
export function getMouseButtonCountDisplay(gadget: Gadget): string {
  if (gadget.category !== "mouse") return UNSPECIFIED

  const fromSpreadsheet = normalizeMouseButtonCountLabel(gadget.mouseSpreadsheetButtonCount)
  if (fromSpreadsheet) return fromSpreadsheet

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "ボタン数")
    const fromSpec = normalizeMouseButtonCountLabel(row?.value)
    if (fromSpec) return fromSpec
  }

  const fromHighlight = gadget.highlights.find((h) => h.label === "ボタン数")?.value
  const fromHighlightLabel = normalizeMouseButtonCountLabel(fromHighlight)
  if (fromHighlightLabel) return fromHighlightLabel

  return inferMouseButtonCountLabelFromText([gadget.name, gadget.tagline].filter(Boolean).join(" "))
}
