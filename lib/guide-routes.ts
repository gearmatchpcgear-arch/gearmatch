import { categories, type CategoryId } from "@/lib/gadgets"
import { GUIDE_CATEGORY_DEFAULT_TAB, isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { buildGuideRecommendationTabHref } from "@/lib/guide-recommendation-tab-url"

/** ガイド個別ページを持つカテゴリ（表示順） */
export const GUIDE_CATEGORY_IDS = categories.map((c) => c.id) as readonly CategoryId[]

export type GuideCategorySlug = CategoryId

export function isGuideCategorySlug(slug: string): slug is GuideCategorySlug {
  return (GUIDE_CATEGORY_IDS as readonly string[]).includes(slug)
}

export function guideCategoryPath(categoryId: CategoryId): string {
  return `/guide/${categoryId}`
}

/** 用途タブ付きカテゴリはデフォルトタブ付きURL（SEO正規URL） */
export function guideCategoryDefaultHref(categoryId: CategoryId): string {
  const path = guideCategoryPath(categoryId)
  if (isGuideTabbedCategory(categoryId)) {
    return buildGuideRecommendationTabHref(path, GUIDE_CATEGORY_DEFAULT_TAB[categoryId])
  }
  return path
}

export function getGuideCategoryLabel(categoryId: CategoryId): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId
}
