import type { Gadget, SpecGroup } from "@/lib/gadgets"

/** キーボード詳細モーダルでは非表示にするスペックラベル */
const KEYBOARD_HIDDEN_DETAIL_LABELS = new Set(["重量"])

function stripKeyboardHiddenLabels<T extends { label: string }>(gadget: Gadget, rows: T[]): T[] {
  if (gadget.category !== "keyboard") return rows
  return rows.filter((row) => !KEYBOARD_HIDDEN_DETAIL_LABELS.has(row.label))
}

/** キーボード詳細の主要スペックから重量を除外 */
export function filterKeyboardDetailHighlights<T extends { label: string }>(
  gadget: Gadget,
  rows: T[],
): T[] {
  return stripKeyboardHiddenLabels(gadget, rows)
}

/** キーボード詳細のスペックグループから重量行を除外 */
export function filterKeyboardDetailSpecGroups(gadget: Gadget, groups: SpecGroup[]): SpecGroup[] {
  if (gadget.category !== "keyboard") return groups
  return groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => !KEYBOARD_HIDDEN_DETAIL_LABELS.has(row.label)),
    }))
    .filter((group) => group.rows.length > 0)
}
