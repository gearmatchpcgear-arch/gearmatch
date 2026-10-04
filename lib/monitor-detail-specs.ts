import type { Gadget, SpecGroup, SpecRow } from "@/lib/gadgets"
import { getMonitorVesaStandardDisplay } from "@/lib/monitor-vesa-standard"

const UNSPECIFIED_SPEC = "—" as const

/** 詳細モーダルに表示しないランキング・検索系ラベル */
const HIDDEN_DETAIL_LABELS = new Set([
  "Amazonギフト",
  "Amazon新着",
  "Amazon売れ筋",
  "Amazon新着ランキング",
  "Amazon検索",
  "検索順位",
])

const HIDDEN_DETAIL_GROUP_TITLES = new Set(["Amazon検索"])

function allRows(gadget: Gadget): SpecRow[] {
  return gadget.specGroups.flatMap((g) => g.rows)
}

function findRowValue(gadget: Gadget, labels: string[]): string | null {
  for (const label of labels) {
    const row = allRows(gadget).find((r) => r.label === label)
    if (row?.value && row.value !== UNSPECIFIED_SPEC) return row.value
  }
  return null
}

function isHiddenDetailLabel(label: string) {
  return HIDDEN_DETAIL_LABELS.has(label)
}

/** 詳細の重量表示（kg を優先。g のみの場合は kg に換算） */
export function formatMonitorDetailWeight(value: string): string {
  if (!value || value === UNSPECIFIED_SPEC) return value
  if (/\bkg\b/i.test(value)) return value

  const gMatch = value.match(/(約\s*)?([\d,]+)\s*g\b/i)
  if (gMatch) {
    const grams = Number(gMatch[2].replace(/,/g, ""))
    if (Number.isFinite(grams) && grams > 0) {
      const prefix = gMatch[1] ?? ""
      const kg = grams / 1000
      const formatted = Number.isInteger(kg) ? String(kg) : kg.toFixed(1)
      return `${prefix}${formatted} kg`
    }
  }
  return value
}

export function inferMonitorVesa(gadget: Gadget): string {
  return getMonitorVesaStandardDisplay(gadget)
}

export function inferMonitorWeightKg(gadget: Gadget): string {
  const explicit = findRowValue(gadget, ["重量"])
  if (explicit) return formatMonitorDetailWeight(explicit)

  const fromHighlight = gadget.highlights.find((h) => h.label === "重量")?.value
  if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) {
    return formatMonitorDetailWeight(fromHighlight)
  }

  return UNSPECIFIED_SPEC
}

function filterRows(rows: SpecRow[]): SpecRow[] {
  return rows.filter((row) => !isHiddenDetailLabel(row.label))
}

/** 詳細モーダル用: Amazon検索・ランキング系のグループ/行を除外 */
export function filterDetailSpecGroups(groups: SpecGroup[]): SpecGroup[] {
  return groups
    .filter((group) => !HIDDEN_DETAIL_GROUP_TITLES.has(group.title))
    .map((group) => ({ ...group, rows: filterRows(group.rows) }))
    .filter((group) => group.rows.length > 0)
}

/** モニター詳細モーダル用スペック（Amazonランキング非表示・本体情報を統合） */
export function getMonitorDetailSpecGroups(gadget: Gadget): SpecGroup[] {
  if (gadget.category !== "monitor") return gadget.specGroups

  const displayGroup = gadget.specGroups.find((g) => /ディスプレイ|画面/i.test(g.title))

  const displayRows = filterRows(displayGroup?.rows ?? []).filter(
    (row) => row.label !== "アスペクト比",
  )

  const bodyRows: SpecRow[] = [
    { label: "VESA規格", value: inferMonitorVesa(gadget) },
    { label: "重量", value: inferMonitorWeightKg(gadget) },
  ]

  const groups: SpecGroup[] = [{ title: "ディスプレイ", rows: displayRows }]

  groups.push({ title: "本体", rows: bodyRows })

  for (const group of gadget.specGroups) {
    if (HIDDEN_DETAIL_GROUP_TITLES.has(group.title)) continue
    if (/ディスプレイ|画面|接続端子|端子|ポート/i.test(group.title)) continue

    const rows = filterRows(group.rows).filter(
      (row) =>
        row.label !== "重量" &&
        row.label !== "寸法" &&
        row.label !== "VESA" &&
        row.label !== "壁掛け対応" &&
        row.label !== "壁掛け対応（VESA規格）" &&
        row.label !== "アスペクト比",
    )
    if (rows.length > 0) groups.push({ title: group.title, rows })
  }

  return groups
}
