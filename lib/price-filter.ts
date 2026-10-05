import { getCardDisplayPrice, type Gadget } from "./gadgets"

export type AppliedPriceRange = {
  min: number | null
  max: number | null
}

export type PriceRangePreset = {
  id: string
  label: string
  min: number | null
  max: number | null
}

export const PRICE_RANGE_PRESETS: PriceRangePreset[] = [
  { id: "under-5000", label: "〜5,000円", min: null, max: 5000 },
  { id: "under-10000", label: "〜1万円", min: null, max: 10000 },
  { id: "under-13000", label: "〜1.3万円", min: null, max: 13000 },
  { id: "5000-10000", label: "5,000〜1万円", min: 5000, max: 10000 },
  { id: "10000-20000", label: "1万〜2万円", min: 10000, max: 20000 },
  { id: "over-20000", label: "2万円〜", min: 20000, max: null },
]

const FULLWIDTH_DIGITS = "０１２３４５６７８９"

const MISSING_PRICE_TOKENS = new Set(["", "-", "—"])

/** カード等の価格値を円単位の整数に正規化（文字列・数値・null/undefined 対応）。無効時は null */
export function parsePrice(priceVal: unknown): number | null {
  if (priceVal === null || priceVal === undefined) return null

  if (typeof priceVal === "number") {
    return Number.isFinite(priceVal) && priceVal >= 0 ? priceVal : null
  }

  const trimmed = String(priceVal).trim()
  if (MISSING_PRICE_TOKENS.has(trimmed)) return null

  return parsePriceInput(trimmed)
}

/** 入力文字列を円単位の整数に変換（全角数字・カンマ・円記号対応）。無効時は null */
export function parsePriceInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let normalized = trimmed
  for (let i = 0; i < FULLWIDTH_DIGITS.length; i++) {
    normalized = normalized.replaceAll(FULLWIDTH_DIGITS[i]!, String(i))
  }

  normalized = normalized
    .replace(/[¥￥,\s]/g, "")
    .replace(/[円]/g, "")

  if (!/^\d+$/.test(normalized)) return null

  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

export function formatPriceInputValue(value: number | null): string {
  if (value == null) return ""
  return value.toLocaleString("ja-JP")
}

/** min > max のとき順序を入れ替え */
export function normalizePriceRange(
  min: number | null,
  max: number | null,
): { min: number | null; max: number | null; swapped: boolean } {
  if (min != null && max != null && min > max) {
    return { min: max, max: min, swapped: true }
  }
  return { min, max, swapped: false }
}

export function isPriceRangeActive(range: AppliedPriceRange): boolean {
  return range.min != null || range.max != null
}

export function matchesPriceRange(gadget: Gadget, range: AppliedPriceRange): boolean {
  if (!isPriceRangeActive(range)) return true

  const cardPrice = parsePrice(getCardDisplayPrice(gadget))
  if (cardPrice === null) return false

  const { min, max } = normalizePriceRange(range.min, range.max)
  if (min != null && cardPrice < min) return false
  if (max != null && cardPrice > max) return false
  return true
}

/** 適用中の価格帯（カード表示価格ベース）の説明文 */
export function formatAppliedPriceRangeSummary(range: AppliedPriceRange): string {
  const { min, max } = normalizePriceRange(range.min, range.max)
  if (min == null && max == null) return ""
  if (min == null && max != null) {
    return `カード表示価格が ${formatPriceInputValue(max)}円以下`
  }
  if (min != null && max == null) {
    return `カード表示価格が ${formatPriceInputValue(min)}円以上`
  }
  return `カード表示価格が ${formatPriceInputValue(min)}円〜${formatPriceInputValue(max)}円`
}

export function priceRangeEquals(a: AppliedPriceRange, b: AppliedPriceRange): boolean {
  return a.min === b.min && a.max === b.max
}

export const EMPTY_PRICE_RANGE: AppliedPriceRange = { min: null, max: null }

export const PRICE_SLIDER_MIN = 0
export const PRICE_SLIDER_STEP = 1000
export const DEFAULT_PRICE_SLIDER_MAX = 100_000

/**
 * スライダー上限（常に 10 万円）。
 * 右端は「¥100,000+」表示。最大ハンドルが右端のとき適用 max は null となり、10 万円超も含めて表示する。
 */
export function computePriceSliderMax(_prices: Array<unknown>): number {
  return DEFAULT_PRICE_SLIDER_MAX
}

/** スライダー用に step 単位へ丸めつつ 0〜上限に収める */
export function clampToPriceSliderStep(value: number, sliderMax: number): number {
  const snapped = Math.round(value / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP
  return Math.max(PRICE_SLIDER_MIN, Math.min(snapped, sliderMax))
}

export function appliedRangeToSliderValues(
  range: AppliedPriceRange,
  sliderMax: number,
): [number, number] {
  const rawMin = range.min ?? PRICE_SLIDER_MIN
  const rawMax = range.max ?? sliderMax
  const min = Math.max(PRICE_SLIDER_MIN, Math.min(rawMin, sliderMax))
  const max = Math.max(min, Math.min(rawMax, sliderMax))
  return [min, max]
}

export function sliderValuesToAppliedRange(
  values: readonly [number, number],
  sliderMax: number,
): AppliedPriceRange {
  const lo = Math.min(values[0], values[1])
  const hi = Math.max(values[0], values[1])
  const normalized = normalizePriceRange(
    lo <= PRICE_SLIDER_MIN ? null : lo,
    hi >= sliderMax ? null : hi,
  )
  return { min: normalized.min, max: normalized.max }
}

export function isFullPriceSliderRange(
  values: readonly [number, number],
  sliderMax: number,
): boolean {
  return values[0] <= PRICE_SLIDER_MIN && values[1] >= sliderMax
}

export function formatPriceSliderLabel(value: number, sliderMax: number): string {
  const formatted = `¥${value.toLocaleString("ja-JP")}`
  return value >= sliderMax ? `${formatted}+` : formatted
}
