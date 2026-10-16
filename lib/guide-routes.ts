import { categories, type CategoryId } from "@/lib/gadgets"

/** ガイド個別ページを持つカテゴリ（表示順） */
export const GUIDE_CATEGORY_IDS = categories.map((c) => c.id) as readonly CategoryId[]

export type GuideCategorySlug = CategoryId

export function isGuideCategorySlug(slug: string): slug is GuideCategorySlug {
  return (GUIDE_CATEGORY_IDS as readonly string[]).includes(slug)
}

export function guideCategoryPath(categoryId: CategoryId): string {
  return `/guide/${categoryId}`
}

export function getGuideCategoryLabel(categoryId: CategoryId): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId
}
