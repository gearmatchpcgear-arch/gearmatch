import type { Gadget } from "@/lib/gadgets"
import { getCardHighlights, UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { getGamingChairFrameMaterial } from "@/lib/gaming-chair-filter-tags"
import { formatShapeLabel } from "@/lib/gaming-chair-shape-display"
import { getGamingChairCsvRow, hasGamingChairCsvRow } from "@/lib/gaming-chairs-csv-data"
import { filterDetailSpecGroups, isHiddenDetailSpecLabel } from "@/lib/monitor-detail-specs"

export type GamingChairDetailSpecItem = {
  label: string
  value: string
}

export type GamingChairDetailSpecSections = {
  detailInfo: GamingChairDetailSpecItem[]
  frame: GamingChairDetailSpecItem[]
}

const SKIP_GROUP_TITLES = /^Amazon/i
const HIDDEN_SECONDARY_LABELS = new Set(["ランバーサポート", "アームレスト"])

function isHiddenSecondaryLabel(label: string): boolean {
  return HIDDEN_SECONDARY_LABELS.has(label)
}

function isPrimaryHighlightLabel(label: string, primaryLabels: Set<string>): boolean {
  if (primaryLabels.has(label)) return true
  if (label === "最大リクライニング" || label === "リクライニング") return true
  if (/寸法/.test(label) && [...primaryLabels].some((l) => /寸法/.test(l))) return true
  if (label === "オットマン" && primaryLabels.has("オットマン")) return true
  return false
}

function isFilledValue(value: string | undefined): value is string {
  if (!value?.trim()) return false
  return value !== UNSPECIFIED_SPEC && value !== "-"
}

function toDisplayValue(value: string | undefined): string {
  return isFilledValue(value) ? value : "—"
}

function shapeToDisplayValue(value: string | undefined): string {
  if (!isFilledValue(value)) return "—"
  return formatShapeLabel(value)
}

type LabelValueRow = { label: string; value: string }

function rowsFromSpecGroups(
  gadget: Gadget,
  primaryLabels: Set<string>,
  skipLabels: Set<string>,
): LabelValueRow[] {
  const seen = new Set<string>()
  const rows: LabelValueRow[] = []

  for (const group of filterDetailSpecGroups(gadget.specGroups)) {
    if (SKIP_GROUP_TITLES.test(group.title)) continue
    for (const row of group.rows) {
      if (!isFilledValue(row.value)) continue
      if (isHiddenDetailSpecLabel(row.label)) continue
      if (isPrimaryHighlightLabel(row.label, primaryLabels)) continue
      if (skipLabels.has(row.label)) continue
      if (isHiddenSecondaryLabel(row.label)) continue
      if (seen.has(row.label)) continue
      seen.add(row.label)
      rows.push({ label: row.label, value: row.value })
    }
  }

  return rows
}

function getFlatSecondaryRows(gadget: Gadget): LabelValueRow[] {
  const primaryLabels = new Set(getCardHighlights(gadget).map((h) => h.label))

  if (!hasGamingChairCsvRow(gadget)) return []

  const row = getGamingChairCsvRow(gadget.id)!
  const backrest =
    row.backrestWidth?.trim() && row.backrestWidth !== UNSPECIFIED_SPEC
      ? row.backrestWidth
      : undefined

  const fixed: LabelValueRow[] = [
    { label: "背もたれ形状", value: row.shape || UNSPECIFIED_SPEC },
    { label: "背もたれ幅", value: backrest ?? UNSPECIFIED_SPEC },
    { label: "フレームの種類", value: row.frameType || UNSPECIFIED_SPEC },
  ]

  const skip = new Set(fixed.map((r) => r.label))
  skip.add("形状")
  skip.add("オットマン")

  return [...fixed, ...rowsFromSpecGroups(gadget, primaryLabels, skip)].filter(
    (r) => !isHiddenSecondaryLabel(r.label),
  )
}

function valueFromFlat(flat: LabelValueRow[], ...labels: string[]): string | undefined {
  for (const label of labels) {
    const hit = flat.find((r) => r.label === label)
    if (hit && isFilledValue(hit.value)) return hit.value
  }
  return undefined
}

/** 詳細情報（背もたれ幅・形状）とフレーム（フレームの種類） */
export function getGamingChairDetailSpecSections(gadget: Gadget): GamingChairDetailSpecSections | null {
  if (gadget.category !== "gaming-chair") return null

  const flat = getFlatSecondaryRows(gadget)

  const backrestWidth = valueFromFlat(flat, "背もたれ幅")
  const shape = valueFromFlat(flat, "背もたれ形状", "形状")

  let frameType = valueFromFlat(flat, "フレームの種類", "フレーム材質")
  if (!frameType) {
    const fromHelper = getGamingChairFrameMaterial(gadget)
    if (isFilledValue(fromHelper)) frameType = fromHelper
  }

  return {
    detailInfo: [
      { label: "背もたれ幅", value: toDisplayValue(backrestWidth) },
      { label: "形状", value: shapeToDisplayValue(shape) },
    ],
    frame: [{ label: "フレームの種類", value: toDisplayValue(frameType) }],
  }
}
