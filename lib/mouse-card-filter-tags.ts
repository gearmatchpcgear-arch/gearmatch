import type { Gadget } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"
import { resolveMouseButtonCountNumber } from "@/lib/mouse-button-count"

/** カード「電源」に対応 */
export type MousePowerFilterTag = "power-wired" | "power-rechargeable" | "power-battery"

/** カード「ボタン数」に対応 */
export type MouseButtonFilterTag = "buttons-3-under" | "buttons-4-6" | "buttons-6-over"

/** カード「重量」に対応 */
export type MouseWeightFilterTag = "weight-under-70" | "weight-70-90" | "weight-over-91"

export const MOUSE_POWER_LABELS: Record<MousePowerFilterTag, string> = {
  "power-wired": "有線給電",
  "power-rechargeable": "充電式",
  "power-battery": "電池式",
}

export const MOUSE_BUTTON_LABELS: Record<MouseButtonFilterTag, string> = {
  "buttons-3-under": "3ボタン以下",
  "buttons-4-6": "4〜6ボタン",
  "buttons-6-over": "6ボタン以上",
}

export const MOUSE_WEIGHT_LABELS: Record<MouseWeightFilterTag, string> = {
  "weight-under-70": "〜70g",
  "weight-70-90": "70g〜90g",
  "weight-over-91": "91g以上",
}

function powerText(gadget: Gadget): string {
  const fromHighlight = gadget.highlights.find((h) => h.label === "電源")?.value
  if (fromHighlight && fromHighlight !== "—") return fromHighlight

  const powerGroup = gadget.specGroups.find((g) => /接続|電源/i.test(g.title))
  const row = powerGroup?.rows.find((r) => r.label === "電源")
  if (row?.value && row.value !== "—") return row.value

  if (/有線\s*usb|usb\s*有線|有線給電/i.test(gadget.connection ?? "")) return "有線給電"
  return ""
}

function buttonCount(gadget: Gadget): number {
  return resolveMouseButtonCountNumber(gadget)
}

function weightGrams(gadget: Gadget): number | null {
  const fromHighlight = gadget.highlights.find((h) => h.label === "重量")?.value
  if (isFilterSpecFilled(fromHighlight)) {
    const m = fromHighlight!.match(/([\d,]+)\s*g/i)
    if (m) return Number(m[1].replace(/,/g, ""))
  }

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "重量")
    if (isFilterSpecFilled(row?.value)) {
      const m = row!.value.match(/([\d,]+)\s*g/i)
      if (m) return Number(m[1].replace(/,/g, ""))
    }
  }

  return null
}

export function inferMousePowerTags(gadget: Gadget): MousePowerFilterTag[] {
  if (gadget.category !== "mouse") return []
  const text = powerText(gadget)
  if (!text) return []

  if (/充電|recharge|内蔵.*バッテ|li-po|mAh/i.test(text)) return ["power-rechargeable"]
  if (/有線|wired|usb.*給電|ケーブル/i.test(text) && !/電池|battery/i.test(text)) {
    return ["power-wired"]
  }
  if (/電池|乾電池|単[1234]形|battery/i.test(text)) return ["power-battery"]
  if (/有線給電/i.test(text)) return ["power-wired"]
  return []
}

export function inferMouseButtonTags(gadget: Gadget): MouseButtonFilterTag[] {
  if (gadget.category !== "mouse") return []
  const count = buttonCount(gadget)
  if (!Number.isFinite(count)) return []

  const tags: MouseButtonFilterTag[] = []
  if (count <= 3) tags.push("buttons-3-under")
  if (count >= 4 && count <= 6) tags.push("buttons-4-6")
  if (count >= 6) tags.push("buttons-6-over")
  return tags
}

export function inferMouseWeightTags(gadget: Gadget): MouseWeightFilterTag[] {
  if (gadget.category !== "mouse") return []
  const grams = weightGrams(gadget)
  if (grams === null) return []
  if (grams <= 70) return ["weight-under-70"]
  if (grams > 70 && grams <= 90) return ["weight-70-90"]
  if (grams >= 91) return ["weight-over-91"]
  return []
}

export function hasMousePowerFilterTag(gadget: Gadget, tag: MousePowerFilterTag): boolean {
  return inferMousePowerTags(gadget).includes(tag)
}

export function hasMouseButtonFilterTag(gadget: Gadget, tag: MouseButtonFilterTag): boolean {
  return inferMouseButtonTags(gadget).includes(tag)
}

export function hasMouseWeightFilterTag(gadget: Gadget, tag: MouseWeightFilterTag): boolean {
  return inferMouseWeightTags(gadget).includes(tag)
}
