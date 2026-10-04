import {
  getEffectiveRating,
  hasDisplayReviews,
  type CategoryId,
  type Gadget,
} from "@/lib/gadgets"

function compareGuidePick(a: Gadget, b: Gadget): number {
  const aHas = hasDisplayReviews(a)
  const bHas = hasDisplayReviews(b)
  if (aHas !== bHas) return bHas ? 1 : -1

  const reviewsDiff = (b.reviews ?? 0) - (a.reviews ?? 0)
  if (reviewsDiff !== 0) return reviewsDiff

  return getEffectiveRating(b) - getEffectiveRating(a)
}

/** ガイドページ用：カテゴリ内の定番・高評価モデルを抽出 */
export function getGuidePicks(
  category: CategoryId,
  pool: Gadget[],
  limit = 6,
): Gadget[] {
  return pool.filter((gadget) => gadget.category === category).sort(compareGuidePick).slice(0, limit)
}
