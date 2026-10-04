import type { Gadget } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"

/** マウス絞り込み用タグ（フィルターIDと1:1対応） */
export type MouseFilterTag =
  | "reading-optical"
  | "reading-laser"
  | "reading-trackball"
  | "reading-blueled"
  | "reading-ir-other"
  | "side-buttons"
  | "side-wheel"

export const MOUSE_FILTER_TAG_LABELS: Record<MouseFilterTag, string> = {
  "reading-optical": "オプティカル / 光学式",
  "reading-laser": "レーザー / Darkfield",
  "reading-trackball": "トラックボール",
  "reading-blueled": "BlueLED",
  "reading-ir-other": "IR LED / その他",
  "side-buttons": "サイドボタン",
  "side-wheel": "サイドホイール",
}

const MOUSE_READING_FILTER_TAGS: MouseFilterTag[] = [
  "reading-optical",
  "reading-laser",
  "reading-trackball",
  "reading-blueled",
  "reading-ir-other",
]

function readingMethodValue(gadget: Gadget) {
  const fromHighlight = gadget.highlights.find((h) => h.label === "読み取り方式")?.value
  if (fromHighlight && fromHighlight !== "—") return fromHighlight

  const sensorGroup = gadget.specGroups.find((g) => /センサー|入力/i.test(g.title))
  const sensorRow = sensorGroup?.rows.find((r) => r.label === "センサー")
  if (sensorRow?.value && sensorRow.value !== "—") return sensorRow.value

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "読み取り方式")
    if (row?.value && row.value !== "—") return row.value
  }

  return ""
}

function buttonCount(gadget: Gadget): number | null {
  const sensorGroup = gadget.specGroups.find((g) => /センサー|入力/i.test(g.title))
  const row = sensorGroup?.rows.find((r) => r.label === "ボタン数")
  if (!row?.value) return null
  const m = row.value.match(/(\d+)/)
  return m ? Number(m[1]) : null
}

function inferReadingTags(gadget: Gadget): MouseFilterTag[] {
  const reading = readingMethodValue(gadget)
  if (!reading) return []

  const text = reading.toLowerCase()
  if (/トラックボール|trackball/i.test(text)) return ["reading-trackball"]
  if (/darkfield|レーザー|laser/i.test(text)) return ["reading-laser"]
  if (/blue\s*led|blueled/i.test(text)) return ["reading-blueled"]
  if (/ir\s*led|irled|irセンサー|ultimate\s*ir|ジャイロ|gyroscope|スティック型|赤外線|その他/i.test(text)) {
    return ["reading-ir-other"]
  }
  if (/光学|オプティカル|optical/i.test(text)) return ["reading-optical"]
  return []
}

function inferSideButtons(gadget: Gadget): boolean {
  const count = buttonCount(gadget)
  if (count !== null && count >= 5) return true

  const reading = readingMethodValue(gadget)
  if (/サイドボタン|back\/forward|thumb\s*buttons?|戻る.*進む|進む.*戻る/i.test(reading)) {
    return true
  }

  const fromHighlight = gadget.highlights.find((h) => h.label === "ボタン数")?.value
  if (
    isFilterSpecFilled(fromHighlight) &&
    /サイド|[5-9]\s*ボタン|[5-9]ボタン/i.test(fromHighlight!)
  ) {
    return true
  }

  return false
}

function inferSideWheel(gadget: Gadget): boolean {
  const texts: string[] = []
  const reading = readingMethodValue(gadget)
  if (reading) texts.push(reading)

  for (const h of gadget.highlights) {
    if (isFilterSpecFilled(h.value)) texts.push(h.value)
  }
  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (isFilterSpecFilled(row.value)) texts.push(row.value)
    }
  }

  const hay = texts.join(" ").toLowerCase()
  return /サイドホイール|thumb\s*wheel|横スクロール|horizontal\s*scroll|チルト.*ホイール|tilt\s*wheel|サムホイール/i.test(
    hay,
  )
}

/** 明示タグ + データから推論したタグをマージ（重複除去） */
export function inferMouseFilterTags(gadget: Gadget): MouseFilterTag[] {
  if (gadget.category !== "mouse") return []

  const inferredReading = inferReadingTags(gadget)
  const inferred: MouseFilterTag[] = [
    ...inferredReading,
    ...(inferSideButtons(gadget) ? (["side-buttons"] as const) : []),
    ...(inferSideWheel(gadget) ? (["side-wheel"] as const) : []),
  ]

  const explicit = (gadget.mouseFilterTags ?? []).filter(
    (tag) => !MOUSE_READING_FILTER_TAGS.includes(tag),
  )
  return [...new Set([...explicit, ...inferred])]
}

export function hasMouseFilterTag(gadget: Gadget, tag: MouseFilterTag): boolean {
  return inferMouseFilterTags(gadget).includes(tag)
}
