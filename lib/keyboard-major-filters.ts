import type { Gadget } from "@/lib/gadgets"

/** キーボード絞り込みに表示する最小該当商品数 */
export const KEYBOARD_MAJOR_FILTER_MIN_COUNT = 3

type MatchableFilter = {
  id: string
  label: string
  match: (gadget: Gadget) => boolean
}

export type KeyboardFilterGroupTemplate = {
  id: string
  label: string
  matchMode?: "any" | "all"
  filters: MatchableFilter[]
}

export function countKeyboardFilterMatches(
  keyboards: Gadget[],
  filter: MatchableFilter,
): number {
  let count = 0
  for (const gadget of keyboards) {
    if (filter.match(gadget)) count++
  }
  return count
}

/** 該当数が minCount 以上になるまで走査（件数集計の早期打切り） */
export function keyboardFilterMeetsMinCount(
  keyboards: Gadget[],
  filter: MatchableFilter,
  minCount: number,
): boolean {
  if (minCount <= 0) return true
  let count = 0
  for (const gadget of keyboards) {
    if (filter.match(gadget)) {
      count++
      if (count >= minCount) return true
    }
  }
  return false
}

/**
 * カードデータに基づく match 関数で該当数を集計し、
 * minCount 以上の選択肢だけを残したフィルターグループを返す。
 */
export function buildMajorKeyboardFilterGroups<T extends KeyboardFilterGroupTemplate>(
  templateGroups: T[],
  gadgets: Gadget[],
  minCount = KEYBOARD_MAJOR_FILTER_MIN_COUNT,
): T[] {
  const keyboards =
    gadgets.length > 0 && gadgets.every((g) => g.category === "keyboard")
      ? gadgets
      : gadgets.filter((g) => g.category === "keyboard")
  if (keyboards.length === 0) return []

  const matchCounts = new Map<string, number>()
  for (const group of templateGroups) {
    for (const filter of group.filters) {
      matchCounts.set(filter.id, 0)
    }
  }

  for (const gadget of keyboards) {
    for (const group of templateGroups) {
      for (const filter of group.filters) {
        const current = matchCounts.get(filter.id) ?? 0
        if (current >= minCount) continue
        if (filter.match(gadget)) {
          matchCounts.set(filter.id, current + 1)
        }
      }
    }
  }

  return templateGroups
    .map((group) => ({
      ...group,
      filters: group.filters.filter(
        (filter) => (matchCounts.get(filter.id) ?? 0) >= minCount,
      ),
    }))
    .filter((group) => group.filters.length > 0) as T[]
}
