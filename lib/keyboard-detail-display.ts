import { isCardSpecValueFilled, type Gadget, type SpecGroup } from "@/lib/gadgets"

/** キーボード詳細モーダルでは非表示にするスペックラベル */
const KEYBOARD_HIDDEN_DETAIL_LABELS = new Set(["重量", "ゲーミングキーボード"])

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

/** キーボード詳細モーダル用の表示値（該当しない場合は undefined で通常フォーマットへ） */
export function formatKeyboardDetailSpecRowDisplayValue(
  gadget: Gadget,
  label: string,
  value: string,
): string | undefined {
  if (gadget.category !== "keyboard") return undefined
  if (label !== "ラピッドトリガー") return undefined
  if (!isCardSpecValueFilled(value)) return undefined
  return "搭載"
}
